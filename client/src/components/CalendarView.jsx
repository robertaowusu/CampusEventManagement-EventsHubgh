import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import '../styles/CalendarView.css';

const CalendarView = ({ events, onEventClick }) => {
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const categories = [
    'academic',
    'sports',
    'cultural',
    'technology',
    'workshops',
    'social'
  ];

  useEffect(() => {
    if (selectedCategories.length === 0) {
      setFilteredEvents(formatEvents(events));
    } else {
      const filtered = events.filter(event => 
        selectedCategories.includes(event.category.toLowerCase())
      );
      setFilteredEvents(formatEvents(filtered));
    }
  }, [events, selectedCategories]);

  const formatEvents = (events) => {
    return events.map(event => ({
      id: event._id,
      title: event.title,
      start: event.date,
      end: event.date,
      extendedProps: {
        location: event.location,
        time: event.time,
        category: event.category,
        description: event.description,
        capacity: event.capacity,
        registeredUsers: event.registeredUsers
      }
    }));
  };

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(cat => cat !== category);
      }
      return [...prev, category];
    });
  };

  return (
    <div className="calendar-container">
      <div className="filters">
        <h3>Filter by Category</h3>
        <div className="category-filters">
          {categories.map(category => (
            <label key={category} className="category-checkbox">
              <input
                type="checkbox"
                checked={selectedCategories.includes(category)}
                onChange={() => handleCategoryChange(category)}
              />
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </label>
          ))}
        </div>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={filteredEvents}
        eventClick={({ event }) => onEventClick(event.id)}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,dayGridWeek'
        }}
        eventContent={(eventInfo) => (
          <div className={`calendar-event ${eventInfo.event.extendedProps.category}`}>
            <div className="event-title">{eventInfo.event.title}</div>
            <div className="event-time">{eventInfo.event.extendedProps.time}</div>
          </div>
        )}
      />
    </div>
  );
};

export default CalendarView; 