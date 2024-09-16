import { baseBatchGetDto } from "src/helper/base.dto";

export interface getCustomersDto extends baseBatchGetDto {}

export interface addCustomerDto {
  username: string
  password: string
  email: string
}

export interface updateCustomerDto {
  id: string;
  email: string;
  password: string;
}

export interface deleteCustomerDto {
  id: string;
}