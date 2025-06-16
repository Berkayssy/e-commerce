import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import "./OrderList.css";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
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

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/orders?page=${page}&limit=${limit}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (page === 1) {
          setOrders(res.data.orders || []);
        } else {
          setOrders(prevOrders => [...prevOrders, ...(res.data.orders || [])]);
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

    fetchOrders();
  }, [navigate, page, limit]);

  const handleLoadMore = () => {
    setPage(prevPage => prevPage + 1);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      setUpdatingStatus(orderId);
      const token = localStorage.getItem("token");
      
      const res = await axios.put(
        `${process.env.REACT_APP_API_URL}/orders/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(orders.map(order => 
        order._id === orderId ? res.data.order : order
      ));
    } catch (err) {
      console.error("Error updating order status:", err);
      setError(err.response?.data?.error || "Failed to update order status");
    } finally {
      setUpdatingStatus(null);
    }
  };

  if (loading && page === 1) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <button onClick={() => window.location.reload()} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (orders.length === 0 && !loading) {
    return (
      <div className="no-orders">
        <h2>No Orders Found</h2>
        <p>There are no orders in the system yet.</p>
      </div>
    );
  }

  return (
    <div className="order-list-container">
      <h1 className="order-list-title">Order Management</h1>
      <div className="order-list">
        {orders.map((order) => (
          <div key={order._id} className="order-item-list">
            <div className="order-list-header">
              <div className="order-list-id">Order #{order._id.slice(-6)}</div>
              <div className="order-status-container">
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                  disabled={updatingStatus === order._id}
                  className={`status-select ${order.status}`}
                >
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                {updatingStatus === order._id && (
                  <div className="status-updating">Updating...</div>
                )}
              </div>
            </div>

            <div className="order-list-products">
              {order.products.map((p) => (
                <div className="list-product-item" key={p._id}>
                  <img 
                    src={p.product?.imageUrl} 
                    alt={p.product?.name}
                    className="list-product-image"
                    onError={(e) => {
                      e.target.src = '/placeholder-image.png';
                    }}
                  />
                  <div className="list-product-details">
                    <span className="list-product-name">{p.product?.name || "Unnamed Product"}</span>
                    <span className="list-product-quantity">x{p.quantity}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="order-list-summary">
              <div className="list-total-price">
                Total: ${order.totalPrice.toFixed(2)}
              </div>
              <div className="list-order-date">
                Ordered on: {new Date(order.createdAt).toLocaleDateString()}
              </div>
            </div>

            <div className="order-list-contact">
              <div className="order-list-user">
                <strong>Customer:</strong> {orders.user?.username || "Guest"}
              </div>
              <div className="order-list-contact-info">
                <h3>Contact Information</h3>
                <div className="order-list-contact-details">
                  <div className="order-list-contact-item">
                    <strong>Full Name:</strong> {orders.contactInfo?.fullName}
                  </div>
                  <div className="order-list-contact-item">
                    <strong>Phone:</strong> {orders.contactInfo?.phone}
                  </div>
                  <div className="order-list-contact-item">
                    <strong>Email:</strong> {orders.contactInfo?.email}
                  </div>
                  <div className="order-list-contact-item">
                    <strong>Address:</strong> {orders.contactInfo?.address}
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
};

export default OrderList;