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

  const totalPrice = basket.reduce(
    (acc, item) => acc + item.price * (item.quantity || 1),
    0
  );

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, '');
    const groups = [];
    for (let i = 0; i < digits.length && i < 16; i += 4) {
      groups.push(digits.slice(i, i + 4));
    }
    return groups.join(' ');
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
    if (!fullName || !phone || !email || !address || !cardNumber) {
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
        totalPrice,
        contactInfo: {
          fullName,
          phone: phone.replace(/\D/g, ''),
          email,
          address
        },
        paymentInfo: {
          cardHolder: fullName,
          cardNumber: cardNumber.replace(/\s/g, ''),
          cardLast4: cardNumber.slice(-4),
          expiry: "12/26"
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
      
      toast.success("Order confirmed!");
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
      <h2 className="order-title">Confirm Order</h2>

      <div className="order-items">
        {basket.length === 0 ? (
          <p>No products in basket.</p>
        ) : (
          basket.map((item) => (
            <div key={item._id} className="order-item">
              <span>{item.name}</span>
              <span>${item.price.toFixed(2)}</span>
            </div>
          ))
        )}
      </div>

      <div className="order-total">Total: ${totalPrice.toFixed(2)}</div>

      <div className="order-form">
        <div className="input-group">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            className="order-input"
            onChange={(e) => setFullName(e.target.value)}
            required
          />
          <span className="required-indicator">*</span>
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
          <span className="required-indicator">*</span>
        </div>

        <div className="input-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            className="order-input"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <span className="required-indicator">*</span>
        </div>

        <div className="input-group card-input-group">
          <input
            type="text"
            placeholder="Card Number"
            value={cardNumber}
            className="order-input card-input"
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            maxLength="19"
            required
          />
          <span className="required-indicator">*</span>
          <div className="card-icons">
            <span className="card-icon visa">Visa</span>
            <span className="card-icon mastercard">Mastercard</span>
          </div>
        </div>

        <div className="input-group">
          <textarea
            placeholder="Address"
            value={address}
            className="order-input"
            onChange={(e) => setAddress(e.target.value)}
            required
          />
          <span className="required-indicator">*</span>
        </div>
      </div>

      <div className="order-buttons">
        <button
          onClick={handleConfirm}
          className="order-confirm"
          disabled={basket.length === 0}
        >
          Confirm
        </button>
        <button onClick={onClose} className="order-cancel">Cancel</button>
      </div>
    </Modal>
  );
};

export default OrderModal;