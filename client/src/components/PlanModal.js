import React, { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import './PlanModal.css';
import PaymentModal from './PaymentModal';

const PlanModal = ({ plan, onClose, onConfirm, isLoading }) => {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);
  const [showPayment, setShowPayment] = useState(false);

  useEffect(() => {
    // Modal açılış animasyonu
    gsap.set([modalRef.current, overlayRef.current], { opacity: 0 });
    
    gsap.to(overlayRef.current, {
      opacity: 1,
      duration: 0.3,
      ease: "power2.out"
    });

    gsap.fromTo(modalRef.current,
      { 
        opacity: 0, 
        scale: 0.8, 
        y: 50 
      },
      { 
        opacity: 1, 
        scale: 1, 
        y: 0, 
        duration: 0.4, 
        delay: 0.1,
        ease: "back.out(1.7)" 
      }
    );

    // Content animasyonu
    gsap.fromTo(contentRef.current?.children,
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.5, 
        stagger: 0.1,
        delay: 0.3,
        ease: "power2.out" 
      }
    );
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleConfirm = () => {
    setShowPayment(true);
  };

  const getPlanIcon = () => {
    switch (plan.id) {
      case 'starter':
        return '🚀';
      case 'pro':
        return '📈';
      case 'enterprise':
        return '🏢';
      case 'ultimate':
        return '👑';
      default:
        return '💼';
    }
  };

  const getPlanColor = () => {
    return plan.color || '#818cf8';
  };

  return (
    <>
      <div className="plan-modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
        <div className="plan-modal" ref={modalRef}>
          <button className="modal-close-btn" onClick={onClose}>
            ×
          </button>
          <div className="modal-content" ref={contentRef}>
            {/* Plan Header */}
            <div className="modal-header">
              <div className="plan-icon" style={{ color: getPlanColor(), fontSize: 48, marginBottom: 8 }}>
                {getPlanIcon()}
              </div>
              <h2 className="modal-title">{plan.name} Plan Details</h2>
              <p className="modal-subtitle">
                {plan.description}
              </p>
            </div>
            {/* Plan Summary */}
            <div className="plan-summary">
              <div className="summary-item">
                <span className="summary-label">Plan:</span>
                <span className="summary-value">{plan.name}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Price:</span>
                <span className="summary-value">{plan.price === 0 ? 'Free' : `$${plan.price}`} {plan.period}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Features:</span>
                <span className="summary-value">{plan.features.length} features included</span>
              </div>
            </div>
            {/* Key Features */}
            <div className="key-features">
              <h3>What's included:</h3>
              <div className="features-list">
                {plan.features.slice(0, 8).map((feature, index) => (
                  <div key={index} className="feature-item">
                    <span className="feature-icon">✓</span>
                    <span className="feature-text">{feature}</span>
                  </div>
                ))}
                {plan.features.length > 8 && (
                  <div className="more-features">
                    +{plan.features.length - 8} more features
                  </div>
                )}
              </div>
            </div>
            {/* Action Buttons */}
            <div className="modal-actions">
              <button 
                className="modal-btn secondary" 
                onClick={onClose}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button 
                className="modal-btn primary" 
                onClick={handleConfirm}
                disabled={isLoading}
                style={{ '--plan-color': getPlanColor() }}
              >
                {isLoading ? (
                  <div className="loading-spinner">
                    <div className="spinner"></div>
                    <span>Processing...</span>
                  </div>
                ) : (
                  plan.id === 'starter' ? 'Get Started Free' : `Continue to Payment`
                )}
              </button>
            </div>
            {/* Additional Info */}
            <div className="modal-info">
              <p>
                {plan.id === 'starter' 
                  ? 'No credit card required. Start building your store immediately.'
                  : 'You can cancel anytime. 30-day money-back guarantee.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* Payment Modal açılırsa burada gösterilecek */}
      {showPayment && (
        <PaymentModal 
          isOpen={showPayment} 
          onClose={() => setShowPayment(false)} 
          plan={plan} 
        />
      )}
    </>
  );
};

export default PlanModal; 