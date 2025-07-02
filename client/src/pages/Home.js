import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import useGsapFadeIn from '../components/common/useGsapFadeIn';
import './Home.css';

const Home = () => {
  const { token } = useAuth();
  const titleWordsRefs = useRef([]);
  const underlineRef = useRef(null);
  const buttonsRef = useRef(null);
  const heroIconRef = useRef(null);
  const infoCardsRef = useRef(null);
  const featuresRef = useRef(null);
  const pricingRef = useRef(null);
  const navbarRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const wakeServer = async () => {
      try {
        await axios.get(`${process.env.REACT_APP_API_URL}/ping`);
        console.log("Server pinged and awake.");
      } catch (err) {
        console.log("Ping failed", err.message);
      }
    };
    wakeServer();
  }, []);

  // Animate 'Build,' and 'Manage' letter by letter
  const buildManageLetterRefs = useRef([]);
  useGsapFadeIn([
    heroIconRef,
    ...buildManageLetterRefs.current,
    ...titleWordsRefs.current,
    underlineRef
  ], {
    stagger: 0.07,
    duration: 0.6,
    y: 32,
    delay: 0.15
  });

  useGsapFadeIn(
    infoCardsRef.current ? infoCardsRef.current.querySelectorAll('.hero-info-card') : [],
    {
      stagger: 0.13,
      duration: 0.6,
      y: 28,
      delay: 0.45
    }
  );

  useGsapFadeIn([buttonsRef], {
    stagger: 0.1,
    duration: 0.7,
    y: 32,
    delay: 0.7
  });

  useGsapFadeIn(featuresRef.current?.querySelectorAll('.feature-card'), { 
    stagger: 0.1, 
    duration: 0.6, 
    y: 40 
  });

  useGsapFadeIn(pricingRef.current?.querySelectorAll('.pricing-card'), { 
    stagger: 0.15, 
    duration: 0.7, 
    y: 50 
  });

  const handleGetStarted = () => navigate('/plans?plan=starter');
  const handleUpgrade = () => navigate('/plans?plan=growth');
  const handleContactSales = () => {
    window.location.href = 'mailto:sales@commercesaas.com?subject=Enterprise%20Plan%20Inquiry';
  };

  const renderHeroButtons = () => {
    if (token) {
      return (
        <Link to="/products" className="home-btn">
          Go to Dashboard
        </Link>
      );
    }
    return (
      <Link to="/plans" className="home-btn">
        Get Started
      </Link>
    );
  };

  const features = [
    { icon: '⚡', title: 'Lightning Fast', description: 'Set up your store in minutes, not hours. Our streamlined process gets you selling faster.' },
    { icon: '🔒', title: 'Secure & Reliable', description: 'Bank-level security with 99.9% uptime guarantee. Your business is always protected.' },
    { icon: '📊', title: 'Advanced Analytics', description: 'Real-time insights into your business performance. Make data-driven decisions.' },
    { icon: '🎨', title: 'Customizable', description: 'Personalize your store with themes, colors, and layouts that match your brand.' },
    { icon: '📱', title: 'Mobile Optimized', description: 'Perfect shopping experience on all devices. Your customers shop anywhere, anytime.' },
    { icon: '🛡️', title: '24/7 Support', description: 'Expert support team available round the clock. We\'re here when you need us.' }
  ];

  const pricingPlans = [
    {
      title: 'Starter',
      price: '$0',
      period: 'Free forever',
      features: ['Up to 10 products', 'Basic analytics', 'Community support', 'Standard themes'],
      buttonText: 'Get Started',
      onClick: handleGetStarted
    },
    {
      title: 'Growth',
      price: '$99',
      period: 'per month',
      features: ['Unlimited products', 'Advanced analytics', 'Email & chat support', 'Custom branding', 'Priority updates'],
      buttonText: 'Upgrade',
      onClick: handleUpgrade,
      featured: true,
      badge: 'Most Popular'
    },
    {
      title: 'Enterprise',
      price: '$249',
      period: 'per month',
      features: ['All features included', 'Priority support', 'Custom domain', 'Dedicated account manager', 'API access'],
      buttonText: 'Contact Sales',
      onClick: handleContactSales
    }
  ];

  return (
    <div className="home-page">
      {/* Enhanced Navbar */}
      <nav className="home-navbar" ref={navbarRef}>
        <div className="nav-container">
          <div className="nav-logo">
            <span className="logo-icon">💼</span>
            <span className="logo-text">CommerceSaaS</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
          </div>
          <div className="nav-auth">
            {token ? (
              <Link to="/products" className="nav-btn primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link to="/login" className="nav-btn secondary">
                  Sign In
                </Link>
                <Link to="/register" className="nav-btn primary">
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg" />
        <svg className="hero-svg-bg" width="100%" height="100%" viewBox="0 0 1440 400" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* ... existing SVG ... */}
        </svg>
        <div className="hero-header-center">
          <div className="hero-icon" ref={heroIconRef}>💼</div>
          <h1 className="hero-title">
            {/* Build, Manage animated letter by letter */}
            {['Build,', 'Manage'].map((word, wi) => (
              <span key={wi} style={{ display: 'inline-block', marginRight: 8 }}>
                {word.split('').map((char, ci) => (
                  <span
                    key={ci}
                    ref={el => buildManageLetterRefs.current[wi * 10 + ci] = el}
                    style={{ display: 'inline-block' }}
                  >
                    {char}
                  </span>
                ))}
              </span>
            ))}
            {/* The rest of the title as before */}
            {['&', 'Grow', 'Your', 'Gallery'].map((word, i) => (
              <span
                key={i}
                ref={el => titleWordsRefs.current[i] = el}
                style={{ display: 'inline-block', marginRight: i === 3 ? 0 : 8 }}
              >
                {word}
              </span>
            ))}
          </h1>
          <div ref={underlineRef} className="hero-title-underline"></div>
        </div>
        <div className="hero-main-grid">
          <div className="hero-info-cards-wrapper">
            <div className="hero-info-cards hero-info-cards-grid" ref={infoCardsRef}>
              <div className="feature-card">The all-in-one SaaS platform for galleries of every size—small, medium, or global.</div>
              <div className="feature-card">Create your own digital showroom, manage your inventory, and track sales and leads with ease.</div>
              <div className="feature-card">Empower your team with a powerful admin panel, real-time analytics, and seamless user management.</div>
              <div className="feature-card">Whether you're a boutique dealer or a global gallery, control your business from anywhere, anytime.</div>
            </div>
            <div className="hero-buttons hero-main-btn-center" ref={buttonsRef}>
              <div className="hero-btn-glow"></div>
              {renderHeroButtons()}
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="features-section" ref={featuresRef}>
        <div className="section-container">
          <h2 className="section-title">Why Choose Us</h2>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Grid */}
      <section id="pricing" className="pricing-section" ref={pricingRef}>
        <div className="section-container">
          <h2 className="section-title">Choose Your Plan</h2>
          <div className="pricing-grid">
            {pricingPlans.map((plan, index) => (
              <div key={index} className={`pricing-card${plan.featured ? ' featured' : ''}`}>
                {plan.badge && <div className="pricing-badge">{plan.badge}</div>}
                <div className="pricing-header">
                  <div className="pricing-title">{plan.title}</div>
                  <div className="pricing-price">{plan.price}</div>
                  <div className="pricing-period">{plan.period}</div>
                </div>
                <div className="pricing-features">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="feature-item">✓ {feature}</div>
                  ))}
                </div>
                <button 
                  className={`pricing-btn${plan.featured ? ' featured' : ''}`} 
                  onClick={plan.onClick}
                >
                  {plan.buttonText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="home-footer">
        <div className="footer-container">
          <div className="footer-content">
            <div className="footer-logo">
              <span className="logo-icon">💼</span>
              <span className="logo-text">CommerceSaaS</span>
            </div>
            <div className="footer-links">
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <Link to="/privacy">Privacy</Link>
              <Link to="/terms">Terms</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2024 CommerceSaaS. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;