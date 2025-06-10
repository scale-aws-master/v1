-- Drop existing tables and types if they exist
DROP TABLE IF EXISTS Permissions CASCADE;
DROP TABLE IF EXISTS Enrollments CASCADE;
DROP TABLE IF EXISTS AccessCards CASCADE;
DROP TABLE IF EXISTS EnrollmentPeriods CASCADE;
DROP TABLE IF EXISTS Schools CASCADE;
DROP TABLE IF EXISTS Accounts CASCADE;
DROP TYPE IF EXISTS role_type CASCADE;

-- Create role type
CREATE TYPE role_type AS ENUM ('Student', 'Instructor', 'Admin');

-- Create Accounts table
CREATE TABLE Accounts (
    account_id SERIAL PRIMARY KEY,
    ssn VARCHAR(11) UNIQUE,
    name VARCHAR(100) NOT NULL,
    dob DATE NOT NULL,
    primary_email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
);

-- Create Schools table
CREATE TABLE Schools (
    school_id SERIAL PRIMARY KEY,
    school_name VARCHAR(100) NOT NULL
);

-- Create EnrollmentPeriods table
CREATE TABLE EnrollmentPeriods (
    period_id SERIAL PRIMARY KEY,
    school_id INT REFERENCES Schools(school_id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

-- Create AccessCards table
CREATE TABLE AccessCards (
    accesscard_id SERIAL PRIMARY KEY,
    account_id INT REFERENCES Accounts(account_id),
    school_id INT REFERENCES Schools(school_id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    global BOOLEAN DEFAULT FALSE,
    role role_type NOT NULL
);

-- Create Enrollments table
CREATE TABLE Enrollments (
    enrollment_id SERIAL PRIMARY KEY,
    accesscard_id INT REFERENCES AccessCards(accesscard_id),
    period_id INT REFERENCES EnrollmentPeriods(period_id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL
);

-- Create Permissions table
CREATE TABLE Permissions (
    permission_id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    resource VARCHAR(100),
    rules JSONB NOT NULL,
    access BOOLEAN NOT NULL
);

-- Create check_access function
CREATE OR REPLACE FUNCTION check_access(
    p_type VARCHAR(50),
    p_role role_type,
    p_school_name VARCHAR(100),
    p_email VARCHAR(255),
    p_account_id INTEGER
)
RETURNS BOOLEAN AS $$
DECLARE
    perm RECORD;
    rule JSONB;
    condition_parts TEXT[];
    all_conditions_met BOOLEAN;
    part TEXT;
BEGIN
    -- Fetch the single permission for the given type
    SELECT * INTO perm FROM Permissions WHERE type = p_type;
    IF NOT FOUND THEN
        RETURN FALSE;  -- No permission found, deny access
    END IF;

    -- Loop through each rule in the rules array
    FOR rule IN SELECT jsonb_array_elements(perm.rules->'rules') LOOP
        condition_parts := string_to_array(rule->>'condition', ' AND ');
        all_conditions_met := TRUE;

        -- Check each part of the condition
        FOREACH part IN ARRAY condition_parts LOOP
            CASE part
                WHEN 'roles' THEN
                    IF NOT ('any' = ANY((rule->>'roles')::TEXT[]) OR p_role::TEXT = ANY((rule->>'roles')::TEXT[])) THEN
                        all_conditions_met := FALSE;
                    END IF;
                WHEN 'schools' THEN
                    IF p_school_name IS NOT NULL AND NOT ('any' = ANY((rule->>'schools')::TEXT[]) OR p_school_name = ANY((rule->>'schools')::TEXT[])) THEN
                        all_conditions_met := FALSE;
                    END IF;
                WHEN 'emails' THEN
                    IF NOT (p_email = ANY((rule->>'emails')::TEXT[])) THEN
                        all_conditions_met := FALSE;
                    END IF;
                WHEN 'accounts' THEN
                    IF NOT (p_account_id = ANY((rule->>'accounts')::INTEGER[])) THEN
                        all_conditions_met := FALSE;
                    END IF;
                ELSE
                    RAISE EXCEPTION 'Invalid condition part: %', part;
            END CASE;
        END LOOP;

        -- If all conditions in this rule are met, return the access value
        IF all_conditions_met THEN
            RETURN perm.access;
        END IF;
    END LOOP;

    -- No rules satisfied, deny access
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Insert demo schools
INSERT INTO Schools (school_name) VALUES
('School 1'),
('School 2');

-- Insert demo accounts (password is 'password123' hashed)
INSERT INTO Accounts (ssn, name, dob, primary_email, password_hash) VALUES
('111-11-1111', 'Demo Student', '2000-01-01', 'student1@school1.edu', '$2b$10$XClR.BYflvMJtcSrVpOumO5Zoqv1HPf0dblvEGh4jTfMGi5Cvk/.2'),
('222-22-2222', 'Demo Instructor', '1985-01-01', 'instructor1@school1.edu', '$2b$10$XClR.BYflvMJtcSrVpOumO5Zoqv1HPf0dblvEGh4jTfMGi5Cvk/.2'),
('333-33-3333', 'Demo Admin', '1980-01-01', 'admin1@school1.edu', '$2b$10$XClR.BYflvMJtcSrVpOumO5Zoqv1HPf0dblvEGh4jTfMGi5Cvk/.2'),
('444-44-4444', 'Global Instructor', '1985-01-01', 'global.instructor@global.edu', '$2b$10$XClR.BYflvMJtcSrVpOumO5Zoqv1HPf0dblvEGh4jTfMGi5Cvk/.2'),
('555-55-5555', 'Global Admin', '1980-01-01', 'global.admin@global.edu', '$2b$10$XClR.BYflvMJtcSrVpOumO5Zoqv1HPf0dblvEGh4jTfMGi5Cvk/.2');

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

-- Insert enrollment periods for School 1
INSERT INTO EnrollmentPeriods (school_id, name, start_date, end_date) VALUES
(1, 'Fall 2023', '2023-09-01', '2023-12-15'),
(1, 'Spring 2024', '2024-01-15', '2024-05-15');

-- Insert enrollments for Demo Student
INSERT INTO Enrollments (accesscard_id, period_id, start_date, end_date) VALUES
(1, 1, '2023-09-01', '2023-12-15'),  -- Fall 2023
(1, 2, '2024-01-15', '2024-05-15');  -- Spring 2024

-- Add instructor access card for School 2
INSERT INTO AccessCards (account_id, school_id, email, global, role) VALUES
(2, 2, 'instructor1@school2.edu', false, 'Instructor'); 