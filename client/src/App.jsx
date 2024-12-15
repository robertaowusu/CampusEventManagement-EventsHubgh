import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import EventsPage from './pages/EventsPage';
import CalendarPage from './pages/CalendarPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ProfilePage from './pages/ProfilePage';
import CreateEvent from './pages/CreateEvent';
import ManageEvents from './pages/ManageEvents';
import EditEvent from './pages/EditEvent';
import { AuthProvider } from './context/AuthContext';
import './styles/global.css';
import EventDetailsPage from './pages/EventDetailsPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-wrapper">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/events" element={<EventsPage />} />
              <Route path="/calendar" element={<CalendarPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/events/create" element={<CreateEvent />} />
              <Route path="/events/manage" element={<ManageEvents />} />
              <Route path="/events/edit/:eventId" element={<EditEvent />} />
              <Route path="/events/:eventId" element={<EventDetailsPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
