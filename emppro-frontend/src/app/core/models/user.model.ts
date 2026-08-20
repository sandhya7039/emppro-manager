export interface User {
  id: number;
  email: string;
  role: 'admin' | 'employee';
  name?: string; // 👈 Add this
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    token: string;
    user: User;
  };
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: any;
}