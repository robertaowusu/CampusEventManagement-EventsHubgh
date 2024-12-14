import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    preferences: []
  });

  const preferences = [
    'academic',
    'sports',
    'cultural',
    'technology',
    'workshops',
    'social'
  ];

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      console.log('Registration response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      localStorage.setItem('token', data.token);
      login(data.token);
      navigate('/events');
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.message);
    }
  };

  return (
    <div className="register-container">
      <div className="page-header">
        <h1>Create Your Account</h1>
        <p>Join us to stay updated with campus events</p>
      </div>
      
      <div className="content-container">
        <div className="form-container">
          <form className="register-form" onSubmit={handleSubmit}>
            {error && <div className="error-message">{error}</div>}
            
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="Enter your email"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input 
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Create a password"
                minLength="6"
              />
            </div>

            <div className="preferences-section">
              <h3>Event Preferences</h3>
              <div className="preferences-grid">
                {preferences.map(pref => (
                  <label key={pref} className="checkbox-label">
                    <input
                      type="checkbox"
                      value={pref}
                      onChange={(e) => {
                        const value = e.target.value;
                        setFormData(prev => ({
                          ...prev,
                          preferences: e.target.checked 
                            ? [...prev.preferences, value]
                            : prev.preferences.filter(p => p !== value)
                        }));
                      }}
                    />
                    {pref.charAt(0).toUpperCase() + pref.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn primary">Create Account</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 