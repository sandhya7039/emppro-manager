export interface Task {
  id: number;
  project_id: number;
  employee_id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | null;
  priority: 'low' | 'medium' | 'high';
  due_date: string;
  created_at: string;
  project_name?: string;
  assigned_to?: string;
}

export interface TaskCreate {
  project_id: number;
  employee_id: number;
  title: string;
  description: string;
  priority: string;
  due_date: string;
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  employee_id?: number;
}

export interface TaskUpdateStatus {
  status: string;
}