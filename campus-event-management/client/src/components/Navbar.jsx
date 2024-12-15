import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/" className="nav-logo">
          Events Hub GH
        </Link>
        
        <div className="nav-links">
          <Link to="/events">Events</Link>
          <Link to="/calendar">Calendar</Link>
          
          {user ? (
            <>
              {user.isAdmin && (
                <>
                  <Link to="/events/create">Create Event</Link>
                  <Link to="/events/manage">Manage Events</Link>
                </>
              )}
              <Link to="/profile">Profile</Link>
              <button onClick={handleLogout} className="logout-btn">Logout</button>
              <span className="user-email">{user.email}</span>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 