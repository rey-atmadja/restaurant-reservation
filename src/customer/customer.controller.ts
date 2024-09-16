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
import { getCustomersDto } from './customer.dto';
import { Customer } from './customer.entity';
import { CustomerService } from './customer.service';
import { CustomerValidation } from './customer.validator';

@Controller('customer')
export class CustomerController {
  private validator = new CustomerValidation();
  constructor(private customerService: CustomerService) {}
  @Get()
  async getCustomers(@Query() query: any) {
    try {
      let value = this.validator.getCustomers({ ...query });
      return await this.customerService.getCustomers(value);
    } catch (error) {
      throw error;
    }
  }

  @Post()
  async addCustomer(@Body() input: any) {
    try {
      let value = this.validator.addCustomer(input);
      return await this.customerService.addCustomer(value);
    } catch (error) {
      throw error;
    }
  }

  @Put('/:id')
  async updateCustomer(@Body() input: any, @Param() param: any) {
    try {
      let value = this.validator.updateCustomer({ ...input, ...param });
      return await this.customerService.updateCustomer(value);
    } catch (error) {
      throw error;
    }
  }

  @Delete('/:id')
  async deleteCustomer(@Param() param: any) {
    try {
      let value = this.validator.deleteCustomer({ ...param });
      return await this.customerService.deleteCustomer(value);
    } catch (error) {
      throw error;
    }
  }
}
