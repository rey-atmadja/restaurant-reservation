import * as coreJoi from 'joi';
import joiDate from '@joi/date';
const Joi = coreJoi.extend(joiDate) as typeof coreJoi;
import {
  addTableDto,
  deleteTableDto,
  getTableViaRestaurantIDDto,
  updateTableDto,
} from './table.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

export class TableValidation {
  addTable(payload: any): addTableDto {
    const validationSchema: coreJoi.ObjectSchema = Joi.object({
      tableNo: Joi.string().required(),
      restaurantId: Joi.string().guid().required(),
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

  updateTable(payload: any): updateTableDto {
    const validationSchema: coreJoi.ObjectSchema = Joi.object({
      id: Joi.string().guid().required(),
      tableNo: Joi.string().required(),
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

  getTableViaRestaurantID(payload: any): getTableViaRestaurantIDDto {
    const validationSchema: coreJoi.ObjectSchema = Joi.object({
      restaurantId: Joi.string().guid().required(),
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

  deleteTable(payload: any): deleteTableDto {
    const validationSchema: coreJoi.ObjectSchema = Joi.object({
      id: Joi.string().guid().required(),
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
