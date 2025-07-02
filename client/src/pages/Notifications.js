import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Notifications.css';

const Notifications = () => {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'order',
      title: 'New Order Received',
      message: 'Order #12345 has been placed successfully',
      time: '2 minutes ago',
      read: false,
      icon: '📦'
    },
    {
      id: 2,
      type: 'system',
      title: 'System Maintenance',
      message: 'Scheduled maintenance will occur tonight at 2 AM EST',
      time: '1 hour ago',
      read: true,
      icon: '🔧'
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment Successful',
      message: 'Your subscription payment has been processed',
      time: '3 hours ago',
      read: true,
      icon: '💳'
    },
    {
      id: 4,
      type: 'product',
      title: 'Low Stock Alert',
      message: 'Product "Luxury Car Model X" is running low on stock',
      time: '1 day ago',
      read: false,
      icon: '⚠️'
    }
  ]);

  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    paymentAlerts: true,
    systemMaintenance: false,
    marketingEmails: false,
    weeklyReports: true
  });

  const [activeTab, setActiveTab] = useState('all');

  // GSAP refs
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const tabsRef = useRef(null);
  const notificationsRef = useRef(null);
  const settingsRef = useRef(null);
  const notificationItemsRef = useRef([]);
  const settingItemsRef = useRef([]);

  useEffect(() => {
    // Page entrance animation
    gsap.set(pageRef.current, { opacity: 0, y: 30 });
    gsap.set(headerRef.current, { opacity: 0, y: -20 });
    gsap.set(tabsRef.current, { opacity: 0, y: 20 });
    gsap.set(notificationsRef.current, { opacity: 0, x: -30 });
    gsap.set(settingsRef.current, { opacity: 0, x: 30 });

    const tl = gsap.timeline();
    tl.to(pageRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
      .to(headerRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
      .to(tabsRef.current, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, '-=0.2')
      .to(notificationsRef.current, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
      .to(settingsRef.current, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, '-=0.5');

    // Stagger animations
    gsap.fromTo(notificationItemsRef.current, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out', delay: 0.4 }
    );

    gsap.fromTo(settingItemsRef.current, 
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out', delay: 0.6 }
    );
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );

    // Animate the notification item
    const notificationItem = notificationItemsRef.current.find(item => item.dataset.notificationId === id.toString());
    if (notificationItem) {
      gsap.to(notificationItem, { 
        backgroundColor: 'rgba(34, 197, 94, 0.1)', 
        duration: 0.3,
        yoyo: true,
        repeat: 1
      });
    }
  };

  const deleteNotification = (id) => {
    const notificationItem = notificationItemsRef.current.find(item => item.dataset.notificationId === id.toString());
    if (notificationItem) {
      gsap.to(notificationItem, { 
        opacity: 0, 
        x: -100, 
        duration: 0.3, 
        ease: 'power2.in',
        onComplete: () => {
          setNotifications(prev => prev.filter(notif => notif.id !== id));
        }
      });
    }
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    
    // Animate the setting item
    const settingItem = settingItemsRef.current.find(item => item.dataset.settingKey === key);
    if (settingItem) {
      gsap.to(settingItem, { 
        backgroundColor: 'rgba(129, 140, 248, 0.1)', 
        duration: 0.3,
        yoyo: true,
        repeat: 1
      });
    }
  };

  const filteredNotifications = activeTab === 'all' 
    ? notifications 
    : notifications.filter(notif => notif.type === activeTab);

  const unreadCount = notifications.filter(notif => !notif.read).length;

  return (
    <div className="notifications-page" ref={pageRef}>
      <div className="notifications-header" ref={headerRef}>
        <h1>Notifications</h1>
        <p>Stay updated with your account activity and important alerts</p>
        {unreadCount > 0 && (
          <div className="unread-badge">
            {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      <div className="notifications-tabs" ref={tabsRef}>
        <button 
          className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button 
          className={`tab-button ${activeTab === 'order' ? 'active' : ''}`}
          onClick={() => setActiveTab('order')}
        >
          Orders
        </button>
        <button 
          className={`tab-button ${activeTab === 'payment' ? 'active' : ''}`}
          onClick={() => setActiveTab('payment')}
        >
          Payments
        </button>
        <button 
          className={`tab-button ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          System
        </button>
      </div>

      <div className="notifications-content">
        <div className="notifications-list" ref={notificationsRef}>
          <h2>Recent Notifications</h2>
          <div className="notifications-container">
            {filteredNotifications.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔔</div>
                <h3>No notifications</h3>
                <p>You're all caught up! Check back later for updates.</p>
              </div>
            ) : (
              filteredNotifications.map((notification, index) => (
                <div 
                  key={notification.id}
                  className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  ref={el => notificationItemsRef.current[index] = el}
                  data-notification-id={notification.id}
                >
                  <div className="notification-icon">{notification.icon}</div>
                  <div className="notification-content">
                    <div className="notification-header">
                      <h4>{notification.title}</h4>
                      <span className="notification-time">{notification.time}</span>
                    </div>
                    <p className="notification-message">{notification.message}</p>
                    <div className="notification-actions">
                      {!notification.read && (
                        <button 
                          className="mark-read-btn"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark as read
                        </button>
                      )}
                      <button 
                        className="delete-btn"
                        onClick={() => deleteNotification(notification.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="notification-settings" ref={settingsRef}>
          <h2>Notification Settings</h2>
          <div className="settings-container">
            <div 
              className="setting-item"
              ref={el => settingItemsRef.current[0] = el}
              data-setting-key="emailNotifications"
            >
              <div className="setting-info">
                <h4>Email Notifications</h4>
                <p>Receive notifications via email</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={() => toggleSetting('emailNotifications')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div 
              className="setting-item"
              ref={el => settingItemsRef.current[1] = el}
              data-setting-key="pushNotifications"
            >
              <div className="setting-info">
                <h4>Push Notifications</h4>
                <p>Receive browser push notifications</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={() => toggleSetting('pushNotifications')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div 
              className="setting-item"
              ref={el => settingItemsRef.current[2] = el}
              data-setting-key="orderUpdates"
            >
              <div className="setting-info">
                <h4>Order Updates</h4>
                <p>Get notified about order status changes</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.orderUpdates}
                  onChange={() => toggleSetting('orderUpdates')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div 
              className="setting-item"
              ref={el => settingItemsRef.current[3] = el}
              data-setting-key="paymentAlerts"
            >
              <div className="setting-info">
                <h4>Payment Alerts</h4>
                <p>Receive payment confirmations and alerts</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.paymentAlerts}
                  onChange={() => toggleSetting('paymentAlerts')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div 
              className="setting-item"
              ref={el => settingItemsRef.current[4] = el}
              data-setting-key="systemMaintenance"
            >
              <div className="setting-info">
                <h4>System Maintenance</h4>
                <p>Get notified about scheduled maintenance</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.systemMaintenance}
                  onChange={() => toggleSetting('systemMaintenance')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div 
              className="setting-item"
              ref={el => settingItemsRef.current[5] = el}
              data-setting-key="marketingEmails"
            >
              <div className="setting-info">
                <h4>Marketing Emails</h4>
                <p>Receive promotional emails and updates</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.marketingEmails}
                  onChange={() => toggleSetting('marketingEmails')}
                />
                <span className="slider"></span>
              </label>
            </div>

            <div 
              className="setting-item"
              ref={el => settingItemsRef.current[6] = el}
              data-setting-key="weeklyReports"
            >
              <div className="setting-info">
                <h4>Weekly Reports</h4>
                <p>Receive weekly performance summaries</p>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.weeklyReports}
                  onChange={() => toggleSetting('weeklyReports')}
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications; 