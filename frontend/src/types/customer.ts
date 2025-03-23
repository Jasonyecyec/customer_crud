export type Customer = {
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
};

export type CustomerResponse = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  contact_number: string;
  created_at: Date;
  updated_at: Date;
};

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
