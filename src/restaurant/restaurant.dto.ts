import { baseBatchGetDto } from 'src/helper/base.dto';

export interface addRestaurantDto {
  name: string;
  openingTime: string;
  closingTime: string;
}

export interface getOpenRestaurantForReservationDto extends baseBatchGetDto {}

export interface updateRestaurantDto {
  id: string;
  openingTime?: string;
  closingTime?: string;
}

export interface deleteRestaurantDto {
  id: string;
}
