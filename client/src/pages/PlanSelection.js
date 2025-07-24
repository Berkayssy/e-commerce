import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import gsap from 'gsap';
import './PlanSelection.css';
import PlanModal from '../components/PlanModal';

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

// Planlara frontend'de görsel ve metinsel özellikleri ekle
const enrichPlan = (plan) => {
  // Eşleme tablosu
  const planMeta = {
    Starter: {
      icon: '🚀',
      color: '#818cf8',
      period: 'First 3 months free, then $99/mo',
      popular: false
    },
    Pro: {
      icon: '📈',
      color: '#c084fc',
      period: 'per month',
      popular: true
    },
    Enterprise: {
      icon: '🏢',
      color: '#f472b6',
      period: 'per month',
      popular: false
    },
    Ultimate: {
      icon: '👑',
      color: '#fbbf24',
      period: 'per month',
      popular: false
    }
  };
  const meta = planMeta[plan.name] || {};
  return { ...plan, ...meta };
};

const PlanSelection = () => {
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [openFaq, setOpenFaq] = useState(null);
  const [isLoading] = useState(false);
  const [modalPlan, setModalPlan] = useState(null);
  const [showAllPlans, setShowAllPlans] = useState(false);
  const location = useLocation();
  
  const titleRef = useRef(null);
  const subtitleRef = useRef(null);
  const plansRef = useRef(null);
  const plansGridRef = useRef(null);

  useEffect(() => {
    // Planları API'den çek
    const fetchPlans = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/plans`);
        const data = await res.json();
        if (Array.isArray(data)) {
          setPlans(data);
        } else if (Array.isArray(data.plans)) {
          setPlans(data.plans);
        } else {
          setPlans([]);
        }
      } catch (err) {
        setPlans([]);
      }
    };
    fetchPlans();
  }, []);

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
          
          <div ref={plansGridRef} className="plans-grid" style={{
            display: showAllPlans ? 'grid' : 'flex',
            gridTemplateColumns: showAllPlans ? 'repeat(3, 1fr)' : undefined,
            flexDirection: showAllPlans ? undefined : 'column',
            gap: '2rem',
            justifyItems: 'center',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            width: '100%',
            maxWidth: showAllPlans ? '900px' : '400px',
            margin: '0 auto'
          }}>
            {/* Main plans */}
            {Array.isArray(plans) && plans
              .filter(plan => showAllPlans ? plan.name !== 'Starter' : plan.name === 'Starter')
              .map((plan, idx, arr) => {
                let enriched = enrichPlan(plan);
                // Ortadaki kartı most popular yap
                if (showAllPlans && idx === 1 && arr.length === 3) {
                  enriched = { ...enriched, popular: true };
                } else {
                  enriched = { ...enriched, popular: false };
                }
                return (
                  <div 
                    key={enriched._id}
                    className={`plan-card ${enriched.popular ? 'popular' : ''} ${selectedPlan === enriched._id ? 'selected' : ''}`}
                    style={{ borderTop: `4px solid ${enriched.color || '#818cf8'}` }}
                  >
                  {enriched.popular && (
                    <div className="popular-badge">Most Popular</div>
                  )}
                  <div className="plan-header-section">
                    <div className="plan-icon" style={{ color: enriched.color || '#818cf8', fontSize: 32, marginBottom: 4 }}>
                      {enriched.icon || '💼'}
                    </div>
                    <div className="plan-title-row">
                      <h3 className="plan-name">{enriched.name}</h3>
                      {enriched.price === 0 && (
                        <span className="free-badge-inline">Free</span>
                      )}
                    </div>
                    <div className="plan-price-row">
                      <span className="plan-price-main" style={{ color: enriched.color || '#818cf8' }}>
                        {enriched.price === 0 ? 'Free' : `$${enriched.price}`}
                      </span>
                      <span className="plan-price-period">{enriched.period || (enriched.durationDays ? `${enriched.durationDays} days` : '')}</span>
                    </div>
                    <p className="plan-description">{enriched.description}</p>
                  </div>
                  <div className="plan-features">
                    {enriched.features && enriched.features.map((feature, index) => (
                      <div key={index} className="feature-item">
                        <span className="feature-icon" style={{ color: '#10b981' }}>✓</span>
                        <span className="feature-text">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="plan-divider"></div>
                  <button 
                    className={`plan-select-btn ${enriched.popular ? 'popular' : ''} ${isLoading ? 'loading' : ''}`}
                    style={{ '--plan-color': enriched.color || '#818cf8' }}
                    onClick={(e) => { e.stopPropagation(); setModalPlan(enriched); }}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <span className="loading-spinner"></span>
                    ) : (
                      enriched.price === 0 ? 'Get Started Free' : `Choose ${enriched.name}`
                    )}
                  </button>
                </div>
              );
            })}
          </div>
          {/* Ok ile toggle */}
          {!showAllPlans && (
            <div style={{ textAlign: 'center', marginTop: '2rem', cursor: 'pointer', fontSize: '2rem' }} onClick={() => setShowAllPlans(true)}>
              <span title="Diğer planları görüntüle">→</span>
            </div>
          )}
          {showAllPlans && (
            <div style={{ textAlign: 'center', marginTop: '2rem', cursor: 'pointer', fontSize: '2rem' }} onClick={() => setShowAllPlans(false)}>
              <span title="Starter planını göster">←</span>
            </div>
          )}
          {/* Ultimate plan, ayrı ve ortalanmış */}
          {/* ... ultimatePlan kodu kaldırıldı, çünkü artık plans API'den geliyor ... */}
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
        {/* Plan Modal */}
        {modalPlan && (
          <PlanModal 
            plan={modalPlan} 
            onClose={() => setModalPlan(null)} 
            onConfirm={() => {}} 
            isLoading={false} 
          />
        )}
      </div>
    </div>
  );
};

export default PlanSelection; 