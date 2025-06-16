import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Home.css';

const Home = () => {
  const { token } = useAuth();

  const renderButtons = () => {
    if (token) {
      return (
        <Link to="/products" className="home-btn">
          View Products
        </Link>
      );
    }

    return (
      <>
        <Link to="/login" className="home-btn">
          Login
        </Link>
        <Link to="/register" className="home-btn">
          Register
        </Link>
      </>
    );
  };

  return (
    <div className="home-container">
      <h1 className="home-title">Welcome to Our Shop 🛍️</h1>
      <p className="home-description">
        Discover amazing products tailored just for you. High quality, affordable, and fast shipping.
      </p>
      <div className="home-buttons">
        {renderButtons()}
      </div>
    </div>
  );
};

export default Home;