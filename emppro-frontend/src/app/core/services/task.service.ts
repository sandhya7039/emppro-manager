import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Task, TaskCreate, TaskUpdate, TaskUpdateStatus } from '../models/task.model';
import Swal from 'sweetalert2';

interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private apiUrl = environment.apiBaseUrl;

  private tasksSignal = signal<Task[]>([]);
  public tasks = this.tasksSignal.asReadonly();

  private loadingSignal = signal<boolean>(false);
  public loading = this.loadingSignal.asReadonly();

  private totalSignal = signal<number>(0);
  public total = this.totalSignal.asReadonly();

  constructor(private http: HttpClient) {}

  // Get all tasks (Admin)
  getTasks(params?: any): Observable<ApiResponse<Task[]>> {
    this.loadingSignal.set(true);
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/tasks`, { params }).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.tasksSignal.set(response.data);
            this.totalSignal.set(response.pagination?.total || 0);
          }
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.loadingSignal.set(false);
          this.showToast('error', 'Failed to load tasks');
          console.error('Get tasks error:', error);
        }
      })
    );
  }

  // Get my tasks (Employee)
  getMyTasks(): Observable<ApiResponse<Task[]>> {
    this.loadingSignal.set(true);
    return this.http.get<ApiResponse<Task[]>>(`${this.apiUrl}/tasks/my-tasks`).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.tasksSignal.set(response.data);
            this.totalSignal.set(response.data?.length || 0);
          }
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.loadingSignal.set(false);
          this.showToast('error', 'Failed to load your tasks');
          console.error('Get my tasks error:', error);
        }
      })
    );
  }

  // Get task by ID
  getTaskById(id: number): Observable<ApiResponse<Task>> {
    return this.http.get<ApiResponse<Task>>(`${this.apiUrl}/tasks/${id}`);
  }

  // Create task (Admin)
  createTask(data: TaskCreate): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(`${this.apiUrl}/tasks`, data).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.showToast('success', response.message || 'Task created successfully!');
            this.getTasks().subscribe();
          }
        },
        error: (error) => {
          this.showToast('error', error.error?.message || 'Failed to create task');
          console.error('Create error:', error);
        }
      })
    );
  }

  // Update task (Admin)
  updateTask(id: number, data: TaskUpdate): Observable<ApiResponse<Task>> {
    return this.http.put<ApiResponse<Task>>(`${this.apiUrl}/tasks/${id}`, data).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.showToast('success', response.message || 'Task updated successfully!');
            this.getTasks().subscribe();
          }
        },
        error: (error) => {
          this.showToast('error', error.error?.message || 'Failed to update task');
          console.error('Update error:', error);
        }
      })
    );
  }

 // Update task status (Admin or Employee)
updateTaskStatus(id: number, status: string): Observable<ApiResponse<Task>> {
  console.log('🔄 Updating task status - ID:', id, 'Status:', status);
  
  return this.http.patch<ApiResponse<Task>>(`${this.apiUrl}/tasks/${id}/status`, { status }).pipe(
    tap({
      next: (response) => {
        console.log('📥 Update status response:', response);
        if (response.success) {
          // 👇 Use the status from response data
          const updatedStatus = response.data?.status || status;
          this.showToast('success', `Task status updated to ${updatedStatus}`);
          this.getMyTasks().subscribe();
        }
      },
      error: (error) => {
        console.error('❌ Update status error:', error);
        this.showToast('error', error.error?.message || 'Failed to update status');
      }
    })
  );
}

  // Delete task (Admin)
  deleteTask(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/tasks/${id}`).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.showToast('success', response.message || 'Task deleted successfully!');
            this.getTasks().subscribe();
          }
        },
        error: (error) => {
          this.showToast('error', error.error?.message || 'Failed to delete task');
          console.error('Delete error:', error);
        }
      })
    );
  }

  private showToast(icon: 'success' | 'error' | 'warning' | 'info', message: string): void {
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-right',
      iconColor: 'white',
      customClass: {
        popup: 'colored-toast'
      },
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.style.background = icon === 'success' ? '#22c55e' :
                                 icon === 'error' ? '#ef4444' :
                                 icon === 'warning' ? '#f59e0b' : '#667eea';
        toast.style.color = 'white';
        toast.style.borderRadius = '12px';
        toast.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)';
        toast.style.fontSize = '14px';
        toast.style.fontWeight = '500';
      }
    });
    Toast.fire({
      icon: icon,
      title: message
    });
  }
}