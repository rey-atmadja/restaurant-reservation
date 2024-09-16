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
import { RestaurantService } from './restaurant.service';
import { RestaurantValidation } from './restaurant.validator';

@Controller('restaurant')
export class RestaurantController {
  private validator = new RestaurantValidation();
  constructor (private restaurantService: RestaurantService) {}
  @Post()
  async addRestaurant(@Body() input: any) {
    try {
      let value = this.validator.addRestaurant(input);
      return this.restaurantService.addRestaurant(value);
    } catch (error) {
      throw error;
    }
  }
  @Get('/open')
  async getOpenRestaurantForReservation(@Query() query) {
    try {
      let value = this.validator.getOpenRestaurantForReservation(query);
      return this.restaurantService.getOpenRestaurantForReservation(value);
    } catch (error) {
      throw error;
    }
  }
  @Put('/:id')
  async updateRestaurant(@Param() param, @Body() input) {
    try {
      let value = this.validator.updateRestaurant({...param, ...input});
      return this.restaurantService.updateRestaurant(value);
    } catch (error) {
      throw error;
    }
  }
  @Delete('/:id')
  async deleteRestaurant(@Param() param) {
    try {
      let value = this.validator.deleteRestaurant(param);
      return this.restaurantService.deleteRestaurant(value);
    } catch (error) {
      throw error;
    }
  }
}
