import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';

import { ReservationService } from './reservation.service';
import { ReservationValidation } from './reservation.validator';

@Controller('reservation')
export class ReservationController {
  private validator = new ReservationValidation();
  constructor(private reservationService: ReservationService) {}

  @Post('/:restaurantId')
  async addReservation(@Param() param, @Body() input) {
    try {
      let value = this.validator.addReservation({ ...input, ...param });
      return await this.reservationService.addReservation(value);
    } catch (error) {
      throw error;
    }
  }

  @Get('/customer/:customerId')
  async getReservationsDoneByCustomer(@Param() param, @Query() query) {
    try {
      let value = this.validator.getReservationsDoneByCustomer({
        ...query,
        ...param,
      });
      return await this.reservationService.getReservationsDoneByCustomer(value);
    } catch (error) {
      throw error;
    }
  }

  @Get('/restaurant/:restaurantId')
  async getReservationsByRestaurantId(@Param() param, @Query() query) {
    try {
      let value = this.validator.getReservationsByRestaurantId({
        ...query,
        ...param,
      });
      return await this.reservationService.getReservationsByRestaurantId(value);
    } catch (error) {
      throw error;
    }
  }

  @Put('/:id')
  async updateReservation(@Param() param, @Body() input) {
    try {
      let value = this.validator.updateReservation({ ...input, ...param });
      return await this.reservationService.updateReservation(value);
    } catch (error) {
      throw error;
    }
  }

  @Delete('/:id')
  async cancelReservation(@Param() param) {
    try {
      let value = this.validator.cancelReservation(param);
      return await this.reservationService.cancelReservation(value);
    } catch (error) {
      throw error;
    }
  }
}
