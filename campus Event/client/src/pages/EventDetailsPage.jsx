import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/EventDetailsPage.css';

const EventDetailsPage = () => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { eventId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEventDetails();
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      console.log('Fetching details for event:', eventId);
      const response = await fetch(`http://localhost:5001/api/events/${eventId}`);
      const data = await response.json();
      console.log('Received event data:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch event details');
      }

      setEvent(data);
    } catch (error) {
      console.error('Error fetching event details:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!event) return <div className="error-message">Event not found</div>;

  const availableSeats = event.capacity - (event.registeredUsers?.length || 0);

  return (
    <div className="event-details-page">
      <div className="event-header">
        <h1>{event.title}</h1>
        <div className="event-meta">
          <span className="date">📅 {formatDate(event.date)}</span>
          <span className="time">⏰ {event.time}</span>
          <span className="location">📍 {event.location}</span>
          <span className="category">🏷️ {event.category}</span>
        </div>
      </div>

      <div className="event-content">
        <div className="event-image-section">
          {event.imageUrl ? (
            <img 
              src={`http://localhost:5001${event.imageUrl}`} 
              alt={event.title}
              className="event-image"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/images/default-event.jpg';
              }}
            />
          ) : (
            <img 
              src="/images/default-event.jpg" 
              alt={event.title} 
              className="event-image"
            />
          )}
        </div>

        <div className="event-details-section">
          <div className="description-section">
            <h2>About This Event</h2>
            <p>{event.description}</p>
          </div>

          <div className="capacity-section">
            <h2>Event Details</h2>
            <div className="details-grid">
              <div className="detail-item">
                <span className="label">Category</span>
                <span className="value">{event.category}</span>
              </div>
              <div className="detail-item">
                <span className="label">Date</span>
                <span className="value">{formatDate(event.date)}</span>
              </div>
              <div className="detail-item">
                <span className="label">Time</span>
                <span className="value">{event.time}</span>
              </div>
              <div className="detail-item">
                <span className="label">Location</span>
                <span className="value">{event.location}</span>
              </div>
              <div className="detail-item">
                <span className="label">Total Capacity</span>
                <span className="value">{event.capacity} seats</span>
              </div>
              <div className="detail-item">
                <span className="label">Available Seats</span>
                <span className="value">{availableSeats} seats</span>
              </div>
            </div>
          </div>

          {event.registeredUsers?.find(reg => reg.userId === user?.id) ? (
            <div className="registration-status">
              <p className="registered-message">
                ✅ You are registered for this event!
              </p>
              <p className="seat-number">
                Your Seat Number: {event.registeredUsers.find(reg => reg.userId === user?.id).seatNumber}
              </p>
            </div>
          ) : (
            availableSeats > 0 ? (
              <button 
                onClick={() => handleRSVP()}
                className="rsvp-button"
              >
                RSVP Now
              </button>
            ) : (
              <div className="event-full">
                <p>⚠️ This event is currently full</p>
              </div>
            )
          )}

          <div className="back-button-container">
            <button 
              onClick={() => navigate(-1)}
              className="back-button"
            >
              ← Back to Events
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailsPage; 