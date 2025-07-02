import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './UserManagement.css';

const UserManagement = () => {
  const pageRef = useRef(null);
  const userCardsRef = useRef([]);
  const [users, setUsers] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user', status: 'active', joinDate: '2024-01-15', lastLogin: '2024-01-20' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'admin', status: 'active', joinDate: '2024-01-10', lastLogin: '2024-01-21' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'user', status: 'inactive', joinDate: '2024-01-05', lastLogin: '2024-01-18' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'user', status: 'active', joinDate: '2024-01-12', lastLogin: '2024-01-19' },
    { id: 5, name: 'David Brown', email: 'david@example.com', role: 'user', status: 'active', joinDate: '2024-01-08', lastLogin: '2024-01-20' },
    { id: 6, name: 'Lisa Davis', email: 'lisa@example.com', role: 'admin', status: 'active', joinDate: '2024-01-03', lastLogin: '2024-01-21' },
  ]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    // Page entrance animation
    gsap.set(pageRef.current, { opacity: 0, y: 30 });
    gsap.to(pageRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });

    // User cards animation
    gsap.fromTo(userCardsRef.current,
      { opacity: 0, y: 50, scale: 0.8 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.08, ease: 'back.out(1.7)', delay: 0.2 }
    );
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesFilter = selectedFilter === 'all' || user.status === selectedFilter;
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleStatusChange = (userId, newStatus) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const handleRoleChange = (userId, newRole) => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const handleDeleteUser = (userId) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  };

  const getStatusColor = (status) => {
    return status === 'active' ? '#10b981' : '#ef4444';
  };

  const getRoleColor = (role) => {
    return role === 'admin' ? '#f472b6' : '#818cf8';
  };

  return (
    <div className="page-container" ref={pageRef}>
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">Manage your platform users and their permissions</p>
        </div>

        {/* Controls */}
        <div className="user-controls">
          <div className="search-section">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="user-search-input input"
            />
          </div>
          
          <div className="filter-section">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="user-filter-select input"
            >
              <option value="all">All Users</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="user-stats grid grid-3">
          <div className="stat-item card">
            <span className="stat-number">{users.length}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-item card">
            <span className="stat-number">{users.filter(u => u.status === 'active').length}</span>
            <span className="stat-label">Active Users</span>
          </div>
          <div className="stat-item card">
            <span className="stat-number">{users.filter(u => u.role === 'admin').length}</span>
            <span className="stat-label">Admins</span>
          </div>
        </div>

        {/* Users Grid */}
        <div className="users-grid grid grid-auto-fit">
          {filteredUsers.map((user, index) => (
            <div 
              key={user.id} 
              className="user-card card"
              ref={el => userCardsRef.current[index] = el}
            >
              <div className="user-card-header">
                <div className="user-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <h3 className="user-name">{user.name}</h3>
                  <p className="user-email">{user.email}</p>
                </div>
                <div className="user-status">
                  <span 
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(user.status) }}
                  >
                    {user.status}
                  </span>
                </div>
              </div>

              <div className="user-details">
                <div className="detail-item">
                  <span className="detail-label">Role:</span>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    className="role-select"
                    style={{ color: getRoleColor(user.role) }}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                <div className="detail-item">
                  <span className="detail-label">Status:</span>
                  <select
                    value={user.status}
                    onChange={(e) => handleStatusChange(user.id, e.target.value)}
                    className="status-select"
                    style={{ color: getStatusColor(user.status) }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Joined:</span>
                  <span className="detail-value">{user.joinDate}</span>
                </div>

                <div className="detail-item">
                  <span className="detail-label">Last Login:</span>
                  <span className="detail-value">{user.lastLogin}</span>
                </div>
              </div>

              <div className="user-actions">
                <button className="action-btn btn">
                  <span role="img" aria-label="edit">✏️</span>
                  Edit
                </button>
                <button 
                  className="action-btn btn"
                  onClick={() => handleDeleteUser(user.id)}
                >
                  <span role="img" aria-label="delete">🗑️</span>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="no-users">
            <p>No users found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement; 