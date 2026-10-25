export type Role = "USER" | "ADMIN";
export type Condition = "NEW" | "USED";
export type FuelType = "PETROL" | "DIESEL" | "EV" | "HYBRID";
export type Category =
  | "SUV"
  | "SEDAN"
  | "HATCHBACK"
  | "COUPE"
  | "TRUCK"
  | "EV";

export interface User {
  id: string;
  email: string;
  role: Role;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: Category;
  price: number;
  quantity: number;
  condition: Condition;
  year: number;
  fuelType: FuelType;
  imageUrl?: string | null;
  modelUrl?: string | null;
  mileage?: number | null;
  ownersCount?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponseData {
  user: User;
  token: string;
}

export interface ApiResponse<T> {
  status: "success" | "error";
  data?: T;
  message?: string;
}
