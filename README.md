# Multi-School Web Application

A web application for managing multiple schools with role-based access control.

## Demo Accounts

Here are some demo accounts you can use to test different scenarios:

### Single School, Single Role
```
Email: student1@school1.edu
Password: password123
Role: Student
School: School 1
```

### Single School, Multiple Roles
```
Email: instructor1@school1.edu
Password: password123
Role: Instructor
School: School 1

Email: admin1@school1.edu
Password: password123
Role: Admin
School: School 1
```

### Multiple Schools, Multiple Roles
```
Email: global.instructor@global.edu
Password: password123
Role: Instructor
Schools: All Schools (Global Access)

Email: global.admin@global.edu
Password: password123
Role: Admin
Schools: All Schools (Global Access)
```

## Local Development Setup

### Prerequisites
- Node.js (v16 or higher)
- PostgreSQL database
- npm or yarn package manager

### Setup Instructions

1. **Clone the repository and install dependencies:**
```bash
git clone <repository-url>
cd v1
npm install
cd client && npm install && cd ..
```

2. **Set up local PostgreSQL database:**
- Create a PostgreSQL database for local development
- Run the schema from `db-tables-schema.txt` to create tables

3. **Configure local environment variables:**
- Copy `.env.example` to `.env.local`
- Update the database connection details in `.env.local`:
```
DB_HOST=localhost
DB_USER=your_postgres_username
DB_PASSWORD=your_postgres_password
DB_NAME=your_database_name
DB_PORT=5432
PORT=5000
JWT_SECRET=your_secure_jwt_secret
```

4. **Start local development servers:**
```bash
# Terminal 1: Start backend server (port 5000)
npm run dev:local

# Terminal 2: Start frontend development server (port 3000)
npm run client
```

5. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## AWS Elastic Beanstalk Deployment

### Prerequisites
- AWS CLI configured with appropriate credentials
- Elastic Beanstalk CLI (eb) installed

### Deployment Instructions

1. **Configure AWS environment:**
- Ensure your AWS credentials are configured
- Set up RDS PostgreSQL instance for production database

2. **Deploy to Elastic Beanstalk:**
```bash
# Initialize EB application (if not already done)
eb init

# Create environment (if not already done)
eb create multi-school-portal-prod

# Deploy current version
eb deploy
```

3. **Configure environment variables in AWS:**
- Set production database credentials in EB environment
- Configure JWT_SECRET and other production variables

4. **Access deployed application:**
- Use the URL provided by `eb status` or AWS console

## Environment Differences

| Feature | Local Development | AWS Production |
|---------|------------------|----------------|
| Database SSL | Disabled | Required |
| Static Files | Served by React dev server | Served by Express |
| Port | Backend: 5000, Frontend: 3000 | Single port (configured by EB) |
| Environment | NODE_ENV=development | NODE_ENV=production |

## Features

- Role-based access control (Student, Instructor, Admin)
- Multi-school support
- Secure authentication
- Global and school-specific access cards
- Permission-based resource access

## Security Notes

- All passwords are hashed before storage
- JWT-based authentication
- Role-based access control
- School-specific access restrictions
