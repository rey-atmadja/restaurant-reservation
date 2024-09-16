import { Reservations } from 'src/reservation/reservation.entity';
import { Table } from 'src/table/table.entity';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity({
  name: 'restaurant',
  schema: 'restaurant_schema',
})
export class Restaurant {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('varchar')
  name: string;

  @Column('time', { name: 'opening_time' })
  openingTime: string;

  @Column('time', { name: 'closing_time' })
  closingTime: string;

  @Column('timestamp with time zone', { name: 'created_at' })
  createdAt?: Date;

  @OneToMany(() => Table, (table) => table.restaurant, { onDelete: 'CASCADE' })
  tables?: Table[];

  @OneToMany(() => Reservations, (reservation) => reservation.restaurant, {
    onDelete: 'CASCADE',
  })
  reservations?: Reservations[];
}
