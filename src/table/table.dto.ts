import { baseBatchGetDto } from "src/helper/base.dto";

export interface addTableDto {
  restaurantId: string;
  tableNo: string;
}

export interface updateTableDto {
  id: string;
  tableNo?: string;
}

export interface getTableViaRestaurantIDDto extends baseBatchGetDto {
  restaurantId: string;
}

export interface deleteTableDto {
  id: string;
}