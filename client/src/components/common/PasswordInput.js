import React, { useState } from 'react';

const PasswordInput = ({ name, placeholder, value, onChange, ...rest }) => {
  const [show, setShow] = useState(false);
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="input-group password-input-wrapper">
      <span className="icon">🔒</span>
      <input
        type={show ? 'text' : 'password'}
        className="login-input"
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        {...rest}
      />
      <button
        type="button"
        className="toggle-password-btn"
        onClick={() => setShow((prev) => !prev)}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? '🙈' : '👁️'}
      </button>
    </div>
  );
};

export default PasswordInput; 