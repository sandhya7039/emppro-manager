import { Component, signal, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmployeeService } from '../../../core/services/employee.service';
import { Employee, EmployeeCreate, EmployeeUpdate } from '../../../core/models/employee.model';
import { MainLayoutComponent } from '../../../shared/components/main-layout/main-layout';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-employees',
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MainLayoutComponent
  ],
  templateUrl: './employees.html',
  styleUrl: './employees.scss'
})
export class EmployeesComponent implements OnInit {
  private employeeService = inject(EmployeeService);
  private fb = inject(FormBuilder);

  // Signals
  employees = this.employeeService.employees;
  loading = this.employeeService.loading;
  total = this.employeeService.total;

  // Modal state
  isModalOpen = signal<boolean>(false);
  modalMode = signal<'add' | 'edit'>('add');
  selectedEmployee = signal<Employee | null>(null);

  // Filters
  searchTerm = signal<string>('');
  selectedDepartment = signal<string>('');
  selectedStatus = signal<string>('');
  currentPage = signal<number>(1);
  pageSize = signal<number>(10);

  // Form
  employeeForm!: FormGroup;
  departments = ['Engineering', 'Quality Assurance', 'Design', 'Marketing', 'HR', 'Finance'];

  constructor() {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadEmployees();
  }

  initForm(): void {
    this.employeeForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      first_name: ['', [Validators.required, Validators.minLength(2)]],
      last_name: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
      designation: ['', [Validators.required]],
      department: ['', [Validators.required]],
      date_joined: ['', [Validators.required]]
    });
  }

  loadEmployees(): void {
    const params: any = {
      page: this.currentPage(),
      limit: this.pageSize()
    };
    if (this.searchTerm()) params.search = this.searchTerm();
    if (this.selectedDepartment()) params.department = this.selectedDepartment();
    if (this.selectedStatus()) params.status = this.selectedStatus();
    this.employeeService.getEmployees(params).subscribe();
  }

  // ========== MODAL FUNCTIONS ==========
  openAddModal(): void {
    this.modalMode.set('add');
    this.selectedEmployee.set(null);
    this.employeeForm.reset();
    this.isModalOpen.set(true);
  }

  openEditModal(employee: Employee): void {
    this.modalMode.set('edit');
    this.selectedEmployee.set(employee);
    this.employeeForm.patchValue({
      email: employee.email,
      first_name: employee.first_name,
      last_name: employee.last_name,
      phone: employee.phone,
      designation: employee.designation,
      department: employee.department,
      date_joined: employee.date_joined ? employee.date_joined.split('T')[0] : ''
    });
    this.isModalOpen.set(true);
  }

  closeModal(): void {
    this.isModalOpen.set(false);
    this.employeeForm.reset();
  }

  // ========== CRUD OPERATIONS ==========
  onSubmit(): void {
    if (this.employeeForm.invalid) {
      this.employeeForm.markAllAsTouched();
      return;
    }

    const formData = this.employeeForm.value;

    if (this.modalMode() === 'add') {
      this.employeeService.createEmployee(formData).subscribe({
        next: () => {
          this.closeModal();
          this.loadEmployees();
        }
      });
    } else {
      const id = this.selectedEmployee()?.id!;
      const updateData: EmployeeUpdate = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
        designation: formData.designation,
        department: formData.department,
        date_joined: formData.date_joined
      };
      this.employeeService.updateEmployee(id, updateData).subscribe({
        next: () => {
          this.closeModal();
          this.loadEmployees();
        }
      });
    }
  }

  // ========== DELETE ==========
  confirmDelete(employee: Employee): void {
    Swal.fire({
      title: 'Delete Employee?',
      text: `Are you sure you want to delete ${employee.first_name} ${employee.last_name}? This action cannot be undone.`,
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
          this.employeeService.deleteEmployee(employee.id).subscribe({
            next: () => {
              this.loadEmployees();
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
          text: `${employee.first_name} ${employee.last_name} has been deleted.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      }
    });
  }

  // ========== STATUS TOGGLE ==========
// ========== STATUS TOGGLE ==========
confirmToggleStatus(employee: Employee): void {
  const actionText = employee.is_active === 1 ? 'Deactivate' : 'Activate';
  const icon = employee.is_active === 1 ? 'warning' : 'info';

  Swal.fire({
    title: `${actionText} Employee?`,
    text: `Are you sure you want to ${actionText.toLowerCase()} ${employee.first_name} ${employee.last_name}?`,
    icon: icon,
    showCancelButton: true,
    confirmButtonColor: employee.is_active === 1 ? '#ef4444' : '#22c55e',
    cancelButtonColor: '#6b7280',
    confirmButtonText: `Yes, ${actionText}!`,
    cancelButtonText: 'Cancel',
    reverseButtons: true,
    showLoaderOnConfirm: true,
    preConfirm: () => {
      return new Promise((resolve) => {
        const status = employee.is_active === 1 ? false : true;
        console.log('🔄 Sending status:', status);
        
        // 👇 Only send is_active, not all fields
        this.employeeService.toggleStatus(employee.id, status).subscribe({
          next: () => {
            this.loadEmployees();
            resolve(true);
          },
          error: (error) => {
            console.error('❌ Toggle error:', error);
            resolve(false);
          }
        });
      });
    },
    allowOutsideClick: () => !Swal.isLoading()
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: `${actionText}d!`,
        text: `${employee.first_name} ${employee.last_name} has been ${actionText.toLowerCase()}d.`,
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
    this.loadEmployees();
  }

  onDepartmentFilter(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedDepartment.set(select.value);
    this.currentPage.set(1);
    this.loadEmployees();
  }

  onStatusFilter(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.selectedStatus.set(select.value);
    this.currentPage.set(1);
    this.loadEmployees();
  }

  changePage(page: number): void {
    this.currentPage.set(page);
    this.loadEmployees();
  }

  // ========== UTILITY ==========
  get f() { return this.employeeForm.controls; }
  getFullName(employee: Employee): string { return `${employee.first_name} ${employee.last_name}`; }
  getStatusBadge(status: number): string { return status === 1 ? 'badge-active' : 'badge-inactive'; }
  getStatusText(status: number): string { return status === 1 ? 'Active' : 'Inactive'; }
  get totalPages(): number { return Math.ceil(this.total() / this.pageSize()); }
}