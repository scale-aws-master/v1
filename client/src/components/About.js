import React from 'react';

function About() {
  return (
    <div className="about-container">
      <h1>About the Multi-School Portal</h1>
      
      <section className="about-section">
        <h2>Our Mission</h2>
        <p>
          The Multi-School Portal is designed to streamline educational management across multiple institutions.
          We provide a unified platform for students, instructors, and administrators to access and manage
          school resources efficiently.
        </p>
      </section>

      <section className="about-section">
        <h2>Key Features</h2>
        <ul>
          <li>Centralized access to multiple schools</li>
          <li>Role-based permissions and access control</li>
          <li>Secure authentication and data protection</li>
          <li>Flexible enrollment management</li>
          <li>Comprehensive school administration tools</li>
        </ul>
      </section>

      <section className="about-section">
        <h2>User Roles</h2>
        <div className="roles-grid">
          <div className="role-card">
            <h3>Students</h3>
            <p>Access course materials, track progress, and manage enrollments.</p>
          </div>
          <div className="role-card">
            <h3>Instructors</h3>
            <p>Manage courses, track student progress, and access teaching resources.</p>
          </div>
          <div className="role-card">
            <h3>Administrators</h3>
            <p>Oversee school operations, manage users, and configure system settings.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About; 