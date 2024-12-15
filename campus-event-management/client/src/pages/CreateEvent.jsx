import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/CreateEvent.css';

const CreateEvent = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    category: '',
    capacity: '',
    schedule: [{ time: '', activity: '', speaker: '', location: '' }],
    venue: {
      name: '',
      address: '',
      capacity: '',
      seatingArrangement: {
        rows: '',
        seatsPerRow: ''
      }
    },
    additionalDetails: {
      dress_code: '',
      refreshments: false,
      parking: false,
      special_instructions: ''
    }
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScheduleChange = (index, field, value) => {
    const newSchedule = [...formData.schedule];
    newSchedule[index][field] = value;
    setFormData(prev => ({
      ...prev,
      schedule: newSchedule
    }));
  };

  const addScheduleItem = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { time: '', activity: '', speaker: '', location: '' }]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.isAdmin) {
      setError('Only admins can create events');
      return;
    }

    try {
      const response = await fetch('http://localhost:5001/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create event');
      }

      navigate('/events');
    } catch (error) {
      console.error('Error creating event:', error);
      setError(error.message);
    }
  };

  if (!user?.isAdmin) {
    return <div className="error-message">Only admins can access this page</div>;
  }

  return (
    <div className="create-event-container">
      <h1>Create New Event</h1>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h2>Basic Information</h2>
          <div className="form-group">
            <label>Event Title</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select name="category" value={formData.category} onChange={handleChange} required>
              <option value="">Select Category</option>
              <option value="academic">Academic</option>
              <option value="social">Social</option>
              <option value="cultural">Cultural</option>
              <option value="technology">Technology</option>
            </select>
          </div>

          <div className="form-group">
            <label>Capacity</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
              min="1"
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Venue Details</h2>
          <div className="form-group">
            <label>Venue Name</label>
            <input
              type="text"
              name="venue.name"
              value={formData.venue.name}
              onChange={e => setFormData(prev => ({
                ...prev,
                venue: { ...prev.venue, name: e.target.value }
              }))}
              required
            />
          </div>

          <div className="form-group">
            <label>Address</label>
            <input
              type="text"
              name="venue.address"
              value={formData.venue.address}
              onChange={e => setFormData(prev => ({
                ...prev,
                venue: { ...prev.venue, address: e.target.value }
              }))}
              required
            />
          </div>
        </div>

        <div className="form-section">
          <h2>Schedule</h2>
          {formData.schedule.map((item, index) => (
            <div key={index} className="schedule-item">
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={item.time}
                  onChange={e => handleScheduleChange(index, 'time', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Activity</label>
                <input
                  type="text"
                  value={item.activity}
                  onChange={e => handleScheduleChange(index, 'activity', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Speaker</label>
                <input
                  type="text"
                  value={item.speaker}
                  onChange={e => handleScheduleChange(index, 'speaker', e.target.value)}
                />
              </div>
            </div>
          ))}
          <button type="button" onClick={addScheduleItem} className="btn secondary">
            Add Schedule Item
          </button>
        </div>

        <div className="form-section">
          <h2>Additional Details</h2>
          <div className="form-group">
            <label>Dress Code</label>
            <input
              type="text"
              name="additionalDetails.dress_code"
              value={formData.additionalDetails.dress_code}
              onChange={e => setFormData(prev => ({
                ...prev,
                additionalDetails: { ...prev.additionalDetails, dress_code: e.target.value }
              }))}
            />
          </div>

          <div className="checkbox-group">
            <label>
              <input
                type="checkbox"
                checked={formData.additionalDetails.refreshments}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  additionalDetails: { ...prev.additionalDetails, refreshments: e.target.checked }
                }))}
              />
              Refreshments Available
            </label>

            <label>
              <input
                type="checkbox"
                checked={formData.additionalDetails.parking}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  additionalDetails: { ...prev.additionalDetails, parking: e.target.checked }
                }))}
              />
              Parking Available
            </label>
          </div>

          <div className="form-group">
            <label>Special Instructions</label>
            <textarea
              name="additionalDetails.special_instructions"
              value={formData.additionalDetails.special_instructions}
              onChange={e => setFormData(prev => ({
                ...prev,
                additionalDetails: { ...prev.additionalDetails, special_instructions: e.target.value }
              }))}
              rows="4"
            />
          </div>
        </div>

        <button type="submit" className="btn primary">Create Event</button>
      </form>
    </div>
  );
};

export default CreateEvent; 