import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { TaskService } from '../../../core/services/task.service';
import { ProjectService } from '../../../core/services/project.service';
import { Task } from '../../../core/models/task.model';
import { Project } from '../../../core/models/project.model';
import { MainLayoutComponent } from '../../../shared/components/main-layout/main-layout';
import { ToastService } from '../../../core/services/toast.service';
import Swal from 'sweetalert2';
import { TaskModalComponent } from '../../../shared/components/task-modal/task-modal';

@Component({
  selector: 'app-employee-dashboard',
  imports: [CommonModule, RouterModule, MainLayoutComponent, TaskModalComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class EmployeeDashboardComponent implements OnInit {
  private authService = inject(AuthService);
  private taskService = inject(TaskService);
  private projectService = inject(ProjectService);
  private toastService = inject(ToastService);

  // ========== USER INFO ==========
  userName = signal<string>('');
  userEmail = signal<string>('');
  userAvatar = signal<string>('');

  // ========== STATS ==========
  totalTasks = signal<number>(0);
  pendingTasks = signal<number>(0);
  inProgressTasks = signal<number>(0);
  completedTasks = signal<number>(0);
  totalProjects = signal<number>(0);
  completionRate = signal<number>(0);

  // ========== RECENT DATA ==========
  recentTasks = signal<Task[]>([]);
  recentProjects = signal<Project[]>([]);

  // ========== SEARCH ==========
  isSearchOpen = signal<boolean>(false);
  searchQuery = signal<string>('');
  filteredTasks = signal<Task[]>([]);

  // ========== TASK MODAL ==========
  isTaskModalOpen = signal<boolean>(false);

  // ========== LOADING ==========
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      const displayName = user.name || user.email.split('@')[0];
      this.userName.set(displayName);
      this.userEmail.set(user.email);
      this.userAvatar.set(displayName.charAt(0).toUpperCase());
    }
    this.loadData();
  }

  loadData(): void {
    this.isLoading.set(true);
    
    // Load tasks
    this.taskService.getMyTasks().subscribe({
      next: (response: any) => {
        if (response.success) {
          const tasks = response.data || [];
          this.totalTasks.set(tasks.length);
          this.pendingTasks.set(tasks.filter((t: Task) => t.status === 'pending' || t.status === null).length);
          this.inProgressTasks.set(tasks.filter((t: Task) => t.status === 'in_progress').length);
          this.completedTasks.set(tasks.filter((t: Task) => t.status === 'completed').length);
          
          const rate = this.totalTasks() > 0 
            ? Math.round((this.completedTasks() / this.totalTasks()) * 100) 
            : 0;
          this.completionRate.set(rate);
          
          this.recentTasks.set(tasks.slice(0, 5));
          this.filteredTasks.set(tasks.slice(0, 5));
        }
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.toastService.showError('Failed to load your tasks');
        this.checkLoadingComplete();
      }
    });

    // Load projects
    this.projectService.getMyProjects().subscribe({
      next: (response: any) => {
        if (response.success) {
          const projects = response.data || [];
          this.totalProjects.set(projects.length);
          this.recentProjects.set(projects.slice(0, 3));
        }
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading projects:', error);
        this.toastService.showError('Failed to load your projects');
        this.checkLoadingComplete();
      }
    });
  }

  checkLoadingComplete(): void {
    if (this.totalTasks() !== undefined && this.totalProjects() !== undefined) {
      this.isLoading.set(false);
    }
  }

  // ========== ADD TASK ==========
  openAddTaskModal(): void {
    this.isTaskModalOpen.set(true);
  }

  handleTaskSave(taskData: any): void {
    const user = this.authService.getCurrentUser();
    const data = { ...taskData, employee_id: user?.id };
    
    this.taskService.createTask(data).subscribe({
      next: () => {
        this.isTaskModalOpen.set(false);
        this.toastService.showSuccess('Task created successfully!');
        this.loadData();
      },
      error: (error) => {
        console.error('Error creating task:', error);
        this.toastService.showError(error.error?.message || 'Failed to create task');
      }
    });
  }

  // ========== SEARCH ==========
  toggleSearch(): void {
    this.isSearchOpen.set(!this.isSearchOpen());
    if (!this.isSearchOpen()) {
      this.searchQuery.set('');
      this.filteredTasks.set(this.recentTasks());
    } else {
      setTimeout(() => {
        const input = document.querySelector('.search-wrapper input') as HTMLInputElement;
        if (input) input.focus();
      }, 100);
    }
  }

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    const query = input.value.toLowerCase().trim();
    this.searchQuery.set(query);
    
    if (query === '') {
      this.filteredTasks.set(this.recentTasks());
    } else {
      const filtered = this.recentTasks().filter(task => 
        task.title.toLowerCase().includes(query) ||
        (task.project_name && task.project_name.toLowerCase().includes(query)) ||
        (task.description && task.description.toLowerCase().includes(query))
      );
      this.filteredTasks.set(filtered);
    }
  }

  // ========== VIEW TASK DETAIL ==========
  viewTaskDetail(task: Task): void {
    Swal.fire({
      title: task.title,
      html: `
        <div style="text-align: left;">
          <p><strong>Description:</strong> ${task.description || 'No description'}</p>
          <p><strong>Project:</strong> ${task.project_name || 'No Project'}</p>
          <p><strong>Priority:</strong> ${task.priority || 'medium'}</p>
          <p><strong>Status:</strong> ${this.getStatusText(task.status)}</p>
          <p><strong>Due Date:</strong> ${task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}</p>
        </div>
      `,
      confirmButtonColor: '#667eea',
      confirmButtonText: 'Close'
    });
  }

  // ========== REPORTS ==========
  viewReports(): void {
    const completionRate = this.completionRate();

    Swal.fire({
      title: '📈 Your Performance',
      html: `
        <div style="text-align: left; padding: 8px 0;">
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
            <span>📋 Total Tasks</span>
            <span style="font-weight: 700; color: #1a2332; font-size: 18px;">${this.totalTasks()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
            <span>✅ Completed</span>
            <span style="font-weight: 700; color: #22c55e; font-size: 18px;">${this.completedTasks()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #f0f0f0;">
            <span>⏳ Pending</span>
            <span style="font-weight: 700; color: #f59e0b; font-size: 18px;">${this.pendingTasks()}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 10px 0;">
            <span>🔄 In Progress</span>
            <span style="font-weight: 700; color: #3b82f6; font-size: 18px;">${this.inProgressTasks()}</span>
          </div>
          <div style="margin-top: 16px; padding-top: 16px; border-top: 2px solid #667eea; display: flex; justify-content: space-between;">
            <span style="font-weight: 600; font-size: 16px;">📊 Completion Rate</span>
            <span style="font-weight: 700; color: #667eea; font-size: 24px;">
              ${completionRate}%
            </span>
          </div>
        </div>
      `,
      confirmButtonColor: '#667eea',
      confirmButtonText: 'Close'
    });
  }

  // ========== UTILITY METHODS ==========
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

  getPercentage(value: number, total: number): number {
    return total === 0 ? 0 : Math.round((value / total) * 100);
  }

  getProjectProgress(project: Project): number {
    return project.total_tasks && project.total_tasks > 0 
      ? Math.min(Math.round((project.total_tasks / (project.total_tasks + 1)) * 100), 100)
      : 0;
  }

  getTodayDate(): string {
    const now = new Date();
    return now.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getOverdueTasks(): number {
    const today = new Date();
    return this.recentTasks().filter(task => {
      if (!task.due_date) return false;
      const dueDate = new Date(task.due_date);
      return dueDate < today && task.status !== 'completed';
    }).length;
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }
}