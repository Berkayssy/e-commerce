import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './BillingPlans.css';

const BillingPlans = () => {
  const [currentPlan, setCurrentPlan] = useState('pro');
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: billingCycle === 'monthly' ? 9 : 90,
      features: ['Up to 100 products', 'Basic analytics', 'Email support', '1GB storage'],
      popular: false
    },
    {
      id: 'pro',
      name: 'Pro',
      price: billingCycle === 'monthly' ? 29 : 290,
      features: ['Unlimited products', 'Advanced analytics', 'Priority support', '10GB storage', 'Custom domain'],
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: billingCycle === 'monthly' ? 99 : 990,
      features: ['Everything in Pro', 'API access', 'Dedicated support', 'Unlimited storage', 'White-label solution'],
      popular: false
    }
  ];

  // GSAP refs
  const pageRef = useRef(null);
  const plansRef = useRef(null);
  const billingToggleRef = useRef(null);
  const planCardsRef = useRef([]);

  useEffect(() => {
    // Page entrance animation
    gsap.set(pageRef.current, { opacity: 0, y: 30 });
    gsap.to(pageRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });

    // Plans animation
    gsap.fromTo(plansRef.current,
      { opacity: 0, y: 50, scale: 0.95 },
      { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power2.out', delay: 0.2 }
    );

    // Stagger animation for plan cards
    gsap.fromTo(planCardsRef.current, 
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.15, ease: 'back.out(1.7)', delay: 0.4 }
    );
  }, []);

  const handlePlanChange = async (planId) => {
    setIsLoading(true);
    
    // Animate the selected plan
    const selectedCard = planCardsRef.current.find(card => card.dataset.plan === planId);
    if (selectedCard) {
      gsap.to(selectedCard, { 
        scale: 1.05, 
        duration: 0.2,
        yoyo: true,
        repeat: 1
      });
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setCurrentPlan(planId);
    setIsLoading(false);

    // Success animation
    gsap.to(selectedCard, { 
      backgroundColor: 'rgba(34, 197, 94, 0.1)', 
      duration: 0.3,
      yoyo: true,
      repeat: 1
    });
  };

  const handleBillingToggle = () => {
    const newCycle = billingCycle === 'monthly' ? 'yearly' : 'monthly';
    setBillingCycle(newCycle);
    
    // Animate price changes
    gsap.to(planCardsRef.current, { 
      opacity: 0.5, 
      duration: 0.2,
      yoyo: true,
      repeat: 1
    });
  };

  return (
    <div className="page-container" ref={pageRef}>
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Billing & Plans</h1>
          <p className="page-subtitle">Choose the perfect plan for your business needs</p>
        </div>

        <div className="billing-container" ref={plansRef}>
          <div className="billing-toggle" ref={billingToggleRef}>
            <span className={billingCycle === 'monthly' ? 'active' : ''}>Monthly</span>
            <button 
              className="toggle-switch"
              onClick={handleBillingToggle}
            >
              <div className={`toggle-slider ${billingCycle === 'yearly' ? 'yearly' : ''}`}></div>
            </button>
            <span className={billingCycle === 'yearly' ? 'active' : ''}>
              Yearly
              <span className="save-badge">Save 20%</span>
            </span>
          </div>

          <div className="plans-grid grid grid-3">
            {plans.map((plan, index) => (
              <div 
                key={plan.id}
                className={`plan-card card ${plan.popular ? 'popular' : ''} ${currentPlan === plan.id ? 'current' : ''}`}
                ref={el => planCardsRef.current[index] = el}
                data-plan={plan.id}
              >
                {plan.popular && <div className="popular-badge">Most Popular</div>}
                
                <div className="plan-header">
                  <h3 className="plan-name">{plan.name}</h3>
                  <div className="plan-price">
                    <span className="currency">$</span>
                    <span className="amount">{plan.price}</span>
                    <span className="period">/{billingCycle === 'monthly' ? 'mo' : 'year'}</span>
                  </div>
                </div>

                <div className="plan-features">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="feature-item">
                      <span className="feature-icon">✓</span>
                      <span className="feature-text">{feature}</span>
                    </div>
                  ))}
                </div>

                <button 
                  className={`plan-button btn ${currentPlan === plan.id ? 'current-plan' : 'btn-primary'}`}
                  onClick={() => handlePlanChange(plan.id)}
                  disabled={isLoading}
                >
                  {currentPlan === plan.id ? 'Current Plan' : 'Choose Plan'}
                </button>
              </div>
            ))}
          </div>

          <div className="billing-info card">
            <h3 className="billing-title">Billing Information</h3>
            <div className="billing-details">
              <div className="billing-item">
                <span className="label">Current Plan:</span>
                <span className="value">{plans.find(p => p.id === currentPlan)?.name}</span>
              </div>
              <div className="billing-item">
                <span className="label">Billing Cycle:</span>
                <span className="value">{billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}</span>
              </div>
              <div className="billing-item">
                <span className="label">Next Billing:</span>
                <span className="value">March 15, 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPlans; 