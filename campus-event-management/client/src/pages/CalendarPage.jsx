import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import 'react-calendar/dist/Calendar.css';
import '../styles/CalendarPage.css';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [activeCategories, setActiveCategories] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = ['academic', 'sports', 'cultural', 'social'];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/events');
      const data = await response.json();
      console.log('Fetched events:', data);
      
      // Convert date strings to Date objects
      const eventsWithDates = data.map(event => ({
        ...event,
        date: new Date(event.date)
      }));
      
      setEvents(eventsWithDates);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  // Filter events based on selected date and categories
  useEffect(() => {
    const filtered = events.filter(event => {
      const eventDate = new Date(event.date);
      const isSameDate = 
        eventDate.getFullYear() === selectedDate.getFullYear() &&
        eventDate.getMonth() === selectedDate.getMonth() &&
        eventDate.getDate() === selectedDate.getDate();
      const matchesCategory = activeCategories.length === 0 || activeCategories.includes(event.category);
      return isSameDate && matchesCategory;
    });
    setFilteredEvents(filtered);
  }, [selectedDate, events, activeCategories]);

  const tileClassName = ({ date }) => {
    const hasEvents = events.some(event => {
      const eventDate = new Date(event.date);
      return eventDate.toDateString() === date.toDateString();
    });
    return hasEvents ? 'has-events' : '';
  };

  const tileContent = ({ date }) => {
    const dayEvents = events.filter(event => {
      const eventDate = new Date(event.date);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });

    if (dayEvents.length > 0) {
      return (
        <div className="event-indicator">
          <span className="event-count">{dayEvents.length}</span>
        </div>
      );
    }
    return null;
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const toggleCategory = (category) => {
    setActiveCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const handleEventClick = (eventId) => {
    navigate(`/events/${eventId}`);
  };

  useEffect(() => {
    console.log('Current events:', events);
    console.log('Selected date:', selectedDate);
    console.log('Filtered events:', filteredEvents);
  }, [events, selectedDate, filteredEvents]);

  return (
    <div className="calendar-page">
      <div className="calendar-container">
        <h1>Event Calendar</h1>
        
        <div className="category-filter">
          <h3>Filter by Category</h3>
          <div className="category-buttons">
            {categories.map(category => (
              <button
                key={category}
                className={`category-btn ${activeCategories.includes(category) ? 'active' : ''}`}
                onClick={() => toggleCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <Calendar
          onChange={handleDateClick}
          value={selectedDate}
          tileClassName={tileClassName}
          tileContent={tileContent}
          className="event-calendar"
        />

        <div className="events-list">
          <h2>Events on {selectedDate.toLocaleDateString()}</h2>
          {filteredEvents.length > 0 ? (
            <div className="event-cards">
              {filteredEvents.map(event => (
                <div 
                  key={event._id} 
                  className="event-card"
                  onClick={() => handleEventClick(event._id)}
                >
                  <h3>{event.title}</h3>
                  <div className="event-info">
                    <p>⏰ {event.time}</p>
                    <p>📍 {event.location}</p>
                    <p>🏷️ {event.category}</p>
                    <p>👥 {event.capacity - (event.registeredUsers?.length || 0)} seats available</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-events">No events scheduled for this date</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default CalendarPage; 