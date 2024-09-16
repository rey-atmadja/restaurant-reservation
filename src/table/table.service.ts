import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryFailedError } from 'typeorm';

import { Table } from './table.entity';

import * as lodash from 'lodash';
import { addTableDto, deleteTableDto, getTableViaRestaurantIDDto, updateTableDto } from './table.dto';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(Table)
    private tableRepository: Repository<Table>,
    private dataSource: DataSource,
  ) {}

  async addTable(input: addTableDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let newTable: Table = {
        tableNo: input.tableNo,
        restaurantId: input.restaurantId,
      };

      let tableInstance = new Table();

      Object.assign(tableInstance, newTable);

      let saveResult = await queryRunner.manager.save(tableInstance);
      await queryRunner.commitTransaction();
      return saveResult;
    } catch (error) {
      let errorMessage = error;
      if (error instanceof QueryFailedError) {
        let constraint = error.driverError.constraint
          ? error.driverError.constraint
          : '';
        switch (constraint) {
          case 'table_un_restaurant_id_table_no':
            errorMessage = {
              message: 'TABLE NUMBER HAS BEEN USED, PLEASE USE ANOTHER ONE',
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

  async updateTable(input: updateTableDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (lodash.isNil(input.tableNo))
        throw new HttpException(
          {
            message: 'PAYLOAD_ERROR',
            error: { message: "PAYLOAD CAN'T BE EMPTY" },
          },
          HttpStatus.BAD_REQUEST,
        );

      let toUpdate = await this.tableRepository.findOne({
        where: { id: input.id },
      });

      toUpdate.tableNo = input.tableNo;

      let saveResult = await queryRunner.manager.save(toUpdate);

      await queryRunner.commitTransaction();
      return saveResult;
    } catch (error) {
      let errorMessage = error;
      if (error instanceof HttpException) throw error;
      await queryRunner.rollbackTransaction();

      if (error instanceof QueryFailedError) {
        let constraint = error.driverError.constraint
          ? error.driverError.constraint
          : '';
        switch (constraint) {
          case 'table_un_restaurant_id_table_no':
            errorMessage = {
              message: 'TABLE NUMBER HAS BEEN USED, PLEASE USE ANOTHER ONE',
            };
            break;
          default:
            break;
        }
      }

      throw new HttpException(
        { message: 'DATABASE_ERROR', error: errorMessage },
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    } finally {
      await queryRunner.release();
    }
  }

  async getTableViaRestaurantID(input : getTableViaRestaurantIDDto) {
    let queryResult = await this.tableRepository.findAndCount({
      relations: {
        restaurant: true
      },
      where: {
        restaurantId: input.restaurantId
      },
      take: input.limit || 10,
      skip: input.offset || 0,
    });

    return {
      count: queryResult[1],
      rows: queryResult[0],
    };
  }

  async deleteTable(input: deleteTableDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let toDelete = await this.tableRepository.findOne({
        where: { id: input.id },
      });

      if (lodash.isNil(toDelete))
        throw new HttpException(
          {
            message: 'OBJECT_MISSING',
            error: { message: 'CANNOT FIND TABLE' },
          },
          HttpStatus.NOT_FOUND,
        );
      await queryRunner.manager.delete(Table, {id: toDelete.id});
      await queryRunner.commitTransaction();

      return {deleted: toDelete};
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
}
