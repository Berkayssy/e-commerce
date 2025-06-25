import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router'
import './MyOrderList.css'

export default function MyOrderList() {
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const limit = 5; // Number of orders to load per request
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/orders/my?page=${page}&limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (page === 1) {
          setMyOrders(res.data.orders || []);
        } else {
          setMyOrders(prevOrders => [...prevOrders, ...(res.data.orders || [])]);
        }
        setHasMore(res.data.orders && res.data.orders.length === limit);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError(err.response?.data?.error || "Failed to fetch orders");
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMyOrders();
  }, [navigate, page, limit]);

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  if (loading && page === 1) {
    return (
      <div className="my-loading-container">
        <div className="my-loading-spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-error-container">
        <p className="my-error-message">{error}</p>
        <button onClick={() => window.location.reload()} className="my-retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (myOrders.length === 0 && !loading) {
    return (
      <div className="my-no-orders">
        <h2>Your Orders</h2>
        <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
        <button onClick={() => navigate('/products')} className="my-shop-now-button">
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <div className="my-order-list-container">
      <h1 className="my-order-list-title">My Orders</h1>
      <div className="my-order-list">
        {myOrders.map((order) => (
          <div key={order._id} className="my-order-item-list">
            <div className="my-order-list-header">
              <div className="my-order-list-id">Order #{order._id.slice(-6)}</div>
              <div 
                className={`my-order-status ${order.status}`}
              >
                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
              </div>
            </div>

            <div className="my-order-list-products">
              {order.products.map((p) => (
                <div className="my-list-product-item" key={p._id}>
                  <img 
                    src={p.product?.imageUrl} 
                    alt={p.product?.name}
                    className="my-list-product-image"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.png';
                    }}
                  />
                  <div className="my-list-product-details">
                    <span className="my-list-product-name">{p.product?.name}</span>
                    <span className="my-list-product-quantity">x{p.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="my-order-list-summary">
              <div className="my-list-total-price">
                Total: ${order.totalPrice.toFixed(2)}
              </div>
              <div className="my-list-order-date">
                Ordered on: {new Date(order.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="my-order-list-contact">
              <div className="my-order-list-info">
                <h3>Contact Information</h3>
                <div className="my-order-list-contact-details">
                  <div className="my-order-list-contact-item">
                    <strong>Full Name:</strong> {order.contactInfo?.fullName}
                  </div>
                  <div className="my-order-list-contact-item">
                    <strong>Phone:</strong> {order.contactInfo?.phone}
                  </div>
                  <div className="my-order-list-contact-item">
                    <strong>Email:</strong> {order.contactInfo?.email}
                  </div>
                  <div className="my-order-list-contact-item">
                    <strong>Address:</strong> {order.contactInfo?.address}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <button className="load-more-button" onClick={handleLoadMore} disabled={loading}>
          {loading ? 'Loading...' : 'Load More Orders'}
        </button>
      )}
    </div>
  );
}