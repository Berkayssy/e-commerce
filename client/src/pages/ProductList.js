import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import "./ProductList.css";
import { useBasket } from "../contexts/BasketContext";
import Modal from 'react-modal';
import { useSearch } from '../contexts/SearchContext';
import useGsapFadeIn from '../components/common/useGsapFadeIn';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { getProductsByCommunity } from '../api/api';
import { useAuth } from '../contexts/AuthContext';

// Ensure that react-modal is properly configured
// If you already have it in index.js or App.js, you can remove it from here.
Modal.setAppElement('#root'); 

const ProductList = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  // Filter states
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [stockFilter, setStockFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const isAdmin = localStorage.getItem("role") === "admin";
  const isUser = localStorage.getItem("role") === "user";
  const { basket } = useBasket();
  const effectiveBasket = isAdmin ? [] : basket;
  const { searchTerm, selectedCategory } = useSearch();
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const location = useLocation();
  const { token } = useAuth();
  const [communityOwnerId, setCommunityOwnerId] = useState(null);
  const [communityName, setCommunityName] = useState('');
  const [communityLogo, setCommunityLogo] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let communityId = params.get('communityId');
    const role = localStorage.getItem('role');
    const sellerCommunityId = localStorage.getItem('sellerCommunityId');
    if (!communityId) {
      if (role === 'seller' && sellerCommunityId) {
        navigate(`/products?communityId=${sellerCommunityId}`);
        return;
      } else {
        navigate('/communities');
        return;
      }
    }
    const fetchProducts = async () => {
      try {
        setError(null);
        setLoading(true);
        let productsData;
        if (communityId) {
          // Community bilgisi de çek
          const res = await getProductsByCommunity(communityId);
          productsData = res.products;
          // Ek: community owner bilgisini de al
          if (res.community) {
            setCommunityOwnerId(res.community.owner);
            setCommunityName(res.community.name || 'Your Store');
            setCommunityLogo(res.community.logoUrl || null);
          }
        } else {
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/products`, {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          });
          productsData = res.data.products;
        }
        
        // Extract brand from product names and update products
        const productsWithBrands = productsData.map(product => {
          const name = product.name || '';
          let brand = 'Generic';
          
          // Extract brand from product name
          const brandNames = [
            'Mercedes', 'BMW', 'Maserati', 'Ferrari', 'Porsche', 'Audi', 
            'Lamborghini', 'Bentley', 'Rolls-Royce', 'Aston Martin', 
            'McLaren', 'Bugatti', 'Pagani', 'Koenigsegg', 'Chevrolet'
          ];
          
          // Check for brand matches in product name
          const nameLower = name.toLowerCase();
          for (const brandName of brandNames) {
            const brandLower = brandName.toLowerCase();
            // Check if brand name appears anywhere in the product name
            if (nameLower.includes(brandLower)) {
              brand = brandName;
              break;
            }
          }
          
          // Special case for "Aston Martin" (two words)
          if (nameLower.includes('aston') && nameLower.includes('martin')) {
            brand = 'Aston Martin';
          }
          // Special case for "Rolls-Royce" (with hyphen)
          else if (nameLower.includes('rolls') && nameLower.includes('royce')) {
            brand = 'Rolls-Royce';
          }
          // Special case for "Chevrolet" (common variations)
          else if (nameLower.includes('chevrolet') || nameLower.includes('chevy')) {
            brand = 'Chevrolet';
          }
          // Special case for "Porsche" (common misspellings)
          else if (nameLower.includes('porche') || nameLower.includes('porsch')) {
            brand = 'Porsche';
          }
          
          return {
            ...product,
            brand: (product.brand && product.brand !== 'Generic') ? product.brand : brand
          };
        });
        
        setProducts(productsWithBrands);
      } catch (err) {
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [location.search, navigate]);

  // GSAP animations
  useGsapFadeIn(pageRef, { 
    duration: 0.6, 
    y: 20,
    delay: 0.1 
  });

  const handleDelete = async (id) => {
    try {
      setError(null);
      await axios.delete(`${process.env.REACT_APP_API_URL}/products/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setProducts(products.filter((p) => p._id !== id));
      setDeleteConfirmId(null);
    } catch (err) {
      setError("Failed to delete product. Please try again.");
      setDeleteConfirmId(null);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setCurrentImageIndex(0);
  };

  const productImagesInModal = selectedProduct?.images && selectedProduct.images.length > 0 
    ? selectedProduct.images 
    : (selectedProduct?.imageUrl ? [selectedProduct.imageUrl] : []);

  const goToNextSlideModal = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex + 1) % productImagesInModal.length
    );
  };

  const goToPrevSlideModal = () => {
    setCurrentImageIndex((prevIndex) => 
      (prevIndex - 1 + productImagesInModal.length) % productImagesInModal.length
    );
  };

  // Get unique brands from products
  const uniqueBrands = [
    'All Brands',
    'Mercedes',
    'BMW',
    'Maserati',
    'Ferrari',
    'Porsche',
    'Audi',
    'Lamborghini',
    'Bentley',
    'Rolls-Royce',
    'Aston Martin',
    'McLaren',
    'Bugatti',
    'Pagani',
    'Koenigsegg',
    'Chevrolet',
    'Generic'
  ];

  // Filtered products with all filters
  const filteredProducts = products.filter((p) => {
    const nameMatch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = selectedCategory === 'All Categories' || (p.category && p.category === selectedCategory);
    const priceMatch = p.price >= priceRange.min && p.price <= priceRange.max;
    const brandMatch = selectedBrand === 'All Brands' || (p.brand || 'Generic') === selectedBrand;
    const stockMatch = stockFilter === 'All' || 
      (stockFilter === 'In Stock' && p.stock > 0) || 
      (stockFilter === 'Out of Stock' && p.stock === 0);
    
    return nameMatch && categoryMatch && priceMatch && brandMatch && stockMatch;
  });

  const clearFilters = () => {
    setPriceRange({ min: 0, max: 1000000 });
    setSelectedBrand('All Brands');
    setStockFilter('All');
  };

  // Kullanıcı mağaza sahibi mi?
  let isStoreOwner = false;
  try {
    if (communityOwnerId && token) {
      const userId = JSON.parse(atob(token.split('.')[1])).id;
      isStoreOwner = communityOwnerId === userId;
    }
  } catch (e) {}

  if (!loading && products.length === 0 && isStoreOwner) {
    return (
      <div className="onboarding-welcome" style={{
        textAlign: 'center',
        marginTop: 60,
        background: 'rgba(20,22,40,0.92)',
        borderRadius: 18,
        boxShadow: '0 6px 32px #818cf822, 0 1.5px 0 #c084fc33',
        padding: '44px 28px 36px 28px',
        maxWidth: 480,
        marginLeft: 'auto',
        marginRight: 'auto',
        border: '2.5px solid',
        borderImage: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%) 1',
        position: 'relative',
      }}>
        <div style={{marginBottom: 18, display: 'flex', justifyContent: 'center'}}>
          {communityLogo ? (
            <img src={communityLogo} alt="Store Logo" style={{width: 54, height: 54, borderRadius: 12, boxShadow: '0 2px 12px #c084fc33', objectFit: 'cover', background: '#fff'}} />
          ) : (
            <svg viewBox="0 0 32 32" width="44" height="44" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="diamondWelcome" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#f7c873" />
                  <stop offset="0.5" stopColor="#c084fc" />
                  <stop offset="1" stopColor="#818cf8" />
                </linearGradient>
              </defs>
              <polygon points="16,4 28,12 16,28 4,12" fill="url(#diamondWelcome)" stroke="#fff" strokeWidth="1.2" />
              <polygon points="16,8 24,13 16,24 8,13" fill="#fff" fillOpacity="0.18" />
            </svg>
          )}
        </div>
        <h2 style={{
          fontWeight: 900,
          fontSize: '2.25rem',
          background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.01em',
          marginBottom: 10,
          textShadow: '0 2px 16px #c084fc22, 0 1px 0 #fff2',
        }}>Welcome, {communityName}!</h2>
        <p style={{
          color: '#cbd5e1',
          fontSize: '1.13rem',
          marginBottom: 28,
          fontWeight: 500,
          letterSpacing: '-0.01em',
          textShadow: '0 1px 0 #fff1',
        }}>
          Your store is ready. Add your first product now to start selling.
        </p>
        <button className="luxury-btn" style={{
          marginTop: 8,
          padding: '12px 32px',
          fontSize: 18,
          boxShadow: '0 0 16px 2px #c084fc44, 0 2px 12px #818cf822',
          borderRadius: 10,
          border: 'none',
          fontWeight: 700,
          letterSpacing: '-0.01em',
          background: 'linear-gradient(90deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
          color: '#fff',
          transition: 'box-shadow 0.18s',
        }} onClick={() => navigate(`/add-product?communityId=${new URLSearchParams(location.search).get('communityId')}`)}>
          Add Your First Product
        </button>
      </div>
    );
  }

  if (loading) {
    return <LoadingSpinner message="Loading products..." />;
  }

  if (error) {
    return (
      <div className="product-error-container">
        <ErrorMessage error={error} />
      </div>
    );
  }

  return (
    <div className="product-list-page" ref={pageRef}>
      {/* Filter Toggle Button for Mobile */}
      {isUser && (
        <div className="filter-toggle-container">
          <button 
            className="filter-toggle-btn"
            onClick={() => setShowFilters(!showFilters)}
          >
            <span role="img" aria-label="filter">🔍</span>
            Filters {showFilters ? '−' : '+'}
          </button>
        </div>
      )}

      <div className="product-list-container">
        {/* Filters Sidebar (only for users) */}
        {isUser && (
          <div className="filters-sidebar" style={{alignItems: 'center', textAlign: 'center', gap: 18}}>
            {/* Mağaza adı ve logo en üstte */}
            {communityLogo ? (
              <img src={communityLogo} alt="Store Logo" style={{width: 54, height: 54, borderRadius: 12, boxShadow: '0 2px 12px #c084fc33', objectFit: 'cover', background: '#fff', marginBottom: 8, marginTop: 2}} />
            ) : (
              <svg viewBox="0 0 32 32" width="44" height="44" fill="none" xmlns="http://www.w3.org/2000/svg" style={{marginBottom: 8, marginTop: 2}}>
                <defs>
                  <linearGradient id="diamondSidebar" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#f7c873" />
                    <stop offset="0.5" stopColor="#c084fc" />
                    <stop offset="1" stopColor="#818cf8" />
                  </linearGradient>
                </defs>
                <polygon points="16,4 28,12 16,28 4,12" fill="url(#diamondSidebar)" stroke="#fff" strokeWidth="1.2" />
                <polygon points="16,8 24,13 16,24 8,13" fill="#fff" fillOpacity="0.18" />
              </svg>
            )}
            <div style={{fontWeight: 900, fontSize: '1.18rem', background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text', letterSpacing: '-0.01em', marginBottom: 8}}>{communityName || 'Your Store'}</div>
          </div>
        )}

        {/* Products Grid (always visible) */}
        <div className="products-content">
          <div className="product-grid">
            {filteredProducts.length === 0 ? (
              <div className="product-error-container" style={{gridColumn: '1/-1', textAlign: 'center'}}>
                <ErrorMessage error="No products found for the selected filters." />
              </div>
            ) : (
              filteredProducts.map((product) => (
                <div key={product._id} className={`product-card${(!isAdmin && effectiveBasket.some(b => b._id === product._id)) ? ' in-basket' : ''}`} onClick={() => !isAdmin && navigate(`/products/${product._id}`)} style={!isAdmin ? { cursor: 'pointer' } : {}}>
                  <div className="product-image-wrapper">
                    <span className={`stock-badge-absolute ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {product.stock} {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </span>
                    <img
                      src={product.images && product.images.length > 0 ? product.images[0] : product.imageUrl || '/placeholder-image.png'}
                      alt={product.name}
                      className="product-image"
                    />
                  </div>
                  <div className="product-info-section">
                    <div className="product-header-row">
                      <span className="product-name">{product.name}</span>
                      <span className="product-category prominent">{product.category}</span>
                    </div>
                    <div className="product-brand-row">
                      <span className="product-brand">{product.brand || 'Generic'}</span>
                    </div>
                    <div className="product-price-row">
                      <span className="product-price">
                        ${Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="product-description-card">{product.description}</div>
                  </div>
                  {isAdmin && (
                    <div className="product-actions-section">
                      <button className="icon-btn edit-btn" onClick={(e) => { e.stopPropagation(); navigate(`/edit-product/${product._id}`); }} title="Edit">
                        <span role="img" aria-label="edit">✏️</span>
                      </button>
                      <button className="icon-btn delete-btn" onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(product._id); }} title="Delete">
                        <span role="img" aria-label="delete">🗑️</span>
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="delete-confirmation-overlay analytics-modal-overlay">
          <div className="delete-confirmation-modal modern-modal analytics-modal">
            <button className="modal-close-btn" onClick={() => setDeleteConfirmId(null)} title="Close">×</button>
            <h3 className="modal-title delete-title">Delete Product</h3>
            <p className="delete-desc">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="delete-confirmation-actions">
              <button onClick={() => handleDelete(deleteConfirmId)} className="action-btn prominent delete-btn-modal">Delete</button>
              <button onClick={() => setDeleteConfirmId(null)} className="action-btn">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Product Detail Modal */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        className="product-modal analytics-modal"
        overlayClassName="product-modal-overlay analytics-modal-overlay"
      >
        <button onClick={closeModal} className="modal-close-btn">×</button>
        {selectedProduct && (
          <>
            <div className="modal-image-wrapper">
              <span className={`stock-badge-absolute ${selectedProduct.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                {selectedProduct.stock} {selectedProduct.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
              <img 
                src={productImagesInModal[currentImageIndex] || '/placeholder-image.png'}
                alt={selectedProduct.name}
                className="modal-image"
              />
            </div>
            <div className="modal-product-details">
              <h2 className="modal-title">{selectedProduct.name}</h2>
              <div className="modal-product-category">{selectedProduct.category}</div>
              <div className="modal-product-brand">{selectedProduct.brand || 'Generic'}</div>
              <div className="modal-product-price">
                ${Number(selectedProduct.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="modal-product-description-card">{selectedProduct.description}</div>
            </div>
            {productImagesInModal.length > 1 && (
              <>
                <button className="modal-slider-arrow modal-left-arrow" onClick={goToPrevSlideModal}>←</button>
                <button className="modal-slider-arrow modal-right-arrow" onClick={goToNextSlideModal}>→</button>
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default ProductList;       