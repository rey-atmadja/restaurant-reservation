import { Customer } from 'src/customer/customer.entity';
import { Restaurant } from 'src/restaurant/restaurant.entity';
import { Table } from 'src/table/table.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity({
  schema: 'restaurant_schema',
  name: 'reservations',
})
export class Reservations {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('uuid', {
    name: 'restaurant_id',
  })
  restaurantId: string;

  @Column('uuid', {
    name: 'customer_id',
  })
  customerId: string;

  @Column('uuid', {
    name: 'table_id',
  })
  tableId: string;

  @Column('date', {
    name: 'reservation_date',
  })
  reservationDate: string;

  @Column('time', {
    name: 'reservation_time',
  })
  reservationTime: string;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.reservations)
  @JoinColumn({ name: 'restaurant_id' })
  restaurant?: Restaurant;

  @ManyToOne(() => Customer, (customer) => customer.reservations)
  @JoinColumn({ name: 'customer_id' })
  customer?: Customer;

  @ManyToOne(() => Table, (table) => table.reservations)
  @JoinColumn({ name: 'table_id' })
  table?: Table;

  createdAt?: Date;
}
