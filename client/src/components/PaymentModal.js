import React, { useState } from 'react';
import Modal from 'react-modal';
import InputGroup from './common/InputGroup';
import PasswordInput from './common/PasswordInput';
import ErrorMessage from './common/ErrorMessage';
import LoadingSpinner from './common/LoadingSpinner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { createSubscriptionAndRegister } from '../api/api';
import './PlanModal.css';

Modal.setAppElement('#root');

const PaymentModal = ({ isOpen, onClose, plan }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    storeName: '',
    phone: '',
    country: '',
    city: '',
    address: ''
  });
  const [card, setCard] = useState({
    number: '',
    expiry: '',
    cvv: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
  };
  // Kart numarası otomatik formatlama (4'lü gruplar, tire ile)
  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 16);
    const groups = [];
    for (let i = 0; i < digits.length; i += 4) {
      groups.push(digits.slice(i, i + 4));
    }
    return groups.join('-');
  };
  // Tarih otomatik formatlama MM/YY
  const formatExpiry = (value) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    if (digits.length <= 2) return digits;
    return digits.slice(0, 2) + '/' + digits.slice(2, 4);
  };
  // CVV sadece 3 hane
  const formatCvv = (value) => value.replace(/\D/g, '').slice(0, 3);

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    let formatted = value;
    if (name === 'number') formatted = formatCardNumber(value);
    if (name === 'expiry') formatted = formatExpiry(value);
    if (name === 'cvv') formatted = formatCvv(value);
    setCard({ ...card, [name]: formatted });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password || !form.storeName) {
      setError('Please fill in all registration fields.');
      return;
    }
    if (plan.price > 0 && (!card.number || !card.expiry || !card.cvv)) {
      setError('Please fill in all payment fields.');
      return;
    }
    setLoading(true);
    try {
      // Tek API çağrısı ile register + subscription
      const payload = {
        username: form.username,
        email: form.email,
        password: form.password,
        storeName: form.storeName,
        phone: form.phone,
        country: form.country,
        city: form.city,
        address: form.address,
        plan: plan._id || plan.id,
        cardNumber: card.number,
        cardExpiry: card.expiry,
        cardCvv: card.cvv,
        role: 'seller'
      };
      const response = await createSubscriptionAndRegister(payload);
      // Token ve userId kaydet
      if (response.token) localStorage.setItem('token', response.token);
      if (response.userId) localStorage.setItem('userId', response.userId);
      if (response.planId) localStorage.setItem('selectedPlanId', response.planId);
      setLoading(false);
      onClose();
      if (response.sellerId && response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('sellerId', response.sellerId);
        navigate('/onboarding'); // Mağaza açma/onboarding sayfası
      } else {
        navigate('/'); // Fallback: anasayfa
      }
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.message || err.message || 'An error occurred');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Payment Modal"
      className="plan-modal wide-modal"
      overlayClassName="plan-modal-overlay"
    >
      <button className="modal-close-btn" onClick={onClose}>×</button>
      <div className="modal-content">
        <div className="modal-header">
          <div className="plan-icon" style={{ fontSize: 40 }}>{plan.icon || '💳'}</div>
          <h2 className="modal-title">Complete Registration & Payment</h2>
          <p className="modal-subtitle">Create your account and activate the <b>{plan.name}</b> plan.</p>
        </div>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="plan-summary">
            <div className="summary-item">
              <span className="summary-label">Plan:</span>
              <span className="summary-value">{plan.name}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Price:</span>
              <span className="summary-value">{plan.price === 0 ? 'Free' : `$${plan.price}`} {plan.period}</span>
            </div>
          </div>
          <div className="key-features responsive-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <h3 style={{ marginBottom: 6 }}>Registration</h3>
              <InputGroup
                icon="👤"
                name="username"
                placeholder="Full Name"
                value={form.username}
                onChange={handleChange}
                required
              />
              <InputGroup
                icon="🏪"
                name="storeName"
                placeholder="Store Name"
                value={form.storeName}
                onChange={handleChange}
                required
              />
              <InputGroup
                icon="✉️"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                required
              />
              <PasswordInput
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                required
              />
              <InputGroup
                icon="📞"
                name="phone"
                placeholder="Phone Number"
                value={form.phone}
                onChange={handleChange}
                required
              />
              <InputGroup
                icon="🌍"
                name="country"
                placeholder="Country"
                value={form.country}
                onChange={handleChange}
                required
              />
              <InputGroup
                icon="🏙️"
                name="city"
                placeholder="City"
                value={form.city}
                onChange={handleChange}
                required
              />
              <InputGroup
                icon="🏠"
                name="address"
                placeholder="Address"
                value={form.address}
                onChange={handleChange}
                required
              />
            </div>
            {plan.price > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <h3 style={{ marginBottom: 6 }}>Payment</h3>
                <InputGroup
                  icon="💳"
                  name="number"
                  placeholder="Card Number"
                  value={card.number}
                  onChange={handleCardChange}
                  maxLength={19}
                  required
                />
                <div style={{ display: 'flex', gap: 8 }}>
                  <InputGroup
                    icon="📅"
                    name="expiry"
                    placeholder="MM/YY"
                    value={card.expiry}
                    onChange={handleCardChange}
                    maxLength={5}
                    required
                  />
                  <InputGroup
                    icon="🔒"
                    name="cvv"
                    placeholder="CVV"
                    value={card.cvv}
                    onChange={handleCardChange}
                    maxLength={3}
                    required
                  />
                </div>
              </div>
            )}
          </div>
          <ErrorMessage error={error} />
          <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
            <button className="modal-btn secondary" type="button" onClick={onClose} disabled={loading}>Cancel</button>
            <button className="modal-btn primary" type="submit" disabled={loading} style={{ '--plan-color': plan.color }}>
              {loading ? <LoadingSpinner message="Processing..." /> : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PaymentModal; 