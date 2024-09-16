import * as coreJoi from 'joi';
import joiDate from '@joi/date';
const Joi = coreJoi.extend(joiDate) as typeof coreJoi;
import { addRestaurantDto, deleteRestaurantDto, getOpenRestaurantForReservationDto, updateRestaurantDto } from './restaurant.dto';
import { HttpException, HttpStatus } from '@nestjs/common';

export class RestaurantValidation {
  addRestaurant(payload: any): addRestaurantDto {
    const validationSchema: coreJoi.ObjectSchema = Joi.object({
      name: Joi.string().required(),
      openingTime: Joi.string().regex(/([01]\d|2[0-3]):?([0-5]\d)/).required(),
      closingTime: Joi.string().regex(/([01]\d|2[0-3]):?([0-5]\d)/).required()
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

  getOpenRestaurantForReservation(payload: any) : getOpenRestaurantForReservationDto {
    const validationSchema: coreJoi.ObjectSchema = Joi.object({
      limit: Joi.number().optional(),
      offset: Joi.number().optional()
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

  updateRestaurant(payload: any) : updateRestaurantDto {
    const validationSchema: coreJoi.ObjectSchema = Joi.object({
      id: Joi.string().guid().required(),
      openingTime: Joi.string().regex(/([01]\d|2[0-3]):?([0-5]\d)/).optional(),
      closingTime: Joi.string().regex(/([01]\d|2[0-3]):?([0-5]\d)/).optional()
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

  deleteRestaurant (payload: any) : deleteRestaurantDto {
    const validationSchema: coreJoi.ObjectSchema = Joi.object({
      id: Joi.string().guid().required()
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