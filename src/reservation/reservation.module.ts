import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Reservations } from './reservation.entity';
import { Table } from '../table/table.entity';
import { Restaurant } from '../restaurant/restaurant.entity';
import { Customer } from '../customer/customer.entity';
import { ReservationService } from './reservation.service';
import { ReservationController } from './reservation.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Reservations, Table, Restaurant, Customer]),
  ],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
