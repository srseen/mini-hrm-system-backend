# HRM System - Human Resource Management

A comprehensive Human Resource Management system built with **NestJS**, **PostgreSQL**, and **TypeORM**. This system provides complete employee management, department organization, position tracking, and leave management with role-based access control.

## Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [API Documentation](#-api-documentation)
- [Database Schema](#-database-schema)
- [Authentication & Authorization](#-authentication--authorization)
- [API Endpoints](#-api-endpoints)
- [Usage Examples](#-usage-examples)
- [Development](#-development)

## Features

### Authentication & Authorization

- **JWT-based Authentication** with secure password hashing (bcrypt)
- **Role-Based Access Control (RBAC)** with 4 user roles:
  - `ADMIN` - Full system access
  - `HR` - Employee and leave management
  - `MANAGER` - Team and leave approval
  - `EMPLOYEE` - Basic access and leave requests

### Employee Management

- Complete CRUD operations for employee records
- Employee profiles with personal and professional information
- Department and position assignments
- Soft delete functionality (data preservation)
- Advanced filtering by department and position

### Department Management

- Department creation and management
- One-to-many relationships with employees
- Department statistics and reporting
- Prevent deletion of departments with active employees

### Position Management

- Job position definitions with salary information
- Position-employee relationships
- Position statistics and employee tracking
- Salary management capabilities

### Leave Management System

- **Leave Types**: Annual, Sick, Personal, Maternity, Paternity, Emergency
- **Leave Status Tracking**: Pending, Approved, Rejected, Cancelled
- **Smart Validation**:
  - Prevent overlapping leave requests
  - No past-date leave requests
  - Business rule enforcement
- **Leave Balance Calculation** with annual entitlements
- **Approval Workflow** with audit trail
- **Self-service** leave cancellation

## Tech Stack

### Backend

- **Framework**: NestJS (Node.js)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Authentication**: JWT + Passport.js
- **Validation**: class-validator, class-transformer
- **Documentation**: Swagger/OpenAPI
- **Configuration**: @nestjs/config

### DevOps & Tools

- **Containerization**: Docker & Docker Compose
- **Development**: Hot reload, TypeScript
- **API Testing**: Built-in Swagger UI
- **Code Quality**: ESLint, Prettier

## Project Structure

```
src/
├── auth/                     # Authentication module
│   ├── decorators/          # Custom decorators (Roles)
│   ├── dto/                 # Data Transfer Objects
│   ├── guards/              # Auth & Role guards
│   ├── strategies/          # JWT strategy
│   └── auth.service.ts      # Auth business logic
├── config/                  # Configuration files
│   └── database.config.ts   # Database configuration
├── entities/                # TypeORM entities
│   ├── user.entity.ts       # User/Auth entity
│   ├── employee.entity.ts   # Employee entity
│   ├── department.entity.ts # Department entity
│   ├── position.entity.ts   # Position entity
│   └── leave-request.entity.ts # Leave request entity
├── employees/               # Employee management module
├── departments/             # Department management module
├── positions/               # Position management module
├── leave/                   # Leave management module
└── main.ts                  # Application entry point
```

## Installation

### Prerequisites

- Node.js (v18 or higher)
- Docker & Docker Compose
- Git

### Quick Start

1. **Clone the repository**

```bash
git clone <repository-url>
cd hrm-system
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start PostgreSQL database**

```bash
docker-compose up -d
```

5. **Run the application**

```bash
# Development mode
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

The application will be available at:

- **API Server**: http://localhost:3000
- **Swagger Documentation**: http://localhost:3000/api

## Configuration

### Environment Variables (.env)

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=hrm_user
DB_PASSWORD=hrm_pass
DB_NAME=hrm_db

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=24h

# Application
PORT=3000
```

### Database Setup

The system uses PostgreSQL with the following configuration:

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: hrm_user
      POSTGRES_PASSWORD: hrm_pass
      POSTGRES_DB: hrm_db
    ports:
      - '5432:5432'
```

## API Documentation

Interactive API documentation is available via Swagger UI at:
**http://localhost:3000/api**

The documentation includes:

- All available endpoints
- Request/response schemas
- Authentication requirements
- Try-it-out functionality
- Model definitions

## Database Schema

### Core Entities

#### Users

- Authentication and authorization
- Role-based access control
- Password hashing with bcrypt

#### Employees

- Personal information (name, email, phone)
- Professional details (hire date, status)
- Department and position relationships

#### Departments

- Organizational structure
- One-to-many with employees
- Soft delete support

#### Positions

- Job definitions
- Salary information
- Employee assignments

#### Leave Requests

- Leave type and duration
- Approval workflow
- Status tracking
- Audit trail

### Relationships

```
User (1:1) Employee (M:1) Department
Employee (M:1) Position
Employee (1:M) LeaveRequest
```

## Authentication & Authorization

### User Roles & Permissions

| Role         | Permissions                                                         |
| ------------ | ------------------------------------------------------------------- |
| **ADMIN**    | Full system access, delete operations                               |
| **HR**       | Employee management, leave approval, department/position management |
| **MANAGER**  | Leave approval, employee updates                                    |
| **EMPLOYEE** | View basic data, submit leave requests                              |

### Authentication Flow

1. **Register**: `POST /auth/register`
2. **Login**: `POST /auth/login` → Returns JWT token
3. **Protected Routes**: Include `Authorization: Bearer <token>` header
4. **Role Check**: Routes automatically verify required roles

## API Endpoints

### Authentication

```
POST   /auth/register          # User registration
POST   /auth/login             # User login
GET    /protected              # Test protected route
```

### Employee Management

```
GET    /employees              # List all employees
POST   /employees              # Create employee (HR/Admin)
GET    /employees/:id          # Get employee details
PATCH  /employees/:id          # Update employee (HR/Admin/Manager)
DELETE /employees/:id          # Delete employee (Admin)
```

### Department Management

```
GET    /departments            # List all departments
POST   /departments            # Create department (HR/Admin)
GET    /departments/:id        # Get department details
GET    /departments/:id/stats  # Department statistics
PATCH  /departments/:id        # Update department (HR/Admin)
DELETE /departments/:id        # Delete department (Admin)
```

### Position Management

```
GET    /positions              # List all positions
POST   /positions              # Create position (HR/Admin)
GET    /positions/:id          # Get position details
GET    /positions/:id/stats    # Position statistics
PATCH  /positions/:id          # Update position (HR/Admin)
DELETE /positions/:id          # Delete position (Admin)
```

### Leave Management

```
GET    /leave                  # List all leaves (Admin/HR/Manager)
POST   /leave                  # Submit leave request
GET    /leave/employee/:id     # Employee's leave history
GET    /leave/balance/:id      # Leave balance inquiry
GET    /leave/:id              # Leave request details
PATCH  /leave/:id/status       # Approve/reject leave (Admin/HR/Manager)
PATCH  /leave/:id/cancel       # Cancel own leave request
```

## Usage Examples

### 1. User Registration & Login

```bash
# Register new user
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "password123",
    "roles": ["admin"]
  }'

# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "password123"
  }'
```

### 2. Create Department & Position

```bash
# Create department
curl -X POST http://localhost:3000/departments \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Engineering",
    "description": "Software development team"
  }'

# Create position
curl -X POST http://localhost:3000/positions \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Senior Developer",
    "description": "Lead development projects",
    "baseSalary": 80000
  }'
```

### 3. Employee Management

```bash
# Create employee
curl -X POST http://localhost:3000/employees \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com",
    "phoneNumber": "+1234567890",
    "hireDate": "2024-01-15",
    "departmentId": "dept-uuid",
    "positionId": "position-uuid"
  }'
```

### 4. Leave Management

```bash
# Submit leave request
curl -X POST http://localhost:3000/leave \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-02-01",
    "endDate": "2024-02-03",
    "leaveType": "ANNUAL",
    "reason": "Family vacation",
    "employeeId": "employee-uuid"
  }'

# Approve leave request
curl -X PATCH http://localhost:3000/leave/{leave-id}/status \
  -H "Authorization: Bearer <your-jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "APPROVED",
    "approverComments": "Approved for vacation"
  }'
```

## Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start with hot reload
npm run start:debug        # Start in debug mode

# Production
npm run build              # Build the application
npm run start:prod         # Start production server

# Testing
npm run test               # Run unit tests
npm run test:e2e           # Run end-to-end tests
npm run test:cov           # Run tests with coverage

# Code Quality
npm run lint               # Run ESLint
npm run format             # Format code with Prettier
```

### Database Management

```bash
# Start database
docker-compose up -d

# Stop database
docker-compose down

# Reset database (removes all data)
docker-compose down -v
docker-compose up -d
```

### Development Workflow

1. **Start the database**: `docker-compose up -d`
2. **Install dependencies**: `npm install`
3. **Start development server**: `npm run start:dev`
4. **Access Swagger UI**: http://localhost:3000/api
5. **Make changes**: Code will auto-reload
6. **Test endpoints**: Use Swagger UI or Postman

## Production Deployment

### Environment Setup

1. Set production environment variables
2. Use a managed PostgreSQL service
3. Configure proper JWT secrets
4. Set up SSL/TLS certificates
5. Configure reverse proxy (nginx)

### Build & Deploy

```bash
npm run build
npm run start:prod
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:

- Check the [API Documentation](http://localhost:3000/api)
- Review the code examples above
- Open an issue in the repository

---
