import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  QueryFailedError,
  LessThanOrEqual,
  MoreThanOrEqual,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';

import * as lodash from 'lodash';
import {
  addRestaurantDto,
  deleteRestaurantDto,
  getOpenRestaurantForReservationDto,
  updateRestaurantDto,
} from './restaurant.dto';
import { timeNow } from 'src/helper/functions';
import * as moment from 'moment';

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    private dataSource: DataSource,
  ) {}

  async addRestaurant(input: addRestaurantDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let newRestaurant: Restaurant = {
        name: input.name,
        openingTime: input.openingTime,
        closingTime: input.closingTime,
      };

      let openingTimeDate = moment(input.openingTime, 'HH:mm');
      let closingTimeDate = moment(input.closingTime, 'HH:mm');
      let isAfter = closingTimeDate.isAfter(openingTimeDate);

      if (!isAfter)
        throw new HttpException(
          {
            message: 'INVALID OPENING TIME',
            error: {
              message: 'OPENING TIME HAS TO BE LOWER THAN CLOSING TIME',
            },
          },
          HttpStatus.BAD_REQUEST,
        );

      let restaurantInstance = new Restaurant();

      Object.assign(restaurantInstance, newRestaurant);

      let saveResult = await queryRunner.manager.save(restaurantInstance);
      await queryRunner.commitTransaction();
      return saveResult;
    } catch (error) {
      let errorMessage = error;
      if (error instanceof QueryFailedError) {
        let constraint = error.driverError.constraint
          ? error.driverError.constraint
          : '';
        switch (constraint) {
          case 'restaurant_un_name':
            errorMessage = {
              message: 'NAME HAS BEEN USED, PLEASE USE ANOTHER ONE',
            };
            break;
          default:
            break;
        }
      }

      if (error instanceof HttpException) throw error;

      await queryRunner.rollbackTransaction();
      throw new HttpException(
        { message: 'DATABASE_ERROR', error: errorMessage },
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    } finally {
      queryRunner.release();
    }
  }

  async updateRestaurant(input: updateRestaurantDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (lodash.isNil(input.openingTime) && lodash.isNil(input.closingTime))
        throw new HttpException(
          {
            message: 'PAYLOAD_ERROR',
            error: { message: "PAYLOAD CAN'T BE EMPTY" },
          },
          HttpStatus.BAD_REQUEST,
        );

      let toUpdate = await this.restaurantRepository.findOne({
        where: { id: input.id },
      });
      if (input.openingTime) toUpdate.openingTime = input.openingTime;
      if (input.closingTime) toUpdate.closingTime = input.closingTime;

      let openingTimeDate = moment(toUpdate.openingTime, 'hh:mm');
      let closingTimeDate = moment(toUpdate.closingTime, 'hh:mm');
      let isAfter = closingTimeDate.isAfter(openingTimeDate);

      if (!isAfter)
        throw new HttpException(
          {
            message: 'INVALID OPENING TIME',
            error: {
              message: 'OPENING TIME HAS TO BE LOWER THAN CLOSING TIME',
            },
          },
          HttpStatus.BAD_REQUEST,
        );

      let saveResult = await queryRunner.manager.save(toUpdate);

      await queryRunner.commitTransaction();
      return saveResult;
    } catch (error) {
      let errorMessage = error;
      if (error instanceof HttpException) throw error;
      await queryRunner.rollbackTransaction();
      throw new HttpException(
        { message: 'DATABASE_ERROR', error: errorMessage },
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteRestaurant(input: deleteRestaurantDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let toDelete = await this.restaurantRepository.findOne({
        where: { id: input.id },
      });

      if (lodash.isNil(toDelete))
        throw new HttpException(
          {
            message: 'OBJECT_MISSING',
            error: { message: 'CANNOT FIND RESTAURANT' },
          },
          HttpStatus.NOT_FOUND,
        );
      await queryRunner.manager.delete(Restaurant, { id: toDelete.id });
      await queryRunner.commitTransaction();

      return { deleted: toDelete };
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof HttpException) throw error;

      throw new HttpException(
        { message: 'DATABASE_ERROR', error },
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    } finally {
      queryRunner.release();
    }
  }

  async getOpenRestaurantForReservation(
    input: getOpenRestaurantForReservationDto,
  ) {
    let time = timeNow();
    let queryResult = await this.restaurantRepository.findAndCount({
      relations: {
        tables: true,
      },
      where: {
        openingTime: LessThanOrEqual(time),
        closingTime: MoreThanOrEqual(time),
      },
      take: input.limit || 10,
      skip: input.offset || 0,
    });

    return {
      count: queryResult[1],
      rows: queryResult[0],
    };
  }
}
