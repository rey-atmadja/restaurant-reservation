import { Restaurant } from 'src/restaurant/restaurant.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';

@Entity({
  schema: 'restaurant_schema',
  name: 'table'
})
export class Table {
  @PrimaryGeneratedColumn('uuid')
  id?: string;
  
  @Column('varchar', {name: 'table_no'})
  tableNo: string;
  
  @Column('uuid', {name: 'restaurant_id'})
  restaurantId: string;
  
  @ManyToOne(() => Restaurant, (restaurant) => restaurant.tables)
  @JoinColumn({name: 'restaurant_id'})
  restaurant?: Restaurant;

  @Column('timestamp with time zone', {
    name: 'created_at'
  })
  createdAt?: Date;

  @Column('timestamp with time zone', {
    name: 'updated_at'
  })
  updatedAt?: Date;
}