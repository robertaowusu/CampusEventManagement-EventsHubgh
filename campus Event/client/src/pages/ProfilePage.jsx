import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/ProfilePage.css';

const ProfilePage = () => {
  const { user } = useAuth();
  const [userEvents, setUserEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchUserEvents();
  }, [user, navigate]);

  const fetchUserEvents = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/events/user/registered', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch registered events');
      }

      const data = await response.json();
      setUserEvents(data);
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="error-message">Please log in to view your profile</div>;
  }

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>My Profile</h1>
        <div className="user-info">
          <p className="email">{user.email}</p>
          {user.isAdmin && <span className="admin-badge">Admin</span>}
        </div>
      </div>

      <div className="registered-events">
        <h2>My Events</h2>
        {userEvents.length > 0 ? (
          <div className="events-grid">
            {userEvents.map(event => {
              const registration = event.registeredUsers?.find(
                reg => reg && reg.userId === user.id
              );
              
              return (
                <div key={event._id} className="event-card">
                  <h3>{event.title}</h3>
                  <div className="event-details">
                    <p>📅 Date: {new Date(event.date).toLocaleDateString()}</p>
                    <p>⏰ Time: {event.time}</p>
                    <p>📍 Location: {event.location}</p>
                    {registration && (
                      <p>🎟️ Seat Number: {registration.seatNumber}</p>
                    )}
                  </div>
                  <button 
                    onClick={() => navigate(`/events/${event._id}`)}
                    className="btn view-details"
                  >
                    View Details
                  </button>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-events">
            <p>You haven't registered for any events yet.</p>
            <button 
              onClick={() => navigate('/events')}
              className="btn primary"
            >
              Browse Events
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage; 