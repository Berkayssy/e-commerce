import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBasket } from '../contexts/BasketContext';
import useGsapFadeIn from '../components/common/useGsapFadeIn';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { getUserFavorites, removeFromFavorites } from '../api/api';
import './Favorites.css';

const Favorites = () => {
  const { userId } = useParams();
  const { token } = useAuth();
  const { basket, addToBasket, removeFromBasket } = useBasket();
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [sortBy, setSortBy] = useState('name'); // name, price, date
  const [searchQuery, setSearchQuery] = useState('');
  
  // GSAP refs
  const pageRef = useRef(null);
  const headerRef = useRef(null);
  const favoritesRef = useRef(null);
  const favoriteCardsRef = useRef([]);

  // GSAP animations
  useGsapFadeIn([pageRef, headerRef, favoritesRef], { 
    stagger: 0.2, 
    duration: 0.6, 
    y: 30 
  });

  useGsapFadeIn(favoriteCardsRef.current, { 
    stagger: 0.1, 
    duration: 0.5, 
    y: 30,
    delay: 0.4 
  });

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }



    // Load favorites from API
    const loadFavorites = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // userId ile API çağrısı yap
        const response = await getUserFavorites(userId);
        if (response.success) {
          // Transform the data to match our component structure
          const transformedFavorites = response.favorites.map(fav => ({
            _id: fav.product._id,
            name: fav.product.name,
            price: fav.product.price,
            category: fav.product.category,
            brand: fav.product.brand,
            stock: fav.product.stock,
            imageUrl: fav.product.images && fav.product.images.length > 0 ? fav.product.images[0].url : null,
            description: fav.product.description,
            createdAt: fav.addedAt
          }));
          setFavorites(transformedFavorites);
        } else {
          setError('Failed to load favorites. Please try again.');
        }
      } catch (err) {
        console.error('Error loading favorites:', err);
        setError('Failed to load favorites. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadFavorites();
  }, [token, navigate, userId]);

  const handleRemoveFavorite = async (productId) => {
    try {
      // userId ile API çağrısı yap
      const response = await removeFromFavorites(productId, userId);
      if (response.success) {
        setFavorites(prev => prev.filter(fav => fav._id !== productId));
      } else {
        setError('Failed to remove from favorites. Please try again.');
      }
    } catch (err) {
      console.error('Error removing from favorites:', err);
      setError('Failed to remove from favorites. Please try again.');
    }
  };

  const handleAddToBasket = (product) => {
    addToBasket(product);
  };

  const handleRemoveFromBasket = (productId) => {
    removeFromBasket(productId);
  };

  const isInBasket = (productId) => {
    return basket.some(item => item._id === productId);
  };

  // Filtered and sorted favorites
  const filteredFavorites = useMemo(() => {
    return favorites.filter(fav => 
      fav.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fav.category.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });
  }, [favorites, searchQuery, sortBy]);

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="favorites-loading-container">
            <LoadingSpinner message="Loading your favorites..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className="favorites-error-container">
            <ErrorMessage error={error} />
          </div>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="page-container" ref={pageRef}>
        <div className="page-content">
          <div className="favorites-empty-state">
            <div className="empty-icon">❤️</div>
            <h2>No Favorites Yet</h2>
            <p>You haven't added any products to your favorites yet. Start exploring to find products you love!</p>
            <button onClick={() => navigate('/communities')} className="explore-btn">
              Explore Stores
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container" ref={pageRef}>
      <div className="page-content">
        <div className="favorites-header" ref={headerRef}>
          <div className="header-left">
            <h1>
              My Favorites
            </h1>
            <p>Your saved products ({filteredFavorites.length})</p>
          </div>
          
          <div className="header-controls">
            {/* Search */}
            <div className="search-container">
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="clear-search-btn"
                >
                  ×
                </button>
              )}
            </div>
            
            {/* Sort */}
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="sort-select"
            >
              <option value="name">Sort by Name</option>
              <option value="price">Sort by Price</option>
              <option value="date">Sort by Date Added</option>
            </select>
            
            {/* View Mode */}
            <div className="view-mode-toggle">
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Grid view"
              >
                ⊞
              </button>
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
                title="List view"
              >
                ☰
              </button>
            </div>
          </div>
        </div>

        <div className="favorites-container" ref={favoritesRef}>
          {filteredFavorites.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>No favorites found</h3>
              <p>Try adjusting your search or browse all products</p>
              <button onClick={() => setSearchQuery('')} className="clear-filters-btn">
                Clear Search
              </button>
            </div>
          ) : (
            <div className={`favorites-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
              {filteredFavorites.map((product, index) => (
                <div 
                  key={product._id} 
                  className={`favorite-card ${viewMode === 'list' ? 'list-card' : ''}`}
                  ref={el => favoriteCardsRef.current[index] = el}
                >
                  <div className="card-header">
                    <img
                      src={product.imageUrl || '/placeholder-image.png'}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.png';
                      }}
                    />
                    <div className="product-overlay" />
                    
                    {/* Stock Badge */}
                    <div className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
                    </div>
                    
                    {/* Remove from Favorites */}
                    <button
                      className="remove-favorite-btn"
                      onClick={() => handleRemoveFavorite(product._id)}
                      title="Remove from favorites"
                    >
                      ❌
                    </button>
                  </div>
                  
                  <div className="card-body">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">{product.description}</p>
                    
                    <div className="product-meta">
                      <span className="category-badge">📂 {product.category}</span>
                      <span className="brand-badge">🏷️ {product.brand}</span>
                      <span className="price-badge">💰 ${product.price.toLocaleString()}</span>
                    </div>
                    
                    <div className="card-actions">
                      <button
                        className={`basket-btn ${isInBasket(product._id) ? 'in-basket' : ''}`}
                        onClick={() => isInBasket(product._id) 
                          ? handleRemoveFromBasket(product._id)
                          : handleAddToBasket(product)
                        }
                        disabled={product.stock === 0}
                      >
                        {isInBasket(product._id) ? '🗑️ Remove from Basket' : '🛒 Add to Basket'}
                      </button>
                      
                      <button
                        className="view-details-btn"
                        onClick={() => navigate(`/products/${product._id}`)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Favorites; 