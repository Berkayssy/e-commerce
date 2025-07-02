import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import './Terms.css';

const Terms = () => {
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
    <div className="terms-page">
      <div className="terms-container">
        <div className="terms-header">
          <Link to="/" className="back-link">
            ← Back to Home
          </Link>
          <h1 ref={titleRef} className="terms-title">Terms of Service</h1>
          <p className="terms-subtitle">Last updated: December 2024</p>
        </div>

        <div ref={contentRef} className="terms-content">
          <section className="terms-section">
            <h2>1. Acceptance of Terms</h2>
            <p>By accessing and using CommerceSaaS, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.</p>
          </section>

          <section className="terms-section">
            <h2>2. Description of Service</h2>
            <p>CommerceSaaS provides an e-commerce platform that allows users to create online stores, manage products, process orders, and conduct business transactions. Our service includes:</p>
            <ul>
              <li>Store creation and management tools</li>
              <li>Product catalog management</li>
              <li>Order processing and tracking</li>
              <li>Payment processing integration</li>
              <li>Analytics and reporting features</li>
              <li>Customer support services</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>3. User Accounts</h2>
            <p>To access certain features of our service, you must create an account. You are responsible for:</p>
            <ul>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and complete information</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>4. Acceptable Use</h2>
            <p>You agree not to use our service to:</p>
            <ul>
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon intellectual property rights</li>
              <li>Transmit harmful, offensive, or inappropriate content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper functioning of the service</li>
              <li>Engage in fraudulent or deceptive practices</li>
            </ul>
          </section>

          <section className="terms-section">
            <h2>5. Payment Terms</h2>
            <p>Our service offers various pricing plans. By subscribing to a paid plan, you agree to:</p>
            <ul>
              <li>Pay all fees in advance on a recurring basis</li>
              <li>Provide accurate billing information</li>
              <li>Authorize automatic billing for renewal periods</li>
              <li>Pay any applicable taxes</li>
            </ul>
            <p>We reserve the right to modify pricing with 30 days notice. Refunds are provided according to our refund policy.</p>
          </section>

          <section className="terms-section">
            <h2>6. Intellectual Property</h2>
            <p>Our service and its original content, features, and functionality are owned by CommerceSaaS and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.</p>
            <p>You retain ownership of content you create using our service, but grant us a license to use, store, and display such content as necessary to provide our services.</p>
          </section>

          <section className="terms-section">
            <h2>7. Privacy and Data Protection</h2>
            <p>Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference.</p>
            <p>We implement appropriate security measures to protect your data, but cannot guarantee absolute security. You are responsible for maintaining the security of your account.</p>
          </section>

          <section className="terms-section">
            <h2>8. Service Availability</h2>
            <p>We strive to maintain high service availability but do not guarantee uninterrupted access. We may temporarily suspend service for maintenance, updates, or other operational reasons.</p>
            <p>We are not liable for any damages resulting from service interruptions, except as required by applicable law.</p>
          </section>

          <section className="terms-section">
            <h2>9. Limitation of Liability</h2>
            <p>To the maximum extent permitted by law, CommerceSaaS shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities.</p>
            <p>Our total liability shall not exceed the amount paid by you for our services in the 12 months preceding the claim.</p>
          </section>

          <section className="terms-section">
            <h2>10. Indemnification</h2>
            <p>You agree to indemnify and hold harmless CommerceSaaS from any claims, damages, losses, or expenses arising from your use of our service or violation of these Terms.</p>
          </section>

          <section className="terms-section">
            <h2>11. Termination</h2>
            <p>You may cancel your account at any time through your account settings. We may terminate or suspend your account immediately if you violate these Terms.</p>
            <p>Upon termination, your right to use the service ceases immediately, and we may delete your account and data in accordance with our data retention policy.</p>
          </section>

          <section className="terms-section">
            <h2>12. Governing Law</h2>
            <p>These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which CommerceSaaS operates, without regard to conflict of law principles.</p>
          </section>

          <section className="terms-section">
            <h2>13. Changes to Terms</h2>
            <p>We reserve the right to modify these Terms at any time. We will notify users of material changes via email or through our service. Continued use after changes constitutes acceptance of the new Terms.</p>
          </section>

          <section className="terms-section">
            <h2>14. Contact Information</h2>
            <p>If you have any questions about these Terms of Service, please contact us at:</p>
            <div className="contact-info">
              <p><strong>Email:</strong> legal@commercesaas.com</p>
              <p><strong>Address:</strong> 123 Commerce Street, Tech City, TC 12345</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms; 