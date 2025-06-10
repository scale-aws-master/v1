import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Start from './components/Start';
import Home from './components/Home';
import About from './components/About';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setIsAuthenticated(true);
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <div className="App">
        <nav className="navbar">
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/about">About</Link></li>
            <li><Link to="/start">Start</Link></li>
            {isAuthenticated && (
              <li><button onClick={handleLogout} className="logout-btn">Logout</button></li>
            )}
          </ul>
        </nav>

        <div className="container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route 
              path="/start" 
              element={
                isAuthenticated ? 
                <Start user={user} /> : 
                <Navigate to="/login" />
              } 
            />
            <Route 
              path="/login" 
              element={
                isAuthenticated ? 
                <Navigate to="/start" /> : 
                <Login onLogin={handleLogin} />
              } 
            />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App; 