import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table } from '../table/table.entity';
import { RestaurantController } from './restaurant.controller';
import { Restaurant } from './restaurant.entity';
// import { CustomerProviders } from './customer.providers';
import { RestaurantService } from './restaurant.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Table])],
  controllers: [RestaurantController],
  providers: [RestaurantService],
})
export class RestaurantModule {}
