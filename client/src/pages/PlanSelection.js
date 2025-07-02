import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import './PlanSelection.css';

const FAQS = [
  {
    question: 'Can I change my plan later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately and are prorated.'
  },
  {
    question: 'Is there a setup fee?',
    answer: 'No setup fees for any plan. You only pay for the plan you choose, with transparent pricing.'
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, PayPal, Apple Pay, Google Pay, and bank transfers for Enterprise plans.'
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 30-day money-back guarantee for all paid plans. No questions asked.'
  },
  {
    question: 'Is my data secure?',
    answer: 'Absolutely. We use bank-level encryption, regular security audits, and comply with GDPR and SOC 2 standards.'
  }
];

const PlanSelection = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const plansRef = useRef(null);
  const plansGridRef = useRef(null);

  useEffect(() => {
    // URL'den plan bilgisini al
    const urlParams = new URLSearchParams(location.search);
    const planFromUrl = urlParams.get('plan');
    if (planFromUrl) {
      setSelectedPlan(planFromUrl);
    }

    // Animasyonlar
    gsap.fromTo([titleRef.current, subtitleRef.current],
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        stagger: 0.2,
        ease: "power2.out" 
      }
    );

    gsap.fromTo(plansRef.current?.children,
      { opacity: 0, y: 50 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.7, 
        stagger: 0.15,
        delay: 0.3,
        ease: "power2.out" 
      }
    );
  }, [location]);

  // --- Force all plan cards to same height (JS solution) ---
  useEffect(() => {
    function setEqualCardHeights() {
      const grid = plansGridRef.current;
      if (!grid) return;
      const cards = Array.from(grid.querySelectorAll('.plan-card'));
      // Reset heights first
      cards.forEach(card => card.style.height = 'auto');
      // Find max height
      const max = Math.max(...cards.map(card => card.offsetHeight));
      // Set all to max
      cards.forEach(card => card.style.height = max + 'px');
    }
    setEqualCardHeights();
    window.addEventListener('resize', setEqualCardHeights);
    return () => window.removeEventListener('resize', setEqualCardHeights);
  }, []);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      price: 0,
      period: 'Free forever',
      description: 'Perfect for small automotive businesses just getting started',
      features: [
        'Up to 10 products',
        'Basic analytics dashboard',
        'Community support',
        'Standard gallery themes',
        'Mobile responsive design',
        'SSL certificate included',
        'Basic SEO tools',
        'Email notifications'
      ],
      popular: false,
      color: '#818cf8',
      icon: '🚀'
    },
    {
      id: 'growth',
      name: 'Growth',
      price: 99,
      period: 'per month',
      description: 'Ideal for growing automotive businesses with more needs',
      features: [
        'Unlimited products',
        'Advanced analytics & insights',
        'Priority email & chat support',
        'Custom branding & themes',
        'Priority updates & features',
        'API access & webhooks',
        'Advanced SEO optimization',
        'Multi-language support',
        'Advanced inventory management',
        'Customer reviews & ratings'
      ],
      popular: true,
      color: '#c084fc',
      icon: '📈'
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 249,
      period: 'per month',
      description: 'For large automotive businesses with complex requirements',
      features: [
        'All Growth features included',
        '24/7 priority phone support',
        'Custom domain & branding',
        'Dedicated account manager',
        'Advanced API & integrations',
        'White-label solution',
        'Advanced security features',
        'Custom integrations',
        'SLA guarantee (99.9%)',
        'Training & onboarding sessions',
        'Advanced reporting suite',
        'Multi-location support'
      ],
      popular: false,
      color: '#f472b6',
      icon: '🏢'
    }
  ];

  const handlePlanSelect = async (plan) => {
    setIsLoading(true);
    try {
      // Simulate loading for better UX
      await new Promise(resolve => setTimeout(resolve, 300));
      navigate(`/plans/${plan.id}`);
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleButtonClick = (e, plan) => {
    e.stopPropagation();
    handlePlanSelect(plan);
  };

  // FAQ toggle
  const handleFaqToggle = idx => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  return (
    <div className="plan-selection-page">
      <div className="plan-selection-container">
        {/* Header */}
        <div className="plan-header">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
          <h1 ref={titleRef} className="plan-title">Choose Your Perfect Plan</h1>
          <p ref={subtitleRef} className="plan-subtitle">
            Select the plan that best fits your automotive business needs. You can upgrade or downgrade anytime.
          </p>
        </div>

        {/* Gallery Section with Automotive SVG BG */}
        <div className="gallery-section">
          <svg className="gallery-bg-svg" viewBox="0 0 1440 320" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="auto1" x1="0" y1="0" x2="1440" y2="320" gradientUnits="userSpaceOnUse">
                <stop stopColor="#818cf8" stopOpacity="0.18" />
                <stop offset="1" stopColor="#f472b6" stopOpacity="0.13" />
              </linearGradient>
            </defs>
            <path d="M0,160 C360,80 1080,240 1440,160 L1440,320 L0,320 Z" fill="url(#auto1)" />
            <ellipse cx="1200" cy="60" rx="120" ry="30" fill="#c084fc" opacity="0.08" />
            <ellipse cx="300" cy="100" rx="180" ry="40" fill="#818cf8" opacity="0.07" />
            <rect x="900" y="200" width="200" height="20" rx="10" fill="#f472b6" opacity="0.07" />
          </svg>
          
          <div ref={plansGridRef} className="plans-grid">
            {plans.map((plan) => (
              <div 
                key={plan.id}
                className={`plan-card ${plan.popular ? 'popular' : ''} ${selectedPlan === plan.id ? 'selected' : ''}`}
                onClick={() => handlePlanSelect(plan)}
                style={{ borderTop: `4px solid ${plan.color}` }}
              >
                {plan.popular && (
                  <div className="popular-badge">Most Popular</div>
                )}
                
                <div className="plan-header-section">
                  <div className="plan-icon" style={{ color: plan.color, fontSize: 32, marginBottom: 4 }}>
                    {plan.icon}
                  </div>
                  <div className="plan-title-row">
                    <h3 className="plan-name">{plan.name}</h3>
                    {plan.id === 'starter' && (
                      <span className="free-badge-inline">Free</span>
                    )}
                  </div>
                  <div className="plan-price-row">
                    <span className="plan-price-main" style={{ color: plan.color }}>
                      {plan.price === 0 ? 'Free' : `$${plan.price}`}
                    </span>
                    <span className="plan-price-period">{plan.period}</span>
                  </div>
                  <p className="plan-description">{plan.description}</p>
                </div>
                
                <div className="plan-features">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="feature-item">
                      <span className="feature-icon" style={{ color: '#10b981' }}>✓</span>
                      <span className="feature-text">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="plan-divider"></div>
                
                <button 
                  className={`plan-select-btn ${plan.popular ? 'popular' : ''} ${isLoading ? 'loading' : ''}`}
                  style={{ '--plan-color': plan.color }}
                  onClick={(e) => handleButtonClick(e, plan)}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <span className="loading-spinner"></span>
                  ) : (
                    plan.id === 'starter' ? 'Get Started Free' : `Choose ${plan.name}`
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ Section - Accordion */}
        <div className="faq-section">
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            {FAQS.map((faq, idx) => (
              <div key={idx} className={`faq-item${openFaq === idx ? ' open' : ''}`}> 
                <button 
                  className="faq-question" 
                  onClick={() => handleFaqToggle(idx)} 
                  aria-expanded={openFaq === idx}
                  aria-controls={`faq-answer-${idx}`}
                >
                  <span>{faq.question}</span>
                  <span className="faq-arrow">{openFaq === idx ? '▲' : '▼'}</span>
                </button>
                <div 
                  id={`faq-answer-${idx}`}
                  className="faq-answer" 
                  style={{ 
                    maxHeight: openFaq === idx ? '200px' : '0', 
                    opacity: openFaq === idx ? 1 : 0, 
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
                  }}
                >
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanSelection; 