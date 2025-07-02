import React from 'react';

const LoadingSpinner = ({ message = 'Loading...', size = 'medium' }) => (
  <div className={`loading-container ${size}`}>
    <div className="loading-spinner"></div>
    <p>{message}</p>
  </div>
);

export default LoadingSpinner; 