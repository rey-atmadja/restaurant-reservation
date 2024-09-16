import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryFailedError } from 'typeorm';
import {
  addCustomerDto,
  deleteCustomerDto,
  getCustomersDto,
  updateCustomerDto,
} from './customer.dto';
import { Customer } from './customer.entity';

import * as lodash from 'lodash';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
    private dataSource: DataSource,
  ) {}

  async addCustomer(input: addCustomerDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let newUser: Customer = {
        email: input.email,
        username: input.username,
        password: input.password,
      };

      let userInstance = new Customer();

      Object.assign(userInstance, newUser);

      let saveResult = await queryRunner.manager.save(userInstance);
      await queryRunner.commitTransaction();
      return saveResult;
    } catch (error) {
      let errorMessage = error;
      if (error instanceof QueryFailedError) {
        let constraint = error.driverError.constraint
          ? error.driverError.constraint
          : '';
        switch (constraint) {
          case 'customer_un_username':
            errorMessage = {
              message: 'USERNAME HAS BEEN USED, PLEASE USE ANOTHER ONE',
            };
            break;
          case 'customer_un_email':
            errorMessage = {
              message: 'EMAIL HAS BEEN USED, PLEASE USE ANOTHER ONE',
            };
            break;
          default:
            break;
        }
      }
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

  async getCustomers(input: getCustomersDto) {
    let queryResult = await this.customerRepository.findAndCount({
      take: input.limit || 10,
      skip: input.offset || 0,
    });

    return {
      count: queryResult[1],
      rows: queryResult[0]
    }
  }

  async updateCustomer(input: updateCustomerDto): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      if (lodash.isNil(input.email) && lodash.isNil(input.password))
        throw new HttpException(
          {
            message: 'PAYLOAD_ERROR',
            error: { message: "PAYLOAD CAN'T BE EMPTY" },
          },
          HttpStatus.BAD_REQUEST,
        );

      let toUpdate = await queryRunner.manager.findOne(Customer, {
        where: { id: input.id },
      });

      if (lodash.isNil(toUpdate))
        throw new HttpException(
          {
            message: 'OBJECT_MISSING',
            error: { message: 'CANNOT FIND USER' },
          },
          HttpStatus.NOT_FOUND,
        );

      toUpdate.email = input.email ? input.email : toUpdate.email;
      toUpdate.password = input.password ? input.password : toUpdate.password;

      let updateResult = await queryRunner.manager.save(toUpdate);

      await queryRunner.commitTransaction();
      return updateResult;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      if (error instanceof HttpException) throw error;

      let errorMessage = error;

      if (error instanceof QueryFailedError) {
        let constraint = error.driverError.constraint
          ? error.driverError.constraint
          : '';
        switch (constraint) {
          case 'customer_un_username':
            errorMessage = {
              message: 'USERNAME HAS BEEN USED, PLEASE USE ANOTHER ONE',
            };
            break;
          case 'customer_un_email':
            errorMessage = {
              message: 'EMAIL HAS BEEN USED, PLEASE USE ANOTHER ONE',
            };
            break;
          default:
            break;
        }
      }

      throw new HttpException(
        { message: 'DATABASE_ERROR', errorMessage },
        HttpStatus.INTERNAL_SERVER_ERROR,
        { cause: error },
      );
    } finally {
      await queryRunner.release();
    }
  }

  async deleteCustomer(input: deleteCustomerDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      let toDelete = await queryRunner.manager.findOne(Customer, {
        where: { id: input.id },
      });

      if (lodash.isNil(toDelete))
        throw new HttpException(
          {
            message: 'OBJECT_MISSING',
            error: { message: 'CANNOT FIND USER' },
          },
          HttpStatus.NOT_FOUND,
        );

      await queryRunner.manager.delete(Customer, { id: input.id });
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
