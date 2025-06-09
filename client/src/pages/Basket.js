import React from 'react';
import { useBasket } from '../contexts/BasketContext';

const Basket = () => {
  const { basket, setBasket } = useBasket();

  const handleRemove = (id) => {
    setBasket(basket.filter((item) => item._id !== id));
  };

  const handleOrder = () => {
    alert('Order placed!');
  }

  if (basket.length === 0) return <p>Your basket is empty.</p>;

  return (
    <div className="order-list">
      {basket.map((product) => (
        <div key={product._id} style={{ marginBottom: "1rem", border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
          <p>Price: ${product.price}</p>
          <button className="login-btn" onClick={() => handleRemove(product._id)}>Remove</button>
          <button className="login-btn" onClick={() => handleOrder()}>Order</button>
        </div>
      ))}
    </div>
  );
};

export default Basket;