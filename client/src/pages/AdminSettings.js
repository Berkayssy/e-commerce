import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './AdminSettings.css';

const AdminSettings = () => {
  const pageRef = useRef(null);
  const settingsCardsRef = useRef([]);
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    siteName: 'CommerceSaaS',
    siteDescription: 'Modern e-commerce platform',
    maintenanceMode: false,
    emailNotifications: true,
    autoBackup: true,
    backupFrequency: 'daily',
    maxFileSize: '10MB',
    allowedFileTypes: ['jpg', 'png', 'pdf'],
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    enableTwoFactor: true,
    enableApiAccess: false,
    apiKey: 'sk_live_1234567890abcdef',
    webhookUrl: 'https://api.example.com/webhook',
    analyticsEnabled: true,
    trackingCode: 'GA-123456789',
    seoEnabled: true,
    metaTitle: 'CommerceSaaS - Modern E-commerce',
    metaDescription: 'Best e-commerce platform for modern businesses'
  });

  useEffect(() => {
    // Page entrance animation
    gsap.set(pageRef.current, { opacity: 0, y: 30 });
    gsap.to(pageRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });

    // Settings cards animation
    gsap.fromTo(settingsCardsRef.current,
      { opacity: 0, y: 50, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.1, ease: 'back.out(1.7)', delay: 0.2 }
    );
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveSettings = () => {
    // Simulate saving settings
    console.log('Saving settings:', settings);
    // Here you would typically make an API call
  };

  const generateNewApiKey = () => {
    const newKey = 'sk_live_' + Math.random().toString(36).substr(2, 15);
    handleSettingChange('apiKey', newKey);
  };

  const renderGeneralSettings = () => (
    <div className="settings-section">
      <div className="setting-group">
        <h3 className="setting-group-title">Site Configuration</h3>
        <div className="setting-item">
          <label className="setting-label">Site Name</label>
          <input
            type="text"
            value={settings.siteName}
            onChange={(e) => handleSettingChange('siteName', e.target.value)}
            className="setting-input"
          />
        </div>
        <div className="setting-item">
          <label className="setting-label">Site Description</label>
          <textarea
            value={settings.siteDescription}
            onChange={(e) => handleSettingChange('siteDescription', e.target.value)}
            className="setting-textarea"
            rows="3"
          />
        </div>
      </div>

      <div className="setting-group">
        <h3 className="setting-group-title">System Settings</h3>
        <div className="setting-item">
          <label className="setting-label">Maintenance Mode</label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.maintenanceMode}
              onChange={(e) => handleSettingChange('maintenanceMode', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <label className="setting-label">Email Notifications</label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.emailNotifications}
              onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <label className="setting-label">Auto Backup</label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.autoBackup}
              onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <label className="setting-label">Backup Frequency</label>
          <select
            value={settings.backupFrequency}
            onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
            className="setting-select"
          >
            <option value="hourly">Hourly</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="settings-section">
      <div className="setting-group">
        <h3 className="setting-group-title">Authentication</h3>
        <div className="setting-item">
          <label className="setting-label">Session Timeout (minutes)</label>
          <input
            type="number"
            value={settings.sessionTimeout}
            onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
            className="setting-input"
            min="5"
            max="1440"
          />
        </div>
        <div className="setting-item">
          <label className="setting-label">Max Login Attempts</label>
          <input
            type="number"
            value={settings.maxLoginAttempts}
            onChange={(e) => handleSettingChange('maxLoginAttempts', parseInt(e.target.value))}
            className="setting-input"
            min="3"
            max="10"
          />
        </div>
        <div className="setting-item">
          <label className="setting-label">Two-Factor Authentication</label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.enableTwoFactor}
              onChange={(e) => handleSettingChange('enableTwoFactor', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
      </div>

      <div className="setting-group">
        <h3 className="setting-group-title">API Settings</h3>
        <div className="setting-item">
          <label className="setting-label">Enable API Access</label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.enableApiAccess}
              onChange={(e) => handleSettingChange('enableApiAccess', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <label className="setting-label">API Key</label>
          <div className="api-key-container">
            <input
              type="text"
              value={settings.apiKey}
              readOnly
              className="setting-input api-key-input"
            />
            <button onClick={generateNewApiKey} className="generate-key-btn">
              Generate New
            </button>
          </div>
        </div>
        <div className="setting-item">
          <label className="setting-label">Webhook URL</label>
          <input
            type="url"
            value={settings.webhookUrl}
            onChange={(e) => handleSettingChange('webhookUrl', e.target.value)}
            className="setting-input"
            placeholder="https://api.example.com/webhook"
          />
        </div>
      </div>
    </div>
  );

  const renderFileSettings = () => (
    <div className="settings-section">
      <div className="setting-group">
        <h3 className="setting-group-title">File Upload Settings</h3>
        <div className="setting-item">
          <label className="setting-label">Maximum File Size</label>
          <select
            value={settings.maxFileSize}
            onChange={(e) => handleSettingChange('maxFileSize', e.target.value)}
            className="setting-select"
          >
            <option value="5MB">5MB</option>
            <option value="10MB">10MB</option>
            <option value="25MB">25MB</option>
            <option value="50MB">50MB</option>
            <option value="100MB">100MB</option>
          </select>
        </div>
        <div className="setting-item">
          <label className="setting-label">Allowed File Types</label>
          <div className="file-types-container">
            {['jpg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx'].map(type => (
              <label key={type} className="file-type-checkbox">
                <input
                  type="checkbox"
                  checked={settings.allowedFileTypes.includes(type)}
                  onChange={(e) => {
                    const newTypes = e.target.checked
                      ? [...settings.allowedFileTypes, type]
                      : settings.allowedFileTypes.filter(t => t !== type);
                    handleSettingChange('allowedFileTypes', newTypes);
                  }}
                />
                <span className="checkbox-custom"></span>
                {type.toUpperCase()}
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsSettings = () => (
    <div className="settings-section">
      <div className="setting-group">
        <h3 className="setting-group-title">Analytics & Tracking</h3>
        <div className="setting-item">
          <label className="setting-label">Enable Analytics</label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.analyticsEnabled}
              onChange={(e) => handleSettingChange('analyticsEnabled', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <label className="setting-label">Tracking Code</label>
          <input
            type="text"
            value={settings.trackingCode}
            onChange={(e) => handleSettingChange('trackingCode', e.target.value)}
            className="setting-input"
            placeholder="GA-123456789"
          />
        </div>
      </div>

      <div className="setting-group">
        <h3 className="setting-group-title">SEO Settings</h3>
        <div className="setting-item">
          <label className="setting-label">Enable SEO</label>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={settings.seoEnabled}
              onChange={(e) => handleSettingChange('seoEnabled', e.target.checked)}
            />
            <span className="toggle-slider"></span>
          </label>
        </div>
        <div className="setting-item">
          <label className="setting-label">Meta Title</label>
          <input
            type="text"
            value={settings.metaTitle}
            onChange={(e) => handleSettingChange('metaTitle', e.target.value)}
            className="setting-input"
          />
        </div>
        <div className="setting-item">
          <label className="setting-label">Meta Description</label>
          <textarea
            value={settings.metaDescription}
            onChange={(e) => handleSettingChange('metaDescription', e.target.value)}
            className="setting-textarea"
            rows="3"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="admin-settings-page" ref={pageRef}>
      <div className="admin-settings-container">
        <div className="admin-settings-header">
          <h1 className="admin-settings-title">Admin Settings</h1>
          <p className="admin-settings-subtitle">Configure your platform settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="settings-tabs">
          <button 
            className={`tab-btn ${activeTab === 'general' ? 'active' : ''}`}
            onClick={() => setActiveTab('general')}
          >
            General
          </button>
          <button 
            className={`tab-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => setActiveTab('security')}
          >
            Security
          </button>
          <button 
            className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
            onClick={() => setActiveTab('files')}
          >
            Files
          </button>
          <button 
            className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveTab('analytics')}
          >
            Analytics
          </button>
        </div>

        {/* Settings Content */}
        <div className="settings-content" ref={el => settingsCardsRef.current[0] = el}>
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
          {activeTab === 'files' && renderFileSettings()}
          {activeTab === 'analytics' && renderAnalyticsSettings()}
        </div>

        {/* Save Button */}
        <div className="settings-actions">
          <button onClick={handleSaveSettings} className="save-settings-btn">
            <span role="img" aria-label="save">💾</span>
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings; 