import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ProjectService } from '../../../core/services/project.service';
import { Project } from '../../../core/models/project.model';
import { MainLayoutComponent } from '../../../shared/components/main-layout/main-layout';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-my-projects',
  imports: [CommonModule, RouterModule, MainLayoutComponent],
  templateUrl: './my-projects.html',
  styleUrl: './my-projects.scss'
})
export class MyProjectsComponent implements OnInit {
  private projectService = inject(ProjectService);
  private toastService = inject(ToastService);

  projects = signal<Project[]>([]);
  loading = signal<boolean>(true);
  searchTerm = signal<string>('');
  error = signal<string | null>(null);

  ngOnInit(): void {
    console.log('🔄 MyProjectsComponent initialized');
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading.set(true);
    this.error.set(null);
    
    console.log('🔄 Loading my projects...');
    
    this.projectService.getMyProjects().subscribe({
      next: (response: any) => {
        console.log('📦 Response:', response);
        
        if (response && response.success) {
          const data = response.data || [];
          console.log('📋 Projects found:', data.length);
          this.projects.set(data);
        } else {
          console.warn('⚠️ No data in response');
          this.error.set('No projects found');
          this.projects.set([]);
        }
        this.loading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading projects:', error);
        this.error.set(error.message || 'Failed to load projects');
        this.loading.set(false);
        this.projects.set([]);
        this.toastService.showError('Failed to load your projects');
      }
    });
  }

  // Filtered projects based on search
  get filteredProjects(): Project[] {
    const search = this.searchTerm().toLowerCase().trim();
    if (!search) return this.projects();
    return this.projects().filter(p => 
      p.name?.toLowerCase().includes(search) ||
      p.description?.toLowerCase().includes(search)
    );
  }

  // Status badge class
  getStatusBadge(status: string): string {
    const map: Record<string, string> = {
      'planned': 'badge-planned',
      'active': 'badge-active',
      'completed': 'badge-completed',
      'on-hold': 'badge-hold'
    };
    return map[status] || 'badge-planned';
  }

  // Status display text
  getStatusText(status: string): string {
    const map: Record<string, string> = {
      'planned': 'Planned',
      'active': 'Active',
      'completed': 'Completed',
      'on-hold': 'On Hold'
    };
    return map[status] || status;
  }

  // Project progress
  getProgress(project: Project): number {
    return project.total_tasks && project.total_tasks > 0 
      ? Math.min(Math.round((project.total_tasks / (project.total_tasks + 1)) * 100), 100)
      : 0;
  }

  // Search handler
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  // Refresh
  refresh(): void {
    this.loadProjects();
  }
}