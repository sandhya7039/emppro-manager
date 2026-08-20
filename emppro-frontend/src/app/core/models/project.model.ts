export interface Project {
  id: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: 'planned' | 'active' | 'completed' | 'on-hold';
  created_at: string;
  total_employees?: number;
  total_tasks?: number;
  employees?: ProjectEmployee[];
}

export interface ProjectEmployee {
  id: number;
  first_name: string;
  last_name: string;
  designation: string;
  department: string;
  assigned_date: string;
}

export interface ProjectCreate {
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: string;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  start_date?: string;
  end_date?: string;
  status?: string;
}

export interface ProjectAssign {
  employee_ids: number[];
}