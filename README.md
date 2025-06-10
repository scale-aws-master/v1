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

## Setup Instructions

1. Install dependencies:
```bash
npm install
cd client && npm install
```

2. Set up the database:
- Create a PostgreSQL database
- Run the schema from `db-tables-schema.txt`

3. Configure environment variables:
Create a `.env` file in the root directory with:
```
DB_HOST=localhost
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=your_database_name
JWT_SECRET=your_jwt_secret
```

4. Start the application:
```bash
# Start backend
npm start

# In a new terminal, start frontend
cd client && npm start
```

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