import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './LoginModal.css';

const LoginModal = ({ isOpen, onClose, feature }) => {
    const navigate = useNavigate();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);
            document.body.style.overflow = 'hidden';
        } else {
            setIsVisible(false);
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleClose = () => {
        setIsVisible(false);
        setTimeout(() => {
            onClose();
        }, 200);
    };

    const handleLogin = () => {
        handleClose();
        navigate('/login');
    };

    const handleRegister = () => {
        handleClose();
        navigate('/register');
    };

    const getFeatureInfo = () => {
        switch (feature) {
            case 'orders':
                return {
                    title: 'Track Your Orders',
                    description: 'Sign in to view your order history, track shipments, and manage your purchases.',
                    icon: '📦',
                    benefits: [
                        'View order history and status',
                        'Track shipments in real-time',
                        'Manage returns and refunds',
                        'Get order notifications'
                    ]
                };
            case 'plans':
                return {
                    title: 'Payment Plans & Billing',
                    description: 'Sign in to access your payment plans, billing information, and subscription management.',
                    icon: '💳',
                    benefits: [
                        'View your current plans',
                        'Manage billing information',
                        'Upgrade or downgrade plans',
                        'Access payment history'
                    ]
                };
            case 'favorites':
                return {
                    title: 'Save Your Favorites',
                    description: 'Sign in to save your favorite stores and products for quick access later.',
                    icon: '❤️',
                    benefits: [
                        'Save favorite stores and products',
                        'Create personalized collections',
                        'Get notified about updates',
                        'Access favorites across devices'
                    ]
                };
            default:
                return {
                    title: 'Sign In Required',
                    description: 'Please sign in to access this feature.',
                    icon: '🔐',
                    benefits: [
                        'Access personalized features',
                        'Save your preferences',
                        'Track your activity',
                        'Get personalized recommendations'
                    ]
                };
        }
    };

    const featureInfo = getFeatureInfo();

    if (!isOpen) return null;

    return (
        <div className={`login-modal-overlay ${isVisible ? 'visible' : ''}`} onClick={handleClose}>
            <div className="login-modal" onClick={(e) => e.stopPropagation()}>
                <button className="login-modal-close" onClick={handleClose}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                <div className="login-modal-content">
                    <div className="login-modal-header">
                        <div className="login-modal-icon">
                            <span style={{ fontSize: '3rem' }}>{featureInfo.icon}</span>
                        </div>
                        <h2 className="login-modal-title">{featureInfo.title}</h2>
                        <p className="login-modal-description">{featureInfo.description}</p>
                    </div>

                    <div className="login-modal-benefits">
                        <h3>What you'll get:</h3>
                        <ul className="benefits-list">
                            {featureInfo.benefits.map((benefit, index) => (
                                <li key={index} className="benefit-item">
                                    <span className="benefit-icon">✓</span>
                                    {benefit}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="login-modal-actions">
                        <button 
                            className="login-modal-btn primary-btn"
                            onClick={handleLogin}
                        >
                            <span className="btn-icon">👤</span>
                            Sign In
                        </button>
                        <button 
                            className="login-modal-btn secondary-btn"
                            onClick={handleRegister}
                        >
                            <span className="btn-icon">📝</span>
                            Create Account
                        </button>
                    </div>

                    <div className="login-modal-footer">
                        <p>Don't have an account? <button className="link-btn" onClick={handleRegister}>Sign up for free</button></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal; 