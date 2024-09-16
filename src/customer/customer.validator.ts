import * as coreJoi from 'joi';
import joiDate from '@joi/date';
const Joi = coreJoi.extend(joiDate) as typeof coreJoi;
import {
  addCustomerDto,
  deleteCustomerDto,
  getCustomersDto,
  updateCustomerDto,
} from './customer.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomerValidation {
  getCustomers(payload: any): getCustomersDto {
    const validationSchema: coreJoi.ObjectSchema = Joi.object({
      limit: Joi.number().optional(),
      offset: Joi.number().optional(),
    });

    const validation = validationSchema.validate(payload);
    if (validation.error)
      throw new HttpException(
        { message: 'VALIDATION_ERROR', error: validation.error.details },
        HttpStatus.BAD_REQUEST,
        {
          cause: validation.error,
        },
      );
    return validation.value;
  }

  addCustomer(payload: any): addCustomerDto {
    const validationSchema: coreJoi.ObjectSchema = Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
      email: Joi.string().email().required(),
    });

    const validation = validationSchema.validate(payload);
    if (validation.error)
      throw new HttpException(
        { message: 'VALIDATION_ERROR', error: validation.error.details },
        HttpStatus.BAD_REQUEST,
        {
          cause: validation.error,
        },
      );
    return validation.value;
  }

  updateCustomer(payload: any): updateCustomerDto {
    const validationSchema: coreJoi.ObjectSchema = Joi.object({
      id: Joi.string().uuid().required(),
      password: Joi.string().optional(),
      email: Joi.string().email().optional(),
    });

    const validation = validationSchema.validate(payload);
    if (validation.error)
      throw new HttpException(
        { message: 'VALIDATION_ERROR', error: validation.error.details },
        HttpStatus.BAD_REQUEST,
        {
          cause: validation.error,
        },
      );
    return validation.value;
  }

  deleteCustomer(payload: any): deleteCustomerDto {
    const validationSchema: coreJoi.ObjectSchema = Joi.object({
      id: Joi.string().uuid().required(),
    });

    const validation = validationSchema.validate(payload);
    if (validation.error)
      throw new HttpException(
        { message: 'VALIDATION_ERROR', error: validation.error.details },
        HttpStatus.BAD_REQUEST,
        {
          cause: validation.error,
        },
      );
    return validation.value;
  }
}
