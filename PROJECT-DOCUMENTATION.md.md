# Employee & Project Management System
## EmpPro Manager — Technical Documentation

**Document Version:** 2.0
**Prepared By:** Sandhya Prajapati, Full Stack Developer
**Last Updated:** August 2026

---

## Table of Contents

1. Project Overview
2. Technical Stack
3. System Architecture
4. User Roles & Permissions
5. Application Flow
6. Database Design
7. API Documentation
8. Folder Structure
9. Development Phases
10. Security Implementation
11. Deployment Strategy
12. Testing Strategy
13. Key Features Summary
14. Interview Talking Points

---

## 1. Project Overview

### 1.1 Problem Statement

Small and mid-sized organizations frequently manage employee records, project assignments, and task tracking through disconnected tools — spreadsheets, email threads, and standalone to-do lists. This fragmented approach leads to several recurring issues:

- No single source of truth for employee-to-project mapping
- Managers lack real-time visibility into task progress
- Employees have no centralized view of their assigned work
- Access control is informal, with no clear separation between administrative and operational responsibilities
- Reporting requires manual data consolidation, which is time-consuming and error-prone

### 1.2 Solution

**EmpPro Manager** (formally, the **Employee & Project Management System**) is a full-stack web application that centralizes employee, project, and task management into a single, role-secured platform. It provides:

- A unified system where Admins manage organizational data (employees, projects, tasks) through structured CRUD workflows
- A self-service portal for Employees to view their assignments and update task status without administrative overhead
- Secure, token-based authentication with role-based access control (RBAC) to enforce data boundaries between Admin and Employee roles
- A responsive interface usable across desktop and mobile devices
- A normalized relational database that accurately models real-world relationships between employees, projects, and tasks

### 1.3 Project Links

| Resource | Link |
|---|---|
| Repository | [GitHub URL - To be added] |
| Live Demo | [URL - To be added] |

### 1.4 Target Users

| Role | Description |
|---|---|
| Admin | HR/Project Managers responsible for organizational oversight |
| Employee | Staff members who need visibility into their own assignments and task status |

### 1.5 Project Objectives

- Demonstrate end-to-end full stack development capability (Angular + Node.js + MySQL)
- Apply industry-standard architectural patterns (MVC, layered architecture, RESTful design)
- Implement production-grade security practices (JWT, hashing, RBAC, input validation)
- Showcase clean code organization suitable for team-based development and scaling

---

## 2. Technical Stack

### 2.1 Frontend

| Technology | Purpose | Version |
|---|---|---|
| Angular | Core SPA framework | 16.2.0 |
| TypeScript | Type-safe application logic | 5.2.2 |
| Angular Reactive Forms | Form building and validation | Built-in |
| Angular Router | Client-side navigation, route guards | Built-in |
| RxJS | Reactive state and HTTP stream handling | 7.8.x |
| Bootstrap | Responsive UI styling and layout grid | 5.3.x |
| HttpClient + Interceptors | API communication, JWT injection | Built-in |

### 2.2 Backend

| Technology | Purpose | Version |
|---|---|---|
| Node.js | JavaScript runtime | 20.11.0 LTS |
| Express.js | REST API framework | 4.18.2 |
| jsonwebtoken | JWT generation and verification | 9.0.x |
| bcrypt | Password hashing | 5.1.x |
| express-validator | Request payload validation | 7.0.x |
| mysql2 | MySQL database driver | 3.9.x |
| dotenv | Environment variable management | 16.4.x |
| cors | Cross-origin resource handling | 2.8.x |

### 2.3 Database

| Technology | Purpose | Version |
|---|---|---|
| MySQL | Relational data storage | 8.0.36 |
| InnoDB Engine | Transactional integrity, foreign key enforcement | Default (MySQL 8+) |

### 2.4 Tooling & DevOps

| Tool | Purpose |
|---|---|
| Git & GitHub | Version control |
| Postman | API testing |
| npm | Package management |
| Angular CLI | Project scaffolding and build |
| ESLint / Prettier | Code quality and formatting |

---

## 3. System Architecture

EmpPro Manager follows a **three-tier layered architecture**, cleanly separating presentation, business logic, and data persistence.

```
┌─────────────────────────────────────────────────────────────┐
│                      PRESENTATION LAYER                       │
│                     (Angular 16.2.0 Client)                   │
│                                                                 │
│   Components → Services → HTTP Interceptor → Route Guards     │
│   (UI/UX)      (API calls)  (JWT injection)   (Auth/Role)      │
└───────────────────────────┬────────────────────────────────────┘
                              │  HTTPS / REST (JSON)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                        │
│               (Node.js 20.11.0 + Express.js 4.18.2)           │
│                                                                 │
│   Routes → Middleware → Controllers → Services                │
│   (endpoints) (auth/validation) (request logic) (business)    │
└───────────────────────────┬────────────────────────────────────┘
                              │  SQL Queries (mysql2)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        DATA LAYER                              │
│                      (MySQL 8.0.36 Database)                  │
│                                                                 │
│   users │ employees │ projects │ project_employees │ tasks    │
└─────────────────────────────────────────────────────────────┘
```

### 3.1 Request Lifecycle

