import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { assignAdmin } from '../api/api';
import InputGroup from '../components/common/InputGroup';
import ErrorMessage from '../components/common/ErrorMessage';
import LoadingSpinner from '../components/common/LoadingSpinner';
import './AssignAdmin.css';

const AssignAdmin = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const communityId = params.get('communityId');
  
  const [form, setForm] = useState({ email: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [admins] = useState([]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email) {
      setError('Please enter an email address.');
      return;
    }
    
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await assignAdmin({ email: form.email });
      setSuccess(`Admin assigned successfully! ${response.admin.email} is now an admin for this store.`);
      setForm({ email: '' });
      // Refresh admin list
      // setAdmins([...admins, response.admin]);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to assign admin. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!communityId) {
    return (
      <div className="assign-admin-container">
        <div className="assign-admin-card">
          <div className="assign-admin-icon">⚠️</div>
          <h2>No Community Selected</h2>
          <p>Please select a community to assign admins.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="assign-admin-container">
      <div className="assign-admin-card">
        <div className="assign-admin-header">
          <div className="assign-admin-icon">🛡️</div>
          <h2>Assign Admin</h2>
          <p>Assign an admin to manage your store</p>
          <div className="community-info">
            <span>Community ID: <strong>{communityId}</strong></span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="assign-admin-form">
          <div className="form-group">
            <InputGroup
              icon="✉️"
              name="email"
              type="email"
              placeholder="Enter admin email address"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          {error && <ErrorMessage error={error} />}
          {success && <div className="success-message">{success}</div>}

          <button 
            type="submit" 
            className="assign-admin-btn" 
            disabled={loading}
          >
            {loading ? <LoadingSpinner message="Assigning..." /> : 'Assign Admin'}
          </button>
        </form>

        {admins.length > 0 && (
          <div className="admins-list">
            <h3>Current Admins</h3>
            <div className="admins-grid">
              {admins.map((admin, index) => (
                <div key={index} className="admin-item">
                  <div className="admin-email">{admin.email}</div>
                  <div className="admin-status">Active</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="assign-admin-info">
          <h4>How it works:</h4>
          <ul>
            <li>Enter the email address of the person you want to assign as admin</li>
            <li>The user will receive a notification about their new admin role</li>
            <li>Admins can manage products, orders, and store settings</li>
            <li>You can remove admin access at any time from settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AssignAdmin; 