import React from 'react';

const InputGroup = ({ icon, type = 'text', name, placeholder, value, onChange, ...rest }) => {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
    }
  };

  return (
    <div className="input-group">
      {icon && <span className="icon">{icon}</span>}
      <input
        className="login-input"
        type={type}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        {...rest}
      />
    </div>
  );
};

export default InputGroup; 