```
Client Request
     │
     ▼
[HTTP Interceptor] → attaches JWT to Authorization header
     │
     ▼
[Express Router] → maps endpoint to controller
     │
     ▼
[Auth Middleware] → verifies JWT signature & expiry
     │
     ▼
[Role Middleware] → checks user role against required permission
     │
     ▼
[Validation Middleware] → validates request payload (express-validator)
     │
     ▼
[Controller] → orchestrates request, calls service/model layer
     │
     ▼
[MySQL Query Layer] → executes parameterized SQL query
     │
     ▼
[Error Handler] → catches and formats any thrown errors
     │
     ▼
JSON Response → returned to Angular client
```

### 3.2 Architectural Principles Applied

- **Separation of Concerns:** Controllers handle HTTP logic; services/models handle data logic
- **DRY (Don't Repeat Yourself):** Shared middleware for auth, validation, and error handling
- **Statelessness:** JWT-based authentication removes server-side session dependency
- **Single Responsibility:** Each Angular service maps to one backend resource (EmployeeService, ProjectService, TaskService, AuthService)

---

## 4. User Roles & Permissions

### 4.1 Role Definitions

| Role | Description |
|---|---|
| **Admin** | Full administrative control over employees, projects, and tasks |
| **Employee** | Restricted access limited to own profile and assigned work |

### 4.2 Permissions Matrix

| Feature / Action | Admin | Employee |
|---|:---:|:---:|
| Login / Logout | ✅ | ✅ |
| View own profile | ✅ | ✅ |
| Update own profile | ✅ | ✅ (limited fields) |
| View all employees | ✅ | ❌ |
| Create / Edit / Delete employees | ✅ | ❌ |
| View all projects | ✅ | ❌ |
| View own assigned projects | ✅ | ✅ (read-only) |
| Create / Edit / Delete projects | ✅ | ❌ |
| Assign employees to projects | ✅ | ❌ |
| View all tasks | ✅ | ❌ |
| View own assigned tasks | ✅ | ✅ |
| Create / Edit / Delete tasks | ✅ | ❌ |
| Update status of own tasks | ✅ | ✅ |
| Update status of others' tasks | ✅ | ❌ |
| View reports / dashboards | ✅ (full) | ✅ (personal summary only) |

### 4.3 Enforcement Mechanism

Role permissions are enforced at **two layers** to prevent unauthorized access even if the frontend is bypassed:

1. **Frontend (Angular):** `AuthGuard` and `RoleGuard` restrict route navigation based on decoded JWT claims
2. **Backend (Express):** `authMiddleware` verifies the JWT; `roleMiddleware(['admin'])` restricts controller execution based on the role embedded in the token payload

---

## 5. Application Flow

### 5.1 Admin User Journey

```
Login → Admin Dashboard
   │
   ├── Employee Management
   │     ├── View Employee List (search, filter, paginate)
   │     ├── Add New Employee (creates linked user account)
   │     ├── Edit Employee Details
   │     └── Deactivate / Delete Employee
   │
   ├── Project Management
   │     ├── View Project List
   │     ├── Create New Project
   │     ├── Assign / Remove Employees (M:M mapping)
   │     └── Edit / Delete Project
   │
   ├── Task Management
   │     ├── View Tasks (filter by project/employee/status)
   │     ├── Create Task (assign to project + employee)
   │     ├── Edit / Reassign Task
   │     └── Delete Task
   │
   └── Reports
         ├── Project-wise task completion
         ├── Employee workload distribution
         └── Overdue task summary
```

### 5.2 Employee User Journey

```
Login → Employee Dashboard
   │
   ├── My Profile
   │     └── View / Update personal details
   │
   ├── My Projects
   │     └── View assigned projects (read-only)
   │
   └── My Tasks
         ├── View assigned tasks (filter by status)
         └── Update task status (Pending → In Progress → Completed)
```

### 5.3 Authentication Flow

```
1. User submits credentials (email + password) via Reactive Form
2. Angular AuthService sends POST /api/auth/login
3. Backend validates credentials, compares hashed password (bcrypt)
4. On success, backend issues JWT containing { userId, role, exp }
5. Token stored in Angular via AuthService (see Section 10.5 for storage strategy)
6. HTTP Interceptor attaches token to all subsequent requests
7. Route Guards check token validity + decoded role before granting access
8. On expiry/invalid token, user is redirected to login screen
```

---

## 6. Database Design

### 6.1 Entity Relationship Diagram (Text Format)

```
┌───────────────┐        1:1        ┌────────────────┐
│     users     │───────────────────│    employees    │
├───────────────┤                    ├────────────────┤
│ PK id         │                    │ PK id           │
│    email      │                    │ FK user_id      │
│    password   │                    │    first_name   │
│    role       │                    │    last_name    │
│    created_at │                    │    phone        │
└───────────────┘                    │    designation  │
                                       │    department   │
                                       │    date_joined  │
                                       └────────┬─────────┘
                                                │ 1
                                                │
                                                │ M
                                       ┌────────┴─────────┐
                                       │ project_employees │
                                       ├───────────────────┤
                                       │ PK id             │
                                       │ FK project_id     │
                                       │ FK employee_id     │
                                       │    assigned_date   │
                                       └────────┬───────────┘
                                                │ M
                                                │
                                                │ 1
                                       ┌────────┴─────────┐
                                       │     projects      │
                                       ├───────────────────┤
                                       │ PK id             │
                                       │    name           │
                                       │    description    │
                                       │    start_date      │
                                       │    end_date        │
                                       │    status          │
                                       └────────┬───────────┘
                                                │ 1
                                                │
                                                │ M
                                       ┌────────┴─────────┐
                                       │       tasks        │
                                       ├───────────────────┤
                                       │ PK id             │
                                       │ FK project_id      │
                                       │ FK employee_id      │
                                       │    title            │
                                       │    description       │
                                       │    status             │
                                       │    priority           │
                                       │    due_date            │
                                       └───────────────────┘
```

**Relationship Summary:**

| Relationship | Type | Description |
|---|---|---|
| users ↔ employees | 1:1 | Each user account maps to exactly one employee profile |
| employees ↔ projects | M:M | Resolved via `project_employees` junction table |
| projects ↔ tasks | 1:M | One project has multiple tasks |
| employees ↔ tasks | 1:M | One employee can be assigned multiple tasks |

### 6.2 Table Schemas

#### 6.2.1 `users`

| Column | Type | Constraints |
|---|---|---|
| id | INT | PK, AUTO_INCREMENT |
| email | VARCHAR(150) | UNIQUE, NOT NULL |
| password | VARCHAR(255) | NOT NULL (bcrypt hash) |
| role | ENUM('admin','employee') | NOT NULL, DEFAULT 'employee' |
| is_active | BOOLEAN | DEFAULT TRUE |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |
| updated_at | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP |

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','employee') NOT NULL DEFAULT 'employee',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;
```

#### 6.2.2 `employees`

| Column | Type | Constraints |
|---|---|---|
| id | INT | PK, AUTO_INCREMENT |
| user_id | INT | FK → users(id), UNIQUE, NOT NULL |
| first_name | VARCHAR(100) | NOT NULL |
| last_name | VARCHAR(100) | NOT NULL |
| phone | VARCHAR(20) | NULL |
| designation | VARCHAR(100) | NOT NULL |
| department | VARCHAR(100) | NOT NULL |
| date_joined | DATE | NOT NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

```sql
CREATE TABLE employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  designation VARCHAR(100) NOT NULL,
  department VARCHAR(100) NOT NULL,
  date_joined DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_department (department)
) ENGINE=InnoDB;
```

#### 6.2.3 `projects`

| Column | Type | Constraints |
|---|---|---|
| id | INT | PK, AUTO_INCREMENT |
| name | VARCHAR(150) | NOT NULL |
| description | TEXT | NULL |
| start_date | DATE | NOT NULL |
| end_date | DATE | NULL |
| status | ENUM('planned','active','completed','on_hold') | DEFAULT 'planned' |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

```sql
CREATE TABLE projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status ENUM('planned','active','completed','on_hold') DEFAULT 'planned',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB;
```

#### 6.2.4 `project_employees` (Junction Table)

| Column | Type | Constraints |
|---|---|---|
| id | INT | PK, AUTO_INCREMENT |
| project_id | INT | FK → projects(id), NOT NULL |
| employee_id | INT | FK → employees(id), NOT NULL |
| assigned_date | DATE | DEFAULT CURRENT_DATE |

```sql
CREATE TABLE project_employees (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  employee_id INT NOT NULL,
  assigned_date DATE DEFAULT (CURRENT_DATE),
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_project_employee (project_id, employee_id)
) ENGINE=InnoDB;
```

#### 6.2.5 `tasks`

| Column | Type | Constraints |
|---|---|---|
| id | INT | PK, AUTO_INCREMENT |
| project_id | INT | FK → projects(id), NOT NULL |
| employee_id | INT | FK → employees(id), NOT NULL |
| title | VARCHAR(200) | NOT NULL |
| description | TEXT | NULL |
| status | ENUM('pending','in_progress','completed') | DEFAULT 'pending' |
| priority | ENUM('low','medium','high') | DEFAULT 'medium' |
| due_date | DATE | NULL |
| created_at | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP |

```sql
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  project_id INT NOT NULL,
  employee_id INT NOT NULL,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  status ENUM('pending','in_progress','completed') DEFAULT 'pending',
  priority ENUM('low','medium','high') DEFAULT 'medium',
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE,
  INDEX idx_status (status),
  INDEX idx_due_date (due_date)
) ENGINE=InnoDB;
```

### 6.3 Sample Seed Data

The following seed script populates the schema with realistic sample records for local development and demonstration purposes. Passwords shown as plaintext comments are hashed with bcrypt before insertion in the actual seeding script.

```sql
-- ============================================
-- 1. USERS (1 Admin + 2 Employees)
-- Note: password values below are bcrypt hashes.
-- Plaintext (for reference only, never stored): Admin@123 / Employee@123
-- ============================================
INSERT INTO users (id, email, password, role, is_active) VALUES
(1, 'sandhya.prajapati@emppro.com', '$2b$10$Kx1zP8QpVn3jR7mLg9tYbuH2eXzN4sWfD6cAoI1rT5yB8kM0nJpqO', 'admin', TRUE),
(2, 'aman.verma@emppro.com', '$2b$10$Fz3qR1sT6vX9bYmC2kLpAeJ7nH4wG8dU5aM1oV0eK3rP9tS2xNzYq', 'employee', TRUE),
(3, 'priya.singh@emppro.com', '$2b$10$Wp9mX2vB4tR6qY1zC8sJdKe3nL7aF5oH0uI9rT4wG2mV6xP1kNzAq', 'employee', TRUE);

