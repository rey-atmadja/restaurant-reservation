import * as coreJoi from 'joi';
import joiDate from '@joi/date';
const Joi = coreJoi.extend(joiDate) as typeof coreJoi;
import {
  addReservationDto,
  cancelReservationDto,
  getReservationsByRestaurantIdDto,
  getReservationsDoneByCustomerDto,
  updateReservationDto,
} from './reservation.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

export class ReservationValidation {
  addReservation(payload: any): addReservationDto {
    const validationSchema: coreJoi.ObjectSchema = Joi.object({
      restaurantId: Joi.string().guid().required(),
      customerId: Joi.string().guid().required(),
      tableId: Joi.string().guid().required(),
      reservationDate: Joi.date().format('YYYY-MM-DD').raw().required(),
      reservationTime: Joi.string()
        .regex(/([01]\d|2[0-3]):?([0-5]\d)/)
        .required(),
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

  getReservationsDoneByCustomer(
    payload: any,
  ): getReservationsDoneByCustomerDto {
    const validationSchema: coreJoi.ObjectSchema = Joi.object({
      customerId: Joi.string().guid().required(),
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

  getReservationsByRestaurantId(
    payload: any,
  ): getReservationsByRestaurantIdDto {
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

  updateReservation(payload: any): updateReservationDto {
    const validationSchema: coreJoi.ObjectSchema = Joi.object({
      id: Joi.string().guid().required(),
      reservationDate: Joi.date().format('YYYY-MM-DD').raw().optional(),
      reservationTime: Joi.string()
        .regex(/([01]\d|2[0-3]):?([0-5]\d)/)
        .optional(),
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

  cancelReservation(payload: any): cancelReservationDto {
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
