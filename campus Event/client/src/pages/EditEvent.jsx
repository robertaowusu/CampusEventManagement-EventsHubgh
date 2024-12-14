import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/EditEvent.css';

const EditEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
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
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      navigate('/');
      return;
    }
    fetchEvent();
  }, [eventId, user]);

  const fetchEvent = async () => {
    try {
      const response = await fetch(`http://localhost:5001/api/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch event');
      }

      const data = await response.json();
      console.log('Fetched event:', data); // Debug log
      setFormData({
        ...data,
        date: data.date?.split('T')[0], // Format date for input
        schedule: data.schedule || [{ time: '', activity: '', speaker: '', location: '' }]
      });
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

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

  const removeScheduleItem = (index) => {
    setFormData(prev => ({
      ...prev,
      schedule: prev.schedule.filter((_, i) => i !== index)
    }));
  };

  const addScheduleItem = () => {
    setFormData(prev => ({
      ...prev,
      schedule: [...prev.schedule, { time: '', activity: '', speaker: '', location: '' }]
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();

      // Add basic fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('date', formData.date);
      formDataToSend.append('time', formData.time);
      formDataToSend.append('location', formData.location);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('capacity', formData.capacity);

      // Add image if it exists
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      // Add complex objects as JSON strings
      formDataToSend.append('schedule', JSON.stringify(formData.schedule || []));
      formDataToSend.append('venue', JSON.stringify(formData.venue || {}));
      formDataToSend.append('additionalDetails', JSON.stringify(formData.additionalDetails || {}));

      // Debug log
      console.log('Form data being sent:', {
        title: formData.title,
        date: formData.date,
        time: formData.time,
        location: formData.location,
        hasImage: !!formData.image,
        schedule: formData.schedule
      });

      const response = await fetch(`http://localhost:5001/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formDataToSend
      });

      const responseData = await response.json();
      console.log('Server response:', responseData);

      if (!response.ok) {
        throw new Error(responseData.message || responseData.error || 'Failed to update event');
      }

      navigate('/events/manage');
    } catch (error) {
      console.error('Error updating event:', error);
      setError(typeof error === 'string' ? error : error.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="edit-event-container">
      <h1>Edit Event</h1>
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
              value={formData.date?.split('T')[0]}
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

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              placeholder="Event location"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Event description"
            />
          </div>

          <div className="form-group">
            <label>Event Image</label>
            <div className="image-upload-container">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="file-input"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="file-input-label">
                Choose Image
              </label>
              {imagePreview || formData.imageUrl ? (
                <div className="image-preview">
                  <img 
                    src={imagePreview || `http://localhost:5001${formData.imageUrl}`} 
                    alt="Event preview" 
                  />
                </div>
              ) : null}
            </div>
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
              <button 
                type="button" 
                onClick={() => removeScheduleItem(index)}
                className="btn remove-btn"
              >
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addScheduleItem} className="btn secondary">
            Add Schedule Item
          </button>
        </div>

        <div className="button-group">
          <button type="button" onClick={() => navigate('/events/manage')} className="btn secondary">
            Cancel
          </button>
          <button type="submit" className="btn primary">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent; 