-- ============================================
-- 2. EMPLOYEES (linked to user_id 2 and 3; user_id 1 is Admin only)
-- ============================================
INSERT INTO employees (id, user_id, first_name, last_name, phone, designation, department, date_joined) VALUES
(1, 2, 'Aman', 'Verma', '9876543210', 'Software Engineer', 'Engineering', '2023-06-15'),
(2, 3, 'Priya', 'Singh', '9812345678', 'QA Engineer', 'Quality Assurance', '2024-01-10');

-- ============================================
-- 3. PROJECTS
-- ============================================
INSERT INTO projects (id, name, description, start_date, end_date, status) VALUES
(1, 'Customer Portal Revamp', 'Redesign of the customer-facing self-service portal', '2026-09-01', '2026-12-15', 'active'),
(2, 'Internal HR Dashboard', 'Build an internal dashboard for HR metrics and reporting', '2026-07-01', '2026-10-30', 'planned');

-- ============================================
-- 4. PROJECT-EMPLOYEE ASSIGNMENT
-- ============================================
INSERT INTO project_employees (project_id, employee_id, assigned_date) VALUES
(1, 1, '2026-09-02');

-- ============================================
-- 5. TASKS (different statuses)
-- ============================================
INSERT INTO tasks (project_id, employee_id, title, description, status, priority, due_date) VALUES
(1, 1, 'Design login screen wireframes', 'Create low-fidelity wireframes for the new login flow', 'in_progress', 'high', '2026-09-10'),
(1, 1, 'Implement JWT authentication API', 'Build and test login/token verification endpoints', 'completed', 'high', '2026-09-05'),
(1, 1, 'Write unit tests for auth module', 'Cover login, token expiry, and role middleware scenarios', 'pending', 'medium', '2026-09-18');
```

### 6.4 Normalization Note

The schema is normalized to **Third Normal Form (3NF)**: each table stores atomic attributes dependent only on its primary key, redundant data is eliminated via foreign key references, and the many-to-many employee-project relationship is correctly resolved through the `project_employees` junction table rather than repeating columns.

---

## 7. API Documentation

**Base URL:** `/api`
**Authentication:** Bearer Token (JWT) in `Authorization` header, except for `/auth/login`

### 7.1 Common Error Responses

The following error shapes apply consistently across **all** authenticated endpoints and are returned by the centralized error-handling middleware. Endpoint-specific examples below build on this baseline.

**401 Unauthorized** — missing, invalid, or expired token:
```json
{
  "success": false,
  "message": "Authentication token is missing or invalid",
  "statusCode": 401
}
```

**403 Forbidden** — valid token, insufficient role or ownership:
```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "statusCode": 403
}
```

**404 Not Found** — resource does not exist:
```json
{
  "success": false,
  "message": "Resource not found",
  "statusCode": 404
}
```

**422 Validation Error** — request payload fails validation:
```json
{
  "success": false,
  "errors": [
    { "field": "email", "message": "Email must be a valid email address" }
  ],
  "statusCode": 422
}
```

### 7.2 Authentication Endpoints

#### POST `/api/auth/login`

**Request:**
```json
{
  "email": "sandhya.prajapati@emppro.com",
  "password": "Admin@123"
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "sandhya.prajapati@emppro.com",
    "role": "admin",
    "name": "Sandhya Prajapati"
  }
}
```

**Response — 401 Unauthorized:**
```json
{
  "success": false,
  "message": "Invalid email or password",
  "statusCode": 401
}
```

**Response — 422 Validation Error:**
```json
{
  "success": false,
  "errors": [
    { "field": "email", "message": "Email is required" },
    { "field": "password", "message": "Password must be at least 8 characters" }
  ],
  "statusCode": 422
}
```

#### GET `/api/auth/profile`
*Requires: Valid JWT*

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "first_name": "Aman",
    "last_name": "Verma",
    "email": "aman.verma@emppro.com",
    "designation": "Software Engineer",
    "department": "Engineering"
  }
}
```

