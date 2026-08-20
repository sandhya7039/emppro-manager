<div align="center">

# EmpPro Manager

### Employee & Project Management System

A full stack, role-secured platform for managing employees, projects, and tasks — built with Angular, Node.js, Express, and MySQL.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![Code Coverage](https://img.shields.io/badge/coverage-85%25-yellowgreen)
![Angular](https://img.shields.io/badge/Angular-16.2.0-DD0031?logo=angular)
![Node.js](https://img.shields.io/badge/Node.js-20.11.0%20LTS-339933?logo=node.js)
![MySQL](https://img.shields.io/badge/MySQL-8.0.36-4479A1?logo=mysql)

</div>

---

## 📖 About The Project

**EmpPro Manager** is a full stack Employee & Project Management System designed to centralize how organizations track employees, manage projects, and assign tasks. Instead of relying on disconnected spreadsheets and email threads, EmpPro Manager provides a single, secure platform where Admins have full organizational visibility and Employees get a focused, self-service view of their own work.

The application is built around a clean three-tier architecture — an Angular frontend, an Express.js REST API, and a normalized MySQL database — with authentication and authorization enforced consistently at every layer. JWT-based authentication combined with role-based access control ensures that Admins and Employees only ever see and modify data appropriate to their role, with ownership checks preventing employees from altering records that aren't theirs.

This project was built to demonstrate practical, production-oriented full stack development: structured API design, normalized relational modeling, layered security, and a responsive, maintainable frontend architecture.

---

## ✨ Features

- 🔐 **Secure Authentication** — JWT-based login with bcrypt password hashing
- 🛡️ **Role-Based Access Control** — Separate Admin and Employee permission boundaries, enforced both client-side and server-side
- 👥 **Employee Management** — Full CRUD with search, filtering, and pagination
- 📁 **Project Management** — Create, update, and assign employees to projects (many-to-many)
- ✅ **Task Management** — Assign tasks, track status, and enforce task-level ownership
- 📊 **Reports Dashboard** — Project-wise completion stats and workload summaries
- 🔍 **Search & Filter** — Server-driven search and filtering across all list views
- 📱 **Responsive UI** — Fully responsive design built with Bootstrap 5
- ⚡ **Reusable Components** — Loader, pagination, confirmation dialogs, and search/filter bar
- 🧪 **Test Coverage** — Postman API suite plus Jasmine/Karma and Cypress frontend tests

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Frontend | Angular | 16.2.0 |
| Frontend | TypeScript | 5.2.2 |
| Frontend | Bootstrap | 5.3.x |
| Backend | Node.js | 20.11.0 LTS |
| Backend | Express.js | 4.18.2 |
| Database | MySQL | 8.0.36 |
| Auth | JSON Web Tokens (JWT) + bcrypt | — |
| Validation | express-validator | 7.0.x |
| Testing | Jasmine, Karma, Cypress, Postman | — |

---

## 🏗️ Architecture

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

---

## 🗂️ Entity Relationship Diagram

```
┌───────────────┐        1:1        ┌────────────────┐
│     users     │───────────────────│    employees    │
├───────────────┤                    ├────────────────┤
│ PK id         │                    │ PK id           │
│    email      │                    │ FK user_id      │
│    password   │                    │    first_name   │
│    role       │                    │    last_name    │
└───────────────┘                    │    designation  │
                                       │    department   │
                                       └────────┬─────────┘
                                                │ 1
                                                │ M
                                       ┌────────┴─────────┐
                                       │ project_employees │
                                       │  (junction table)  │
                                       └────────┬───────────┘
                                                │ M
                                                │ 1
                                       ┌────────┴─────────┐
                                       │     projects      │
                                       └────────┬───────────┘
                                                │ 1
                                                │ M
                                       ┌────────┴─────────┐
                                       │       tasks         │
                                       └────────────────────┘
```

**Relationships:** `users` ↔ `employees` (1:1) · `employees` ↔ `projects` (M:M via `project_employees`) · `projects` ↔ `tasks` (1:M) · `employees` ↔ `tasks` (1:M)

---

## 🔌 API Endpoints

**Base URL:** `/api`

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/auth/login` | Authenticate and receive JWT | Public |
| GET | `/auth/profile` | Get logged-in user's profile | Authenticated |
| GET | `/employees` | List employees (search, filter, paginate) | Admin |
| POST | `/employees` | Create employee | Admin |
| PUT | `/employees/:id` | Update employee | Admin |
| DELETE | `/employees/:id` | Delete employee | Admin |
| GET | `/projects` | List all projects | Admin |
| GET | `/projects/my-projects` | List own assigned projects | Employee |
| POST | `/projects` | Create project | Admin |
| POST | `/projects/:id/assign` | Assign employees to project | Admin |
| GET | `/tasks` | List all tasks (filterable) | Admin |
| GET | `/tasks/my-tasks` | List own assigned tasks | Employee |
| POST | `/tasks` | Create task | Admin |
| PATCH | `/tasks/:id/status` | Update task status | Admin / Employee (own task) |
| GET | `/reports/summary` | Organizational summary stats | Admin |

> Full request/response examples, including error responses (401, 403, 404, 422), are available in the project's API documentation.

---

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed on your system before proceeding:

| Tool | Minimum Version |
|---|---|
| Node.js | 20.11.0 LTS |
| npm | 10.x |
| MySQL | 8.0.36 |
| Angular CLI | 16.x (`npm install -g @angular/cli`) |
| Git | Any recent version |

### 1. Clone the Repository

```bash
git clone https://github.com/sandhyawebdeveloper/emppro-manager.git
cd emppro-manager
```

### 2. Backend Setup

```bash
cd emppro-backend
npm install
```

Create a `.env` file in the `emppro-backend` root directory (see [Environment Variables](#-environment-variables) below), then start the server:

```bash
# Development
npm run dev

# Production
npm start
```

The API will be available at `http://localhost:5000/api`.

### 3. Database Setup

```bash
# Log in to MySQL
mysql -u root -p

# Create the database
CREATE DATABASE emppro_db;
EXIT;

# Run the schema script
mysql -u root -p emppro_db < database/schema.sql

# (Optional) Load sample seed data
mysql -u root -p emppro_db < database/seed.sql
```

### 4. Frontend Setup

```bash
cd emppro-frontend
npm install
```

Update `src/environments/environment.ts` with your local API base URL if it differs from the default:

```typescript
export const environment = {
  production: false,
  apiBaseUrl: 'http://localhost:5000/api'
};
```

Start the Angular development server:

```bash
ng serve
```

The application will be available at `http://localhost:4200`.

### 5. API Testing (Postman)

A Postman collection is included under `/postman` for testing the API independently of the frontend:

1. Import `postman/EmpPro-Manager.postman_collection.json` into Postman
2. Import `postman/EmpPro-Manager.postman_environment.json` and select it as the active environment
3. Run the **Auth → Login** request first to populate the `admin_token` and `employee_token` environment variables automatically
4. Run remaining requests individually, or execute the full collection via the Collection Runner

---

## 🔧 Environment Variables

Create a `.env` file inside `emppro-backend/` with the following keys:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=emppro_db

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=1d

# CORS Configuration
CLIENT_ORIGIN=http://localhost:4200
```

> ⚠️ Never commit your `.env` file. It is excluded via `.gitignore` by default.

---

## 📁 Folder Structure

```
emppro-manager/
├── emppro-backend/
│   ├── src/
│   │   ├── config/          # Database connection config
│   │   ├── controllers/     # Request handlers
│   │   ├── models/          # Data access layer
│   │   ├── routes/          # API route definitions
│   │   ├── middleware/      # Auth, role, validation, error handling
│   │   ├── validators/      # Request payload validation rules
│   │   └── utils/           # Shared helper utilities
│   ├── .env
│   └── server.js
│
├── emppro-frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/         # Guards, interceptors, services, models
│   │   │   ├── shared/       # Reusable components and pipes
│   │   │   └── modules/      # Auth, Admin, Employee feature modules
│   │   └── environments/
│   └── angular.json
│
├── database/
│   ├── schema.sql
│   └── seed.sql
│
├── postman/
│   ├── EmpPro-Manager.postman_collection.json
│   └── EmpPro-Manager.postman_environment.json
│
└── README.md
```

---

## 📸 Screenshots

| Login Page | Admin Dashboard |
|---|---|
| [Screenshot: Login Page - to be added] | [Screenshot: Admin Dashboard - to be added] |

| Employee List | Project List |
|---|---|
| [Screenshot: Employee List Page - to be added] | [Screenshot: Project List Page - to be added] |

| Task List | Employee Dashboard |
|---|---|
| [Screenshot: Task List Page - to be added] | [Screenshot: Employee Dashboard - to be added] |

---

## 🤝 Contributing

Contributions are welcome. To propose a change:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature-name`)
3. Commit your changes with clear, descriptive messages
4. Ensure existing tests pass and add new tests for any new functionality
5. Push to your branch and open a Pull Request against `develop`

Please open an issue first for major changes to discuss what you'd like to modify.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Sandhya Prajapati

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 👩‍💻 Author

**Sandhya Prajapati**
Full Stack Developer

- GitHub: [@sandhyawebdeveloper](https://github.com/sandhyawebdeveloper)
- LinkedIn: [sandhya-prajapati-dev](https://www.linkedin.com/in/sandhya-prajapati-dev/)
- Email: sandhyawebdeveloper0@gmail.com

---

<div align="center">

If you found this project useful, consider giving it a ⭐ on GitHub!

</div>
