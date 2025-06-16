import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 5; // Number of orders to load per request

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/orders/my?page=${page}&limit=${limit}`); // Assuming a similar endpoint for user's order history
        const data = await response.json();
        if (page === 1) {
          setOrders(data.orders || []);
        } else {
          setOrders(prevOrders => [...prevOrders, ...(data.orders || [])]);
        }
        setHasMore(data.orders && data.orders.length === limit);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    // Fetch orders from the backend
    fetchOrders();
  }, [page, limit]);

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  if (loading && page === 1) {
    return (
      <div className="order-history-loading">
        <div className="order-history-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-history-error">
        <p>{error}</p>
      </div>
    );
  }

  if (orders.length === 0 && !loading) {
    return (
      <div className="order-history-empty">
        <h2>Your Orders</h2>
        <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
        <Link to="/products" className="order-history-empty-button">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="order-history">
      {/* Render your orders here */}
      {orders.map(order => (
        <div key={order._id} className="order-item">
          <h3>Order #{order._id.slice(-6)}</h3>
          <p>Total: ${order.totalPrice.toFixed(2)}</p>
          {/* Add more order details as needed */}
        </div>
      ))}
      {hasMore && (
        <button className="load-more-button" onClick={handleLoadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More Orders'}
        </button>
      )}
    </div>
  );
};

export default OrderHistory; 