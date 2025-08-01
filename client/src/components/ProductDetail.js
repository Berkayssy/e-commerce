import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from 'react-modal';
import { useBasket } from '../contexts/BasketContext';
import { useGsap } from '../contexts/GsapContext';
import { useAuth } from '../contexts/AuthContext';
import "./ProductDetail.css";
import { FaBolt, FaGasPump, FaCogs, FaRoad, FaTachometerAlt, FaCarSide, FaPalette, FaShieldAlt, FaCheckCircle, FaMoneyBillWave, FaMapMarkerAlt, FaWarehouse } from 'react-icons/fa';
import OrderModal from '../modals/OrderModal';
import { addToFavorites, removeFromFavorites, checkFavorite } from '../api/api';

Modal.setAppElement('#root');

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  // Get userId from token if available
  const getUserId = () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.id;
      } catch (e) {
        return null;
      }
    }
    return null;
  };
  const userId = getUserId();

  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isShowroomModalOpen, setIsShowroomModalOpen] = useState(false);
  const [isTestDriveModalOpen, setIsTestDriveModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const { addToBasket, removeFromBasket, basket } = useBasket();
  const { productDetailRefs } = useGsap();
  const { pageRef, imageRef, contentRef } = productDetailRefs;
  const { role, token } = useAuth();
  
  // Token'ı localStorage'dan da kontrol et
  const localToken = localStorage.getItem('token');
  const effectiveToken = token || localToken;
  
  // Favorite state
  const [isFavorited, setIsFavorited] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  // Seller'ın kendi communityId'si
  let sellerCommunityId = null;
  if (role === 'seller') {
    sellerCommunityId = localStorage.getItem('sellerCommunityId');
  }
  // Admin veya seller için ürünün communityId'sini kullan
  const productCommunityId = product?.communityId || sellerCommunityId;
  
  // Seller'ın kendi ürünü olup olmadığını kontrol et
  const isOwnProduct = role === 'seller' && sellerCommunityId && product?.communityId === sellerCommunityId;
  
  // Seller için sidebar'ı kapat
  useEffect(() => {
    if (role === 'seller') {
      // Navbar'daki sidebar'ı kapat
      const sidebarToggle = document.querySelector('.sidebar-toggle-btn');
      if (sidebarToggle) {
        const sidebar = document.querySelector('.sidebar');
        if (sidebar && sidebar.classList.contains('open')) {
          sidebarToggle.click();
        }
      }
    }
  }, [role]);

  // --- Tab state and tab names in English ---
  const [activeTab, setActiveTab] = useState('features');
  const tabNames = [
    { key: 'features', label: 'Features' },
    { key: 'technical', label: 'Technical Details' },
    { key: 'seller', label: 'Seller Info' },
    { key: 'showroom', label: '360° Showroom' },
    { key: 'testdrive', label: 'Test Drive' },
    { key: 'chat', label: 'Chat with Seller' },
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // Anonim kullanıcılar için token olmadan istek yap
        const token = localStorage.getItem("token");
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/products/${id}`, config);
        setProduct(res.data.product);
      } catch (err) {
        setError("Failed to load product details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Check if product is favorited when product loads
  useEffect(() => {
    const checkFavoriteStatus = async () => {
      if (effectiveToken && product) {
        try {
          const response = await checkFavorite(product._id, userId);
          setIsFavorited(response.isFavorited);
        } catch (error) {
          console.error('Error checking favorite status:', error);
        }
      }
    };
    
    checkFavoriteStatus();
  }, [effectiveToken, product, userId]);

  useEffect(() => {
    if (product) setCurrentImageIndex(0);
  }, [product]);

  const productImages = product?.images && product.images.length > 0 
    ? product.images 
    : (product?.imageUrl ? [product.imageUrl] : []);

  const goToNextSlide = () => setCurrentImageIndex((prev) => (prev + 1) % productImages.length);
  const goToPrevSlide = () => setCurrentImageIndex((prev) => (prev - 1 + productImages.length) % productImages.length);
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);
  
  // Token kontrolü ile buton işlevleri
  const handleAddToBasket = () => {
    if (!effectiveToken) {
      window.location.href = '/login';
      return;
    }
    addToBasket(product);
  };
  
  const handleBuyNow = () => {
    if (!effectiveToken) {
      window.location.href = '/login';
      return;
    }
    addToBasket(product);
    setIsOrderModalOpen(true);
  };
  
  const isInBasket = product && basket.some((item) => item._id === product._id);

  // Handle favorite toggle
  const handleFavoriteToggle = async () => {
    if (!effectiveToken) {
      window.location.href = '/login';
      return;
    }

    if (!product) return;

    setFavoriteLoading(true);
    try {
      if (isFavorited) {
        await removeFromFavorites(product._id, userId);
        setIsFavorited(false);
      } else {
        await addToFavorites(product._id, userId);
        setIsFavorited(true);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  // Handle delete product
  const handleDeleteProduct = async () => {
    if (!effectiveToken) {
      window.location.href = '/login';
      return;
    }

    if (!product) return;

    try {
      await axios.delete(`${process.env.REACT_APP_API_URL}/products/${product._id}`, {
        headers: { Authorization: `Bearer ${effectiveToken}` }
      });
      setIsDeleteModalOpen(false);
      navigate('/products');
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product. Please try again.');
    }
  };
  


  if (loading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="product-loading-container">
            <div className="product-loading-spinner"></div>
            <p>Loading product details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="product-error-container">
            <p className="product-error-message">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="product-error-container">
            <p className="product-error-message">Product not found</p>
          </div>
        </div>
      </div>
    );
  }

  // Extract brand from product name (same logic as ProductList.js)
  const extractBrandFromName = (productName) => {
    if (!productName) return 'Generic';
    
    const name = productName.toLowerCase();
    const brandNames = [
      'Mercedes', 'BMW', 'Maserati', 'Ferrari', 'Porsche', 'Audi', 
      'Lamborghini', 'Bentley', 'Rolls-Royce', 'Aston Martin', 
      'McLaren', 'Bugatti', 'Pagani', 'Koenigsegg', 'Chevrolet'
    ];
    
    // Check for brand matches in product name
    for (const brandName of brandNames) {
      const brandLower = brandName.toLowerCase();
      if (name.includes(brandLower)) {
        return brandName;
      }
    }
    
    // Special cases
    if (name.includes('aston') && name.includes('martin')) {
      return 'Aston Martin';
    } else if (name.includes('rolls') && name.includes('royce')) {
      return 'Rolls-Royce';
    } else if (name.includes('chevrolet') || name.includes('chevy')) {
      return 'Chevrolet';
    } else if (name.includes('porche') || name.includes('porsch')) {
      return 'Porsche';
    }
    
    return product?.brand || 'Generic';
  };

  const extractedBrand = extractBrandFromName(product?.name);
  const extractedModel = product?.name?.replace(new RegExp(extractedBrand, 'gi'), '').trim() || 'N/A';

  // 1. Ürün detayları için yeni alanlar
  const extendedDetails = [
    { label: 'Brand', value: extractedBrand },
    { label: 'Model', value: extractedModel },
    { label: 'Discount', value: product?.discount ? `%${product.discount}` : 'No discount' },
    { label: 'Features', value: product?.features?.join(', ') || 'Standard' },
    { label: 'Extra Info', value: product?.extraInfo || '-' },
  ];

  // --- Alt detay grid için zenginleştirilmiş alanlar ve ikonlar ---
  const bottomDetails = [
    { label: 'Horsepower', value: product?.horsepower ? `${product.horsepower} HP` : 'N/A', icon: <FaBolt /> },
    { label: 'Model Year', value: product?.modelYear || '2022', icon: <FaCarSide /> },
    { label: 'Gallery', value: product?.galleryName || 'Auto Gallery', icon: <FaWarehouse /> },
    { label: 'Location', value: product?.location || 'Istanbul, Turkey', icon: <FaMapMarkerAlt />, isLocation: true },
    { label: 'Fuel Type', value: product?.fuelType || 'Petrol', icon: <FaGasPump /> },
    { label: 'Transmission', value: product?.transmission || 'Automatic', icon: <FaCogs /> },
    { label: 'Drivetrain', value: product?.drivetrain || 'FWD', icon: <FaRoad /> },
    { label: 'Mileage', value: product?.mileage ? `${product.mileage} km` : '0 km', icon: <FaTachometerAlt /> },
    { label: 'Body Type', value: product?.bodyType || 'Sedan', icon: <FaCarSide /> },
    { label: 'Color', value: product?.color || 'Black', icon: <FaPalette /> },
    { label: 'Warranty', value: product?.warranty || 'Available', icon: <FaShieldAlt /> },
    { label: 'Expertise', value: product?.expertise || 'Full', icon: <FaCheckCircle /> },
    { label: 'Price Type', value: product?.priceType || 'Negotiable', icon: <FaMoneyBillWave /> },
  ];
  const mapsQuery = encodeURIComponent(product?.location || 'Istanbul, Turkey');
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${mapsQuery}`;

  // Format price with thousands separator and two decimals
  const formattedPrice = product?.price ? new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(product.price) : '';

  return (
    <div className="page-container" ref={pageRef}>
      <div className="page-content">
        <div className="product-detail-container">
          {role === 'user' ? (
            <Link to="/communities" className="back-link btn">
              <span role="img" aria-label="back">←</span>
              Back to Stores
            </Link>
          ) : (productCommunityId ? (
            <Link to={`/products?communityId=${productCommunityId}`} className="back-link btn">
              <span role="img" aria-label="back">←</span>
              Back to Products
            </Link>
          ) : (
            <Link to="/products" className="back-link btn">
              <span role="img" aria-label="back">←</span>
              Back to Products
            </Link>
          ))}
          




          {/* Professional 3-Section Grid Layout */}
          <div className="product-detail-professional-grid">
            {/* Section 1: Image Card */}
            <div className="image-section-card" ref={contentRef}>
              <div className="product-detail-horizontal-imgwrap">
                <img
                  className="product-detail-horizontal-img"
                  src={productImages[currentImageIndex] || '/placeholder-image.png'}
                  alt={product.name}
                  onError={e => { e.target.src = '/placeholder-image.png'; }}
                  onClick={openModal}
                  ref={imageRef}
                  style={{ cursor: 'zoom-in' }}
                />
                {productImages.length > 1 && (
                  <button className="slider-arrow left-arrow" onClick={goToPrevSlide}>
                    <span role="img" aria-label="previous">←</span>
                  </button>
                )}
                {productImages.length > 1 && (
                  <button className="slider-arrow right-arrow" onClick={goToNextSlide}>
                    <span role="img" aria-label="next">→</span>
                  </button>
                )}
              </div>
              {/* Thumbnails below main image */}
              <div className="product-thumbnails-row">
                {productImages.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    className={`product-thumbnail${idx === currentImageIndex ? ' active' : ''}`}
                    onClick={() => setCurrentImageIndex(idx)}
                  />
                ))}
              </div>
            </div>

                      {/* Section 2: Content Card */}
          <div className="content-section-card" ref={contentRef}>
            <div className="product-info">
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px'
              }}>
                <h1 className="product-name">{product.name}</h1>
                
                {/* Admin/Seller Action Buttons */}
                {(role === 'admin' || role === 'seller') && (
                  <div className="product-action-buttons" style={{
                    display: 'flex',
                    gap: '8px',
                    alignItems: 'center'
                  }}>
                    <button
                      className="edit-btn"
                      onClick={() => navigate(`/edit-product/${product._id}`)}
                      style={{
                        background: 'linear-gradient(135deg, #f59e42 0%, #f97316 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 8px rgba(245, 158, 66, 0.3)',
                        transition: 'all 0.2s ease',
                        minWidth: 'fit-content'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 66, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(245, 158, 66, 0.3)';
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => setIsDeleteModalOpen(true)}
                      style={{
                        background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                        transition: 'all 0.2s ease',
                        minWidth: 'fit-content'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                )}
              </div>
                

                <div className="product-meta">
                  <span className="product-category">{product.category}</span>
                  <span className="product-stock">Stock: {product.stock}</span>
                </div>
                {/* Brand Information */}
                <div className="product-brand-info">
                  <div className="brand-item">
                    <span className="brand-label">Brand:</span>
                    <span className="brand-value">{extractedBrand}</span>
                  </div>
                  <div className="brand-item">
                    <span className="brand-label">Model:</span>
                    <span className="brand-value">{extractedModel}</span>
                  </div>
                  {product?.modelYear && (
                    <div className="brand-item">
                      <span className="brand-label">Year:</span>
                      <span className="brand-value">{product.modelYear}</span>
                    </div>
                  )}
                </div>
                <div className="product-price price price-xl">{formattedPrice}</div>
                <div className="product-description">{product.description}</div>
              </div>
              <div style={{display: 'flex', flexDirection: 'column', gap: '12px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)', marginTop: 'auto', width: '100%', minHeight: '120px'}}>
                {!effectiveToken ? (
                  <>
                    <button
                      style={{width: '100%', maxWidth: '280px', margin: '0 auto', padding: '12px 20px', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', color: '#ffffff', minHeight: '48px', background: 'linear-gradient(135deg, #6366f1 0%, #be185d 100%)', boxShadow: '0 2px 8px rgba(99,102,241,0.2)', zIndex: 999}}
                      onClick={() => window.location.href = '/register'}
                    >
                      🛒 Sign Up to Add to Basket
                    </button>
                    <button
                      style={{width: '100%', maxWidth: '280px', margin: '0 auto', padding: '12px 20px', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', color: '#ffffff', minHeight: '48px', background: 'linear-gradient(135deg, #f59e42 0%, #be185d 100%)', boxShadow: '0 2px 8px rgba(245,158,66,0.2)', zIndex: 999}}
                      onClick={() => window.location.href = '/register'}
                    >
                      ⚡ Sign Up to Buy Now
                    </button>
                  </>
                ) : role === 'seller' ? (
                  // Seller hiçbir ürünü satın alamaz
                  <div style={{textAlign: 'center', padding: '20px', color: '#b3b8c5'}}>
                    <div style={{fontSize: '24px', marginBottom: '8px'}}>🏪</div>
                    <p>{isOwnProduct ? 'Your Product' : 'Seller Account'}</p>
                    <p style={{fontSize: '14px', opacity: 0.7}}>
                      {isOwnProduct ? 'This is your own product listing' : 'Sellers cannot purchase products'}
                    </p>
                  </div>
                ) : (
                  <>
                    <button
                      style={{width: '100%', maxWidth: '280px', margin: '0 auto', padding: '12px 20px', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', color: '#ffffff', minHeight: '48px', background: isInBasket ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #6366f1 0%, #be185d 100%)', boxShadow: '0 2px 8px rgba(99,102,241,0.2)', zIndex: 999}}
                      onClick={isInBasket ? () => removeFromBasket(product._id) : handleAddToBasket}
                    >
                      {isInBasket ? '🗑️ Remove from Basket' : '🛒 Add to Basket'}
                    </button>
                    <button
                      style={{width: '100%', maxWidth: '280px', margin: '0 auto', padding: '12px 20px', fontSize: '16px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', borderRadius: '8px', border: 'none', cursor: 'pointer', color: '#ffffff', minHeight: '48px', background: 'linear-gradient(135deg, #f59e42 0%, #be185d 100%)', boxShadow: '0 2px 8px rgba(245,158,66,0.2)', zIndex: 999}}
                      onClick={handleBuyNow}
                    >
                      ⚡ Buy Now
                    </button>
                    <button
                      style={{
                        width: '100%', 
                        maxWidth: '280px', 
                        margin: '0 auto', 
                        padding: '12px 20px', 
                        fontSize: '16px', 
                        fontWeight: 600, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '8px', 
                        borderRadius: '8px', 
                        border: 'none', 
                        cursor: favoriteLoading ? 'not-allowed' : 'pointer', 
                        color: '#ffffff', 
                        minHeight: '48px', 
                        background: isFavorited ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 'linear-gradient(135deg, #f472b6 0%, #be185d 100%)', 
                        boxShadow: '0 2px 8px rgba(244,114,182,0.2)', 
                        zIndex: 999,
                        opacity: favoriteLoading ? 0.7 : 1
                      }}
                      onClick={handleFavoriteToggle}
                      disabled={favoriteLoading}
                    >
                      {favoriteLoading ? '⏳' : (isFavorited ? '❤️ Remove from Favorites' : '🤍 Add to Favorites')}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Section 3: Full Width Details Section */}
            <div className="details-section-fullwidth">
              {/* Tabs */}
              <div className="product-detail-tabs">
                <div className="tab-menu">
                  {tabNames.map(tab => (
                    <button
                      key={tab.key}
                      className={activeTab === tab.key ? 'active' : ''}
                      onClick={() => setActiveTab(tab.key)}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
                <div className="tab-content">
                  {activeTab === 'features' && (
                    <div>
                      <div className="product-extended-details">
                        {extendedDetails.map((detail, idx) => (
                          <div className="product-detail-row" key={idx}>
                            <span className="detail-label">{detail.label}:</span>
                            <span className="detail-value">{detail.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeTab === 'technical' && (
                    <div>
                      <div className="product-bottom-details-grid">
                        {bottomDetails.map((detail, idx) => (
                          <div className="bottom-detail-item" key={idx}>
                            <span className="bottom-detail-icon">{detail.icon}</span>
                            <span className="bottom-detail-label">{detail.label}</span>
                            <span className="bottom-detail-value">{detail.isLocation ? (
                              <a href={mapsUrl} target="_blank" rel="noopener noreferrer">{detail.value}</a>
                            ) : detail.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {activeTab === 'seller' && (
                    <div className="product-seller-info">
                      <div><b>Seller:</b> {product?.galleryName || 'Auto Gallery'}</div>
                      <div><b>Location:</b> <a href={mapsUrl} target="_blank" rel="noopener noreferrer">{product?.location || 'Istanbul, Turkey'}</a></div>
                      <div><b>Phone:</b> {product?.sellerPhone || '+90 555 555 55 55'}</div>
                      <div><b>Email:</b> {product?.sellerEmail || 'info@autogallery.com'}</div>
                    </div>
                  )}
                  {activeTab === 'showroom' && (
                    <div className="product-showroom-section">
                      <div style={{textAlign: 'center', padding: '20px'}}>
                        <h3 style={{color: '#fff', marginBottom: '20px'}}>360° Virtual Showroom</h3>
                        <div style={{background: 'rgba(24,26,32,0.8)', borderRadius: '12px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)'}}>
                          <div style={{fontSize: '48px', marginBottom: '16px'}}>🏎️</div>
                          <p style={{color: '#b3b8c5', marginBottom: '20px', fontSize: '16px'}}>
                            Experience the 360° virtual showroom for this vehicle. 
                            Explore every angle of the car in detail.
                          </p>
                          <button 
                            style={{
                              background: 'linear-gradient(135deg, #6366f1 0%, #be185d 100%)',
                              color: '#fff',
                              border: 'none',
                              padding: '12px 24px',
                              borderRadius: '8px',
                              fontSize: '16px',
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              margin: '0 auto'
                            }}
                            onClick={() => setIsShowroomModalOpen(true)}
                          >
                            🎥 Open 360° Showroom
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'testdrive' && (
                    <div className="product-testdrive-section">
                      <div style={{textAlign: 'center', padding: '20px'}}>
                        <h3 style={{color: '#fff', marginBottom: '20px'}}>Test Drive Booking</h3>
                        <div style={{background: 'rgba(24,26,32,0.8)', borderRadius: '12px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)'}}>
                          <div style={{fontSize: '48px', marginBottom: '16px'}}>🚗</div>
                          <p style={{color: '#b3b8c5', marginBottom: '20px', fontSize: '16px'}}>
                            Book an appointment to test drive this vehicle. 
                            Our expert team will arrange the most suitable time for you.
                          </p>
                          <div style={{display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto'}}>
                            <button 
                              style={{
                                background: 'linear-gradient(135deg, #f59e42 0%, #be185d 100%)',
                                color: '#fff',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                              }}
                              onClick={() => setIsTestDriveModalOpen(true)}
                            >
                              📅 Book Test Drive
                            </button>
                            <button 
                              style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: '#fff',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                              }}
                              onClick={() => window.open('tel:+905555555555', '_blank')}
                            >
                              📞 Call Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'chat' && (
                    <div className="product-chat-section">
                      <div style={{textAlign: 'center', padding: '20px'}}>
                        <h3 style={{color: '#fff', marginBottom: '20px'}}>Chat with Seller</h3>
                        <div style={{background: 'rgba(24,26,32,0.8)', borderRadius: '12px', padding: '30px', border: '1px solid rgba(255,255,255,0.05)'}}>
                          <div style={{fontSize: '48px', marginBottom: '16px'}}>💬</div>
                          <p style={{color: '#b3b8c5', marginBottom: '20px', fontSize: '16px'}}>
                            Start a conversation with the seller to ask questions about this vehicle. 
                            Get instant responses and detailed information.
                          </p>
                          <div style={{display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '300px', margin: '0 auto'}}>
                            <button 
                              style={{
                                background: 'linear-gradient(135deg, #6366f1 0%, #be185d 100%)',
                                color: '#fff',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                              }}
                              onClick={() => setIsChatModalOpen(true)}
                            >
                              💬 Start Chat
                            </button>
                            <button 
                              style={{
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                color: '#fff',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                              }}
                              onClick={() => window.open('https://wa.me/905555555555?text=Hi! I am interested in the ' + encodeURIComponent(product?.name || 'vehicle'), '_blank')}
                            >
                              📱 WhatsApp
                            </button>
                            <button 
                              style={{
                                background: 'linear-gradient(135deg, #f59e42 0%, #be185d 100%)',
                                color: '#fff',
                                border: 'none',
                                padding: '12px 24px',
                                borderRadius: '8px',
                                fontSize: '16px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '8px'
                              }}
                              onClick={() => window.open('mailto:info@autogallery.com?subject=Inquiry about ' + encodeURIComponent(product?.name || 'vehicle'), '_blank')}
                            >
                              📧 Send Email
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Modal */}
          <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            className="product-image-modal large-modal"
            overlayClassName="product-image-overlay"
          >
            <button onClick={closeModal} className="modal-close-btn">×</button>
            <img
              src={productImages[currentImageIndex] || '/placeholder-image.png'}
              alt={product.name}
              className="modal-image large-image"
            />
            {productImages.length > 1 && (
              <button className="modal-slider-arrow modal-left-arrow" onClick={goToPrevSlide}>←</button>
            )}
            {productImages.length > 1 && (
              <button className="modal-slider-arrow modal-right-arrow" onClick={goToNextSlide}>→</button>
            )}
          </Modal>

          {/* Order Modal */}
          {isOrderModalOpen && (
            <OrderModal
              isOpen={isOrderModalOpen}
              onClose={() => setIsOrderModalOpen(false)}
              product={product}
            />
          )}

          {/* Delete Confirmation Modal */}
          {isDeleteModalOpen && (
            <div className="delete-confirmation-overlay" style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              backdropFilter: 'blur(4px)'
            }}>
              <div className="delete-confirmation-modal" style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '400px',
                width: '90%',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                position: 'relative'
              }}>
                <button 
                  onClick={() => setIsDeleteModalOpen(false)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#fff'}
                  onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                >
                  ×
                </button>
                
                <div style={{textAlign: 'center', marginBottom: '24px'}}>
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '16px',
                    filter: 'drop-shadow(0 4px 8px rgba(239, 68, 68, 0.3))'
                  }}>
                    🗑️
                  </div>
                  <h3 style={{
                    margin: '0 0 12px 0',
                    color: '#fff',
                    fontSize: '20px',
                    fontWeight: 600
                  }}>
                    Delete Product
                  </h3>
                  <p style={{
                    margin: 0,
                    color: '#94a3b8',
                    fontSize: '14px',
                    lineHeight: '1.5'
                  }}>
                    Are you sure you want to delete <strong style={{color: '#fff'}}>{product.name}</strong>? 
                    This action cannot be undone.
                  </p>
                </div>
                
                <div style={{
                  display: 'flex',
                  gap: '12px',
                  justifyContent: 'center'
                }}>
                  <button
                    onClick={() => setIsDeleteModalOpen(false)}
                    style={{
                      background: 'rgba(148, 163, 184, 0.1)',
                      border: '1px solid rgba(148, 163, 184, 0.3)',
                      color: '#94a3b8',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.background = 'rgba(148, 163, 184, 0.2)';
                      e.target.style.color = '#fff';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.background = 'rgba(148, 163, 184, 0.1)';
                      e.target.style.color = '#94a3b8';
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteProduct}
                    style={{
                      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                      border: 'none',
                      color: '#fff',
                      padding: '12px 24px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                    }}
                  >
                    Delete Product
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 360° Showroom Modal */}
          {isShowroomModalOpen && (
            <div className="feature-modal-overlay" style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              backdropFilter: 'blur(4px)'
            }}>
              <div className="feature-modal" style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '500px',
                width: '90%',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                position: 'relative'
              }}>
                <button 
                  onClick={() => setIsShowroomModalOpen(false)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#fff'}
                  onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                >
                  ×
                </button>
                
                <div style={{textAlign: 'center'}}>
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '16px',
                    filter: 'drop-shadow(0 4px 8px rgba(99, 102, 241, 0.3))'
                  }}>
                    🏎️
                  </div>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    color: '#fff',
                    fontSize: '24px',
                    fontWeight: 600
                  }}>
                    360° Virtual Showroom
                  </h3>
                  <p style={{
                    margin: '0 0 24px 0',
                    color: '#94a3b8',
                    fontSize: '16px',
                    lineHeight: '1.6'
                  }}>
                    Experience the 360° virtual showroom for this vehicle. 
                    Explore every angle of the car in detail with our immersive viewing technology.
                  </p>
                  <div style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                    border: '1px solid rgba(99, 102, 241, 0.2)'
                  }}>
                    <p style={{
                      margin: 0,
                      color: '#cbd5e1',
                      fontSize: '14px',
                      fontStyle: 'italic'
                    }}>
                      🚧 This feature is coming soon! You'll be able to explore the vehicle in 360° view with interactive controls.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsShowroomModalOpen(false)}
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #be185d 100%)',
                      border: 'none',
                      color: '#fff',
                      padding: '12px 32px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
                    }}
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Test Drive Modal */}
          {isTestDriveModalOpen && (
            <div className="feature-modal-overlay" style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              backdropFilter: 'blur(4px)'
            }}>
              <div className="feature-modal" style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '500px',
                width: '90%',
                border: '1px solid rgba(245, 158, 66, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                position: 'relative'
              }}>
                <button 
                  onClick={() => setIsTestDriveModalOpen(false)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#fff'}
                  onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                >
                  ×
                </button>
                
                <div style={{textAlign: 'center'}}>
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '16px',
                    filter: 'drop-shadow(0 4px 8px rgba(245, 158, 66, 0.3))'
                  }}>
                    🚗
                  </div>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    color: '#fff',
                    fontSize: '24px',
                    fontWeight: 600
                  }}>
                    Test Drive Booking
                  </h3>
                  <p style={{
                    margin: '0 0 24px 0',
                    color: '#94a3b8',
                    fontSize: '16px',
                    lineHeight: '1.6'
                  }}>
                    Book an appointment to test drive this vehicle. 
                    Our expert team will arrange the most suitable time for you.
                  </p>
                  <div style={{
                    background: 'rgba(245, 158, 66, 0.1)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                    border: '1px solid rgba(245, 158, 66, 0.2)'
                  }}>
                    <p style={{
                      margin: 0,
                      color: '#cbd5e1',
                      fontSize: '14px',
                      fontStyle: 'italic'
                    }}>
                      🚧 Test drive booking feature is coming soon! You'll be able to schedule appointments directly through the platform.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsTestDriveModalOpen(false)}
                    style={{
                      background: 'linear-gradient(135deg, #f59e42 0%, #be185d 100%)',
                      border: 'none',
                      color: '#fff',
                      padding: '12px 32px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(245, 158, 66, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(245, 158, 66, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 66, 0.3)';
                    }}
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Chat Modal */}
          {isChatModalOpen && (
            <div className="feature-modal-overlay" style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
              backdropFilter: 'blur(4px)'
            }}>
              <div className="feature-modal" style={{
                background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                borderRadius: '16px',
                padding: '32px',
                maxWidth: '500px',
                width: '90%',
                border: '1px solid rgba(244, 114, 182, 0.3)',
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
                position: 'relative'
              }}>
                <button 
                  onClick={() => setIsChatModalOpen(false)}
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '4px',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#fff'}
                  onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
                >
                  ×
                </button>
                
                <div style={{textAlign: 'center'}}>
                  <div style={{
                    fontSize: '48px',
                    marginBottom: '16px',
                    filter: 'drop-shadow(0 4px 8px rgba(244, 114, 182, 0.3))'
                  }}>
                    💬
                  </div>
                  <h3 style={{
                    margin: '0 0 16px 0',
                    color: '#fff',
                    fontSize: '24px',
                    fontWeight: 600
                  }}>
                    Chat with Seller
                  </h3>
                  <p style={{
                    margin: '0 0 24px 0',
                    color: '#94a3b8',
                    fontSize: '16px',
                    lineHeight: '1.6'
                  }}>
                    Start a conversation with the seller to ask questions about this vehicle. 
                    Get instant responses and detailed information.
                  </p>
                  <div style={{
                    background: 'rgba(244, 114, 182, 0.1)',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '24px',
                    border: '1px solid rgba(244, 114, 182, 0.2)'
                  }}>
                    <p style={{
                      margin: 0,
                      color: '#cbd5e1',
                      fontSize: '14px',
                      fontStyle: 'italic'
                    }}>
                      🚧 Chat feature is coming soon! You'll be able to start real-time conversations with sellers directly through the platform.
                    </p>
                  </div>
                  <button
                    onClick={() => setIsChatModalOpen(false)}
                    style={{
                      background: 'linear-gradient(135deg, #f472b6 0%, #be185d 100%)',
                      border: 'none',
                      color: '#fff',
                      padding: '12px 32px',
                      borderRadius: '8px',
                      fontSize: '16px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(244, 114, 182, 0.3)'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 6px 16px rgba(244, 114, 182, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(244, 114, 182, 0.3)';
                    }}
                  >
                    Got it!
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;