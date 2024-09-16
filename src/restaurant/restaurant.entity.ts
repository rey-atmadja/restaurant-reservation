import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

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
}
