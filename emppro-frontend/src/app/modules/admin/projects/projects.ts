import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ProjectService } from '../../../core/services/project.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { Project, ProjectCreate, ProjectUpdate } from '../../../core/models/project.model';
import { MainLayoutComponent } from '../../../shared/components/main-layout/main-layout';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-projects',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MainLayoutComponent
  ],
  templateUrl: './projects.html',
  styleUrl: './projects.scss'
})
export class ProjectsComponent implements OnInit {
  private projectService = inject(ProjectService);
  private employeeService = inject(EmployeeService);
  private fb = inject(FormBuilder);

  // Signals
  projects = this.projectService.projects;
  loading = this.projectService.loading;
  total = this.projectService.total;
  employees = this.employeeService.employees;

  // Modal states
  isModalOpen = signal<boolean>(false);
  modalMode = signal<'add' | 'edit' | 'assign'>('add');
  selectedProject = signal<Project | null>(null);
  selectedEmployeeIds = signal<number[]>([]);

  // Filters
  searchTerm = signal<string>('');
  selectedStatus = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  // Form
  projectForm!: FormGroup;
  statusOptions = ['planned', 'active', 'completed', 'on-hold'];

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadEmployees();
  }

  initForm(): void {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required]],
      start_date: ['', [Validators.required]],
      end_date: [''],
      status: ['planned', [Validators.required]]
    });
  }

  loadProjects(): void {
    const params: any = {
      page: this.currentPage(),
      limit: this.pageSize()
    };
    if (this.searchTerm()) params.search = this.searchTerm();
    if (this.selectedStatus()) params.status = this.selectedStatus();
    this.projectService.getProjects(params).subscribe();
  }

  loadEmployees(): void {
    this.employeeService.getEmployees({ limit: 100 }).subscribe();
  }

  // ========== MODAL FUNCTIONS ==========
  openAddModal(): void {
    this.modalMode.set('add');
    this.selectedProject.set(null);
    this.projectForm.reset({ status: 'planned' });
    this.isModalOpen.set(true);
  }

  openEditModal(project: Project): void {
    this.modalMode.set('edit');
    this.selectedProject.set(project);
    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      start_date: project.start_date,
      end_date: project.end_date || '',
      status: project.status
    });
    this.isModalOpen.set(true);
  }

  openAssignModal(project: Project): void {
    this.modalMode.set('assign');
    this.selectedProject.set(project);
    this.selectedEmployeeIds.set([]);
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.projectForm.reset({ status: 'planned' });
    this.selectedEmployeeIds.set([]);
  }

  // ========== CRUD OPERATIONS ==========
  onSubmit(): void {
    if (this.projectForm.invalid) {
      this.projectForm.markAllAsTouched();
      return;
    }

    const formData = this.projectForm.value;

    if (this.modalMode() === 'add') {
      this.projectService.createProject(formData).subscribe({
        next: () => {
          this.closeModal();
          this.loadProjects();
        }
      });
    } else if (this.modalMode() === 'edit') {
      const id = this.selectedProject()?.id!;
      this.projectService.updateProject(id, formData).subscribe({
        next: () => {
          this.closeModal();
          this.loadProjects();
        }
      });
    }
  }

  // ========== ASSIGN EMPLOYEES ==========
  toggleEmployeeSelection(employeeId: number): void {
    const current = this.selectedEmployeeIds();
    if (current.includes(employeeId)) {
      this.selectedEmployeeIds.set(current.filter(id => id !== employeeId));
    } else {
      this.selectedEmployeeIds.set([...current, employeeId]);
    }
  }

  assignEmployees(): void {
    const projectId = this.selectedProject()?.id!;
    const employeeIds = this.selectedEmployeeIds();

    if (employeeIds.length === 0) {
      Swal.fire({
        title: 'No Selection',
        text: 'Please select at least one employee to assign.',
        icon: 'warning',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    this.projectService.assignEmployees(projectId, employeeIds).subscribe({
      next: () => {
        this.closeModal();
        this.loadProjects();
      }
    });
  }

  // ========== DELETE ==========
  confirmDelete(project: Project): void {
    Swal.fire({
      title: 'Delete Project?',
      text: `Are you sure you want to delete "${project.name}"? This action cannot be undone.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      showLoaderOnConfirm: true,
      preConfirm: () => {
        return new Promise((resolve) => {
          this.projectService.deleteProject(project.id).subscribe({
            next: () => {
              this.loadProjects();
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
          text: `"${project.name}" has been deleted.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  // ========== FILTERS & PAGINATION ==========
  onSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
    this.currentPage.set(1);
    this.loadProjects();
  }

  onStatusFilter(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus.set(select.value);
    this.currentPage.set(1);
    this.loadProjects();
  }

  changePage(page: number): void {
    this.currentPage.set(page);
    this.loadProjects();
  }

  // ========== UTILITY ==========
  get f() { return this.projectForm.controls; }
  getStatusBadge(status: string): string {
    const map: Record<string, string> = {
      'planned': 'badge-planned',
      'active': 'badge-active',
      'completed': 'badge-completed',
      'on-hold': 'badge-hold'
    };
    return map[status] || 'badge-planned';
  }
  getStatusText(status: string): string {
    const map: Record<string, string> = {
      'planned': 'Planned',
      'active': 'Active',
      'completed': 'Completed',
      'on-hold': 'On Hold'
    };
    return map[status] || status;
  }
  get totalPages(): number { return Math.ceil(this.total() / this.pageSize()); }
  getEmployeeCount(project: Project): number { return project.total_employees || 0; }
  isEmployeeSelected(id: number): boolean { return this.selectedEmployeeIds().includes(id); }
}