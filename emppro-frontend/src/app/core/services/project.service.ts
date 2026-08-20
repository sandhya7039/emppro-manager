import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Project, ProjectCreate, ProjectUpdate, ProjectAssign } from '../models/project.model';
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
export class ProjectService {
  private apiUrl = environment.apiBaseUrl;

  private projectsSignal = signal<Project[]>([]);
  public projects = this.projectsSignal.asReadonly();

  private loadingSignal = signal<boolean>(false);
  public loading = this.loadingSignal.asReadonly();

  private totalSignal = signal<number>(0);
  public total = this.totalSignal.asReadonly();

  constructor(private http: HttpClient) {}

  getProjects(params?: any): Observable<ApiResponse<Project[]>> {
    this.loadingSignal.set(true);
    return this.http.get<ApiResponse<Project[]>>(`${this.apiUrl}/projects`, { params }).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.projectsSignal.set(response.data);
            this.totalSignal.set(response.pagination?.total || 0);
          }
          this.loadingSignal.set(false);
        },
        error: (error) => {
          this.loadingSignal.set(false);
          this.showToast('error', 'Failed to load projects');
          console.error('Get projects error:', error);
        }
      })
    );
  }

getMyProjects(): Observable<ApiResponse<Project[]>> {
  console.log('📤 Calling API:', `${this.apiUrl}/projects/my-projects`);
  return this.http.get<ApiResponse<Project[]>>(`${this.apiUrl}/projects/my-projects`).pipe(
    tap({
      next: (response) => {
        console.log('📥 Response:', response);
      },
      error: (error) => {
        console.error('❌ Error:', error);
      }
    })
  );
}
  getProjectById(id: number): Observable<ApiResponse<Project>> {
    return this.http.get<ApiResponse<Project>>(`${this.apiUrl}/projects/${id}`);
  }

  createProject(data: ProjectCreate): Observable<ApiResponse<Project>> {
    return this.http.post<ApiResponse<Project>>(`${this.apiUrl}/projects`, data).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.showToast('success', response.message || 'Project created successfully!');
            this.getProjects().subscribe();
          }
        },
        error: (error) => {
          this.showToast('error', error.error?.message || 'Failed to create project');
          console.error('Create error:', error);
        }
      })
    );
  }

  updateProject(id: number, data: ProjectUpdate): Observable<ApiResponse<Project>> {
    return this.http.put<ApiResponse<Project>>(`${this.apiUrl}/projects/${id}`, data).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.showToast('success', response.message || 'Project updated successfully!');
            this.getProjects().subscribe();
          }
        },
        error: (error) => {
          this.showToast('error', error.error?.message || 'Failed to update project');
          console.error('Update error:', error);
        }
      })
    );
  }

  deleteProject(id: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/projects/${id}`).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.showToast('success', response.message || 'Project deleted successfully!');
            this.getProjects().subscribe();
          }
        },
        error: (error) => {
          this.showToast('error', error.error?.message || 'Failed to delete project');
          console.error('Delete error:', error);
        }
      })
    );
  }

  assignEmployees(projectId: number, employeeIds: number[]): Observable<ApiResponse<null>> {
    return this.http.post<ApiResponse<null>>(`${this.apiUrl}/projects/${projectId}/assign`, { employee_ids: employeeIds }).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.showToast('success', response.message || 'Employees assigned successfully!');
            this.getProjects().subscribe();
          }
        },
        error: (error) => {
          this.showToast('error', error.error?.message || 'Failed to assign employees');
          console.error('Assign error:', error);
        }
      })
    );
  }

  removeEmployee(projectId: number, employeeId: number): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(`${this.apiUrl}/projects/${projectId}/assign/${employeeId}`).pipe(
      tap({
        next: (response) => {
          if (response.success) {
            this.showToast('success', response.message || 'Employee removed successfully!');
            this.getProjects().subscribe();
          }
        },
        error: (error) => {
          this.showToast('error', error.error?.message || 'Failed to remove employee');
          console.error('Remove error:', error);
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