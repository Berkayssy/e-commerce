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
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

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
      <div className="order-list-filters" style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center' }}>
        <label style={{ color: '#fff' }}>
          Status:
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ marginLeft: '0.5rem', padding: '0.3rem 0.6rem', borderRadius: '5px', border: '1px solid #ccc' }}>
            <option value="">All</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>
        <label style={{ color: '#fff' }}>
          Start Date:
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={{ marginLeft: '0.5rem', padding: '0.3rem 0.6rem', borderRadius: '5px', border: '1px solid #ccc' }} />
        </label>
        <label style={{ color: '#fff' }}>
          End Date:
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={{ marginLeft: '0.5rem', padding: '0.3rem 0.6rem', borderRadius: '5px', border: '1px solid #ccc' }} />
        </label>
      </div>
      <div className="order-list">
        {orders
          .filter(order => {
            if (statusFilter && order.status !== statusFilter) return false;
            const orderDate = new Date(order.createdAt);
            if (startDate && orderDate < new Date(startDate)) return false;
            if (endDate && orderDate > new Date(endDate)) return false;
            return true;
          })
          .map((order) => (
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
                  <strong>Customer:</strong> {order.user?.username || "Guest"}
                </div>
                <div className="order-list-contact-info">
                  <h3>Contact Information</h3>
                  <div className="order-list-contact-details">
                    <div className="order-list-contact-item">
                      <strong>Full Name:</strong> {order.contactInfo?.fullName}
                    </div>
                    <div className="order-list-contact-item">
                      <strong>Phone:</strong> {order.contactInfo?.phone}
                    </div>
                    <div className="order-list-contact-item">
                      <strong>Email:</strong> {order.contactInfo?.email}
                    </div>
                    <div className="order-list-contact-item">
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
};

export default OrderList;