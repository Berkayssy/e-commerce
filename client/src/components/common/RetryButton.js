import React from 'react';

const RetryButton = ({ onRetry, children = 'Retry' }) => (
  <button onClick={onRetry} className="retry-button">
    {children}
  </button>
);

export default RetryButton; 