import { baseBatchGetDto } from 'src/helper/base.dto';

export interface addReservationDto {
  restaurantId: string;
  tableId: string;
  customerId: string;
  reservationDate: string;
  reservationTime: string;
}

export interface getReservationsDoneByCustomerDto extends baseBatchGetDto {
  customerId: string;
}

export interface getReservationsByRestaurantIdDto extends baseBatchGetDto {
  restaurantId: string;
}

export interface updateReservationDto {
  id: string;
  reservationDate: string;
  reservationTime: string;
}

export interface cancelReservationDto {
  id: string;
}
