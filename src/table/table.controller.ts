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

import { TableService } from './table.service';
import { TableValidation } from './table.validator';

@Controller('table')
export class TableController{
  private validator = new TableValidation();
  constructor(private tableService : TableService) {}

  @Post('/:restaurantId')
  async addTable(@Body() input, @Param() param) {
    try {
      let value = this.validator.addTable({...input, ...param});
      return await this.tableService.addTable(value);
    } catch (error) {
      throw error;
    }
  }

  @Put('/:id')
  async updateTable(@Param() param, @Body() input) {
    try {
      let value = this.validator.updateTable({...param, ...input});
      return await this.tableService.updateTable(value);
    } catch (error) {
      throw error;
    }
  }

  @Get('/:restaurantId')
  async getTableViaRestaurantID(@Param() param, @Query() query) {
    try {
      let value = this.validator.getTableViaRestaurantID({...param, ...query});
      return await this.tableService.getTableViaRestaurantID(value)
    } catch (error) {
      throw error;
    }
  }

  @Delete('/:id')
  async deleteTable(@Param() param) {
    try {
      let value = this.validator.deleteTable(param);
      return await this.tableService.deleteTable(value)
    } catch (error) {
      throw error;
    }
  }
}