import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import './PlanModal.css';

const PlanModal = ({ plan, onClose, onConfirm, isLoading }) => {
  const modalRef = useRef(null);
  const overlayRef = useRef(null);
  const contentRef = useRef(null);

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
    onConfirm(plan);
  };

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

  const getPlanColor = () => {
    return plan.color || '#818cf8';
  };

  return (
    <div className="plan-modal-overlay" ref={overlayRef} onClick={handleOverlayClick}>
      <div className="plan-modal" ref={modalRef}>
        <button className="modal-close-btn" onClick={onClose}>
          ×
        </button>
        
        <div className="modal-content" ref={contentRef}>
          {/* Plan Header */}
          <div className="modal-header">
            <div className="plan-icon" style={{ color: getPlanColor() }}>
              {getPlanIcon()}
            </div>
            <h2 className="modal-title">Confirm Your {plan.name} Plan</h2>
            <p className="modal-subtitle">
              You're about to start your journey with the {plan.name} plan
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
              <span className="summary-value">{plan.price} {plan.period}</span>
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
              {plan.features.slice(0, 6).map((feature, index) => (
                <div key={index} className="feature-item">
                  <span className="feature-icon">✓</span>
                  <span className="feature-text">{feature}</span>
                </div>
              ))}
              {plan.features.length > 6 && (
                <div className="more-features">
                  +{plan.features.length - 6} more features
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
                plan.id === 'starter' ? 'Get Started Free' : `Start ${plan.name} Plan`
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
  );
};

export default PlanModal; 