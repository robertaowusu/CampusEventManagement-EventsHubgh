import React from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/EventCard.css';
import { useNavigate } from 'react-router-dom';

const EventCard = ({ event, onClick }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleRSVP = async (e) => {
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in again');
        navigate('/login');
        return;
      }

      const response = await fetch(`http://localhost:5001/api/events/${event._id}/rsvp`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('RSVP response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to register for event');
      }

      alert(`Successfully registered! Your seat number is ${data.seatNumber}`);
      window.location.reload();
    } catch (error) {
      console.error('RSVP error:', error);
      alert(error.message || 'Error registering for event. Please try again.');
    }
  };

  const handleViewDetails = (e) => {
    e.stopPropagation();
    navigate(`/events/${event._id}`);
  };

  if (!event) return null;

  const {
    title,
    date,
    time,
    location,
    imageUrl,
    capacity,
    registeredUsers = [],
    category
  } = event;

  const availableSeats = capacity - (registeredUsers?.length || 0);

  const getCategoryImage = (category) => {
    const images = {
      academic: '/images/webpage2.jpg',
      sports: '/images/webpage3.jpg',
      cultural: '/images/webpage4.jpg',
      social: '/images/webpage2.jpg',
      default: '/images/webpage3.jpg'
    };
    return images[category] || images.default;
  };

  return (
    <div className="event-card">
      <div className="event-image">
        {imageUrl ? (
          <img 
            src={`http://localhost:5001${imageUrl}`} 
            alt={title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = getCategoryImage(category);
            }}
          />
        ) : (
          <img 
            src={getCategoryImage(category)}
            alt={title}
          />
        )}
        <div className="event-date">
          {new Date(date).toLocaleDateString('en-US', { 
            month: 'short',
            day: 'numeric'
          })}
        </div>
      </div>
      <div className="event-details">
        <h3>{title}</h3>
        <p className="event-info">
          <span>📍 {location}</span>
          <span>⏰ {time}</span>
        </p>
        <p className="seats-left">
          {availableSeats} seats remaining
        </p>
      </div>
      <div className="event-actions">
        <button 
          onClick={handleViewDetails}
          className="btn secondary"
        >
          View Details
        </button>
        <button 
          onClick={handleRSVP}
          className="btn primary"
          disabled={event.registeredUsers?.length >= event.capacity}
        >
          {event.registeredUsers?.length >= event.capacity ? 'Event Full' : 'RSVP Now'}
        </button>
      </div>
    </div>
  );
};

export default EventCard; 