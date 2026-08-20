import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData, ChartType } from 'chart.js';
import { AuthService } from '../../../core/services/auth.service';
import { EmployeeService } from '../../../core/services/employee.service';
import { ProjectService } from '../../../core/services/project.service';
import { TaskService } from '../../../core/services/task.service';
import { MainLayoutComponent } from '../../../shared/components/main-layout/main-layout';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule, BaseChartDirective, MainLayoutComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class DashboardComponent implements OnInit {
  userName = signal<string>('');
  userRole = signal<string>('');

  // Stats
  totalEmployees = signal<number>(0);
  totalProjects = signal<number>(0);
  totalTasks = signal<number>(0);
  pendingTasks = signal<number>(0);
  completedTasks = signal<number>(0);
  inProgressTasks = signal<number>(0);

  // Recent Data
  recentEmployees = signal<any[]>([]);
  activeProjects = signal<any[]>([]);

  // ===================== DOUGHNUT CHART (Dynamic) =====================
  public doughnutChartOptions: ChartConfiguration<'doughnut'>['options'] = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a2332',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 8,
        padding: 12
      }
    },
    maintainAspectRatio: false
  };

  // 👇 Dynamic data - Signals se update hoga
  public doughnutChartData = signal<ChartData<'doughnut', number[], string | string[]>>({
    labels: ['Completed', 'In Progress', 'Pending'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#22c55e', '#3b82f6', '#ef4444'],
      hoverBackgroundColor: ['#16a34a', '#2563eb', '#dc2626'],
      borderWidth: 0,
      hoverOffset: 8
    }]
  });

  public doughnutChartType = 'doughnut' as const;

  // ===================== BAR CHART (Dynamic) =====================
  public barChartOptions: ChartConfiguration<'bar'>['options'] = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#666', font: { size: 11 } }
      },
      y: {
        grid: { color: 'rgba(0,0,0,0.05)' },
        ticks: { color: '#666', stepSize: 1, font: { size: 11 } },
        beginAtZero: true
      }
    },
    maintainAspectRatio: false
  };

  // 👇 Dynamic data - API se update hoga
  public barChartData = signal<ChartData<'bar'>>({
    labels: [],
    datasets: [{
      data: [],
      label: 'Employees',
      backgroundColor: ['#667eea', '#764ba2', '#f59e0b', '#22c55e', '#ef4444'],
      hoverBackgroundColor: ['#5a67d8', '#6b3fa0', '#d97706', '#16a34a', '#dc2626'],
      borderRadius: 6,
      barPercentage: 0.6
    }]
  });

  public barChartType = 'bar' as const;

  constructor(
    private authService: AuthService,
    private employeeService: EmployeeService,
    private projectService: ProjectService,
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (user) {
      this.userName.set(user.email);
      this.userRole.set(user.role);
    }
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    // 1. Load Employees
    this.employeeService.getEmployees({ limit: 5 }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.totalEmployees.set(response.pagination?.total || 0);
          this.recentEmployees.set(response.data || []);
          this.updateBarChart(response.data || []);
        }
      }
    });

    // 2. Load Projects
    this.projectService.getProjects({ limit: 5, status: 'active' }).subscribe({
      next: (response: any) => {
        if (response.success) {
          this.totalProjects.set(response.pagination?.total || 0);
          this.activeProjects.set(response.data || []);
        }
      }
    });

    // 3. Load Tasks (for chart)
    this.taskService.getTasks({ limit: 100 }).subscribe({
      next: (response: any) => {
        if (response.success) {
          const tasks = response.data || [];
          this.totalTasks.set(tasks.length);
          
          const completed = tasks.filter((t: any) => t.status === 'completed').length;
          const inProgress = tasks.filter((t: any) => t.status === 'in_progress').length;
          const pending = tasks.filter((t: any) => t.status === 'pending').length;
          
          this.completedTasks.set(completed);
          this.inProgressTasks.set(inProgress);
          this.pendingTasks.set(pending);

          // Update doughnut chart
          this.doughnutChartData.set({
            labels: ['Completed', 'In Progress', 'Pending'],
            datasets: [{
              data: [completed, inProgress, pending],
              backgroundColor: ['#22c55e', '#3b82f6', '#ef4444'],
              hoverBackgroundColor: ['#16a34a', '#2563eb', '#dc2626'],
              borderWidth: 0,
              hoverOffset: 8
            }]
          });
        }
      }
    });
  }

  // Update Bar Chart with department data
  updateBarChart(employees: any[]): void {
    const deptCount: Record<string, number> = {};
    employees.forEach(emp => {
      const dept = emp.department || 'Other';
      deptCount[dept] = (deptCount[dept] || 0) + 1;
    });

    const labels = Object.keys(deptCount);
    const data = Object.values(deptCount);

    this.barChartData.set({
      labels: labels,
      datasets: [{
        data: data,
        label: 'Employees',
        backgroundColor: ['#667eea', '#764ba2', '#f59e0b', '#22c55e', '#ef4444', '#3b82f6'],
        hoverBackgroundColor: ['#5a67d8', '#6b3fa0', '#d97706', '#16a34a', '#dc2626', '#2563eb'],
        borderRadius: 6,
        barPercentage: 0.6
      }]
    });
  }

  // ========== NAVIGATION METHODS ==========
  navigateToEmployees(): void {
    this.router.navigate(['/employees']);
  }

  navigateToProjects(): void {
    this.router.navigate(['/projects']);
  }

  navigateToTasks(): void {
    this.router.navigate(['/tasks']);
  }

  logout(): void {
    this.authService.logout();
  }

  chartClicked(event: any): void {
    console.log('Chart clicked:', event);
  }

  chartHovered(event: any): void {
    console.log('Chart hovered:', event);
  }

  getFullName(employee: any): string {
    return `${employee.first_name} ${employee.last_name}`;
  }

  getInitials(employee: any): string {
    return `${employee.first_name?.[0] || ''}${employee.last_name?.[0] || ''}`;
  }
}