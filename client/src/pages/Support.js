import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import './Support.css';

const Support = () => {
  const [activeFAQ, setActiveFAQ] = useState(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const faqs = [
    {
      id: 1,
      question: "How do I add new products to my store?",
      answer: "You can add new products by navigating to the Products section and clicking the 'Add Product' button. Fill in the required information including name, description, price, and upload images."
    },
    {
      id: 2,
      question: "How can I manage my orders?",
      answer: "All your orders can be viewed and managed in the Orders section. You can track order status, update shipping information, and process refunds if needed."
    },
    {
      id: 3,
      question: "What payment methods do you support?",
      answer: "We support all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers. All payments are processed securely through our trusted payment partners."
    },
    {
      id: 4,
      question: "How do I change my subscription plan?",
      answer: "You can upgrade or downgrade your plan at any time from the Billing & Plans section. Changes will take effect at the start of your next billing cycle."
    },
    {
      id: 5,
      question: "Is there a mobile app available?",
      answer: "Currently, our platform is fully responsive and works great on mobile browsers. We're working on native mobile apps that will be available soon."
    }
  ];

  // GSAP refs
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const faqRef = useRef(null);
  const contactRef = useRef(null);
  const faqItemsRef = useRef([]);
  const contactFormRef = useRef(null);

  useEffect(() => {
    // Page entrance animation
    gsap.set(pageRef.current, { opacity: 0, y: 30 });
    gsap.set(headerRef.current, { opacity: 0, y: -20 });
    gsap.set(faqRef.current, { opacity: 0, x: -30 });
    gsap.set(contactRef.current, { opacity: 0, x: 30 });

    const tl = gsap.timeline();
    tl.to(pageRef.current, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' })
      .to(headerRef.current, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, '-=0.3')
      .to(faqRef.current, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, '-=0.2')
      .to(contactRef.current, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, '-=0.5');

    // Stagger animation for FAQ items
    gsap.fromTo(faqItemsRef.current, 
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.1, ease: 'power2.out', delay: 0.4 }
    );
  }, []);

  const toggleFAQ = (id) => {
    if (activeFAQ === id) {
      setActiveFAQ(null);
    } else {
      setActiveFAQ(id);
      
      // Animate the newly opened FAQ
      const faqItem = faqItemsRef.current.find(item => item.dataset.faqId === id.toString());
      if (faqItem) {
        gsap.fromTo(faqItem, 
          { backgroundColor: 'rgba(129, 140, 248, 0.1)' },
          { backgroundColor: 'rgba(129, 140, 248, 0.05)', duration: 0.3, yoyo: true, repeat: 1 }
        );
      }
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Animate form submission
    gsap.to(contactFormRef.current, { 
      backgroundColor: 'rgba(129, 140, 248, 0.05)', 
      duration: 0.3 
    });

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    
    // Success animation
    gsap.to(contactFormRef.current, { 
      backgroundColor: 'rgba(34, 197, 94, 0.1)', 
      duration: 0.3,
      yoyo: true,
      repeat: 1
    });

    // Reset form
    setContactForm({ name: '', email: '', subject: '', message: '' });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="support-page" ref={pageRef}>
              <div className="support-header" ref={headerRef}>
          <h1>
            Support Center
          </h1>
          <p>Get help with your account and find answers to common questions</p>
        </div>

      <div className="support-content">
        <div className="faq-section" ref={faqRef}>
          <h2>Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div 
                key={faq.id}
                className={`faq-item ${activeFAQ === faq.id ? 'active' : ''}`}
                ref={el => faqItemsRef.current[index] = el}
                data-faq-id={faq.id}
              >
                <button 
                  className="faq-question"
                  onClick={() => toggleFAQ(faq.id)}
                >
                  {faq.question}
                  <span className="faq-icon">{activeFAQ === faq.id ? '−' : '+'}</span>
                </button>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="contact-section" ref={contactRef}>
          <h2>Contact Support</h2>
          <form className="contact-form" ref={contactFormRef} onSubmit={handleContactSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  name="name"
                  value={contactForm.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={contactForm.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>Subject</label>
              <input
                type="text"
                name="subject"
                value={contactForm.subject}
                onChange={handleInputChange}
                required
              />
            </div>
            <div className="form-group">
              <label>Message</label>
              <textarea
                name="message"
                value={contactForm.message}
                onChange={handleInputChange}
                rows="6"
                required
                placeholder="Describe your issue or question in detail..."
              />
            </div>
            <button type="submit" className="submit-btn" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>

      <div className="support-info">
        <div className="info-card">
          <div className="info-icon">📧</div>
          <h3>Email Support</h3>
          <p>support@commercesaas.com</p>
          <span>Response within 24 hours</span>
        </div>
        <div className="info-card">
          <div className="info-icon">💬</div>
          <h3>Live Chat</h3>
          <p>Available 9AM-6PM EST</p>
          <span>Instant response</span>
        </div>
        <div className="info-card">
          <div className="info-icon">📚</div>
          <h3>Documentation</h3>
          <p>Comprehensive guides</p>
          <span>Self-service help</span>
        </div>
      </div>
    </div>
  );
};

export default Support; 