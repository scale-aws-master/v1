import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home-container">
      <h1>Welcome to the Multi-School Portal</h1>
      <div className="features">
        <div className="feature-card">
          <h2>Multi-School Support</h2>
          <p>Access and manage multiple schools through a single platform.</p>
        </div>
        <div className="feature-card">
          <h2>Role-Based Access</h2>
          <p>Different roles (Student, Instructor, Admin) with specific permissions.</p>
        </div>
        <div className="feature-card">
          <h2>Secure Authentication</h2>
          <p>Safe and secure access to school resources.</p>
        </div>
      </div>
      <div className="cta-section">
        <h2>Ready to Get Started?</h2>
        <Link to="/start" className="cta-button">Go to Dashboard</Link>
      </div>
    </div>
  );
}

export default Home; 