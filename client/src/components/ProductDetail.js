import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Modal from 'react-modal';
import { useBasket } from '../contexts/BasketContext';
import { useGsap } from '../contexts/GsapContext';
import "./ProductDetail.css";
import { FaShoppingCart, FaTrash, FaBolt, FaGasPump, FaCogs, FaRoad, FaTachometerAlt, FaCarSide, FaPalette, FaShieldAlt, FaCheckCircle, FaMoneyBillWave, FaMapMarkerAlt, FaWarehouse } from 'react-icons/fa';

Modal.setAppElement('#root');

const ProductDetail = () => {
  const { id } = useParams();
  const [error, setError] = useState(null);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addToBasket, removeFromBasket, basket } = useBasket();
  const { productDetailRefs } = useGsap();
  const { pageRef, imageRef, contentRef, actionsRef } = productDetailRefs;

  // --- Tab state and tab names in English ---
  const [activeTab, setActiveTab] = useState('features');
  const tabNames = [
    { key: 'features', label: 'Features' },
    { key: 'technical', label: 'Technical Details' },
    { key: 'seller', label: 'Seller Info' },
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/products/${id}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setProduct(res.data.product);
      } catch (err) {
        setError("Failed to load product details. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

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
  const handleAddToBasket = () => addToBasket(product);
  const isInBasket = product && basket.some((item) => item._id === product._id);

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
          <Link to="/products" className="back-link btn">
            <span role="img" aria-label="back">←</span>
            Back to Products
          </Link>
          
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
                <h1 className="product-name">{product.name}</h1>
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
              <div className="product-actions" ref={actionsRef}>
                <button
                  className={`action-btn btn btn-modern${isInBasket ? '' : ' btn-primary'}`}
                  onClick={isInBasket ? () => removeFromBasket(product._id) : handleAddToBasket}
                >
                  {isInBasket ? <FaTrash /> : <FaShoppingCart />}
                  {isInBasket ? "Remove from Basket" : "Add to Basket"}
                </button>
                <button
                  className="action-btn btn btn-modern btn-accent"
                  onClick={() => {
                    addToBasket(product);
                    window.location.href = '/basket';
                  }}
                >
                  <FaBolt />
                  Buy Now
                </button>
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
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;