import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'customer',
  schema: 'restaurant_schema',
})
export class Customer {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column('varchar')
  username: string;

  @Column('varchar')
  email: string;

  @Column('varchar')
  password: string;

  @Column({
    name: 'created_at',
    type: 'timestamp with time zone',
    default: `now()`,
  })
  createdAt?: Date;
}
