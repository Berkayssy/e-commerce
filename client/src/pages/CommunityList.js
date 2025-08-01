import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { getCommunities } from '../api/api';
import { useNavigate, useLocation } from 'react-router-dom';
import './CommunityList.css';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import LoginModal from '../components/LoginModal';

const placeholderImg = 'https://ui-avatars.com/api/?name=Store&background=818cf8&color=fff&size=128&rounded=true';

const CommunityList = () => {
  const { role, user } = useAuth();
  const sellerCommunityId = typeof window !== 'undefined' ? localStorage.getItem('sellerCommunityId') : null;
  const navigate = useNavigate();
  const location = useLocation();
  
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
  
  // State management
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [communities, setCommunities] = useState([]);
  const [filteredCommunities, setFilteredCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name'); // name, id, newest
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showFavorites, setShowFavorites] = useState(false);
  
  // Infinite scroll states
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Favorites and interactions
  const [favorites, setFavorites] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  
  // Collapsible sections states
  const [collapsedSections, setCollapsedSections] = useState({
    nav: false,
    categories: false,
    favorites: false,
    recentlyViewed: false,
    stats: false,
    newListings: false
  });
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [loginModalFeature, setLoginModalFeature] = useState('');

  // Refs for stable references
  const pageRef = useRef(page);
  const loadingMoreRef = useRef(loadingMore);
  const hasMoreRef = useRef(hasMore);
  const isInitialLoadRef = useRef(isInitialLoad);
  const lastLoadedPageRef = useRef(0);

  // Update refs when state changes
  useEffect(() => {
    pageRef.current = page;
  }, [page]);

  useEffect(() => {
    loadingMoreRef.current = loadingMore;
  }, [loadingMore]);

  useEffect(() => {
    hasMoreRef.current = hasMore;
  }, [hasMore]);

  useEffect(() => {
    isInitialLoadRef.current = isInitialLoad;
  }, [isInitialLoad]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('communityFavorites');
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
  }, []);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('communityFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Seller/Admin redirect
  useEffect(() => {
    if (role === 'seller' && sellerCommunityId) {
      navigate(`/products?communityId=${sellerCommunityId}`);
    } else if (role === 'admin') {
      navigate('/dashboard');
    }
  }, [role, sellerCommunityId, navigate]);

  // Fetch communities - stable function
  const fetchCommunities = useCallback(async (pageNum = 1, append = false) => {
    try {
      // Prevent duplicate requests
      if (pageNum <= lastLoadedPageRef.current && !isInitialLoadRef.current) {
        return;
      }

      if (pageNum === 1) {
        setLoading(true);
        setError(null);
        setIsInitialLoad(true);
      } else {
        setLoadingMore(true);
      }
      
      const data = await getCommunities();
      const newCommunities = data.communities || [];
      
      // Check if we got new data
      if (newCommunities.length === 0 || (pageNum > 1 && newCommunities.length === communities.length)) {
        setHasMore(false);
        return;
      }
      
      if (append) {
        setCommunities(prev => {
          // Prevent duplicates
          const existingIds = new Set(prev.map(c => c._id));
          const uniqueNewCommunities = newCommunities.filter(c => !existingIds.has(c._id));
          return [...prev, ...uniqueNewCommunities];
        });
      } else {
        setCommunities(newCommunities);
      }
      
      // Update last loaded page
      lastLoadedPageRef.current = pageNum;
      
      // Set hasMore based on whether we got new data
      setHasMore(newCommunities.length > 0 && newCommunities.length >= 10); // Assuming 10 is page size
      
    } catch (err) {
      console.error('Error fetching communities:', err);
      setError('Failed to load stores. Please try again later.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setIsInitialLoad(false);
    }
  }, [communities.length]);

  // Initial fetch
  useEffect(() => {
    fetchCommunities(1, false);
  }, [fetchCommunities]);

  // Filter and sort communities
  const processedCommunities = useMemo(() => {
    let filtered = communities;

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(community => 
        community.category === selectedCategory || 
        community.tags?.includes(selectedCategory)
      );
    }

    // Favorites filter
    if (showFavorites) {
      filtered = filtered.filter(community => 
        favorites.includes(community._id)
      );
    }

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(community =>
        community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        community.transId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (community.description && community.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'id':
          return a.transId.localeCompare(b.transId);
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'popular':
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [communities, searchQuery, sortBy, selectedCategory, showFavorites, favorites]);

  // Update filtered communities
  useEffect(() => {
    setFilteredCommunities(processedCommunities);
  }, [processedCommunities]);

  // Infinite scroll handler - stable function
  const handleScroll = useCallback(() => {
    if (loadingMoreRef.current || !hasMoreRef.current || isInitialLoadRef.current) return;
    
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    if (scrollTop + windowHeight >= documentHeight - 200) {
      const nextPage = pageRef.current + 1;
      
      // Prevent duplicate requests
      if (nextPage > lastLoadedPageRef.current) {
        setPage(nextPage);
        fetchCommunities(nextPage, true);
      }
    }
  }, [fetchCommunities]);

  // Scroll event listener
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  // Handlers
  const handleSelect = useCallback((communityId) => {
    setSelectedCommunity(communityId);
    
    // Add to recently viewed
    setRecentlyViewed(prev => {
      const newList = [communityId, ...prev.filter(id => id !== communityId)].slice(0, 5);
      return newList;
    });
    
    setTimeout(() => {
      navigate(`/products?communityId=${communityId}`);
    }, 150);
  }, [navigate]);

  const handleToggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  const handleNavigation = useCallback((path) => {
    navigate(path);
  }, [navigate]);

  const handleSignIn = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  const handleSearchChange = useCallback((e) => {
    setSearchQuery(e.target.value);
  }, []);

  const handleSortChange = useCallback((e) => {
    setSortBy(e.target.value);
  }, []);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
  }, []);

  const handleRetry = useCallback(() => {
    setPage(1);
    setHasMore(true);
    lastLoadedPageRef.current = 0;
    fetchCommunities(1, false);
  }, [fetchCommunities]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const handleCategoryChange = useCallback((category) => {
    setSelectedCategory(category);
  }, []);

  const handleToggleFavorites = useCallback(() => {
    setShowFavorites(prev => !prev);
  }, []);

  const handleToggleFavorite = useCallback((communityId, e) => {
    e.stopPropagation();
    setFavorites(prev => {
      if (prev.includes(communityId)) {
        return prev.filter(id => id !== communityId);
      } else {
        return [...prev, communityId];
      }
    });
  }, []);

  const handleQuickView = useCallback((communityId, e) => {
    e.stopPropagation();
    // Quick view modal logic here
    console.log('Quick view:', communityId);
  }, []);

  const handleToggleSection = useCallback((section) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Categories (mock data - replace with real categories) - grouped by type
  const categoryGroups = [
    {
      title: '🚗 Passenger Vehicles',
      categories: [
        { id: 'luxury', name: 'Luxury Cars', icon: '💎' },
        { id: 'sport', name: 'Sport Cars', icon: '🏎️' },
        { id: 'vintage', name: 'Vintage Cars', icon: '🕰️' },
        { id: 'hyper', name: 'Hyper Cars', icon: '🚀' },
        { id: 'super', name: 'Super Cars', icon: '⚡' },
        { id: 'classic', name: 'Classic Cars', icon: '🎭' },
        { id: 'exotic', name: 'Exotic Cars', icon: '🌟' },
        { id: 'muscle', name: 'Muscle Cars', icon: '💪' },
        { id: 'tuner', name: 'Tuner Cars', icon: '🔧' },
        { id: 'suv', name: 'SUV', icon: '🚙' },
      ]
    },
    {
      title: '🏁 Performance & Racing',
      categories: [
        { id: 'rally', name: 'Rally Cars', icon: '🏁' },
        { id: 'drift', name: 'Drift Cars', icon: '🌀' },
        { id: 'drag', name: 'Drag Cars', icon: '🏃' },
        { id: 'offroad', name: 'Off-Road', icon: '🏔️' },
      ]
    },
    {
      title: '🚛 Commercial & Industrial',
      categories: [
        { id: 'pickup', name: 'Pickup Trucks', icon: '🚛' },
        { id: 'commercial', name: 'Commercial', icon: '🚚' },
        { id: 'construction', name: 'Construction', icon: '🏗️' },
        { id: 'agricultural', name: 'Agricultural', icon: '🚜' },
        { id: 'mining', name: 'Mining', icon: '⛏️' },
        { id: 'forestry', name: 'Forestry', icon: '🌲' },
      ]
    },
    {
      title: '🏍️ Two-Wheelers',
      categories: [
        { id: 'motorcycle', name: 'Motorcycles', icon: '🏍️' },
        { id: 'scooter', name: 'Scooters', icon: '🛵' },
        { id: 'atv', name: 'ATV/UTV', icon: '🏎️' },
        { id: 'snowmobile', name: 'Snowmobiles', icon: '❄️' },
      ]
    },
    {
      title: '🛥️ Marine & Aviation',
      categories: [
        { id: 'marine', name: 'Marine', icon: '🛥️' },
        { id: 'aviation', name: 'Aviation', icon: '✈️' },
        { id: 'boat', name: 'Boats', icon: '🚤' },
        { id: 'yacht', name: 'Yachts', icon: '🛥️' },
      ]
    },
    {
      title: '🔧 Parts & Services',
      categories: [
        { id: 'parts', name: 'Parts & Accessories', icon: '🔧' },
        { id: 'tools', name: 'Tools & Equipment', icon: '🛠️' },
        { id: 'services', name: 'Services', icon: '🔧' },
      ]
    }
  ];

  // Flatten categories for filtering
  const categories = [
    { id: 'all', name: 'All Stores', icon: '🏪' },
    ...categoryGroups.flatMap(group => group.categories)
  ];

  // Loading state
  if (loading) {
    return (
      <div className="community-list-page">
        <div className="community-loading-container">
          <LoadingSpinner />
          <div className="community-loading-text">Discovering amazing stores...</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="community-list-page">
        <div className="community-error-container">
          <ErrorMessage error={error} />
          <button 
            onClick={handleRetry}
            className="retry-btn"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="community-list-page">
      <div className="community-container">
        
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
          <div className={`community-sidebar ${!sidebarOpen ? 'collapsed' : ''}`}>
          <div className="sidebar-content">
            
            {/* User Section */}
            {user ? (
              <div className="user-section">
                <div className="user-avatar">
                  <img 
                    src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=818cf8&color=fff&size=64&rounded=true`}
                    alt={user.name}
                    onError={(e) => {
                      e.target.src = `https://ui-avatars.com/api/?name=${user.name}&background=818cf8&color=fff&size=64&rounded=true`;
                    }}
                  />
                </div>
                <div className="user-info">
                  <div className="user-name">{user.name}</div>
                  <div className="user-role">{role}</div>
                </div>
              </div>
            ) : (
              <div className="signin-section">
                <div className="signin-text">
                  Sign in to like products, comment, and save favorites.
                </div>
                <button 
                  className="signin-btn"
                  onClick={handleSignIn}
                  aria-label="Sign in to your account"
                >
                  <span>👤</span>
                  Sign In
                </button>
              </div>
            )}

            {/* New Listings Section - Moved under sign in */}
            <div className={`new-listings-section ${collapsedSections.newListings ? 'collapsed' : ''}`}>
              <h4 onClick={() => handleToggleSection('newListings')}>🆕 New Listings</h4>
              <div className="new-listings-content">
                <div className="new-listings-text">
                  Latest products will appear here...
                </div>
              </div>
            </div>
            
            {/* Navigation Section */}
            <div className={`nav-section ${collapsedSections.nav ? 'collapsed' : ''}`}>
              <h4 onClick={() => handleToggleSection('nav')}>Navigation</h4>
              
              <div 
                className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
                onClick={() => handleNavigation('/')}
                onKeyDown={(e) => e.key === 'Enter' && handleNavigation('/')}
                tabIndex={0}
                role="button"
                aria-label="Go to home page"
              >
                <span className="nav-item-icon">🏠</span>
                <span className="nav-item-text">Home</span>
              </div>
              
              <div 
                className={`nav-item ${location.pathname === '/communities' ? 'active' : ''}`}
                onClick={() => handleNavigation('/communities')}
                onKeyDown={(e) => e.key === 'Enter' && handleNavigation('/communities')}
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
                    handleNavigation(`/user/${userId}/favorites`);
                  } else {
                    handleNavigation('/login');
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
                      handleNavigation(`/user/${userId}/favorites`);
                    } else {
                      handleNavigation('/login');
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
                        handleNavigation(`/user/${userId}/orders`);
                      } else {
                        handleNavigation('/login');
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (userId) {
                          handleNavigation(`/user/${userId}/orders`);
                        } else {
                          handleNavigation('/login');
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
                        handleNavigation(`/user/${userId}/profile`);
                      } else {
                        handleNavigation('/login');
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (userId) {
                          handleNavigation(`/user/${userId}/profile`);
                        } else {
                          handleNavigation('/login');
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
                  className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
                  onClick={() => handleCategoryChange('all')}
                  onKeyDown={(e) => e.key === 'Enter' && handleCategoryChange('all')}
                  tabIndex={0}
                  role="button"
                  aria-label="Show all categories"
                >
                  <span className="category-icon">🏪</span>
                  <span className="category-name">All Stores</span>
                </div>
                
                {/* Category Groups */}
                {categoryGroups.map((group, groupIndex) => (
                  <div key={groupIndex} className="category-group">
                    <div className="category-group-title">{group.title}</div>
                    {group.categories.map(category => (
                      <div
                        key={category.id}
                        className={`category-item category-sub-item ${selectedCategory === category.id ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(category.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleCategoryChange(category.id)}
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

            {/* Favorites Section */}
            {user && (
              <div className={`favorites-section ${collapsedSections.favorites ? 'collapsed' : ''}`}>
                <div className="favorites-header">
                  <h4 onClick={() => handleToggleSection('favorites')}>❤️ Favorites</h4>
                  <button
                    className={`favorites-toggle ${showFavorites ? 'active' : ''}`}
                    onClick={handleToggleFavorites}
                    title={showFavorites ? 'Show all stores' : 'Show favorites only'}
                  >
                    {showFavorites ? '👁️' : '❤️'}
                  </button>
                </div>
                <div className="favorites-count">
                  {favorites.length} favorite{favorites.length !== 1 ? 's' : ''}
                </div>
              </div>
            )}

            {/* Recently Viewed */}
            {user && recentlyViewed.length > 0 && (
              <div className={`recently-viewed-section ${collapsedSections.recentlyViewed ? 'collapsed' : ''}`}>
                <h4 onClick={() => handleToggleSection('recentlyViewed')}>👁️ Recently Viewed</h4>
                <div className="recently-viewed-list">
                  {recentlyViewed.slice(0, 3).map(communityId => {
                    const community = communities.find(c => c._id === communityId);
                    if (!community) return null;
                    return (
                      <div
                        key={communityId}
                        className="recent-item"
                        onClick={() => handleSelect(communityId)}
                        tabIndex={0}
                        role="button"
                        aria-label={`View ${community.name}`}
                      >
                        <img
                          src={community.logo?.url || placeholderImg}
                          alt={community.name}
                          className="recent-item-image"
                        />
                        <div className="recent-item-info">
                          <div className="recent-item-name">{community.name}</div>
                          <div className="recent-item-id">{community.transId}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Quick Stats - Fixed layout */}
            <div className={`stats-section ${collapsedSections.stats ? 'collapsed' : ''}`}>
              <h4 onClick={() => handleToggleSection('stats')}>📊 Quick Stats</h4>
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-number">{communities.length}</div>
                  <div className="stat-label">Total Stores</div>
                </div>
                <div className="stat-item">
                  <div className="stat-number">{filteredCommunities.length}</div>
                  <div className="stat-label">Showing</div>
                </div>
                {user && (
                  <div className="stat-item">
                    <div className="stat-number">{favorites.length}</div>
                    <div className="stat-label">Favorites</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        )}

        {/* Main Content */}
        <div className="community-main">
          {/* Header with search and controls */}
          <div className="community-header" data-plan={communities.length > 0 ? communities[0]?.plan?.name || 'Basic' : 'Basic'}>
            <div className="header-left">
              <h2 className="community-title">
                Stores ({filteredCommunities.length})
              </h2>
              {searchQuery && (
                <div className="search-results-info">
                  Showing results for "{searchQuery}"
                </div>
              )}
              {selectedCategory !== 'all' && (
                <div className="category-filter-info">
                  Filtered by: {categories.find(c => c.id === selectedCategory)?.name}
                </div>
              )}
              {showFavorites && (
                <div className="favorites-filter-info">
                  Showing favorites only
                </div>
              )}
            </div>
            
            <div className="header-controls">
              {/* Search Bar */}
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search stores..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="search-input"
                />
              </div>
              
              {/* Sort Dropdown */}
              <select 
                value={sortBy} 
                onChange={handleSortChange}
                className="sort-select"
              >
                <option value="name">Sort by Name</option>
                <option value="id">Sort by ID</option>
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
          
          {/* Communities Grid/List */}
          <div className={`community-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
            {filteredCommunities.length === 0 ? (
              <div className="community-empty-state">
                <div className="empty-icon">🏪</div>
                <div className="empty-title">
                  {searchQuery ? 'No stores found' : 'No stores available'}
                </div>
                <div className="empty-subtitle">
                  {searchQuery 
                    ? `No stores match "${searchQuery}"` 
                    : 'Check back later for new stores'
                  }
                </div>
                {searchQuery && (
                  <button 
                    onClick={handleClearSearch}
                    className="clear-search-btn"
                  >
                    Clear Search
                  </button>
                )}
              </div>
            ) : (
              filteredCommunities.map((community, index) => (
                <div
                  key={community._id}
                  className={`community-card ${selectedCommunity === community._id ? 'selected' : ''} ${viewMode === 'list' ? 'list-card' : ''}`}
                  data-plan={community.plan?.name || 'Basic'}
                  onClick={() => handleSelect(community._id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSelect(community._id)}
                  tabIndex={0}
                  role="button"
                  aria-label={`View ${community.name} store`}
                  style={{
                    animationDelay: `${index * 0.05}s`
                  }}
                >
                  <div className="community-card-header">
                    <img
                      src={community.logo?.url || placeholderImg}
                      alt={`${community.name} logo`}
                      className="community-logo"
                      onError={(e) => {
                        e.target.src = placeholderImg;
                      }}
                    />
                    <div className="community-overlay" />
                    
                    {/* Action Buttons */}
                    <div className="community-actions">
                      <button
                        className={`favorite-btn ${favorites.includes(community._id) ? 'favorited' : ''}`}
                        onClick={(e) => handleToggleFavorite(community._id, e)}
                        aria-label={favorites.includes(community._id) ? 'Remove from favorites' : 'Add to favorites'}
                        tabIndex={-1}
                      >
                        {favorites.includes(community._id) ? '❤️' : '🤍'}
                      </button>
                      
                      <button
                        className="quick-view-btn"
                        onClick={(e) => handleQuickView(community._id, e)}
                        aria-label={`Quick view ${community.name}`}
                        tabIndex={-1}
                      >
                        👁️
                      </button>
                      
                      <button
                        className="community-action-btn"
                        aria-label={`View ${community.name} store`}
                        tabIndex={-1}
                      >
                        →
                      </button>
                    </div>
                  </div>
                  
                  <div className="community-card-body">
                    <h3 className="community-name">{community.name}</h3>
                    <p className="community-description">
                      {community.description || 'No description available.'}
                    </p>
                    
                    {/* Community Stats */}
                    <div className="community-stats">
                      <span className="stat-badge rating-badge">⭐ {community.rating || 4.0}</span>
                      <span className="stat-badge product-badge">📦 {community.productCount || 0} products</span>
                      <span className="stat-badge member-badge">👥 {community.memberCount || 0} members</span>
                      {community.plan?.name && (
                        <span className="stat-badge plan-badge" style={{
                          background: community.plan.name === 'Basic' || community.plan.name === 'Starter' ? 'rgba(129,140,248,0.2)' :
                                   community.plan.name === 'Pro' || community.plan.name === 'Growth' ? 'rgba(192,132,252,0.2)' :
                                   community.plan.name === 'Enterprise' ? 'rgba(244,114,182,0.2)' :
                                   community.plan.name === 'Ultimate' ? 'rgba(255,215,0,0.2)' :
                                   community.plan.name === 'Premium' ? 'rgba(251,191,36,0.2)' : 'rgba(129,140,248,0.2)',
                          borderColor: community.plan.name === 'Basic' || community.plan.name === 'Starter' ? 'rgba(129,140,248,0.4)' :
                                     community.plan.name === 'Pro' || community.plan.name === 'Growth' ? 'rgba(192,132,252,0.4)' :
                                     community.plan.name === 'Enterprise' ? 'rgba(244,114,182,0.4)' :
                                     community.plan.name === 'Ultimate' ? 'rgba(255,215,0,0.4)' :
                                     community.plan.name === 'Premium' ? 'rgba(251,191,36,0.4)' : 'rgba(129,140,248,0.4)',
                          color: community.plan.name === 'Basic' || community.plan.name === 'Starter' ? '#a8b2ff' :
                                community.plan.name === 'Pro' || community.plan.name === 'Growth' ? '#c084fc' :
                                community.plan.name === 'Enterprise' ? '#f472b6' :
                                community.plan.name === 'Ultimate' ? '#ffd700' :
                                community.plan.name === 'Premium' ? '#fbbf24' : '#a8b2ff'
                        }}>
                          {community.plan.name === 'Ultimate' ? '👑' : '💎'} {community.plan.name}
                        </span>
                      )}
                    </div>
                    
                    {/* Additional info for list view */}
                    {viewMode === 'list' && (
                      <div className="community-meta">
                        <span className="meta-item">📅 Created recently</span>
                        <span className="meta-item">⭐ Popular</span>
                        {community.category && (
                          <span className="meta-item">{categories.find(c => c.id === community.category)?.icon} {community.category}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          {/* Load More */}
          {loadingMore && (
            <div className="load-more-container">
              <LoadingSpinner />
              <div className="load-more-text">Loading more stores...</div>
            </div>
          )}
          
          {/* No More Results */}
          {!hasMore && filteredCommunities.length > 0 && (
            <div className="no-more-results">
              <div className="no-more-text">No more stores to load</div>
            </div>
          )}
        </div>
      </div>
      
      {/* Login Modal for Visitors */}
      <LoginModal 
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        feature={loginModalFeature}
      />
    </div>
  );
};

export default CommunityList; 