import React, { useState } from 'react';
import { useBasket } from '../contexts/BasketContext';
import OrderModal from '../modals/OrderModal';
import { Link } from 'react-router-dom';
import './Basket.css';

const Basket = () => {
  const { basket, setBasket } = useBasket();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleRemove = (id) => {
    setBasket(basket.filter((item) => item && item._id !== id));
  };

  const handleClearBasket = () => {
    setBasket([]);
  };

  const handleQuantityChange = (id, quantity) => {
    setBasket((prevBasket) =>
      prevBasket.map((item) =>
        item._id === id ? { ...item, quantity: parseInt(quantity) || 1 } : item
      )
    );
  };

  if (!basket || basket.length === 0) {
    return (
      <div className="basket-empty">
        <h2>Your Basket</h2>
        <p>Your basket is empty. Start shopping to add items!</p>
        <Link to="/products" className="basket-empty-button">
          Browse Products
        </Link>
      </div>
    );
  }

  const totalPrice = basket
    .filter((item) => item && item.price)
    .reduce((acc, item) => acc + item.price * (item.quantity || 1), 0);

  return (
    <div className="basket-container">
      <h2 className="basket-title">Your Basket</h2>
      <div className="basket-items">
        {basket
          .filter((product) => product && product._id && product.name)
          .map((product) => (
            <div key={product._id} className="basket-item">
              <img 
                src={product.imageUrl || '/placeholder-image.png'}
                alt={product.name}
                className="basket-item-image"
                onError={(e) => {
                  e.target.src = '/placeholder-image.png';
                }}
              />
              <div className="basket-item-content">
                <div className="basket-item-header">
                  <h3 className="basket-item-name">{product.name}</h3>
                  <button 
                    className="remove-button"
                    onClick={() => handleRemove(product._id)}
                  >
                    Remove
                  </button>
                </div>
                <p className="basket-item-description">{product.description}</p>
                <div className="basket-item-details">
                  <span className="basket-item-price">${product.price}</span>
                  <div className="quantity-control">
                    <label>Quantity: </label>
                    <input
                      type="number"
                      min="1"
                      value={product.quantity || 1}
                      onChange={(e) => handleQuantityChange(product._id, e.target.value)}
                      className="quantity-input"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
      <div className="basket-summary">
        <div className="total-price">
          Total: ${totalPrice.toFixed(2)}
        </div>
        <div className="basket-actions">
          <button 
            className="confirm-order-button"
            onClick={() => setIsModalOpen(true)}
          >
            Confirm Order
          </button>
          <button 
            className="clear-basket-button"
            onClick={handleClearBasket}
          >
            Clear Basket
          </button>
        </div>
      </div>
      <OrderModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default Basket;