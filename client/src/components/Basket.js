import React, { useState, useEffect, useRef } from 'react';
import { useBasket } from '../contexts/BasketContext';
import OrderModal from '../modals/OrderModal';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import './Basket.css';

const Basket = () => {
  const { basket, setBasket } = useBasket();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  // GSAP refs
  const pageRef = useRef(null);
  const basketItemsRef = useRef([]);
  const summaryRef = useRef(null);

  // Sepet değiştiğinde ref'leri günceller
  useEffect(() => {
    if (basket && basket.length > 0) {
      basketItemsRef.current = basketItemsRef.current.slice(0, basket.length);
    } else {
      basketItemsRef.current = [];
    }
  }, [basket]);

  // Sayfa ve sepet animasyonları
  useEffect(() => {
    // Page entrance animation
    if (pageRef.current) {
      gsap.set(pageRef.current, { opacity: 0, y: 30 });
      gsap.to(pageRef.current, { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' });
    }
    // Basket items animation
    const validBasketItems = basketItemsRef.current.filter(item => item !== null && item !== undefined);
    if (validBasketItems.length > 0) {
      gsap.fromTo(validBasketItems,
        { opacity: 0, y: 50, scale: 0.9 },
        { opacity: 1, y: 0, scale: 1, duration: 0.8, stagger: 0.1, ease: 'back.out(1.7)', delay: 0.2 }
      );
    }
    // Summary animation
    if (summaryRef.current) {
      gsap.fromTo(summaryRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.4 }
      );
    }
  }, [basket]);

  // Sepetten ürün çıkarır
  const handleRemove = (id) => {
    const itemIndex = basket.findIndex(item => item && item._id === id);
    if (itemIndex >= 0 && basketItemsRef.current[itemIndex]) {
      gsap.killTweensOf(basketItemsRef.current[itemIndex]);
    }
    setBasket(basket.filter((item) => item && item._id !== id));
  };

  // Sepeti tamamen temizler
  const handleClearBasket = () => {
    if (basketItemsRef.current.length > 0) {
      gsap.killTweensOf(basketItemsRef.current);
    }
    if (summaryRef.current) {
      gsap.killTweensOf(summaryRef.current);
    }
    basketItemsRef.current = [];
    setBasket([]);
  };

  // Ürün adedini değiştirir
  const handleQuantityChange = (id, quantity) => {
    setBasket((prevBasket) =>
      prevBasket.map((item) =>
        item._id === id ? { ...item, quantity: parseInt(quantity) || 1 } : item
      )
    );
  };

  const formatPrice = (price) => {
    return price ? '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(price) : '';
  };

  if (!basket || basket.length === 0) {
    return (
      <div className="basket-page" ref={pageRef}>
        <div className="basket-content">
          <div className="basket-header">
            <h1 className="basket-title gradient-text">🛒 Your Basket</h1>
            <p className="basket-subtitle">Your shopping cart is empty</p>
          </div>
          <div className="basket-main">
            <div className="basket-list basket-list-empty">
              <div className="basket-empty-icon" style={{fontSize: '4rem', marginBottom: '1.5rem'}}>🛍️</div>
              <h2 className="basket-empty-title">No items yet!</h2>
              <p className="basket-empty-desc">
                Start shopping and discover amazing products tailored for you.
              </p>
              <Link to="/products" className="basket-btn basket-btn-primary basket-btn-animate" style={{marginTop: '2rem', minWidth: 220}}>
                <span role="img" aria-label="shop">✨</span>
                Start Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sepet toplam fiyatını hesaplar
  const totalPrice = basket.reduce((acc, item) => {
    if (item && item.price) {
      return acc + item.price * (item.quantity || 1);
    }
    return acc;
  }, 0);

  return (
    <div className="basket-page" ref={pageRef}>
      <div className="basket-content">
        <div className="basket-header">
          <h1 className="basket-title gradient-text">🛒 Your Basket</h1>
          <p className="basket-subtitle">Review and manage your items with style!</p>
        </div>
        <div className="basket-main">
          <div className="basket-list">
            {basket.map((product, index) => (
              product && product._id && product.name && (
                <div
                  key={product._id}
                  className="basket-list-item"
                  ref={el => {
                    if (el) {
                      basketItemsRef.current[index] = el;
                    }
                  }}
                  onClick={() => navigate(`/products/${product._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="basket-list-imgwrap">
                    <img
                      src={product.imageUrl && product.imageUrl !== '' ? product.imageUrl : (product.images && product.images.length > 0 ? product.images[0] : '/placeholder-image.png')}
                      alt={product.name}
                      className="basket-list-img"
                      onError={(e) => {
                        if (e.target.src !== window.location.origin + '/placeholder-image.png') {
                          e.target.src = '/placeholder-image.png';
                        }
                      }}
                    />
                  </div>
                  <div className="basket-list-info">
                    <div className="basket-list-row-top">
                      <h3 className="basket-list-title">{product.name}</h3>
                      <button
                        className="basket-btn basket-btn-remove"
                        onClick={e => {
                          e.stopPropagation();
                          handleRemove(product._id);
                        }}
                        title="Remove"
                      >
                        <span role="img" aria-label="remove">🗑️</span>
                      </button>
                    </div>
                    <p className="basket-list-desc">{product.description}</p>
                    <div className="basket-list-row-bottom">
                      <div className="basket-list-price">{formatPrice(product.price)}</div>
                      <div className="basket-list-qty-wrap">
                        <label className="basket-list-qty-label">Qty:</label>
                        <input
                          type="number"
                          min="1"
                          value={product.quantity || 1}
                          onClick={e => e.stopPropagation()}
                          onChange={e => handleQuantityChange(product._id, e.target.value)}
                          className="basket-list-qty-input"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
          <div className="basket-summary">
            <button
              className="basket-btn basket-btn-remove basket-summary-clear-btn"
              title="Clear Basket"
              onClick={handleClearBasket}
            >
              <span role="img" aria-label="clear">🗑️</span>
            </button>
            <h3 className="basket-summary-title gradient-text">Order Summary</h3>
            <div className="basket-summary-details">
              <div className="basket-summary-row">
                <span className="basket-summary-label">Items:</span>
                <span className="basket-summary-value">{basket.length}</span>
              </div>
              <div className="basket-summary-row">
                <span className="basket-summary-label">Total:</span>
                <span className="basket-summary-value basket-summary-total highlight-price">{formatPrice(totalPrice)}</span>
              </div>
            </div>
            <div className="basket-summary-actions">
              <button 
                className="basket-btn basket-btn-primary basket-btn-confirm basket-btn-animate"
                onClick={() => setIsModalOpen(true)}
              >
                <span role="img" aria-label="confirm"></span>
                Confirm Order
              </button>
            </div>
          </div>
        </div>
        <OrderModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </div>
    </div>
  );
};

export default Basket;