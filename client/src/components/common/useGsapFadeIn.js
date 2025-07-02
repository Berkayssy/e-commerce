import { useEffect } from 'react';
import gsap from 'gsap';

/**
 * refs: Tek bir ref veya ref dizisi
 * options: GSAP animasyon ayarları (delay, duration, y, vs.)
 */
const useGsapFadeIn = (refs, options = {}) => {
  useEffect(() => {
    const refArray = Array.isArray(refs) ? refs : [refs];
    refArray.forEach((ref, i) => {
      if (ref && ref.current) {
        gsap.set(ref.current, { opacity: 0, y: options.y ?? 30 });
        gsap.to(ref.current, {
          opacity: 1,
          y: 0,
          duration: options.duration ?? 0.5,
          delay: (options.delay ?? 0) + (options.stagger ? i * options.stagger : 0),
          ease: options.ease ?? 'power2.out',
        });
      }
    });
    // Cleanup (opsiyonel)
    return () => {
      refArray.forEach(ref => {
        if (ref && ref.current) {
          gsap.killTweensOf(ref.current);
        }
      });
    };
  }, [refs, options]);
};

export default useGsapFadeIn; 