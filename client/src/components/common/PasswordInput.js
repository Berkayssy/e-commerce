import React, { useState } from 'react';

const PasswordInput = ({ name, placeholder, value, onChange, className, style, ...rest }) => {
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
        className={`login-input ${className || ''}`}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        autoComplete={name === 'confirmPassword' ? 'new-password' : 'current-password'}
        style={style}
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