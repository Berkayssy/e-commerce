import React, { useState } from "react";
import Modal from "react-modal";
import { toast } from "react-toastify";
import { useNavigate } from "react-router";
import { useBasket } from "../contexts/BasketContext";
import axios from "axios";
import "../modals/OrderModal.css";

const OrderModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { basket, clearBasket } = useBasket();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('standard');

  const totalPrice = basket.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0
  );

  const paymentPlans = [
    {
      id: 'standard',
      name: 'Standard Delivery',
      price: 0,
      time: '3-5 business days',
      icon: '🚚'
    },
    {
      id: 'express',
      name: 'Express Delivery',
      price: 15.99,
      time: '1-2 business days',
      icon: '⚡'
    },
    {
      id: 'premium',
      name: 'Premium Delivery',
      price: 29.99,
      time: 'Same day delivery',
      icon: '👑'
    }
  ];

  const selectedPlanData = paymentPlans.find(plan => plan.id === selectedPlan);
  const finalTotal = totalPrice + selectedPlanData.price;

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    const groups = [];
    for (let i = 0; i < digits.length && i < 16; i += 4) {
      groups.push(digits.slice(i, i + 4));
    }
    return groups.join(' ');
  };

  const formatExpiryDate = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) {
      return digits;
    } else {
      return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
    }
  };

  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    } else {
      return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handleConfirm = async () => {
    if (!fullName || !phone || !email || !address || !cardNumber || !expiryDate || !cvv) {
      toast.error("Please fill in all required fields!");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const productsPayload = basket.map((item) => ({
        product: item._id,
        quantity: item.quantity || 1,
      }));

      const orderData = {
        products: productsPayload,
        totalPrice: finalTotal,
        deliveryPlan: selectedPlanData,
        contactInfo: {
          fullName,
          phone: phone.replace(/\D/g, ''),
          email,
          address
        },
        paymentInfo: {
          cardHolder: fullName,
          cardLast4: cardNumber.slice(-4),
          expiry: expiryDate
        }
      };

      console.log("Order payload:", orderData);

      await axios.post(
        `${process.env.REACT_APP_API_URL}/orders`,
        orderData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          }
        }
      );
      
      toast.success("Order confirmed successfully! 🎉");
      clearBasket();
      onClose();
      navigate("/products");
    } catch (error) {
      console.error("Order error:", error.response?.data || error.message);
      toast.error("Error confirming order: " + (error.response?.data?.error || error.message));
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Order Modal"
      className="order-modal"
      overlayClassName="order-overlay"
    >
      <div className="order-modal-header">
        <h2 className="order-title">Complete Your Order</h2>
        <button onClick={onClose} className="order-close-btn">×</button>
      </div>

      <div className="order-modal-content">
        {/* Order Summary */}
        <div className="order-summary-section">
          <h3 className="section-title">Order Summary</h3>
          <div className="order-items">
            {basket.length === 0 ? (
              <p className="empty-basket">No products in basket.</p>
            ) : (
              basket.map((item) => (
                <div key={item._id} className="order-item">
                  <div className="item-info">
                    <span className="item-name">{item.name}</span>
                    <span className="item-quantity">x{item.quantity || 1}</span>
                  </div>
                  <span className="item-price">${(item.price * (item.quantity || 1)).toFixed(2)}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Delivery Plan Selection */}
        <div className="delivery-plan-section">
          <h3 className="section-title">Choose Delivery Plan</h3>
          <div className="delivery-plans">
            {paymentPlans.map((plan) => (
              <div
                key={plan.id}
                className={`delivery-plan ${selectedPlan === plan.id ? 'selected' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <div className="plan-icon">{plan.icon}</div>
                <div className="plan-details">
                  <h4 className="plan-name">{plan.name}</h4>
                  <p className="plan-time">{plan.time}</p>
                </div>
                <div className="plan-price">
                  {plan.price === 0 ? 'Free' : `$${plan.price.toFixed(2)}`}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <div className="contact-section">
          <h3 className="section-title">Contact Information</h3>
          <div className="form-grid">
            <div className="input-group">
              <input
                type="text"
                placeholder="Full Name"
                value={fullName}
                className="order-input"
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <input
                type="text"
                placeholder="Phone Number"
                value={phone}
                className="order-input"
                onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
                maxLength="12"
                required
              />
            </div>

            <div className="input-group">
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                className="order-input"
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group full-width">
              <textarea
                placeholder="Delivery Address"
                value={address}
                className="order-input"
                onChange={(e) => setAddress(e.target.value)}
                rows="3"
                required
              />
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div className="payment-section">
          <h3 className="section-title">Payment Information</h3>
          <div className="payment-card">
            <div className="card-header">
              <span className="card-icon">💳</span>
              <span className="card-title">Credit Card</span>
            </div>
            
            <div className="form-grid">
              <div className="input-group full-width">
                <input
                  type="text"
                  placeholder="Card Number"
                  value={cardNumber}
                  className="order-input"
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength="19"
                  required
                />
              </div>

              <div className="input-group">
                <input
                  type="text"
                  placeholder="MM/YY"
                  value={expiryDate}
                  className="order-input"
                  onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
                  maxLength="5"
                  required
                />
              </div>

              <div className="input-group">
                <input
                  type="text"
                  placeholder="CVV"
                  value={cvv}
                  className="order-input"
                  onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
                  maxLength="3"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Total and Confirm */}
        <div className="order-total-section">
          <div className="total-breakdown">
            <div className="total-row">
              <span>Subtotal:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span>Delivery:</span>
              <span>{selectedPlanData.price === 0 ? 'Free' : `$${selectedPlanData.price.toFixed(2)}`}</span>
            </div>
            <div className="total-row total-final">
              <span>Total:</span>
              <span>${finalTotal.toFixed(2)}</span>
            </div>
          </div>

          <div className="order-buttons">
            <button
              onClick={handleConfirm}
              className="order-confirm"
              disabled={basket.length === 0}
            >
              <span role="img" aria-label="confirm">✅</span>
              Confirm Order
            </button>
            <button onClick={onClose} className="order-cancel">
              <span role="img" aria-label="cancel">❌</span>
              Cancel
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OrderModal;