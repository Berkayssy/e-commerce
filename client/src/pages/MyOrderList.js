import React, { useState, useEffect, useRef, useMemo } from 'react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import useGsapFadeIn from '../components/common/useGsapFadeIn';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import RetryButton from '../components/common/RetryButton';
import './MyOrderList.css'

export default function MyOrderList() {
  const { userId } = useParams();
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cargoLocations, setCargoLocations] = useState({});
  const limit = 5; // Number of orders to load per request
  const navigate = useNavigate();

  // GSAP refs
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const ordersRef = useRef(null);
  const orderCardsRef = useRef([]);

  // Temsili konumlar
  const locations = useMemo(() => [
    'Istanbul, Turkey',
    'Ankara, Turkey',
    'Izmir, Turkey',
    'Bursa, Turkey',
    'Antalya, Turkey',
    'Berlin, Germany',
    'London, UK',
    'Paris, France',
    'Rome, Italy',
    'Madrid, Spain',
    'New York, USA',
    'Los Angeles, USA',
    'Tokyo, Japan',
    'Seoul, South Korea',
    'Moscow, Russia',
    'Dubai, UAE',
    'Amsterdam, Netherlands',
    'Vienna, Austria',
    'Zurich, Switzerland',
    'Stockholm, Sweden'
  ], []);

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
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/orders/my?page=${page}&limit=${limit}${userId ? `&userId=${userId}` : ''}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        let orders = res.data.orders || [];
        if (page === 1) {
          setMyOrders(orders);
        } else {
          setMyOrders(prevOrders => [...prevOrders, ...orders]);
        }
        setHasMore(orders.length === limit);

        // Her sipariş için random bir konum ata
        setCargoLocations(prev => {
          const newLocations = { ...prev };
          orders.forEach(order => {
            if (!newLocations[order._id]) {
              const randomLoc = locations[Math.floor(Math.random() * locations.length)];
              newLocations[order._id] = randomLoc;
            }
          });
          return newLocations;
        });
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
  }, [navigate, page, limit, locations, userId]);

  // GSAP animations
  useGsapFadeIn([pageRef, headerRef, ordersRef], { 
    stagger: 0.2, 
    duration: 0.6, 
    y: 30 
  });

  useGsapFadeIn(orderCardsRef.current, { 
    stagger: 0.1, 
    duration: 0.5, 
    y: 30,
    delay: 0.4 
  });

  const handleOrderClick = (order, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedOrder(selectedOrder === order._id ? null : order._id);
  };

  const handleCargoLocationClick = (e, order) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent the order card click event
    if (cargoLocations[order._id]) {
      const query = encodeURIComponent(cargoLocations[order._id]);
      window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    }
  };

  const handleLoadMore = (e) => {
    e.preventDefault();
    setPage(prevPage => prevPage + 1);
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

  if (loading && page === 1) {
    return <LoadingSpinner message="Loading your orders..." />;
  }

  if (error) {
    return (
      <div className="my-error-container">
        <ErrorMessage error={error} />
        <RetryButton onRetry={() => window.location.reload()} />
      </div>
    );
  }

  if (myOrders.length === 0 && !loading) {
    return (
      <div className="my-no-orders" ref={pageRef}>
        <div className="no-orders-content">
          <div className="no-orders-icon">📦</div>
          <h2>No Orders Yet</h2>
          <p>You haven't placed any orders yet. Start shopping to see your orders here!</p>
          <button onClick={() => navigate('/products')} className="my-shop-now-button">
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="my-order-list-page" ref={pageRef}>
      <div className="my-order-header" ref={headerRef}>
        <h1>
          My Orders
        </h1>
        <p>Track your order history and current status</p>
      </div>

      <div className="my-orders-container" ref={ordersRef}>
        {myOrders.map((order, index) => (
          <div 
            key={order._id} 
            className="my-order-card"
            ref={el => orderCardsRef.current[index] = el}
            data-order-id={order._id}
            onClick={(e) => handleOrderClick(order, e)}
          >
            {/* Where is my cargo alanı */}
            <div 
              className="cargo-location-row"
              onClick={(e) => handleCargoLocationClick(e, order)}
            >
              <span style={{fontWeight:600, color:'#c084fc'}}>Where is my cargo?</span>
              <span style={{color:'#f472b6',fontWeight:500}}>
                {cargoLocations[order._id] || 'Unknown'}
              </span>
              <span style={{color:'#818cf8', fontSize:'0.8rem'}}>📍</span>
            </div>
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
              </div>
              <div 
                className="order-status"
                style={{ backgroundColor: getStatusColor(order.status) }}
              >
                <span className="status-icon">{getStatusIcon(order.status)}</span>
                <span className="status-text">
                  {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
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
                        <span className="order-product-name">{p.product?.name}</span>
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
}