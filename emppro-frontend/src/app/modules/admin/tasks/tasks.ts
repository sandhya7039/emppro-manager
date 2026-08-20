import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TaskService } from '../../../core/services/task.service';
import { ProjectService } from '../../../core/services/project.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { Task } from '../../../core/models/task.model';
import { Project } from '../../../core/models/project.model';
import { Employee } from '../../../core/models/employee.model';
import { MainLayoutComponent } from '../../../shared/components/main-layout/main-layout';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-tasks',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MainLayoutComponent
  ],
  templateUrl: './tasks.html',
  styleUrl: './tasks.scss'
})
export class TasksComponent implements OnInit {
  private taskService = inject(TaskService);
  private projectService = inject(ProjectService);
  private employeeService = inject(EmployeeService);
  private fb = inject(FormBuilder);

  // Signals - These are READONLY from service
  tasks = this.taskService.tasks;
  loading = this.taskService.loading;
  total = this.taskService.total;
  
  projects = signal<Project[]>([]);
  employees = signal<Employee[]>([]);

  // Modal
  isModalOpen = signal<boolean>(false);
  modalMode = signal<'add' | 'edit'>('add');
  selectedTask = signal<Task | null>(null);

  // Filters
  searchTerm = signal<string>('');
  selectedStatus = signal<string>('');
  selectedProject = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  // Form
  taskForm!: FormGroup;
  statusOptions = ['pending', 'in_progress', 'completed'];
  priorityOptions = ['low', 'medium', 'high'];

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadTasks();
    this.loadProjects();
    this.loadEmployees();
  }

  initForm(): void {
    this.taskForm = this.fb.group({
      project_id: ['', [Validators.required]],
      employee_id: ['', [Validators.required]],
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      priority: ['medium', [Validators.required]],
      due_date: ['', [Validators.required]]
    });
  }

  // 👇 FIXED: loadTasks method
  loadTasks(): void {
    const params: any = {
      page: this.currentPage(),
      limit: this.pageSize()
    };
    if (this.searchTerm()) params.search = this.searchTerm();
    if (this.selectedStatus()) params.status = this.selectedStatus();
    if (this.selectedProject()) params.project_id = this.selectedProject();
    
    this.taskService.getTasks(params).subscribe(); // Service manages signals
  }

  loadProjects(): void {
    this.projectService.getProjects({ limit: 100 }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.projects.set(response.data || []);
        }
      }
    });
  }

  loadEmployees(): void {
    this.employeeService.getEmployees({ limit: 100 }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.employees.set(response.data || []);
        }
      }
    });
  }

  // ========== MODAL ==========
  openAddModal(): void {
    this.modalMode.set('add');
    this.selectedTask.set(null);
    this.taskForm.reset({
      project_id: '',
      employee_id: '',
      title: '',
      description: '',
      priority: 'medium',
      due_date: ''
    });
    this.isModalOpen.set(true);
  }

  openEditModal(task: Task): void {
    console.log('📝 Editing task:', task);
    
    this.modalMode.set('edit');
    this.selectedTask.set(task);
    
    // Find project_id from project_name
    let projectId = task.project_id;
    if (!projectId && task.project_name) {
      const found = this.projects().find(p => p.name === task.project_name);
      projectId = found?.id || 0;
    }
    
    // Find employee_id from assigned_to
    let employeeId = task.employee_id;
    if (!employeeId && task.assigned_to) {
      const [firstName, lastName] = task.assigned_to.split(' ');
      const found = this.employees().find(e => 
        e.first_name === firstName && e.last_name === lastName
      );
      employeeId = found?.id || 0;
    }
    
    const dueDate = task.due_date ? task.due_date.split('T')[0] : '';
    
    this.taskForm.patchValue({
      project_id: projectId || '',
      employee_id: employeeId || '',
      title: task.title || '',
      description: task.description || '',
      priority: task.priority || 'medium',
      due_date: dueDate
    });
    
    console.log('📋 Form after patch:', this.taskForm.value);
    
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.taskForm.reset({
      project_id: '',
      employee_id: '',
      title: '',
      description: '',
      priority: 'medium',
      due_date: ''
    });
  }

  // ========== CRUD ==========
  onSubmit(): void {
    if (this.taskForm.invalid) {
      this.taskForm.markAllAsTouched();
      return;
    }

    const formData = this.taskForm.value;

    if (this.modalMode() === 'add') {
      this.taskService.createTask(formData).subscribe({
        next: () => {
          this.closeModal();
          this.loadTasks();
        }
      });
    } else {
      const id = this.selectedTask()?.id!;
      this.taskService.updateTask(id, formData).subscribe({
        next: () => {
          this.closeModal();
          this.loadTasks();
        }
      });
    }
  }

  // ========== DELETE ==========
  confirmDelete(task: Task): void {
    Swal.fire({
      title: 'Delete Task?',
      text: `Are you sure you want to delete "${task.title}"?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return new Promise((resolve) => {
          this.taskService.deleteTask(task.id).subscribe({
            next: () => {
              this.loadTasks();
              resolve(true);
            },
            error: () => resolve(false)
          });
        });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Deleted!',
          text: `"${task.title}" has been deleted.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  // ========== STATUS UPDATE ==========
  updateStatus(task: Task, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const status = select.value;
    
    this.taskService.updateTaskStatus(task.id, status).subscribe({
      next: () => {
        this.loadTasks();
      }
    });
  }

  // ========== FILTERS ==========
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
    this.loadTasks();
  }

  onStatusFilter(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus.set(select.value);
    this.currentPage.set(1);
    this.loadTasks();
  }

  onProjectFilter(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedProject.set(select.value);
    this.currentPage.set(1);
    this.loadTasks();
  }

  changePage(page: number): void {
    this.currentPage.set(page);
    this.loadTasks();
  }

  // ========== UTILITY ==========
  get f() { return this.taskForm.controls; }
  get totalPages(): number { return Math.ceil(this.total() / this.pageSize()); }
  
  // 👇 FIXED: Handle null status
  getStatusBadge(status: string | null): string {
    const safeStatus = status || 'pending';
    const map: Record<string, string> = {
      'pending': 'badge-pending',
      'in_progress': 'badge-progress',
      'completed': 'badge-completed'
    };
    return map[safeStatus] || 'badge-pending';
  }
  
  getStatusText(status: string | null): string {
    const safeStatus = status || 'pending';
    const map: Record<string, string> = {
      'pending': 'Pending',
      'in_progress': 'In Progress',
      'completed': 'Completed'
    };
    return map[safeStatus] || 'Pending';
  }
  
  getPriorityBadge(priority: string): string {
    const map: Record<string, string> = {
      'low': 'priority-low',
      'medium': 'priority-medium',
      'high': 'priority-high'
    };
    return map[priority] || 'priority-medium';
  }
  
  getEmployeeName(employeeId: number): string {
    const emp = this.employees().find(e => e.id === employeeId);
    return emp ? `${emp.first_name} ${emp.last_name}` : 'Unknown';
  }
  
  getProjectName(projectId: number): string {
    const proj = this.projects().find(p => p.id === projectId);
    return proj ? proj.name : 'Unknown';
  }
}