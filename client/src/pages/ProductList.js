import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./ProductList.css";
import { useBasket } from "../contexts/BasketContext";
import Modal from 'react-modal';
import { useSearch } from '../contexts/SearchContext';
import useGsapFadeIn from '../components/common/useGsapFadeIn';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

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
  const { basket } = useBasket();
  const effectiveBasket = isAdmin ? [] : basket;
  const { searchTerm, selectedCategory } = useSearch();
  const navigate = useNavigate();
  const pageRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setError(null);
        const res = await axios.get(`${process.env.REACT_APP_API_URL}/products`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        
        // Extract brand from product names and update products
        const productsWithBrands = res.data.products.map(product => {
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
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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
      console.error("Error deleting product:", err);
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
      {!isAdmin && (
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
        {!isAdmin && (
          <div className={`filters-sidebar${showFilters ? ' show' : ''}`}>
            <div className="filters-header">
              <h3>Filters</h3>
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear All
              </button>
            </div>

            {/* Price Range Filter */}
            <div className="filter-section">
              <h4>Price Range</h4>
              <div className="price-range-container">
                <div className="price-input-group">
                  <label>Min: ${priceRange.min.toLocaleString('en-US')}</label>
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                    className="price-slider"
                  />
                </div>
                <div className="price-input-group">
                  <label>Max: ${priceRange.max.toLocaleString('en-US')}</label>
                  <input
                    type="range"
                    min="0"
                    max="1000000"
                    step="10000"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                    className="price-slider"
                  />
                </div>
              </div>
            </div>

            {/* Brand Filter */}
            <div className="filter-section">
              <h4>Brand</h4>
              <select 
                value={selectedBrand} 
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="filter-select"
              >
                {uniqueBrands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Stock Filter */}
            <div className="filter-section">
              <h4>Stock Status</h4>
              <div className="stock-filter-options">
                {['All', 'In Stock', 'Out of Stock'].map(status => (
                  <label key={status} className="stock-filter-option">
                    <input
                      type="radio"
                      name="stockFilter"
                      value={status}
                      checked={stockFilter === status}
                      onChange={(e) => setStockFilter(e.target.value)}
                    />
                    <span className="radio-custom"></span>
                    {status}
                  </label>
                ))}
              </div>
            </div>

            {/* Results Count */}
            <div className="results-count">
              {filteredProducts.length} of {products.length} products
            </div>
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