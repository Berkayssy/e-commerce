import React from 'react';

const ErrorMessage = ({ error }) => {
  if (!error) return null;
  return (
    <div className="error-message" role="alert">
      {typeof error === 'string' ? error : error.error}
    </div>
  );
};

export default ErrorMessage; 