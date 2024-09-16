import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Repository,
  DataSource,
  QueryFailedError,
  LessThan,
  LessThanOrEqual,
  MoreThanOrEqual,
  Between,
  And,
} from 'typeorm';
import { Reservations } from './reservation.entity';

import * as lodash from 'lodash';

import { timeNow } from '../helper/functions';
import * as moment from 'moment';
import { Restaurant } from '../restaurant/restaurant.entity';
import { Table } from '../table/table.entity';
import {
  addReservationDto,
  cancelReservationDto,
  getReservationsByRestaurantIdDto,
  getReservationsDoneByCustomerDto,
  updateReservationDto,
} from './reservation.dto';

import{createTransport }from 'nodemailer';
import { Customer } from 'src/customer/customer.entity';

const client = createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  auth: {
    user: 'dreamofpast@gmail.com',
    pass: 'cfqt rkwg zxkf rmvf'
  }
})

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Reservations)
    private reservationRepository: Repository<Reservations>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Table)
    private tableRepository: Repository<Table>,
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private dataSource: DataSource,
  ) {}

  async addReservation(input: addReservationDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let restaurantCheck = await this.restaurantCheck(input.restaurantId);
      let customer = await this.customerRepository.findOne({where: {id: input.customerId}});

      if(!customer)
        throw new HttpException({message: 'CUSTOMER_NOT_FOUND', error: {message: 'CUSTOMER IS NOT FOUND'}}, HttpStatus.NOT_FOUND)

      let tableCheck = await this.tableCheck(
        input.tableId,
        input.reservationDate,
        input.reservationTime,
      );

      if (restaurantCheck && tableCheck) {
        let newReservation: Reservations = {
          tableId: input.tableId,
          restaurantId: input.restaurantId,
          customerId: input.customerId,
          reservationDate: input.reservationDate,
          reservationTime: input.reservationTime,
        };

        let reservationInstance = new Reservations();

        Object.assign(reservationInstance, newReservation);

        let saveResult = await queryRunner.manager.save(reservationInstance);
        await queryRunner.commitTransaction();

        //Email User here TO BE IMPLEMENTED
        let message = {
          text: `Your reservation has been completed, thank you for using our service.`,
          from: `Reyner Atmadja <dreamofpast@gmail.com>`,
          to : `${customer.username} <${customer.email}>`,
          subject: `Reservation Completed` 
        }

        await client.sendMail(message);

        return saveResult;
      } else {
        if (!restaurantCheck)
          return {
            message: 'Restaurant is currently closed, please try again later.',
          };
        if (!tableCheck) {
          return {
            message:
              'Your requested table is already booked for the date and time specified, please try again later.',
          };
        }
      }
    } catch (error) {
      console.log(error);
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

  async restaurantCheck(restaurantId: string) {
    //Is Restaurant Open?
    let time = timeNow();
    let toCheck = await this.restaurantRepository.findOne({
      where: {
        id: restaurantId,
        openingTime: LessThanOrEqual(time),
        closingTime: MoreThanOrEqual(time),
      },
    });

    if (lodash.isNil(toCheck)) return false;

    return true;
  }

  async tableCheck(tableId: string, date: string, time: string) {
    //Is Table under reservation on the date given and within the range of time +- 30 minutes of current time?
    // if yes then the table is not allowed to be reserved
    let halfHourBeforeBookingTime = moment(time, 'HH:mm').subtract(
      30,
      'minutes',
    );
    let halfHourBeforeBookingTimeString =
      halfHourBeforeBookingTime.format('HH:mm');
    let halfHourAfterBookingTime = moment(time, 'HH:mm').add(30, 'minutes');
    let halfHourAfterBookingTimeString =
      halfHourAfterBookingTime.format('HH:mm');
    let toCheck = await this.reservationRepository.find({
      where: {
        tableId: tableId,
        reservationDate: date,
        reservationTime: And(
          MoreThanOrEqual(halfHourBeforeBookingTimeString),
          LessThan(halfHourAfterBookingTimeString),
        ),
      },
    });

    if (!lodash.isEmpty(toCheck)) return false;

    return true;
  }

  async getReservationsDoneByCustomer(input: getReservationsDoneByCustomerDto) {
    let queryResult = await this.reservationRepository.findAndCount({
      select: {
        id: true,
        reservationTime: true,
        reservationDate: true,
        customer: {
          username: true,
        },
        table: {
          tableNo: true,
        },
        restaurant: {
          name: true,
        },
      },
      relations: {
        restaurant: true,
        table: true,
      },
      where: {
        customerId: input.customerId,
      },
      take: input.limit || 10,
      skip: input.offset || 0,
    });

    return {
      count: queryResult[1],
      rows: queryResult[0],
    };
  }

  async getReservationsByRestaurantId(input: getReservationsByRestaurantIdDto) {
    let queryResult = await this.reservationRepository.findAndCount({
      select: {
        id: true,
        reservationTime: true,
        reservationDate: true,
        customer: {
          username: true,
        },
        table: {
          tableNo: true,
        },
        restaurant: {
          name: true,
        },
      },
      relations: {
        customer: true,
        table: true,
        restaurant: true,
      },
      where: {
        restaurantId: input.restaurantId,
      },
      take: input.limit || 10,
      skip: input.offset || 0,
    });

    return {
      count: queryResult[1],
      rows: queryResult[0],
    };
  }

  async updateReservation(input: updateReservationDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (
        lodash.isNil(input.reservationDate) &&
        lodash.isNil(input.reservationTime)
      )
        throw new HttpException(
          {
            message: 'PAYLOAD_ERROR',
            error: { message: "PAYLOAD CAN'T BE EMPTY" },
          },
          HttpStatus.BAD_REQUEST,
        );

      let toUpdate = await this.reservationRepository.findOne({
        where: { id: input.id },
      });

      if (input.reservationDate)
        toUpdate.reservationDate = input.reservationDate;
      if (input.reservationTime)
        toUpdate.reservationTime = input.reservationTime;

      let checkNewTimeValidity = await this.tableCheck(
        toUpdate.tableId,
        toUpdate.reservationDate,
        toUpdate.reservationTime,
      );
      if (checkNewTimeValidity) {
        let saveResult = await queryRunner.manager.save(toUpdate);
        await queryRunner.commitTransaction();
        return saveResult;
      } else {
        await queryRunner.rollbackTransaction();
        return {
          message:
            'Your requested table is already booked for the date and time specified, please try again later.',
        };
      }
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

  async cancelReservation(input: cancelReservationDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let toDelete = await this.reservationRepository.findOne({
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
      await queryRunner.release();
    }
  }
}
