import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './ProfileSettings.css';
import { useNavigate } from 'react-router-dom';

const ProfileSettings = () => {
  const pageRef = useRef(null);
  const formRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567',
    bio: 'Passionate about technology and innovation.',
    location: 'San Francisco, CA',
    website: 'https://johndoe.com',
    notifications: {
      email: true,
      push: false,
      sms: true,
      marketing: false
    }
  });
  const navigate = useNavigate();

  useEffect(() => {
    // Page entrance animation
    gsap.set(pageRef.current, { opacity: 0, y: 30 });
    gsap.to(pageRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });

    // Form animation
    gsap.fromTo(formRef.current,
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out', delay: 0.2 }
    );
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNotificationChange = (type) => {
    setFormData(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted:', formData);
  };

  return (
    <div className="page-container" ref={pageRef}>
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Profile Settings</h1>
          <p className="page-subtitle">Manage your account information and preferences</p>
        </div>

        <div className="profile-container" ref={formRef}>
          {/* Tabs */}
          <div className="profile-tabs">
            <button 
              className={`tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              Profile Info
            </button>
            <button 
              className={`tab-btn ${activeTab === 'notifications' ? 'active' : ''}`}
              onClick={() => setActiveTab('notifications')}
            >
              Notifications
            </button>
            <button 
              className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
              onClick={() => setActiveTab('security')}
            >
              Security
            </button>
          </div>

          {/* Profile Info Tab */}
          {activeTab === 'profile' && (
            <div className="tab-content">
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-grid grid grid-2">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">First Name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className="form-input input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">Last Name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className="form-input input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">Email Address</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="form-input input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="form-input input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="location" className="form-label">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="form-input input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="website" className="form-label">Website</label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value={formData.website}
                      onChange={handleInputChange}
                      className="form-input input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="bio" className="form-label">Bio</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    className="form-textarea input"
                    rows="4"
                    placeholder="Tell us about yourself..."
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    Save Changes
                  </button>
                  <button type="button" className="btn" onClick={() => navigate('/products')}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="tab-content">
              <div className="notifications-section">
                <h3 className="section-title">Notification Preferences</h3>
                <div className="notification-options">
                  {Object.entries(formData.notifications).map(([type, enabled]) => (
                    <div key={type} className="notification-option card">
                      <div className="option-info">
                        <h4 className="option-title">
                          {type.charAt(0).toUpperCase() + type.slice(1)} Notifications
                        </h4>
                        <p className="option-description">
                          Receive {type} notifications for important updates
                        </p>
                      </div>
                      <label className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={enabled}
                          onChange={() => handleNotificationChange(type)}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="tab-content">
              <div className="security-section">
                <h3 className="section-title">Security Settings</h3>
                <div className="security-options">
                  <div className="security-option card">
                    <div className="option-info">
                      <h4 className="option-title">Change Password</h4>
                      <p className="option-description">Update your account password</p>
                    </div>
                    <button className="btn">Change Password</button>
                  </div>

                  <div className="security-option card">
                    <div className="option-info">
                      <h4 className="option-title">Two-Factor Authentication</h4>
                      <p className="option-description">Add an extra layer of security</p>
                    </div>
                    <button className="btn">Enable 2FA</button>
                  </div>

                  <div className="security-option card">
                    <div className="option-info">
                      <h4 className="option-title">Login History</h4>
                      <p className="option-description">View recent login activity</p>
                    </div>
                    <button className="btn">View History</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings; 