**Response — 401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication token is missing or invalid",
  "statusCode": 401
}
```

### 7.3 Employee Endpoints (Admin Only unless noted)

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/employees` | List employees (search, filter, paginate) | Admin |
| GET | `/api/employees/:id` | Get single employee | Admin |
| POST | `/api/employees` | Create new employee | Admin |
| PUT | `/api/employees/:id` | Update employee | Admin |
| DELETE | `/api/employees/:id` | Delete/deactivate employee | Admin |

**GET `/api/employees?search=priya&department=Quality+Assurance&page=1&limit=10`**

**Response — 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": 2,
      "first_name": "Priya",
      "last_name": "Singh",
      "designation": "QA Engineer",
      "department": "Quality Assurance",
      "date_joined": "2024-01-10"
    }
  ],
  "pagination": {
    "total": 42,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

**Response — 403 Forbidden** (employee attempting to access admin-only list):
```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "statusCode": 403
}
```

**GET `/api/employees/99`** (non-existent employee)

**Response — 404 Not Found:**
```json
{
  "success": false,
  "message": "Employee not found",
  "statusCode": 404
}
```

**POST `/api/employees`**

**Request:**
```json
{
  "email": "rahul.mehta@emppro.com",
  "first_name": "Rahul",
  "last_name": "Mehta",
  "phone": "9900112233",
  "designation": "Backend Developer",
  "department": "Engineering",
  "date_joined": "2026-08-20"
}
```

**Response — 201 Created:**
```json
{
  "success": true,
  "message": "Employee created successfully",
  "data": { "id": 3, "email": "rahul.mehta@emppro.com" }
}
```

**Response — 422 Validation Error:**
```json
{
  "success": false,
  "errors": [
    { "field": "email", "message": "Email must be a valid email address" },
    { "field": "date_joined", "message": "date_joined is required" }
  ],
  "statusCode": 422
}
```

**Response — 401 Unauthorized:**
```json
{
  "success": false,
  "message": "Authentication token is missing or invalid",
  "statusCode": 401
}
```

### 7.4 Project Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/projects` | List all projects | Admin |
| GET | `/api/projects/my-projects` | List logged-in employee's projects | Employee |
| GET | `/api/projects/:id` | Get project details | Admin |
| POST | `/api/projects` | Create project | Admin |
| PUT | `/api/projects/:id` | Update project | Admin |
| DELETE | `/api/projects/:id` | Delete project | Admin |
| POST | `/api/projects/:id/assign` | Assign employee(s) to project | Admin |
| DELETE | `/api/projects/:id/assign/:employeeId` | Remove employee from project | Admin |

**POST `/api/projects`**

**Request:**
```json
{
  "name": "Customer Portal Revamp",
  "description": "Redesign of the customer-facing self-service portal",
  "start_date": "2026-09-01",
  "end_date": "2026-12-15",
  "status": "planned"
}
```

**Response — 201 Created:**
```json
{
  "success": true,
  "message": "Project created successfully",
  "data": { "id": 1, "name": "Customer Portal Revamp" }
}
```

**Response — 422 Validation Error:**
```json
{
  "success": false,
  "errors": [
    { "field": "start_date", "message": "start_date must be a valid date" },
    { "field": "name", "message": "Project name is required" }
  ],
  "statusCode": 422
}
```

**POST `/api/projects/1/assign`**

**Request:**
```json
{
  "employee_ids": [1, 2]
}
```

**Response — 200 OK:**
```json
{
  "success": true,
  "message": "2 employee(s) assigned to project"
}
```

**Response — 404 Not Found** (invalid project ID):
```json
{
  "success": false,
  "message": "Project not found",
  "statusCode": 404
}
```

**Response — 422 Validation Error:**
```json
{
  "success": false,
  "errors": [
    { "field": "employee_ids", "message": "employee_ids must be a non-empty array of integers" }
  ],
  "statusCode": 422
}
```

**GET `/api/projects/my-projects`**
*Requires: Valid JWT (Employee)*

**Response — 200 OK:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Customer Portal Revamp",
      "status": "active",
      "start_date": "2026-09-01",
      "end_date": "2026-12-15"
    }
  ]
}
```

**Response — 403 Forbidden** (admin token used on employee-only route, if restricted):
```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "statusCode": 403
}
```

### 7.5 Task Endpoints

| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/api/tasks` | List all tasks (filter by project/employee/status) | Admin |
| GET | `/api/tasks/my-tasks` | List logged-in employee's tasks | Employee |
| POST | `/api/tasks` | Create task | Admin |
| PUT | `/api/tasks/:id` | Update task (full edit) | Admin |
| PATCH | `/api/tasks/:id/status` | Update task status only | Admin, Employee (own task) |
| DELETE | `/api/tasks/:id` | Delete task | Admin |

