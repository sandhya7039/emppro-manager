export interface Employee {
  id: number;
  user_id: number;
  first_name: string;
  last_name: string;
  phone: string;
  designation: string;
  department: string;
  date_joined: string;
  created_at: string;
  email: string;
  is_active: number;
  fullName?: string;
}

export interface EmployeeCreate {
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  designation: string;
  department: string;
  date_joined: string;
}

export interface EmployeeUpdate {
  first_name?: string;
  last_name?: string;
  phone?: string;
  designation?: string;
  department?: string;
  date_joined?: string;
  is_active?: boolean;
}

export interface EmployeeFilters {
  search?: string;
  department?: string;
  status?: string;
  page?: number;
  limit?: number;
}