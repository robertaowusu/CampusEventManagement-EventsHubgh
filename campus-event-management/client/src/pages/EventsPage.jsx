import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.isAdmin) {
      // If not admin, don't show admin controls
      const adminControls = document.querySelectorAll('.admin-controls');
      adminControls.forEach(control => control.style.display = 'none');
    }
  }, [user]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5001/api/events');
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Server error:', errorData);
        throw new Error(errorData.message || 'Failed to fetch events');
      }

      const data = await response.json();
      console.log('Fetched events:', data);
      
      if (!Array.isArray(data)) {
        console.error('Received non-array data:', data);
        throw new Error('Invalid data format received');
      }

      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const getUserIdFromToken = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    const decoded = jwtDecode(token);
    return decoded.userId;
  };

  const handleRSVP = async (eventId) => {
    try {
      const userId = getUserIdFromToken();
      if (!userId) {
        alert('Please login to RSVP');
        return;
      }

      const response = await fetch(`http://localhost:5001/api/events/${eventId}/rsvp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ userId })
      });
      
      if (response.ok) {
        // Update event list to reflect new RSVP count
        setEvents(events.map(event => 
          event.id === eventId 
            ? { ...event, availableSeats: event.availableSeats - 1 }
            : event
        ));
        alert('RSVP successful!');
      }
    } catch (error) {
      console.error('RSVP error:', error);
      alert('Failed to RSVP. Please try again.');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    // Add a more descriptive confirmation dialog
    const confirmDelete = window.confirm(
      'Are you sure you want to delete this event? This action cannot be undone.'
    );
    
    if (!confirmDelete) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to delete events');
        return;
      }

      setLoading(true); // Add loading state
      const response = await fetch(`http://localhost:5001/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete event');
      }

      // Remove event from state and show success message
      setEvents(prevEvents => prevEvents.filter(event => event._id !== eventId));
      alert('Event successfully deleted');
    } catch (error) {
      console.error('Delete error:', error);
      alert(error.message || 'Failed to delete event. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  return (
    <div className="page-container">
      <div className="content-wrapper">
        <div className="section-header">
          <h1>Events Hub</h1>
          <p>Discover and join exciting events happening around you</p>
        </div>

        <div className="filters-section">
          <select className="form-select">
            <option value="">All Categories</option>
            <option value="academic">Academic</option>
            <option value="sports">Sports</option>
            <option value="cultural">Cultural</option>
            <option value="technology">Technology</option>
            <option value="workshops">Workshops</option>
            <option value="social">Social</option>
          </select>
        </div>

        <div className="grid-container grid-3-cols">
          {console.log('Rendering events:', events)}
          {events.length > 0 ? (
            events.map(event => (
              <EventCard 
                key={event._id} 
                event={event}
                onClick={() => navigate(`/events/${event._id}`)}
              />
            ))
          ) : (
            <div className="no-events">No events found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsPage;
