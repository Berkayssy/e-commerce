import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
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
import LoginModal from '../components/LoginModal';

// Ensure that react-modal is properly configured
Modal.setAppElement('#root'); 

const ProductList = () => {
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
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  
  // Sidebar and layout states
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [sortBy, setSortBy] = useState('name'); // name, price, newest, popular
  
  // Filter states
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000000 });
  const [selectedBrand, setSelectedBrand] = useState('All Brands');
  const [stockFilter, setStockFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Collapsible sections states
  const [collapsedSections, setCollapsedSections] = useState({
    nav: false,
    categories: false,
    brands: false,
    price: false,
    stock: false,
    stats: false
  });
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginModalFeature, setLoginModalFeature] = useState('');

  const isAdmin = localStorage.getItem("role") === "admin";
  const isSeller = localStorage.getItem("role") === "seller";
  const { basket } = useBasket();
  const effectiveBasket = isAdmin ? [] : basket;
  const { searchTerm, selectedCategory, setSelectedCategory } = useSearch();
  const navigate = useNavigate();
  const pageRef = useRef(null);
  const location = useLocation();
  const { token, user, role } = useAuth();
  const [communityOwnerId, setCommunityOwnerId] = useState(null);
  const [communityName, setCommunityName] = useState('');
  const [communityLogo, setCommunityLogo] = useState(null);

  // Refs for stable references
  const sidebarOpenRef = useRef(sidebarOpen);
  const viewModeRef = useRef(viewMode);
  const sortByRef = useRef(sortBy);

  // Update refs when state changes
  useEffect(() => {
    sidebarOpenRef.current = sidebarOpen;
  }, [sidebarOpen]);

  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  useEffect(() => {
    sortByRef.current = sortBy;
  }, [sortBy]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    let communityId = params.get('communityId');
    const role = localStorage.getItem('role');
    const sellerCommunityId = localStorage.getItem('sellerCommunityId');
    if (!communityId) {
      if (role === 'seller' && sellerCommunityId) {
        navigate(`/products?communityId=${sellerCommunityId}`);
        return;
      } else if (role === 'seller') {
        // Seller ama communityId yoksa, kendi community'sini bul
        const fetchSellerCommunity = async () => {
          try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/sellers/my-community`, {
              headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
            });
            if (response.data.community) {
              navigate(`/products?communityId=${response.data.community._id}`);
              return;
            }
          } catch (error) {
            console.error('Error fetching seller community:', error);
          }
          navigate('/communities');
        };
        fetchSellerCommunity();
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
          // Anonim kullanıcılar için token olmadan istek yap
          const token = localStorage.getItem("token");
          const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
          const res = await axios.get(`${process.env.REACT_APP_API_URL}/products`, config);
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

  // Handlers
  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, []);



  const handleClearFilters = useCallback(() => {
    setSelectedCategory('All Categories');
    setSelectedBrand('All Brands');
    setStockFilter('All');
    setPriceRange({ min: 0, max: 1000000 });
    setSearchQuery('');
  }, [setSelectedCategory, setSelectedBrand, setStockFilter, setPriceRange, setSearchQuery]);

  const handleToggleSection = useCallback((section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

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

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    let filtered = products.filter((p) => {
      const nameMatch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                       p.name.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = selectedCategory === 'All Categories' || (p.category && p.category === selectedCategory);
      const priceMatch = p.price >= priceRange.min && p.price <= priceRange.max;
      const brandMatch = selectedBrand === 'All Brands' || (p.brand || 'Generic') === selectedBrand;
      const stockMatch = stockFilter === 'All' || 
        (stockFilter === 'In Stock' && p.stock > 0) || 
        (stockFilter === 'Out of Stock' && p.stock === 0);
      
      return nameMatch && categoryMatch && priceMatch && brandMatch && stockMatch;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'price':
          return a.price - b.price;
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'popular':
          return (b.stock || 0) - (a.stock || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchQuery, searchTerm, selectedCategory, priceRange, selectedBrand, stockFilter, sortBy]);

  // Kullanıcı mağaza sahibi mi?
  let isStoreOwner = false;
  try {
    if (communityOwnerId && token) {
      const tokenUserId = JSON.parse(atob(token.split('.')[1])).id;
      isStoreOwner = communityOwnerId === tokenUserId;
    }
    // Seller ise ve kendi community'sindeyse store owner olarak kabul et
    if (isSeller && communityOwnerId) {
      const sellerId = localStorage.getItem('sellerId');
      if (sellerId) {
        // Seller'ın kendi community'si olup olmadığını kontrol et
        isStoreOwner = true; // Seller kendi community'sinde ise store owner'dır
      }
    }
  } catch (e) {}

  // Categories for filter - grouped by type
  const categoryGroups = [
    {
      title: '🚗 Passenger Vehicles',
      categories: [
        { id: 'Luxury Car', name: 'Luxury Cars', icon: '💎' },
        { id: 'Sport Car', name: 'Sport Cars', icon: '🏎️' },
        { id: 'Classic Car', name: 'Classic Cars', icon: '🕰️' },
        { id: 'Hyper Car', name: 'Hyper Cars', icon: '🚀' },
        { id: 'Super Car', name: 'Super Cars', icon: '⚡' },
        { id: 'Exotic Car', name: 'Exotic Cars', icon: '🌟' },
        { id: 'Muscle Car', name: 'Muscle Cars', icon: '💪' },
        { id: 'Tuner Car', name: 'Tuner Cars', icon: '🔧' },
        { id: 'SUV', name: 'SUV', icon: '🚙' },
      ]
    },
    {
      title: '🏁 Performance & Racing',
      categories: [
        { id: 'Rally Car', name: 'Rally Cars', icon: '🏁' },
        { id: 'Drift Car', name: 'Drift Cars', icon: '🌀' },
        { id: 'Drag Car', name: 'Drag Cars', icon: '🏃' },
        { id: 'Off-Road', name: 'Off-Road', icon: '🏔️' },
      ]
    },
    {
      title: '🚛 Commercial & Industrial',
      categories: [
        { id: 'Pickup Truck', name: 'Pickup Trucks', icon: '🚛' },
        { id: 'Commercial', name: 'Commercial', icon: '🚚' },
        { id: 'Construction', name: 'Construction', icon: '🏗️' },
        { id: 'Agricultural', name: 'Agricultural', icon: '🚜' },
        { id: 'Mining', name: 'Mining', icon: '⛏️' },
        { id: 'Forestry', name: 'Forestry', icon: '🌲' },
      ]
    },
    {
      title: '🏍️ Two-Wheelers',
      categories: [
        { id: 'Motorcycle', name: 'Motorcycles', icon: '🏍️' },
        { id: 'Scooter', name: 'Scooters', icon: '🛵' },
        { id: 'ATV/UTV', name: 'ATV/UTV', icon: '🏎️' },
        { id: 'Snowmobile', name: 'Snowmobiles', icon: '❄️' },
      ]
    },
    {
      title: '🛥️ Marine & Aviation',
      categories: [
        { id: 'Marine', name: 'Marine', icon: '🛥️' },
        { id: 'Aviation', name: 'Aviation', icon: '✈️' },
        { id: 'Boat', name: 'Boats', icon: '🚤' },
        { id: 'Yacht', name: 'Yachts', icon: '🛥️' },
      ]
    },
    {
      title: '🔧 Parts & Services',
      categories: [
        { id: 'Parts & Accessories', name: 'Parts & Accessories', icon: '🔧' },
        { id: 'Tools & Equipment', name: 'Tools & Equipment', icon: '🛠️' },
        { id: 'Services', name: 'Services', icon: '🔧' },
      ]
    }
  ];

  // Flatten categories for filtering
  const categories = [
    { id: 'All Categories', name: 'All Categories', icon: '🏪' },
    ...categoryGroups.flatMap(group => group.categories)
  ];

  // Brands for filter
  const brands = [
    { id: 'All Brands', name: 'All Brands', icon: '🏷️' },
    { id: 'Mercedes', name: 'Mercedes', icon: '⭐' },
    { id: 'BMW', name: 'BMW', icon: '⭐' },
    { id: 'Ferrari', name: 'Ferrari', icon: '🏎️' },
    { id: 'Porsche', name: 'Porsche', icon: '🏎️' },
    { id: 'Audi', name: 'Audi', icon: '⭐' },
  ];

  if (!loading && products.length === 0 && isStoreOwner) {
    return (
      <div className="product-list-page">
        <div className="onboarding-welcome">
          <div className="welcome-logo">
            {communityLogo ? (
              <img src={communityLogo} alt="Store Logo" />
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
          <h2 className="welcome-title">Welcome, {communityName}!</h2>
          <p className="welcome-subtitle">
            Your store is ready. Add your first product now to start selling.
          </p>
          <button 
            className="welcome-btn"
            onClick={() => navigate(`/add-product?communityId=${new URLSearchParams(location.search).get('communityId')}`)}
          >
            Add Your First Product
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="product-list-page">
        <div className="product-loading-container">
          <LoadingSpinner />
          <div className="product-loading-text">Loading products...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-list-page">
        <div className="product-error-container">
          <ErrorMessage error={error} />
        </div>
      </div>
    );
  }

  return (
    <div className="product-list-page" ref={pageRef}>
      <div className="product-container">
        
        {/* Sidebar Toggle Button - Only for users and visitors */}
        {(role === 'user' || !role) && (
          <button
            className={`sidebar-toggle-btn ${!sidebarOpen ? 'collapsed' : ''}`}
            onClick={handleToggleSidebar}
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
            title={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            {sidebarOpen ? '◀' : '▶'}
          </button>
        )}
        
        {/* Sidebar - Only for users and visitors */}
        {(role === 'user' || !role) && (
          <div className={`product-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
          <div className="sidebar-content">
            
            {/* Store Info Section */}
            <div className="store-section">
              <div className="store-logo">
                {communityLogo ? (
                  <img src={communityLogo} alt="Store Logo" className="store-logo-img" />
                ) : (
                  <svg viewBox="0 0 32 32" width="40" height="40" fill="none" xmlns="http://www.w3.org/2000/svg" className="store-logo-svg">
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
              </div>
              <div className="store-info">
                <div className="store-name">{communityName || 'Store'}</div>
                <div className="store-status">
                  {isStoreOwner ? 'Owner' : 'Seller'}
                </div>
              </div>
            </div>

            {/* Navigation Section */}
            <div className={`nav-section ${collapsedSections.nav ? 'collapsed' : ''}`}>
              <h4 onClick={() => handleToggleSection('nav')}>Navigation</h4>
              
              <div 
                className="nav-item"
                onClick={() => navigate('/')}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
                tabIndex={0}
                role="button"
                aria-label="Go to home page"
              >
                <span className="nav-item-icon">🏠</span>
                <span className="nav-item-text">Home</span>
              </div>
              
              <div 
                className="nav-item"
                onClick={() => navigate('/communities')}
                onKeyDown={(e) => e.key === 'Enter' && navigate('/communities')}
                tabIndex={0}
                role="button"
                aria-label="Browse stores"
              >
                <span className="nav-item-icon">🏪</span>
                <span className="nav-item-text">Stores</span>
              </div>
              
              <div 
                className="nav-item"
                onClick={() => {
                  if (!user) {
                    setLoginModalFeature('favorites');
                    setLoginModalOpen(true);
                    return;
                  }
                  if (userId) {
                    navigate(`/user/${userId}/favorites`);
                  } else {
                    navigate('/login');
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (!user) {
                      setLoginModalFeature('favorites');
                      setLoginModalOpen(true);
                      return;
                    }
                    if (userId) {
                      navigate(`/user/${userId}/favorites`);
                    } else {
                      navigate('/login');
                    }
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label="View favorites"
              >
                <span className="nav-item-icon">❤️</span>
                <span className="nav-item-text">Favorites</span>
              </div>

              {user && (
                <>
                  <div 
                    className="nav-item"
                    onClick={() => {
                      if (userId) {
                        navigate(`/user/${userId}/orders`);
                      } else {
                        navigate('/login');
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (userId) {
                          navigate(`/user/${userId}/orders`);
                        } else {
                          navigate('/login');
                        }
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label="View your orders"
                  >
                    <span className="nav-item-icon">📦</span>
                    <span className="nav-item-text">My Orders</span>
                  </div>
                  
                  <div 
                    className="nav-item"
                    onClick={() => {
                      if (userId) {
                        navigate(`/user/${userId}/profile`);
                      } else {
                        navigate('/login');
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (userId) {
                          navigate(`/user/${userId}/profile`);
                        } else {
                          navigate('/login');
                        }
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label="View your profile"
                  >
                    <span className="nav-item-icon">👤</span>
                    <span className="nav-item-text">Profile</span>
                  </div>
                </>
              )}
            </div>



            {/* Categories Section */}
            <div className={`categories-section ${collapsedSections.categories ? 'collapsed' : ''}`}>
              <h4 onClick={() => handleToggleSection('categories')}>📂 Categories</h4>
              <div className="categories-list">
                {/* All Categories */}
                <div
                  className={`category-item ${selectedCategory === 'All Categories' ? 'active' : ''}`}
                  onClick={() => setSelectedCategory('All Categories')}
                  onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory('All Categories')}
                  tabIndex={0}
                  role="button"
                  aria-label="Show all categories"
                >
                  <span className="category-icon">🏪</span>
                  <span className="category-name">All Categories</span>
                </div>
                
                {/* Category Groups */}
                {categoryGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="category-group">
                    <div className="category-group-title">{group.title}</div>
                    {group.categories.map(category => (
                      <div
                        key={category.id}
                        className={`category-item category-sub-item ${selectedCategory === category.id ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(category.id)}
                        onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory(category.id)}
                        tabIndex={0}
                        role="button"
                        aria-label={`Filter by ${category.name}`}
                      >
                        <span className="category-icon">{category.icon}</span>
                        <span className="category-name">{category.name}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Brands Section */}
            <div className={`brands-section ${collapsedSections.brands ? 'collapsed' : ''}`}>
              <h4 onClick={() => handleToggleSection('brands')}>🏷️ Brands</h4>
              <div className="brands-list">
                {brands.map(brand => (
                  <div
                    key={brand.id}
                    className={`brand-item ${selectedBrand === brand.id ? 'active' : ''}`}
                    onClick={() => setSelectedBrand(brand.id)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedBrand(brand.id)}
                    tabIndex={0}
                    role="button"
                    aria-label={`Filter by ${brand.name}`}
                  >
                    <span className="brand-icon">{brand.icon}</span>
                    <span className="brand-name">{brand.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range Section */}
            <div className={`price-section ${collapsedSections.price ? 'collapsed' : ''}`}>
              <h4 onClick={() => handleToggleSection('price')}>💰 Price Range</h4>
              <div className="price-range-container">
                <div className="price-input-group">
                  <input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({...priceRange, min: Number(e.target.value)})}
                    className="price-input"
                  />
                  <span className="price-separator">to</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({...priceRange, max: Number(e.target.value)})}
                    className="price-input"
                  />
                </div>
              </div>
            </div>

            {/* Stock Filter Section */}
            <div className={`stock-section ${collapsedSections.stock ? 'collapsed' : ''}`}>
              <h4 onClick={() => handleToggleSection('stock')}>📦 Stock Status</h4>
              <div className="stock-filter-options">
                <label className="stock-filter-option">
                  <input 
                    type="radio" 
                    name="stock" 
                    value="All" 
                    checked={stockFilter === 'All'} 
                    onChange={(e) => setStockFilter(e.target.value)} 
                  />
                  <span className="radio-custom"></span>
                  All Products
                </label>
                <label className="stock-filter-option">
                  <input 
                    type="radio" 
                    name="stock" 
                    value="In Stock" 
                    checked={stockFilter === 'In Stock'} 
                    onChange={(e) => setStockFilter(e.target.value)} 
                  />
                  <span className="radio-custom"></span>
                  In Stock
                </label>
                <label className="stock-filter-option">
                  <input 
                    type="radio" 
                    name="stock" 
                    value="Out of Stock" 
                    checked={stockFilter === 'Out of Stock'} 
                    onChange={(e) => setStockFilter(e.target.value)} 
                  />
                  <span className="radio-custom"></span>
                  Out of Stock
                </label>
              </div>
            </div>

            {/* Quick Stats */}
            <div className={`stats-section ${collapsedSections.stats ? 'collapsed' : ''}`}>
              <h4 onClick={() => handleToggleSection('stats')}>📊 Quick Stats</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">{products.length}</div>
                  <div className="stat-label">Total Products</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{filteredProducts.length}</div>
                  <div className="stat-label">Showing</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">
                    {products.filter(p => p.stock > 0).length}
                  </div>
                  <div className="stat-label">In Stock</div>
                </div>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="clear-filters-section">
              <button 
                className="clear-filters-btn"
                onClick={handleClearFilters}
              >
                Clear All Filters
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Main Content */}
        <div className="product-main">
          {/* Header with search and controls */}
          <div className="product-header">
            <div className="header-left">
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                <h2 className="product-title">
                  Products ({filteredProducts.length})
                </h2>
              </div>
              
              {searchQuery && (
                <div className="search-results-info">
                  Showing results for "{searchQuery}"
                </div>
              )}
              {selectedCategory !== 'All Categories' && (
                <div className="category-filter-info">
                  Filtered by: {categories.find(c => c.id === selectedCategory)?.name}
                </div>
              )}
              {selectedBrand !== 'All Brands' && (
                <div className="brand-filter-info">
                  Brand: {brands.find(b => b.id === selectedBrand)?.name}
                </div>
              )}
            </div>
            
            <div className="header-controls">
              {/* Product Search Bar */}
              <div className="product-search-section">
                <div className="product-search-container">
                  <input
                    type="text"
                    className="product-search-input"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && searchQuery.trim()) {
                        // Search functionality is already handled by the onChange
                      }
                    }}
                    autoComplete="off"
                  />
                </div>
              </div>
              
              {/* Sort Dropdown */}
              <select 
                value={sortBy} 
                onChange={handleSortChange}
                className="sort-select"
              >
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="newest">Sort by Newest</option>
                <option value="popular">Sort by Popularity</option>
              </select>
              
              {/* View Mode Toggle */}
              <div className="view-mode-toggle">
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => handleViewModeChange('grid')}
                  title="Grid view"
                >
                  ⊞
                </button>
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => handleViewModeChange('list')}
                  title="List view"
                >
                  ☰
                </button>
              </div>
            </div>
          </div>
          
          {/* Products Grid/List */}
          <div className={`product-grid ${viewMode === 'list' ? 'list-view' : ''} ${filteredProducts.length === 1 ? 'single-product' : ''}`}>
            {filteredProducts.length === 0 ? (
              <div className="product-empty-state">
                <div className="empty-icon">📦</div>
                <div className="empty-title">
                  {searchQuery ? 'No products found' : 'No products available'}
                </div>
                <div className="empty-subtitle">
                  {searchQuery 
                    ? `No products match "${searchQuery}"` 
                    : 'Check back later for new products'
                  }
                </div>

              </div>
            ) : (
              filteredProducts.map((product, index) => (
                                 <div
                   key={product._id}
                   className={`product-card ${(!isAdmin && effectiveBasket.some(b => b._id === product._id)) ? 'in-basket' : ''} ${viewMode === 'list' ? 'list-card' : ''}`}
                   onClick={() => !isAdmin && navigate(`/products/${product._id}`)}
                   style={{
                     cursor: !isAdmin ? 'pointer' : 'default',
                     animationDelay: `${index * 0.05}s`
                   }}
                 >
                  <div className="product-card-header">
                    <img
                      src={product.images && product.images.length > 0 ? product.images[0] : product.imageUrl || '/placeholder-image.png'}
                      alt={product.name}
                      className="product-image"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.png';
                      }}
                    />
                    <div className="product-overlay" />
                    
                    {/* Stock Badge */}
                    <div className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                      {product.stock} {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                    </div>
                    
                    {/* Action Buttons */}
                    {(isAdmin || (isSeller && isStoreOwner)) && (
                      <div className="product-actions">
                        <button
                          className="edit-btn"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            navigate(`/edit-product/${product._id}`); 
                          }}
                          aria-label={`Edit ${product.name}`}
                          tabIndex={-1}
                        >
                          ✏️
                        </button>
                        
                        <button
                          className="delete-btn"
                          onClick={(e) => { 
                            e.stopPropagation(); 
                            setDeleteConfirmId(product._id); 
                          }}
                          aria-label={`Delete ${product.name}`}
                          tabIndex={-1}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                  
                  <div className="product-card-body">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-description">
                      {product.description || 'No description available.'}
                    </p>
                    
                    {/* Product Stats */}
                    <div className="product-stats">
                      <span className="stat-badge category-badge">📂 {product.category}</span>
                      <span className="stat-badge brand-badge">🏷️ {product.brand || 'Generic'}</span>
                      <span className="stat-badge price-badge">💰 ${Number(product.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    
                    {/* Additional info for list view */}
                    {viewMode === 'list' && (
                      <div className="product-meta">
                        <span className="meta-item">📅 Created recently</span>
                        <span className="meta-item">⭐ Popular</span>
                        {product.category && (
                          <span className="meta-item">{categories.find(c => c.id === product.category)?.icon} {product.category}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="delete-confirmation-overlay">
          <div className="delete-confirmation-modal">
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
        className="product-modal"
        overlayClassName="product-modal-overlay"
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
      
      {/* Login Modal for Visitors */}
      <LoginModal 
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        feature={loginModalFeature}
      />
    </div>
  );
};

export default ProductList;       