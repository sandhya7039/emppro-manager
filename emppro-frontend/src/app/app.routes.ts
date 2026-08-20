import { Routes } from '@angular/router';
import { LoginComponent } from './modules/auth/login/login';
import { DashboardComponent } from './modules/admin/dashboard/dashboard';
import { EmployeesComponent } from './modules/admin/employees/employees';
import { ProjectsComponent } from './modules/admin/projects/projects';
import { TasksComponent } from './modules/admin/tasks/tasks';
import { EmployeeDashboardComponent } from './modules/employee/dashboard/dashboard';
import { MyProjectsComponent } from './modules/employee/my-projects/my-projects'; // 👈 Import
import { MyTasksComponent } from './modules/employee/my-tasks/my-tasks';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },

  // Admin Routes
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'employees',
    component: EmployeesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'projects',
    component: ProjectsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },
  {
    path: 'tasks',
    component: TasksComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] }
  },

  // Employee Routes
  {
    path: 'my-dashboard',
    component: EmployeeDashboardComponent,
    canActivate: [AuthGuard],
    data: { roles: ['employee'] }
  },
  {
    path: 'my-projects',  // 👈 Route
    component: MyProjectsComponent,
    canActivate: [AuthGuard],
    data: { roles: ['employee'] }
  },
  {
    path: 'my-tasks',
    component: MyTasksComponent,
    canActivate: [AuthGuard],
    data: { roles: ['employee'] }
  },

  { path: '**', redirectTo: '/login' }
];