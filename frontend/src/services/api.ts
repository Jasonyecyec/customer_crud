import { Customer, ApiResponse, CustomerResponse } from "../types/customer";

const BASE_URL = "http://localhost:80/api/customers";

export const fetchCustomers = async (search?: string): Promise<CustomerResponse[]> => {
  const url = search ? `${BASE_URL}?search=${encodeURIComponent(search)}` : BASE_URL;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error("Failed to fetch customers");
  }
  const result: ApiResponse<CustomerResponse[]> = await response.json();
  if (!result.success) {
    throw new Error(result.message);
  }
  return result.data;
};

export const createCustomer = async (customer: Customer): Promise<Customer> => {
  const response = await fetch(BASE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer),
  });
  if (!response.ok) {
    throw new Error("Failed to create customer");
  }
  const result: ApiResponse<Customer> = await response.json();
  if (!result.success) {
    throw new Error(result.message);
  }
  return result.data;
};

export const updateCustomer = async (id: number, customer: Customer): Promise<Customer> => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(customer),
  });
  if (!response.ok) {
    throw new Error("Failed to update customer");
  }
  const result: ApiResponse<Customer> = await response.json();
  if (!result.success) {
    throw new Error(result.message);
  }
  return result.data;
};

export const deleteCustomer = async (id: number): Promise<void> => {
  const response = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    throw new Error("Failed to delete customer");
  }
  const result: ApiResponse<void> = await response.json();
  if (!result.success) {
    throw new Error(result.message);
  }
};
