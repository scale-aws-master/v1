-- Insert demo schools
INSERT INTO Schools (school_name) VALUES
('School 1'),
('School 2');

-- Insert demo accounts (password is 'password123' hashed)
INSERT INTO Accounts (ssn, name, dob, primary_email, password_hash) VALUES
('111-11-1111', 'Demo Student', '2000-01-01', 'student1@school1.edu', '$2b$10$YourHashedPasswordHere'),
('222-22-2222', 'Demo Instructor', '1985-01-01', 'instructor1@school1.edu', '$2b$10$YourHashedPasswordHere'),
('333-33-3333', 'Demo Admin', '1980-01-01', 'admin1@school1.edu', '$2b$10$YourHashedPasswordHere'),
('444-44-4444', 'Global Instructor', '1985-01-01', 'global.instructor@global.edu', '$2b$10$YourHashedPasswordHere'),
('555-55-5555', 'Global Admin', '1980-01-01', 'global.admin@global.edu', '$2b$10$YourHashedPasswordHere');

-- Insert access cards
INSERT INTO AccessCards (account_id, school_id, email, global, role) VALUES
-- School 1 specific cards
(1, 1, 'student1@school1.edu', false, 'Student'),
(2, 1, 'instructor1@school1.edu', false, 'Instructor'),
(3, 1, 'admin1@school1.edu', false, 'Admin'),

-- Global cards
(4, NULL, 'global.instructor@global.edu', true, 'Instructor'),
(5, NULL, 'global.admin@global.edu', true, 'Admin');

-- Insert permissions for the Start page
INSERT INTO Permissions (type, resource, rules, access) VALUES
('page', 'start', '{"rules": [{"condition": "roles", "roles": ["Student", "Instructor", "Admin"]}]}', true); 