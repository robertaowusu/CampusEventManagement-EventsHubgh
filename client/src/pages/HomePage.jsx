import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import '../styles/HomePage.css';

const HomePage = () => {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFeaturedEvents();
  }, []);

  const fetchFeaturedEvents = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/events');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setFeaturedEvents(data.slice(0, 3));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching featured events:', error);
      setLoading(false);
    }
  };

  return (
    <div className="page-container home-page">
      <div className="hero-section">
        <h1>Welcome to Events Hub GH</h1>
        <p className="hero-description">
          Discover and join exciting events happening on campus
        </p>
        <div className="cta-buttons">
          <Link to="/events" className="btn primary">Browse Events</Link>
          {!user && <Link to="/register" className="btn secondary">Sign Up Now</Link>}
        </div>
      </div>

      <div className="main-content">
        <section className="featured-events">
          <div className="section-header">
            <h2>Featured Events</h2>
            <p>Check out our upcoming highlighted events</p>
          </div>

          {loading ? (
            <div className="loading">Loading events...</div>
          ) : (
            <div className="events-grid">
              {featuredEvents.map(event => (
                <EventCard 
                  key={event._id} 
                  event={event}
                  onClick={() => navigate(`/events/${event._id}`)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default HomePage;