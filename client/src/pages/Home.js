import React from 'react';
import { Link } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
  const { token } = useAuth();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'max(100vh, 100%)',
      textAlign: 'center',
      background: 'linear-gradient(to bottom right, #282c34, #1c1f24)',
      color: 'white',
      padding: '2rem',
    }}>
      <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Welcome to Our Shop 🛍️</h1>
      <p style={{ fontSize: '1.2rem', maxWidth: '600px', marginBottom: '2rem' }}>
        Discover amazing products tailored just for you. High quality, affordable, and fast shipping.
      </p>

      {token ? (
        <Link to="/products">
          <button className='login-btn'>View Products</button>
        </Link>
      ) : (
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link to="/login">
            <button className='login-btn'>Login</button>
          </Link>
          <Link to="/register">
            <button className='login-btn'>Register</button>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;