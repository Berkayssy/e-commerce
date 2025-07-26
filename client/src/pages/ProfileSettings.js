import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './ProfileSettings.css';
import { useNavigate } from 'react-router-dom';
import { getSellerProfile, updateSellerProfile } from '../api/api';

const ProfileSettings = () => {
  const pageRef = useRef(null);
  const formRef = useRef(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    phone: '',
    country: '',
    city: '',
    address: '',
    emailNotifications: true,
    planReminders: true
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

    // Fetch seller profile data
    fetchSellerProfile();
  }, []);

  const fetchSellerProfile = async () => {
    try {
      setLoading(true);
      setError('');
      const sellerData = await getSellerProfile();
      
      setFormData({
        name: sellerData.name || '',
        surname: sellerData.surname || '',
        phone: sellerData.phone || '',
        country: sellerData.country || '',
        city: sellerData.city || '',
        address: sellerData.address || '',
        emailNotifications: sellerData.emailNotifications !== undefined ? sellerData.emailNotifications : true,
        planReminders: sellerData.planReminders !== undefined ? sellerData.planReminders : true
      });
    } catch (err) {
      console.error('Error fetching seller profile:', err);
      setError('Failed to load profile data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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
      [type]: !prev[type]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const updatePayload = {
        name: formData.name,
        surname: formData.surname,
        phone: formData.phone,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        emailNotifications: formData.emailNotifications,
        planReminders: formData.planReminders
      };

      await updateSellerProfile(updatePayload);
      setSuccess('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Loading profile data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" ref={pageRef}>
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Profile Settings</h1>
          <p className="page-subtitle">Manage your account information and preferences</p>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

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
                    <label htmlFor="name" className="form-label">First Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="form-input input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="surname" className="form-label">Last Name</label>
                    <input
                      type="text"
                      id="surname"
                      name="surname"
                      value={formData.surname}
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
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="country" className="form-label">Country</label>
                    <input
                      type="text"
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="form-input input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="city" className="form-label">City</label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="form-input input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="address" className="form-label">Address</label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="form-input input"
                      required
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? 'Saving...' : 'Save Changes'}
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
                  <div className="notification-option card">
                    <div className="option-info">
                      <h4 className="option-title">Email Notifications</h4>
                      <p className="option-description">
                        Receive email notifications for important updates
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.emailNotifications}
                        onChange={() => handleNotificationChange('emailNotifications')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="notification-option card">
                    <div className="option-info">
                      <h4 className="option-title">Plan Reminders</h4>
                      <p className="option-description">
                        Get notified about plan expiration and renewals
                      </p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={formData.planReminders}
                        onChange={() => handleNotificationChange('planReminders')}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleSubmit}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Notification Settings'}
                  </button>
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