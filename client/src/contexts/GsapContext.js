import React, { createContext, useContext, useRef, useState, useCallback, useEffect } from 'react';
import gsap from 'gsap';

const GsapContext = createContext();

export const GsapProvider = ({ children }) => {
  const [showTransition, setShowTransition] = useState(false);
  const [onCompleteCallback, setOnCompleteCallback] = useState(null);
  const overlayRef = useRef(null);
  const spinnerRef = useRef(null);

  // ProductDetail için merkezi ref yönetimi
  const productDetailRefs = {
    pageRef: useRef(null),
    imageRef: useRef(null),
    contentRef: useRef(null),
    actionsRef: useRef(null),
  };

  // AddProduct için merkezi ref yönetimi
  const addProductRefs = {
    pageRef: useRef(null),
    formRef: useRef(null),
    imagePreviewRef: useRef(null),
  };

  // Login için merkezi ref yönetimi
  const loginRefs = {
    loginContainerRef: useRef(null),
    titleRef: useRef(null),
    subtitleRef: useRef(null),
    formRef: useRef(null),
    buttonRef: useRef(null),
    socialButtonsRef: useRef(null),
    signupLinkRef: useRef(null),
  };

  // GTA tarzı geçiş animasyonu fonksiyonu
  const gtaTransition = useCallback((_, onComplete) => {
    setOnCompleteCallback(() => onComplete);
    setShowTransition(true);
  }, []);

  // Overlay fade-in/fade-out ve spinner döndürme
  useEffect(() => {
    let spinnerTween;
    if (showTransition && overlayRef.current && spinnerRef.current) {
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.18,
          ease: 'power2.out',
          onComplete: () => {
            spinnerTween = gsap.to(spinnerRef.current, {
              rotation: 360,
              duration: 0.8,
              repeat: -1,
              ease: 'linear',
              transformOrigin: '50% 50%'
            });
            // Çıkış animasyonu
            setTimeout(() => {
              gsap.to(overlayRef.current, {
                opacity: 0,
                duration: 0.18,
                ease: 'power2.in',
                onComplete: () => {
                  setShowTransition(false);
                  if (onCompleteCallback) onCompleteCallback();
                },
              });
            }, 600); // Toplamda ~0.8s spinner göster
          },
        }
      );
    }
    return () => {
      if (spinnerTween) spinnerTween.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showTransition]);

  const GtaTransitionOverlay = () =>
    showTransition ? (
      <div
        className="gta-transition-overlay"
        ref={overlayRef}
        style={{ zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.96)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <svg
          ref={spinnerRef}
          width="70" height="70" viewBox="0 0 70 70"
          style={{ display: 'block' }}
        >
          <defs>
            <linearGradient id="spinnerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
          <circle
            cx="35" cy="35" r="28"
            stroke="url(#spinnerGradient)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
            strokeDasharray="60 120"
            strokeDashoffset="0"
            opacity="0.95"
          />
        </svg>
      </div>
    ) : null;

  return (
    <GsapContext.Provider value={{ gtaTransition, GtaTransitionOverlay, productDetailRefs, addProductRefs, loginRefs }}>
      {children}
    </GsapContext.Provider>
  );
};

export const useGsap = () => useContext(GsapContext); 