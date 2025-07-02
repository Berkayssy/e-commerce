import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import useGsapFadeIn from '../components/common/useGsapFadeIn';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import RetryButton from '../components/common/RetryButton';
import "./OrderList.css";

const OrderList = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const limit = 5;
  const navigate = useNavigate();

  // GSAP refs
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const filtersRef = useRef(null);
  const ordersRef = useRef(null);
  const orderCardsRef = useRef([]);

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

  // GSAP animations
  useGsapFadeIn([pageRef, headerRef, filtersRef, ordersRef], { 
    stagger: 0.2, 
    duration: 0.6, 
    y: 30 
  });

  useGsapFadeIn(orderCardsRef.current, { 
    stagger: 0.08, 
    duration: 0.5, 
    y: 30,
    delay: 0.4 
  });

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

  const handleOrderClick = (order) => {
    setSelectedOrder(selectedOrder === order._id ? null : order._id);
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };
    return statusColors[status] || '#6b7280';
  };

  const getStatusIcon = (status) => {
    const statusIcons = {
      pending: '⏳',
      processing: '⚙️',
      shipped: '📦',
      delivered: '✅',
      cancelled: '❌'
    };
    return statusIcons[status] || '📋';
  };

  const filteredOrders = orders.filter(order => {
    if (statusFilter && order.status !== statusFilter) return false;
    const orderDate = new Date(order.createdAt);
    if (startDate && orderDate < new Date(startDate)) return false;
    if (endDate && orderDate > new Date(endDate)) return false;
    return true;
  });

  if (loading && page === 1) {
    return <LoadingSpinner message="Loading orders..." />;
  }

  if (error) {
    return (
      <div className="order-error-container">
        <ErrorMessage error={error} />
        <RetryButton onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (orders.length === 0 && !loading) {
    return (
      <div className="order-no-orders" ref={pageRef}>
        <div className="no-orders-content">
          <div className="no-orders-icon">📦</div>
          <h2>No Orders Found</h2>
          <p>There are no orders in the system yet.</p>
        </div>
      </div>
    );
  }

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <div className="order-list-page" ref={pageRef}>
      <div className="order-header" ref={headerRef}>
        <h1>Order Management</h1>
        <p>Manage and track all customer orders</p>
      </div>

      <div className="order-filters" ref={filtersRef}>
        <div className="filter-group">
          <label className="filter-label">
            Status Filter:
            <select 
              value={statusFilter} 
              onChange={e => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="filter-group">
          <label className="filter-label">
            Start Date:
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)}
              className="filter-input"
            />
          </label>
        </div>

        <div className="filter-group">
          <label className="filter-label">
            End Date:
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)}
              className="filter-input"
            />
          </label>
        </div>

        <div className="filter-stats">
          <span className="filter-stat">
            Total: {filteredOrders.length} orders
          </span>
        </div>
      </div>

      <div className="orders-container" ref={ordersRef}>
        {filteredOrders.map((order, index) => (
          <div 
            key={order._id} 
            className="order-card"
            ref={el => orderCardsRef.current[index] = el}
            data-order-id={order._id}
            onClick={() => handleOrderClick(order)}
          >
            <div className="order-card-header">
              <div className="order-info">
                <div className="order-id">Order #{order._id.slice(-6)}</div>
                <div className="order-date">
                  {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className="order-customer">
                  Customer: {order.user?.username || "Guest"}
                </div>
              </div>
              
              <div className="order-status-section">
                <div 
                  className="order-status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  <span className="status-icon">{getStatusIcon(order.status)}</span>
                  <span className="status-text">
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                
                <select
                  value={order.status}
                  onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                  disabled={updatingStatus === order._id}
                  className="status-select"
                  onClick={(e) => e.stopPropagation()}
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                
                {updatingStatus === order._id && (
                  <div className="status-updating">Updating...</div>
                )}
              </div>
            </div>

            <div className="order-products">
              <div className="products-preview">
                {order.products.slice(0, 3).map((p, productIndex) => (
                  <div className="product-preview" key={p._id}>
                    <img 
                      src={p.product?.imageUrl || p.product?.images?.[0]} 
                      alt={p.product?.name}
                      className="product-preview-image"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/60x60/1e293b/ffffff?text=Product';
                      }}
                    />
                    <span className="product-quantity">x{p.quantity}</span>
                  </div>
                ))}
                {order.products.length > 3 && (
                  <div className="more-products">
                    +{order.products.length - 3} more
                  </div>
                )}
              </div>
            </div>

            <div className="order-summary">
              <div className="order-total">
                <span className="total-label">Total:</span>
                <span className="total-amount">${order.totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {selectedOrder === order._id && (
              <div className="order-details">
                <div className="order-products-full">
                  <h4>Products</h4>
                  {order.products.map((p) => (
                    <div className="order-product-item" key={p._id}>
                      <img 
                        src={p.product?.imageUrl || p.product?.images?.[0]} 
                        alt={p.product?.name}
                        className="order-product-image"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80x80/1e293b/ffffff?text=Product';
                        }}
                      />
                      <div className="order-product-info">
                        <span className="order-product-name">{p.product?.name || "Unnamed Product"}</span>
                        <span className="order-product-price">${p.product?.price} x {p.quantity}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-contact">
                  <h4>Contact Information</h4>
                  <div className="contact-details">
                    {[
                      { label: 'Name', value: order.contactInfo?.fullName },
                      { label: 'Phone', value: order.contactInfo?.phone },
                      { label: 'Email', value: order.contactInfo?.email },
                      { label: 'Address', value: order.contactInfo?.address }
                    ].map(contact => (
                      <div key={contact.label} className="contact-item">
                        <span className="contact-label">{contact.label}:</span>
                        <span className="contact-value">{contact.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {hasMore && (
        <div className="load-more-container">
          <button 
            className="load-more-button" 
            onClick={handleLoadMore} 
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Orders'}
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderList;