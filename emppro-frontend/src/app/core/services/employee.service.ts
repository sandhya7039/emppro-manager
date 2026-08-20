import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Employee, EmployeeCreate, EmployeeUpdate } from '../models/employee.model';
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
export class EmployeeService {
  private apiUrl = environment.apiBaseUrl;

  private employeesSignal = signal<Employee[]>([]);
  public employees = this.employeesSignal.asReadonly();

  private loadingSignal = signal<boolean>(false);
  public loading = this.loadingSignal.asReadonly();

  private totalSignal = signal<number>(0);
  public total = this.totalSignal.asReadonly();

  constructor(private http: HttpClient) {}

  getEmployees(params?: any): Observable<ApiResponse<Employee[]>> {
    this.loadingSignal.set(true);
    return this.http.get<ApiResponse<Employee[]>>(`${this.apiUrl}/employees`, { params }).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.employeesSignal.set(response.data);
            this.totalSignal.set(response.pagination?.total || 0);
          }
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.loadingSignal.set(false);
          this.showToast('error', 'Failed to load employees');
          console.error('Get employees error:', error);
        }
      })
    );
  }

  createEmployee(data: EmployeeCreate): Observable<ApiResponse<Employee>> {
    return this.http.post<ApiResponse<Employee>>(`${this.apiUrl}/employees`, data).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.showToast('success', response.message || 'Employee created successfully!');
            this.getEmployees().subscribe();
          }
        },
        error: (error) => {
          this.showToast('error', error.error?.message || 'Failed to create employee');
          console.error('Create error:', error);
        }
      })
    );
  }

  updateEmployee(id: number, data: EmployeeUpdate): Observable<ApiResponse<Employee>> {
    return this.http.put<ApiResponse<Employee>>(`${this.apiUrl}/employees/${id}`, data).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.showToast('success', response.message || 'Employee updated successfully!');
            this.getEmployees().subscribe();
          }
        },
        error: (error) => {
          this.showToast('error', error.error?.message || 'Failed to update employee');
          console.error('Update error:', error);
        }
      })
    );
  }

  deleteEmployee(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/employees/${id}`).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.showToast('success', response.message || 'Employee deactivated successfully!');
            this.getEmployees().subscribe();
          }
        },
        error: (error) => {
          this.showToast('error', error.error?.message || 'Failed to delete employee');
          console.error('Delete error:', error);
        }
      })
    );
  }

toggleStatus(id: number, status: boolean): Observable<ApiResponse<Employee>> {
  console.log('🔄 Toggle Status - ID:', id, 'Status:', status);
  
  // 👇 Only send is_active
  return this.http.put<ApiResponse<Employee>>(`${this.apiUrl}/employees/${id}`, { is_active: status }).pipe(
    tap({
      next: (response) => {
        console.log('✅ Toggle Status Response:', response);
        if (response.success) {
          this.showToast('success', `Employee ${status ? 'activated' : 'deactivated'} successfully!`);
          this.getEmployees().subscribe();
        }
      },
      error: (error) => {
        console.error('❌ Toggle Status Error:', error);
        this.showToast('error', error.error?.message || 'Failed to update status');
      }
    })
  );
}

  refresh(): void {
    this.getEmployees().subscribe();
  }

 // ========== TOAST FUNCTION ==========
private showToast(icon: 'success' | 'error' | 'warning' | 'info', message: string): void {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    customClass: {
      popup: icon === 'success' ? 'swal2-success' :
             icon === 'error' ? 'swal2-error' :
             icon === 'warning' ? 'swal2-warning' : 'swal2-info'
    },
    didOpen: (toast) => {
      toast.style.background = icon === 'success' ? '#22c55e' :
                               icon === 'error' ? '#ef4444' :
                               icon === 'warning' ? '#f59e0b' : '#667eea';
      toast.style.color = 'white';
      toast.style.borderRadius = '8px';
      toast.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      toast.style.fontSize = '14px';
      toast.style.fontWeight = '400';
      toast.style.padding = '12px 20px';
      toast.style.minWidth = '200px';
      toast.style.border = 'none';
    }
  });
  Toast.fire({
    icon: icon,
    title: message
  });
}
}