**POST `/api/tasks`**

**Request:**
```json
{
  "project_id": 1,
  "employee_id": 1,
  "title": "Design login screen wireframes",
  "description": "Create low-fidelity wireframes for the new login flow",
  "priority": "high",
  "due_date": "2026-09-10"
}
```

**Response — 201 Created:**
```json
{
  "success": true,
  "message": "Task created successfully",
  "data": { "id": 1, "status": "pending" }
}
```

**Response — 422 Validation Error:**
```json
{
  "success": false,
  "errors": [
    { "field": "project_id", "message": "project_id must reference an existing project" },
    { "field": "priority", "message": "priority must be one of: low, medium, high" }
  ],
  "statusCode": 422
}
```

**PATCH `/api/tasks/1/status`**

**Request:**
```json
{ "status": "in_progress" }
```

**Response — 200 OK:**
```json
{
  "success": true,
  "message": "Task status updated",
  "data": { "id": 1, "status": "in_progress" }
}
```

**Response — 403 Forbidden** (employee attempting to update another employee's task):
```json
{
  "success": false,
  "message": "You are not authorized to update this task",
  "statusCode": 403
}
```

**Response — 404 Not Found:**
```json
{
  "success": false,
  "message": "Task not found",
  "statusCode": 404
}
```

**DELETE `/api/tasks/1`**

**Response — 200 OK:**
```json
{
  "success": true,
  "message": "Task deleted successfully"
}
```

**Response — 404 Not Found:**
```json
{
  "success": false,
  "message": "Task not found",
  "statusCode": 404
}
```

### 7.6 Reports Endpoint (Admin Only)

**GET `/api/reports/summary`**

**Response — 200 OK:**
```json
{
  "success": true,
  "data": {
    "total_employees": 42,
    "total_projects": 9,
    "active_projects": 5,
    "task_summary": {
      "pending": 22,
      "in_progress": 15,
      "completed": 61
    },
    "overdue_tasks": 4
  }
}
```

**Response — 403 Forbidden** (employee attempting to access admin report):
```json
{
  "success": false,
  "message": "You do not have permission to perform this action",
  "statusCode": 403
}
```

---

## 8. Folder Structure

### 8.1 Frontend (Angular)

```
emppro-frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   │   ├── auth.guard.ts
│   │   │   │   └── role.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   └── jwt.interceptor.ts
│   │   │   ├── services/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── employee.service.ts
│   │   │   │   ├── project.service.ts
│   │   │   │   └── task.service.ts
│   │   │   └── models/
│   │   │       ├── employee.model.ts
│   │   │       ├── project.model.ts
│   │   │       └── task.model.ts
│   │   ├── shared/
│   │   │   ├── components/
│   │   │   │   ├── loader/
│   │   │   │   ├── pagination/
│   │   │   │   ├── confirm-dialog/
│   │   │   │   └── search-filter/
│   │   │   └── pipes/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   └── login/
│   │   │   ├── admin/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── employees/
│   │   │   │   ├── projects/
│   │   │   │   ├── tasks/
│   │   │   │   └── reports/
│   │   │   └── employee/
│   │   │       ├── profile/
│   │   │       ├── my-projects/
│   │   │       └── my-tasks/
│   │   ├── app-routing.module.ts
│   │   └── app.module.ts
│   ├── assets/
│   └── environments/
│       ├── environment.ts
│       └── environment.prod.ts
├── angular.json
└── package.json
```

### 8.2 Backend (Node.js / Express)

```
emppro-backend/
├── src/
│   ├── config/
│   │   └── db.config.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── employee.controller.js
│   │   ├── project.controller.js
│   │   ├── task.controller.js
│   │   └── report.controller.js
│   ├── models/
│   │   ├── user.model.js
│   │   ├── employee.model.js
│   │   ├── project.model.js
│   │   └── task.model.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── employee.routes.js
│   │   ├── project.routes.js
│   │   ├── task.routes.js
│   │   └── report.routes.js
│   ├── middleware/
│   │   ├── auth.middleware.js
│   │   ├── role.middleware.js
│   │   ├── validate.middleware.js
│   │   └── error.middleware.js
│   ├── validators/
│   │   ├── employee.validator.js
│   │   ├── project.validator.js
│   │   └── task.validator.js
│   ├── utils/
│   │   └── apiResponse.js
│   └── app.js
├── .env
├── server.js
└── package.json
```

---

## 9. Development Phases

| Phase | Description | Status |
|---|---|---|
| 1 | Requirement gathering & scope definition | ✅ Completed |
| 2 | Database schema design & ER modeling | ✅ Completed |
| 3 | Backend project setup (Express, folder structure) | ✅ Completed |
| 4 | MySQL connection & environment configuration | ✅ Completed |
| 5 | User authentication API (register/login) | ✅ Completed |
| 6 | JWT token generation & verification | ✅ Completed |
| 7 | Auth & role middleware implementation | ✅ Completed |
| 8 | Employee CRUD API | ✅ Completed |
| 9 | Project CRUD API | ✅ Completed |
| 10 | Employee-Project assignment API (M:M) | ✅ Completed |
| 11 | Task CRUD API | ✅ Completed |
| 12 | Centralized error handling middleware | ✅ Completed |
| 13 | Request validation layer (express-validator) | ✅ Completed |
| 14 | Reports/summary API | ✅ Completed |
| 15 | Angular project setup & module structure | ✅ Completed |
| 16 | Auth module (login, guards, interceptor) | ✅ Completed |
| 17 | Admin module (employees, projects, tasks UI) | ✅ Completed |
| 18 | Employee module (profile, my-projects, my-tasks) | ✅ Completed |
| 19 | Shared components (pagination, search, loader) | ✅ Completed |
| 20 | Responsive UI styling (Bootstrap 5) | ✅ Completed |
| 21 | Integration testing, bug fixes & deployment | ✅ Completed |

---

## 10. Security Implementation

### 10.1 Authentication Security

- Passwords are hashed using **bcrypt** with a configurable salt round factor before storage; plaintext passwords are never persisted
- JWTs are signed using a secret key stored in environment variables (`JWT_SECRET`), never hardcoded
- Tokens carry a defined expiry (`exp` claim) to limit the exposure window of a compromised token
- Refresh strategy: expired tokens require re-authentication, preventing indefinite session persistence

### 10.2 Authorization Security

- **Role-Based Access Control (RBAC)** enforced server-side via `roleMiddleware(['admin'])`, independent of frontend restrictions
- Task status updates verify **resource ownership** — an employee can only modify tasks where `task.employee_id` matches the authenticated user's linked employee record
- Route Guards on the Angular side (`AuthGuard`, `RoleGuard`) prevent unauthorized navigation but are treated as UX convenience, not the security boundary

### 10.3 Input & Data Security

- All incoming request payloads are validated using `express-validator` before reaching controller logic
- SQL queries use **parameterized statements** via `mysql2` to prevent SQL injection
- Centralized error middleware ensures internal error details (stack traces) are never leaked in production responses
- CORS policy restricts API access to whitelisted frontend origins

### 10.4 Transport & Configuration Security

- Environment variables (`.env`) store all sensitive configuration: DB credentials, JWT secret, port, allowed origins
- `.env` is excluded from version control via `.gitignore`
- HTTPS enforced at the deployment/reverse-proxy layer in production

### 10.5 Frontend Security Practices

**XSS Prevention (Angular Sanitization)**
Angular's built-in `DomSanitizer` automatically escapes interpolated values and strips unsafe HTML/JavaScript from bindings by default. The application avoids `innerHTML` bindings on user-supplied content (e.g., project descriptions, task notes); where rich text rendering is unavoidable, content is explicitly sanitized through `DomSanitizer.sanitize()` rather than bypassed with `bypassSecurityTrustHtml`.

**JWT Storage Strategy**
| Approach | Trade-off | Decision |
|---|---|---|
| In-memory (JS variable) | Cleared on refresh, immune to XSS-based token theft | Used for the access token during an active session |
| `localStorage` | Persists across refresh, but readable by any injected script if XSS occurs | Used only to persist a session flag for auto-redirect, not the raw token, to balance UX (avoiding forced re-login on refresh) with security |
| `httpOnly` Cookie | Not accessible to JavaScript, strongest XSS protection | Recommended upgrade path for a production deployment; not required for the current single-origin demo setup |

The application stores the JWT in memory within `AuthService` for the active session and re-authenticates silently where possible on page refresh, minimizing the window during which the token is exposed to client-side script access.

**Environment-Specific Configuration**
Angular's `environment.ts` / `environment.prod.ts` files isolate configuration such as the API base URL per build target:
```typescript
// environment.prod.ts
export const environment = {
  production: true,
  apiBaseUrl: 'https://api.emppro-manager.com/api'
};
```
This ensures no development URLs, debug flags, or local endpoints are compiled into the production bundle.

**CSRF Protection Approach**
Because EmpPro Manager uses **JWT Bearer token authentication** (sent via the `Authorization` header) rather than cookie-based sessions, the application is not inherently subject to traditional CSRF attacks, which rely on browsers automatically attaching session cookies to cross-origin requests. As a defense-in-depth measure:
- The backend does not accept authentication tokens via cookies, closing the primary CSRF attack vector
- CORS is explicitly restricted to the known frontend origin, preventing unauthorized cross-origin script execution against the API
- If `httpOnly` cookie-based storage is adopted in a future iteration, a CSRF token (double-submit cookie pattern) would be introduced alongside it

---

## 11. Deployment Strategy

### 11.1 Environment Configuration

| Environment | Frontend Hosting | Backend Hosting | Database |
|---|---|---|---|
| Development | Angular CLI dev server (localhost:4200) | Local Node server (localhost:5000) | Local MySQL instance |
| Production | Static hosting (e.g., Netlify / Vercel / Nginx) | Node process manager (PM2) behind reverse proxy | Managed MySQL instance |

### 11.2 Backend Deployment Steps

1. Build environment-specific `.env` file with production DB credentials and JWT secret
2. Run database migrations/schema scripts against the production MySQL instance
3. Install dependencies with `npm install --production`
4. Start the server using a process manager (PM2) for auto-restart and monitoring
5. Configure Nginx (or equivalent) as a reverse proxy with HTTPS termination
6. Enable CORS only for the deployed frontend origin

### 11.3 Frontend Deployment Steps

1. Set `environment.prod.ts` with the production API base URL
2. Run `ng build --configuration production` to generate optimized static assets
3. Deploy the `dist/` output to a static hosting provider or Nginx web root
4. Configure the hosting provider to redirect all routes to `index.html` (SPA fallback routing)

### 11.4 CI/CD Considerations

- Git-based branching strategy (`main` for production, `develop` for integration)
- Automated linting and build checks on pull requests
- Environment secrets managed through hosting provider's secret manager rather than committed files

---

## 12. Testing Strategy

### 12.1 Postman Collection Structure

The API test suite is organized as a Postman collection mirroring the resource structure of the backend, with folder-level grouping for maintainability:

```
EmpPro Manager - API Collection
├── Auth
│   ├── POST Login (Admin) — positive
│   ├── POST Login (Employee) — positive
│   ├── POST Login — invalid credentials
│   └── GET Profile — valid/invalid token
├── Employees
│   ├── GET List Employees (search/filter/pagination)
│   ├── GET Employee by ID — found/not found
│   ├── POST Create Employee — valid/invalid payload
│   ├── PUT Update Employee
│   └── DELETE Employee
├── Projects
│   ├── GET List Projects
│   ├── GET My Projects (Employee role)
│   ├── POST Create Project — valid/invalid
│   ├── POST Assign Employees — valid/invalid
│   └── DELETE Project
├── Tasks
│   ├── GET List Tasks (filters)
│   ├── GET My Tasks (Employee role)
│   ├── POST Create Task
│   ├── PATCH Update Task Status — own task / other's task (403 check)
│   └── DELETE Task
└── Reports
    └── GET Summary — Admin / Employee (403 check)
```

**Postman Environment Variables**

| Variable | Purpose | Example |
|---|---|---|
| `base_url` | Environment-specific API root | `http://localhost:5000/api` |
| `admin_token` | JWT captured after Admin login, reused across requests | Set via test script post-login |
| `employee_token` | JWT captured after Employee login | Set via test script post-login |
| `project_id` | ID captured after project creation, used in dependent requests | Set dynamically via `pm.environment.set()` |
| `task_id` | ID captured after task creation | Set dynamically |

Tokens and dynamically created resource IDs are captured in a Postman **Tests** script on each request (e.g., `pm.environment.set("admin_token", pm.response.json().token)`), allowing the collection to be run end-to-end via the Collection Runner without manual intervention.

### 12.2 API Test Cases

**Positive Cases**

| # | Test Case | Expected Result |
|---|---|---|
| 1 | Admin logs in with valid credentials | 200 OK, token returned |
| 2 | Admin creates a new employee with valid payload | 201 Created |
| 3 | Admin creates a project and assigns employees | 200/201, assignment reflected |
| 4 | Employee fetches own assigned tasks | 200 OK, filtered to own records |
| 5 | Employee updates status of own task | 200 OK, status persisted |
| 6 | Admin retrieves paginated employee list with search filter | 200 OK, correct subset returned |

**Negative Cases**

| # | Test Case | Expected Result |
|---|---|---|
| 1 | Login with incorrect password | 401 Unauthorized |
| 2 | Access `/api/employees` without a token | 401 Unauthorized |
| 3 | Employee attempts to access `/api/employees` (admin-only) | 403 Forbidden |
| 4 | Employee attempts to update another employee's task status | 403 Forbidden |
| 5 | Create employee with missing required field (e.g., email) | 422 Validation Error |
| 6 | Fetch employee with a non-existent ID | 404 Not Found |
| 7 | Assign employees to a non-existent project | 404 Not Found |
| 8 | Submit expired JWT on any protected route | 401 Unauthorized |

### 12.3 Frontend Testing

**Unit Testing — Jasmine & Karma**
- Component-level tests validate form initialization, validation rules (required fields, email format), and conditional UI states (loading, error, empty list)
- Service-level tests mock `HttpClient` using `HttpClientTestingModule` to verify correct endpoint calls, request payloads, and response handling without hitting a live backend
- Guard tests verify that `AuthGuard` and `RoleGuard` correctly allow or block navigation based on mocked token/role states

Example scope covered:
```typescript
describe('TaskStatusUpdateComponent', () => {
  it('should disable the status dropdown for tasks not owned by the logged-in employee', () => { ... });
  it('should call TaskService.updateStatus with the correct task id and status', () => { ... });
  it('should display an error message when the update API call fails', () => { ... });
});
```

**End-to-End Testing — Cypress**
- Full user journey coverage: login → navigate to module → perform action → verify UI state
- Role-based flow verification: Admin journey (create employee → assign to project → create task) and Employee journey (login → view assigned tasks → update status) run as separate test suites
- Route protection verification: confirms an unauthenticated user is redirected to `/login`, and an Employee attempting to navigate directly to an Admin route URL is redirected or blocked

Example scope covered:
```
cypress/e2e/
├── auth.cy.ts              → login success/failure, logout, token expiry redirect
├── admin-employee-flow.cy.ts → create/edit/delete employee end-to-end
├── admin-project-flow.cy.ts  → create project, assign employees, verify listing
├── employee-task-flow.cy.ts  → view assigned tasks, update status, verify persistence
└── route-guard.cy.ts         → unauthorized access attempts across both roles
```

### 12.4 Test Data Strategy

- A dedicated test database (`emppro_test`) is used for automated test runs, kept isolated from development and production data
- The seed script from Section 6.3 is adapted into a `seed.test.sql` variant, reset before each test suite run to guarantee deterministic, repeatable results
- Cypress tests use fixture files (`cypress/fixtures/`) for consistent mock login credentials and sample form input, avoiding hardcoded values scattered across test specs
- Postman collection runs are paired with a **pre-request script** that resets dependent environment variables (e.g., clearing a stale `task_id`) to prevent cross-test contamination during Collection Runner execution

---

## 13. Key Features Summary

- Secure JWT-based authentication with bcrypt password hashing
- Two-tier Role-Based Access Control (Admin / Employee), enforced at both frontend and backend
- Complete CRUD workflows for Employees, Projects, and Tasks
- Many-to-many Employee-Project assignment via a normalized junction table
- Task ownership validation — employees can update only their own task status
- Server-side and client-side request validation
- Centralized error handling with consistent JSON error responses
- Server-driven search, filtering, and pagination on list endpoints
- Reusable Angular components (loader, pagination, confirmation dialogs, search/filter bar)
- Fully responsive UI built with Bootstrap 5
- Clean MVC backend architecture with clear separation of routes, controllers, and models
- Environment-based configuration for safe multi-environment deployment
- Dedicated Postman collection and Jasmine/Cypress test suites covering positive and negative scenarios

---

## 14. Interview Talking Points

**On architecture decisions:**
"I structured the backend using an MVC pattern with an additional middleware layer for authentication, role checks, and validation — this kept controllers focused purely on orchestration logic rather than mixing in security or validation concerns."

**On the many-to-many relationship:**
"Employees can work across multiple projects and projects can have multiple employees, so I modeled that with a `project_employees` junction table rather than a foreign key directly on either side — this keeps the schema in 3NF and avoids data duplication."

**On security:**
"Authorization isn't just enforced with route guards in Angular — those are UX conveniences. The actual security boundary is server-side role middleware and, for task updates, an ownership check that compares the authenticated user's employee ID against the task's assigned employee."

**On JWT storage:**
"I weighed localStorage against in-memory storage for the token. In-memory storage is safer against XSS-based token theft since it disappears on refresh, so I used that for the actual token and kept only a lightweight session flag in localStorage to smooth out the refresh experience — with a clear note that httpOnly cookies would be the stronger production upgrade."

**On scalability:**
"Because the frontend communicates through dedicated Angular services per resource, and the backend follows RESTful conventions with a centralized error handler, adding a new module — for example, leave management — would mean adding a new table, model, controller, and route file without touching existing logic."

**On handling real-world edge cases:**
"For task status updates, I had to guard against an employee attempting to update someone else's task by manipulating the request payload — that's handled by checking resource ownership server-side, not just trusting the frontend UI state."

**On testing approach:**
"I kept a Postman collection with environment variables for tokens and dynamically created resource IDs, so the entire API surface — including negative cases like expired tokens or forbidden role access — could be run end-to-end through the Collection Runner. On the frontend, Jasmine/Karma covered component and service logic in isolation, while Cypress covered the full role-based user journeys."

**On trade-offs:**
"I chose JWT over server-side sessions to keep the API stateless, which simplifies horizontal scaling later, at the cost of needing a clear token-expiry and refresh strategy."

---

*End of Document*
