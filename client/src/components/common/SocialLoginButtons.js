import React from 'react';

const SocialLoginButtons = ({ onGoogle, onWeb3, loading }) => (
  <div className="social-login-buttons">
    <button 
      type="button"
      className="social-btn google" 
      aria-label="Sign in with Google"
      onClick={onGoogle}
      disabled={loading}
    >
      <span>Google</span>
    </button>
    <button 
      type="button"
      className="social-btn web3" 
      aria-label="Sign in with Web3"
      onClick={onWeb3}
      disabled={loading}
    >
      <span>Web3</span>
    </button>
  </div>
);

export default SocialLoginButtons; 