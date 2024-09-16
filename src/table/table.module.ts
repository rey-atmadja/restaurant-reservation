import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Restaurant } from '../restaurant/restaurant.entity';
import { Table } from '../table/table.entity';
import { TableController } from './table.controller';
import { TableService } from './table.service';

@Module({
  imports: [TypeOrmModule.forFeature([Restaurant, Table])],
  controllers: [TableController],
  providers: [TableService],
})
export class TableModule {}
