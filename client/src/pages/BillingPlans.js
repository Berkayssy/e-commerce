import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import gsap from 'gsap';
import './BillingPlans.css';

const BillingPlans = () => {
  const { role, token } = useAuth();
  const [currentPlan, setCurrentPlan] = useState(null);
  const [billingCycle, setBillingCycle] = useState('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [sellerPlan, setSellerPlan] = useState(null);
  const [sellerPlanLoading, setSellerPlanLoading] = useState(true);
  const location = useLocation();

  // Check if plan is expired from URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setIsExpired(true);
    }
  }, [location]);

  // Seller için mevcut planı getir
  useEffect(() => {
    const fetchSellerPlan = async () => {
      if (role === 'seller' && token) {
        try {
          setSellerPlanLoading(true);
          // Plan durumunu getir (plan bilgileri, kalan gün sayısı, vs.)
          const response = await fetch(`${process.env.REACT_APP_API_URL}/sellers/plan-status`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await response.json();
          
          if (data.plan) {
            // Plan bilgilerini ayarla
            setSellerPlan({
              ...data.plan,
              daysRemaining: data.daysRemaining,
              isExpired: data.isExpired,
              planEndDate: data.planEndDate,
              status: data.status
            });
            
            // Plan adını küçük harfe çevir ve current plan olarak ayarla
            const planName = data.plan.name?.toLowerCase() || 'pro';
            setCurrentPlan(planName);
          } else {
            // Eğer plan yoksa, default olarak pro planını current yap
            setCurrentPlan('pro');
          }
        } catch (error) {
          // Hata durumunda default olarak pro planını current yap
          setCurrentPlan('pro');
        } finally {
          setSellerPlanLoading(false);
        }
      } else {
        setSellerPlanLoading(false);
      }
    };

    fetchSellerPlan();
  }, [role, token]);

  // User için kayıtlı ödeme yöntemleri
  const userPaymentMethods = [
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      icon: '₿',
      type: 'Cryptocurrency',
      balance: '$2,450.00',
      lastUsed: '2024-02-15',
      status: 'active'
    },
    {
      id: 'debit-card',
      name: 'Debit Card',
      icon: '💳',
      type: 'Visa ****4589',
      balance: '$1,200.00',
      lastUsed: '2024-02-20',
      status: 'active'
    },
    {
      id: 'paypal',
      name: 'PayPal',
      icon: '📧',
      type: 'Digital Wallet',
      balance: '$850.00',
      lastUsed: '2024-02-18',
      status: 'active'
    },
    {
      id: 'bank-transfer',
      name: 'Bank Transfer',
      icon: '🏦',
      type: 'Direct Transfer',
      balance: '$5,000.00',
      lastUsed: '2024-02-10',
      status: 'active'
    }
  ];

  // Seller için planlar (backend'den gelen veriler)
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(true);

  // Backend'den planları çek
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setPlansLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/plans`);
        const plansData = await response.json();
        
        // Planları düzenle ve popular flag'lerini ekle (Starter'ı hariç tut)
        const formattedPlans = plansData
          .filter(plan => plan.name.toLowerCase() !== 'starter') // Starter'ı kaldır
          .map(plan => ({
            id: plan._id,
            name: plan.name,
            price: billingCycle === 'monthly' ? plan.price : plan.price * 10, // Yıllık %20 indirim
            durationDays: plan.durationDays,
            features: plan.features || [],
            popular: plan.name.toLowerCase() === 'enterprise' // Enterprise'ı popular yap
          }));
        
        setPlans(formattedPlans);
      } catch (error) {
        // Fallback planlar
        setPlans([
          {
            id: 'pro',
            name: 'Pro',
            price: billingCycle === 'monthly' ? 149 : 1490,
            durationDays: 30,
            features: [
              'Maximize your business potential',
              'Unlimited listings',
              'Advanced analytics',
              'Priority support',
              'Custom branding',
              'API access',
              'Advanced reporting',
              'Multi-location support',
              'White-label options',
              'Dedicated account manager',
              'Custom integrations',
              'Advanced security features'
            ],
            popular: false
          },
          {
            id: 'enterprise',
            name: 'Enterprise',
            price: billingCycle === 'monthly' ? 299 : 2990,
            durationDays: 30,
            features: [
              'For large chains or high-volume dealerships',
              'Exclusive integrations',
              'Custom development',
              'Dedicated support team',
              'Advanced security',
              'Custom reporting',
              'Multi-brand support',
              'Advanced analytics',
              'Custom workflows',
              'Priority updates',
              'Exclusive features',
              'Custom training',
              'Advanced integrations',
              'Dedicated infrastructure'
            ],
            popular: true
          },
          {
            id: 'ultimate',
            name: 'Ultimate',
            price: billingCycle === 'monthly' ? 999 : 9990,
            durationDays: 30,
            features: [
              'The all-inclusive plan for the most demanding dealerships',
              'Everything in Enterprise',
              'Custom development',
              'Dedicated infrastructure',
              '24/7 priority support',
              'Custom integrations',
              'Advanced security',
              'Exclusive features',
              'Custom training',
              'Dedicated account manager',
              'Custom reporting',
              'Multi-brand support',
              'Advanced analytics',
              'Custom workflows',
              'Priority updates'
            ],
            popular: false
          }
        ]);
      } finally {
        setPlansLoading(false);
      }
    };

    fetchPlans();
  }, [billingCycle]);

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

    try {
      // Gerçek API çağrısı
      const response = await fetch(`${process.env.REACT_APP_API_URL}/sellers/change-plan`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          newPlanId: planId
        })
      });

      if (response.ok) {
        setCurrentPlan(planId);
        
        // Plan bilgilerini yeniden çek
        const planResponse = await fetch(`${process.env.REACT_APP_API_URL}/sellers/plan-status`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (planResponse.ok) {
          const planData = await planResponse.json();
          setSellerPlan({
            ...planData.plan,
            daysRemaining: planData.daysRemaining,
            isExpired: planData.isExpired,
            planEndDate: planData.planEndDate,
            status: planData.status
          });
        }

        // Success animation
        gsap.to(selectedCard, { 
          backgroundColor: 'rgba(34, 197, 94, 0.1)', 
          duration: 0.3,
          yoyo: true,
          repeat: 1
        });
      } else {
        throw new Error('Plan change failed');
      }
          } catch (error) {
        // Error animation
        gsap.to(selectedCard, { 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          duration: 0.3,
          yoyo: true,
          repeat: 1
        });
    } finally {
      setIsLoading(false);
    }
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

  // User için ödeme yöntemleri sayfası
  if (role === 'user') {
    return (
      <div className="page-container" ref={pageRef}>
        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Payment Methods</h1>
            <p className="page-subtitle">Manage your saved payment methods and billing information</p>
          </div>

          <div className="billing-container" ref={plansRef}>
            {/* Add New Payment Method */}
            <div className="add-payment-section" style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #be185d 100%)',
              borderRadius: '12px',
              padding: '24px',
              marginBottom: '24px',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              boxShadow: '0 4px 16px rgba(99, 102, 241, 0.15)'
            }}>
              <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
                <span style={{fontSize: '24px'}}>➕</span>
                <div>
                  <h3 style={{margin: '0 0 8px 0', color: '#fff', fontSize: '18px', fontWeight: 600}}>
                    Add New Payment Method
                  </h3>
                  <p style={{margin: 0, color: 'rgba(255, 255, 255, 0.9)', fontSize: '14px'}}>
                    Add a new credit card, bank account, or digital wallet
                  </p>
                </div>
                <button style={{
                  marginLeft: 'auto',
                  background: 'rgba(255, 255, 255, 0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  color: '#fff',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 500,
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                >
                  Add New
                </button>
              </div>
            </div>

            {/* Payment Methods Grid */}
            <div className="payment-methods-grid" style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '20px',
              marginBottom: '24px'
            }}>
              {userPaymentMethods.map((method, index) => (
                <div key={method.id} className="payment-method-card" style={{
                  background: 'rgba(16, 19, 26, 0.98)',
                  borderRadius: '12px',
                  padding: '20px',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                >
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px'}}>
                    <span style={{fontSize: '24px'}}>{method.icon}</span>
                    <div>
                      <h4 style={{margin: '0 0 4px 0', color: '#fff', fontSize: '16px', fontWeight: 600}}>
                        {method.name}
                      </h4>
                      <p style={{margin: 0, color: '#94a3b8', fontSize: '14px'}}>
                        {method.type}
                      </p>
                    </div>
                    <div style={{marginLeft: 'auto'}}>
                      <span style={{
                        background: method.status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                        color: method.status === 'active' ? '#22c55e' : '#ef4444',
                        padding: '4px 8px',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 500
                      }}>
                        {method.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <p style={{margin: '0 0 4px 0', color: '#94a3b8', fontSize: '12px'}}>Balance</p>
                      <p style={{margin: 0, color: '#22c55e', fontSize: '16px', fontWeight: 600}}>
                        {method.balance}
                      </p>
                    </div>
                    <div style={{textAlign: 'right'}}>
                      <p style={{margin: '0 0 4px 0', color: '#94a3b8', fontSize: '12px'}}>Last Used</p>
                      <p style={{margin: 0, color: '#fff', fontSize: '14px'}}>
                        {new Date(method.lastUsed).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div style={{display: 'flex', gap: '8px', marginTop: '16px'}}>
                    <button style={{
                      flex: 1,
                      background: 'rgba(99, 102, 241, 0.1)',
                      border: '1px solid rgba(99, 102, 241, 0.2)',
                      color: '#6366f1',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.2)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(99, 102, 241, 0.1)'}
                    >
                      Edit
                    </button>
                    <button style={{
                      flex: 1,
                      background: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid rgba(239, 68, 68, 0.2)',
                      color: '#ef4444',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500,
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.2)'}
                    onMouseLeave={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.1)'}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Billing Information */}
            <div className="billing-info-section" style={{
              background: 'rgba(16, 19, 26, 0.98)',
              borderRadius: '12px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              <h3 style={{margin: '0 0 20px 0', color: '#fff', fontSize: '18px', fontWeight: 600}}>
                Billing Information
              </h3>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px'}}>
                <div>
                  <p style={{margin: '0 0 4px 0', color: '#94a3b8', fontSize: '12px'}}>Default Payment Method</p>
                  <p style={{margin: 0, color: '#fff', fontSize: '14px', fontWeight: 500}}>Bitcoin Wallet</p>
                </div>
                <div>
                  <p style={{margin: '0 0 4px 0', color: '#94a3b8', fontSize: '12px'}}>Total Balance</p>
                  <p style={{margin: 0, color: '#22c55e', fontSize: '16px', fontWeight: 600}}>$9,500.00</p>
                </div>
                <div>
                  <p style={{margin: '0 0 4px 0', color: '#94a3b8', fontSize: '12px'}}>Last Transaction</p>
                  <p style={{margin: 0, color: '#fff', fontSize: '14px'}}>Feb 20, 2024</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Seller için mevcut planlar sayfası
  return (
    <div className="page-container" ref={pageRef}>
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">
          Billing & Plans
        </h1>
          <p className="page-subtitle">Choose the perfect plan for your business needs</p>
        </div>

        <div className="billing-container" ref={plansRef}>
          {/* Current Plan Info for Seller */}
          {role === 'seller' && sellerPlan && !sellerPlanLoading && (
            <div className="current-plan-info" style={{
              background: sellerPlan.isExpired ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              padding: '20px 24px',
              borderRadius: '12px',
              marginBottom: '24px',
              border: sellerPlan.isExpired ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)',
              boxShadow: sellerPlan.isExpired ? '0 4px 16px rgba(239, 68, 68, 0.2)' : '0 4px 16px rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <span style={{fontSize: '24px'}}>{sellerPlan.isExpired ? '⚠️' : '💎'}</span>
              <div style={{flex: 1}}>
                <h3 style={{margin: '0 0 8px 0', fontSize: '18px', fontWeight: 600}}>
                  Current Plan: {sellerPlan.name || 'Pro'} (Current)
                </h3>
                <p style={{margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9}}>
                  Status: <span style={{fontWeight: 600}}>{sellerPlan.status || 'Active'}</span>
                </p>
                <p style={{margin: '0 0 8px 0', fontSize: '14px', opacity: 0.9}}>
                  Days Remaining: <span style={{fontWeight: 600}}>{sellerPlan.daysRemaining || 0} days</span>
                </p>
                {sellerPlan.planEndDate && (
                  <p style={{margin: 0, fontSize: '14px', opacity: 0.9}}>
                    Expires: {new Date(sellerPlan.planEndDate).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600
              }}>
                ${sellerPlan.price || 29}/month
              </div>
            </div>
          )}

          {/* Expired Plan Warning */}
          {isExpired && (
            <div className="expired-plan-warning" style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: 'white',
              padding: '16px 20px',
              borderRadius: '12px',
              marginBottom: '24px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              boxShadow: '0 4px 16px rgba(239, 68, 68, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <span style={{fontSize: '20px'}}>⚠️</span>
              <div>
                <h3 style={{margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600}}>Plan Expired</h3>
                <p style={{margin: 0, fontSize: '14px', opacity: 0.9}}>
                  Your current plan has expired. Please renew your subscription to continue using your store.
                </p>
              </div>
            </div>
          )}

          <div className="billing-header">
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
              {plansLoading ? (
                <div style={{
                  gridColumn: '1 / -1',
                  textAlign: 'center',
                  padding: '40px',
                  color: '#94a3b8'
                }}>
                  Loading plans...
                </div>
              ) : (
                plans.map((plan, index) => (
                <div 
                  key={plan.id}
                  className={`plan-card card ${plan.popular ? 'popular' : ''} ${currentPlan === plan.id ? 'current' : ''}`}
                  ref={el => planCardsRef.current[index] = el}
                  data-plan={plan.id}
                  style={{
                    border: currentPlan === plan.id ? '3px solid #10b981' : undefined,
                    boxShadow: currentPlan === plan.id ? '0 0 0 6px rgba(16, 185, 129, 0.15), 0 8px 32px rgba(16, 185, 129, 0.2)' : undefined,
                    transform: currentPlan === plan.id ? 'scale(1.02)' : undefined,
                    transition: 'all 0.3s ease'
                  }}
                >
                  {plan.popular && <div className="popular-badge">Most Popular</div>}
                  {currentPlan === plan.id && (
                    <div className="current-plan-badge" style={{
                      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                      color: 'white',
                      padding: '6px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 700,
                      position: 'absolute',
                      top: '16px',
                      right: '16px',
                      zIndex: 2,
                      boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                      border: '1px solid rgba(255, 255, 255, 0.2)'
                    }}>
                      ✓ Current
                    </div>
                  )}
                  
                  <div className="plan-header">
                    <h3 className="plan-name">{plan.name}</h3>
                                    <div className="plan-price">
                  <span className="currency">$</span>
                  <span className="amount">{plan.price}</span>
                  <span className="period">/{billingCycle === 'monthly' ? 'mo' : 'year'}</span>
                  <div className="plan-duration" style={{
                    fontSize: '12px',
                    color: '#94a3b8',
                    marginTop: '4px',
                    fontWeight: 500
                  }}>
                    {plan.durationDays} days duration
                  </div>
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
                    className={`plan-button btn ${currentPlan === plan.id ? 'current-plan disabled' : 'btn-primary'}`}
                    onClick={currentPlan === plan.id ? undefined : () => handlePlanChange(plan.id)}
                    disabled={isLoading || currentPlan === plan.id}
                    style={{
                      opacity: currentPlan === plan.id ? 0.5 : 1,
                      cursor: currentPlan === plan.id ? 'not-allowed' : 'pointer',
                      background: currentPlan === plan.id ? 'rgba(16, 185, 129, 0.05)' : undefined,
                      border: currentPlan === plan.id ? '1px solid rgba(16, 185, 129, 0.2)' : undefined,
                      color: currentPlan === plan.id ? '#10b981' : undefined,
                      fontWeight: currentPlan === plan.id ? '600' : undefined,
                      pointerEvents: currentPlan === plan.id ? 'none' : 'auto'
                    }}
                  >
                    {currentPlan === plan.id ? '✓ Current Plan' : 'Choose Plan'}
                  </button>
                </div>
              ))
              )}
            </div>

            <div className="billing-info card">
              <h3 className="billing-title">Billing Information</h3>
              <div className="billing-details">
                <div className="billing-item">
                  <span className="label">Current Plan:</span>
                  <span className="value">{plans.find(p => p.id === currentPlan)?.name || sellerPlan?.name}</span>
                </div>
                <div className="billing-item">
                  <span className="label">Plan Duration:</span>
                  <span className="value">{plans.find(p => p.id === currentPlan)?.durationDays || sellerPlan?.durationDays} days</span>
                </div>
                <div className="billing-item">
                  <span className="label">Billing Cycle:</span>
                  <span className="value">{billingCycle === 'monthly' ? 'Monthly' : 'Yearly'}</span>
                </div>
                <div className="billing-item">
                  <span className="label">Plan Price:</span>
                  <span className="value">${plans.find(p => p.id === currentPlan)?.price || sellerPlan?.price || 0}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillingPlans; 