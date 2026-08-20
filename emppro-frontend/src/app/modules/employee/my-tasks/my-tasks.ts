import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../../core/services/task.service';
import { Task } from '../../../core/models/task.model';
import { MainLayoutComponent } from '../../../shared/components/main-layout/main-layout';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-my-tasks',
  imports: [CommonModule, RouterModule, MainLayoutComponent],  // ✅ MainLayoutComponent import
  templateUrl: './my-tasks.html',
  styleUrl: './my-tasks.scss'
})
export class MyTasksComponent implements OnInit {
  private taskService = inject(TaskService);
  private toastService = inject(ToastService);

  tasks = signal<Task[]>([]);
  loading = signal<boolean>(true);
  searchTerm = signal<string>('');
  filterStatus = signal<string>('');

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.loading.set(true);
    this.taskService.getMyTasks().subscribe({
      next: (response: any) => {
        if (response.success) {
          this.tasks.set(response.data || []);
        }
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toastService.showError('Failed to load tasks');
      }
    });
  }

// Update task status
updateStatus(task: Task, event: Event): void {
  const select = event.target as HTMLSelectElement;
  const status = select.value;
  
  console.log('🔄 Updating status for task:', task.id, 'to:', status);

  this.taskService.updateTaskStatus(task.id, status).subscribe({
    next: (response: any) => {
      console.log('✅ Update successful:', response);
      // 👇 Status already updated in service, just reload
      this.loadTasks();
    },
    error: (error) => {
      console.error('❌ Update failed:', error);
      // 👇 Revert select value on error
      select.value = task.status || 'pending';
      this.toastService.showError(error.error?.message || 'Failed to update status');
    }
  });
}
  get filteredTasks(): Task[] {
    let result = this.tasks();
    
    if (this.searchTerm()) {
      const search = this.searchTerm().toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(search) ||
        (t.project_name && t.project_name.toLowerCase().includes(search))
      );
    }
    
    if (this.filterStatus()) {
      result = result.filter(t => t.status === this.filterStatus());
    }
    
    return result;
  }

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

  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  onFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filterStatus.set(select.value);
  }

  refresh(): void {
    this.loadTasks();
  }
}