import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <img src="/images/webpage6.jpg" alt="Events Hub GH Logo" className="footer-logo" />
          <p>Your premier platform for campus events and activities</p>
        </div>
        
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>Email: info@eventshubgh.com</p>
          <p>Phone: +233 24 123 4567</p>
          <p>Location: University of Ghana, Legon</p>
        </div>
        
        <div className="footer-section">
          <h3>Terms & Conditions</h3>
          <ul>
            <li>All events are subject to university guidelines</li>
            <li>Registration deadlines must be strictly adhered to</li>
            <li>Cancellations must be made 24 hours before event</li>
            <li>Event capacity limits are strictly enforced</li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            <li><Link to="/events">Browse Events</Link></li>
            <li><Link to="/calendar">Calendar</Link></li>
            <li><Link to="/register">Sign Up</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Events Hub GH. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
