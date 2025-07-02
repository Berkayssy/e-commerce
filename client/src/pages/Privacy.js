import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import './Privacy.css';

const Privacy = () => {
  const titleRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    // Fade in animation
    gsap.fromTo([titleRef.current, contentRef.current],
      { opacity: 0, y: 30 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.6, 
        stagger: 0.2,
        ease: "power2.out" 
      }
    );
  }, []);

  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <div className="privacy-header">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
          <h1 ref={titleRef} className="privacy-title">Privacy Policy</h1>
          <p className="privacy-subtitle">Last updated: December 2024</p>
        </div>

        <div ref={contentRef} className="privacy-content">
          <section className="policy-section">
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us, such as when you create an account, make a purchase, or contact us for support. This may include:</p>
            <ul>
              <li>Name, email address, and contact information</li>
              <li>Payment and billing information</li>
              <li>Account preferences and settings</li>
              <li>Communication history with our support team</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and support messages</li>
              <li>Respond to your comments and questions</li>
              <li>Protect against fraudulent or illegal activity</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>3. Information Sharing</h2>
            <p>We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:</p>
            <ul>
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and safety</li>
              <li>In connection with a business transfer or merger</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>4. Data Security</h2>
            <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:</p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and updates</li>
              <li>Access controls and authentication</li>
              <li>Employee training on data protection</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access and update your personal information</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of marketing communications</li>
              <li>Request data portability</li>
              <li>Lodge a complaint with supervisory authorities</li>
            </ul>
          </section>

          <section className="policy-section">
            <h2>6. Cookies and Tracking</h2>
            <p>We use cookies and similar technologies to enhance your experience, analyze usage patterns, and personalize content. You can control cookie settings through your browser preferences.</p>
          </section>

          <section className="policy-section">
            <h2>7. Third-Party Services</h2>
            <p>Our service may contain links to third-party websites or integrate with third-party services. We are not responsible for the privacy practices of these external services.</p>
          </section>

          <section className="policy-section">
            <h2>8. Children's Privacy</h2>
            <p>Our service is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.</p>
          </section>

          <section className="policy-section">
            <h2>9. International Transfers</h2>
            <p>Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data.</p>
          </section>

          <section className="policy-section">
            <h2>10. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the "Last updated" date.</p>
          </section>

          <section className="policy-section">
            <h2>11. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <div className="contact-info">
              <p><strong>Email:</strong> privacy@commercesaas.com</p>
              <p><strong>Address:</strong> 123 Commerce Street, Tech City, TC 12345</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy; 