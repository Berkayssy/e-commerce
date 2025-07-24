import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import './PlanDetail.css';
import { useAuth } from '../contexts/AuthContext';

// Plan verilerini burada veya ayrı bir dosyada tutabilirsiniz
const plans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    period: 'Free forever',
    description: 'Perfect for small businesses just getting started',
    features: [
      'Up to 10 products',
      'Basic analytics',
      'Community support',
      'Standard themes',
      'Mobile responsive',
      'SSL certificate'
    ],
    color: '#818cf8'
  },
  {
    id: 'growth',
    name: 'Growth',
    price: 99,
    period: 'per month',
    description: 'Ideal for growing businesses with more needs',
    features: [
      'Unlimited products',
      'Advanced analytics',
      'Email & chat support',
      'Custom branding',
      'Priority updates',
      'API access',
      'Advanced SEO tools',
      'Multi-language support'
    ],
    color: '#c084fc'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 249,
    period: 'per month',
    description: 'For large businesses with complex requirements',
    features: [
      'All features included',
      'Priority support',
      'Custom domain',
      'Dedicated account manager',
      'API access',
      'White-label solution',
      'Advanced security',
      'Custom integrations',
      'SLA guarantee',
      'Training sessions'
    ],
    color: '#f472b6'
  }
];

const PlanDetail = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const contentRef = useRef(null);
  const { token } = useAuth();

  const plan = plans.find(p => p.id === planId);

  useEffect(() => {
    gsap.fromTo(contentRef.current?.children,
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.5, 
        stagger: 0.1,
        ease: "power2.out" 
      }
    );
  }, []);

  if (!plan) {
    return <div className="plan-detail-page"><h2>Plan not found</h2></div>;
  }

  const getPlanIcon = () => {
    switch (plan.id) {
      case 'starter':
        return '🚀';
      case 'growth':
        return '📈';
      case 'enterprise':
        return '🏢';
      default:
        return '💼';
    }
  };

  const handleConfirm = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (!token) {
        // Girişli değilse login sayfasına yönlendir, role=seller ve planId ile
        navigate(`/login?role=seller&planId=${plan.id}`);
        return;
      }
      // Girişli ise seller paneline yönlendir (ör: /dashboard veya /create-store)
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <div className="plan-detail-page">
      <div className="plan-detail-container" ref={contentRef}>
        <button className="back-link" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <div className="plan-header-section">
          <div className="plan-icon" style={{ color: plan.color, fontSize: 48 }}>
            {getPlanIcon()}
          </div>
          <h2 className="plan-title">{plan.name} Plan Details</h2>
          <p className="plan-description">{plan.description}</p>
        </div>
        <div className="plan-summary">
          <div className="summary-item">
            <span className="summary-label">Plan:</span>
            <span className="summary-value plan-summary-plan" style={{ color: plan.color, fontWeight: 600 }}>{plan.name}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Price:</span>
            <span className="summary-value plan-summary-price" style={{ color: plan.color, fontWeight: 600 }}>${plan.price} <span style={{ color: '#cbd5e1', fontWeight: 400 }}>{plan.period}</span></span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Features:</span>
            <span className="summary-value plan-summary-features">{plan.features.length} features included</span>
          </div>
        </div>
        <div className="key-features">
          <h3>What's included:</h3>
          <div className="features-list">
            {plan.features.map((feature, index) => (
              <div key={index} className="feature-item">
                <span className="feature-icon">✓</span>
                <span className="feature-text">{feature}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="plan-actions">
          <button 
            className="plan-btn primary" 
            onClick={handleConfirm}
            disabled={isLoading}
            style={{ '--plan-color': plan.color }}
          >
            {isLoading ? (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <span>Processing...</span>
              </div>
            ) : (
              plan.id === 'starter' ? 'Get Started Free' : `Start ${plan.name} Plan`
            )}
          </button>
        </div>
        <div className="plan-info">
          <p>
            {plan.id === 'starter' 
              ? 'No credit card required. Start building your store immediately.'
              : 'You can cancel anytime. 30-day money-back guarantee.'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default PlanDetail; 