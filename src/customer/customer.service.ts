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
    //Set up transaction
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //Create a new Customer entry
      let newUser: Customer = {
        email: input.email,
        username: input.username,
        password: input.password,
      };

      //Create a new Customer entity
      let userInstance = new Customer();

      //Assign entry to the entity so it is savable
      Object.assign(userInstance, newUser);

      //Save entity, inserting it into the database
      let saveResult = await queryRunner.manager.save(userInstance);

      //Commit the transaction
      await queryRunner.commitTransaction();

      //Return the inserted Customer
      return saveResult;
    } catch (error) {
      let errorMessage = error;
      //If the error is due to unique constraint being hit: return the proper field that is currently causing the error
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

      //Otherwise return a generic error
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
    //Get all customers, with limit and offset, alongside entity counts in order to support pagination
    let queryResult = await this.customerRepository.findAndCount({
      take: input.limit || 10,
      skip: input.offset || 0,
    });

    return {
      count: queryResult[1],
      rows: queryResult[0],
    };
  }

  async updateCustomer(input: updateCustomerDto): Promise<any> {
    //Set up transaction
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      //If empty input, return error as there would be nothing to update
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

      //Throw error if object to update is missing

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
    //Set up transaction
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    //If Object is missing, throw error
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

      //Delete user

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
