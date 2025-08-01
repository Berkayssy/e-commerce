import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBasket } from '../contexts/BasketContext';
import { useSearch } from '../contexts/SearchContext';
import gsap from 'gsap';
import axios from 'axios';
import LoginModal from './LoginModal';
import './Navbar.css';

// Fonksiyonu component DIŞINA taşı
function getCommunityIdFromUrl(locationSearch) {
    const params = new URLSearchParams(locationSearch);
    return params.get('communityId');
}

const Navbar = () => {
    const { token, role, logout, user } = useAuth();
    const { basket } = useBasket();
    const { searchTerm, setSearchTerm } = useSearch();
    const basketCount = basket.length;
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [communityLogo, setCommunityLogo] = useState(null);
    const [communityName, setCommunityName] = useState(null);
    const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
    const avatarBtnRef = useRef(null);
    const avatarDropdownRef = useRef(null);
    const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode
    const [loginModalOpen, setLoginModalOpen] = useState(false);
    const [loginModalFeature, setLoginModalFeature] = useState('');

    // Fetch store logo and name by communityId from API
    useEffect(() => {
        const fetchCommunityData = async () => {
            if (token && (role === 'seller' || role === 'admin')) {
                const communityId = getCommunityIdFromUrl(location.search);
                
                // For sellers, always fetch their profile regardless of communityId in URL
                if (role === 'seller') {
                    try {
                        const res = await axios.get(`${process.env.REACT_APP_API_URL}/sellers/profile`, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        console.log('🔍 Seller profile response:', res.data);
                        console.log('🔍 StoreId in response:', res.data.storeId);
                        
                        const communityData = res.data.storeId;
                        console.log('🔍 CommunityData for seller:', communityData);
                        if (communityData && communityData.logo && communityData.logo.url) {
                            console.log('Setting community logo:', communityData.logo.url);
                            setCommunityLogo(communityData.logo.url);
                        } else {
                            console.log('No logo found in community data');
                            setCommunityLogo(null);
                        }
                        if (communityData && communityData.name) {
                            setCommunityName(communityData.name);
                        } else {
                            setCommunityName(null);
                        }
                    } catch (err) {
                        console.error('Error fetching seller profile:', err);
                        setCommunityLogo(null);
                        setCommunityName(null);
                    }
                    return;
                }
                
                // For admins, check communityId
                if (!communityId) {
                    setCommunityLogo(null);
                    setCommunityName(null);
                    return;
                }
                
                try {
                    const res = await axios.get(`${process.env.REACT_APP_API_URL}/admin/community/${communityId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    const community = res.data.community || res.data;
                    console.log('🔍 Community data:', community);
                    if (community) {
                        console.log('Community data:', community);
                        const communityData = community;
                        console.log('🔍 CommunityData for admin:', communityData);
                        if (communityData && communityData.logo && communityData.logo.url) {
                            console.log('Setting community logo:', communityData.logo.url);
                            setCommunityLogo(communityData.logo.url);
                        } else {
                            console.log('No logo found in community data');
                            setCommunityLogo(null);
                        }
                        if (communityData && communityData.name) {
                            setCommunityName(communityData.name);
                        } else {
                            setCommunityName(null);
                        }
                    } else {
                        console.log('No community data found');
                        setCommunityLogo(null);
                        setCommunityName(null);
                    }
                } catch (err) {
                    console.error('Error fetching community data:', err);
                    setCommunityLogo(null);
                    setCommunityName(null);
                }
            } else {
                setCommunityLogo(null);
                setCommunityName(null);
            }
        };
        fetchCommunityData();
    }, [token, role, location.search, user]);

    // Debug: log avatar sources
    // console.log('communityLogo:', communityLogo);
    // console.log('user:', user);

    // GSAP refs
    const navbarRef = useRef(null);
    const searchBarRef = useRef(null);
    const sidebarRef = useRef(null);

    // Scroll effect
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            setIsScrolled(scrollTop > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Navbar entrance animation
    useEffect(() => {
        if (navbarRef.current) {
            gsap.set(navbarRef.current, { opacity: 0, y: -30 });
            gsap.to(navbarRef.current, { 
                opacity: 1, 
                y: 0, 
                duration: 0.8, 
                ease: 'power2.out',
                delay: 0.1
            });
        }
        
        if (searchBarRef.current) {
            gsap.set(searchBarRef.current, { opacity: 0, scale: 0.95 });
            gsap.to(searchBarRef.current, { 
                opacity: 1, 
                scale: 1, 
                duration: 0.8, 
                delay: 0.3, 
                ease: 'back.out(1.7)' 
            });
        }
    }, []);

    // Close sidebar on route change
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Sidebar artık sadece X butonuna tıklandığında kapanacak
    // Outside click handler kaldırıldı

    // Escape key handler da kaldırıldı - sadece X butonuna tıklandığında kapanacak

    // Prevent body scroll when sidebar is open on mobile
    useEffect(() => {
        if (sidebarOpen && window.innerWidth <= 1023) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [sidebarOpen]);

    // Kullanıcı çıkış işlemini gerçekleştirir
    const handleLogout = () => {
        logout();
        navigate("/");
    };

    // Dark mode toggle
    const toggleDarkMode = () => {
        setIsDarkMode(!isDarkMode);
        // Burada gerçek tema değişikliği yapılabilir
        document.documentElement.setAttribute('data-theme', !isDarkMode ? 'dark' : 'light');
    };

    // Sidebar toggle fonksiyonu
    const toggleSidebar = () => {
        console.log('Sidebar toggled:', !sidebarOpen);
        setSidebarOpen(!sidebarOpen);
    };

    // Sidebar'ı kapatır
    const closeSidebar = () => {
        setSidebarOpen(false);
    };

    // Sidebar menüde tıklamaların yayılmasını engeller
    const handleMenuClick = (e) => {
        e.stopPropagation();
        // Sidebar'ı kapatma - sadece X butonuna tıklandığında kapanacak
    };

    // Global search fonksiyonu - her şeyi ara
    const handleGlobalSearch = () => {
        if (!searchTerm.trim()) return;
        
        const query = searchTerm.trim();
        
        // Global search sayfasına yönlendir
        navigate(`/search?q=${encodeURIComponent(query)}`);
    };

    // Dışarı tıklanınca dropdown'ı kapat
    useEffect(() => {
        if (!avatarDropdownOpen) return;
        const handleClick = (e) => {
            if (
                avatarDropdownRef.current &&
                !avatarDropdownRef.current.contains(e.target) &&
                avatarBtnRef.current &&
                !avatarBtnRef.current.contains(e.target)
            ) {
                setAvatarDropdownOpen(false);
            }
        };
        window.addEventListener('mousedown', handleClick);
        return () => window.removeEventListener('mousedown', handleClick);
    }, [avatarDropdownOpen]);

    let effectiveRole = role;
    if (!effectiveRole && token) {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            effectiveRole = payload.role;
        } catch (e) {
            effectiveRole = null;
        }
    }

    // User ID'yi al
    const getUserId = () => {
        if (user && user.id) {
            return user.id;
        }
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

    // Sidebar nav-linklerini render eder
    const communityId = getCommunityIdFromUrl(location.search);
    const currentPath = location.pathname;
    const userId = getUserId();
    
    const renderNavLinks = () => (
        <div className="sidebar-links">
            {token && effectiveRole === 'user' && userId && (
                <>
                    <Link to="/communities" className={`sidebar-link ${currentPath === '/communities' ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="stores">🛍️</span>
                        All Stores
                    </Link>
                    <Link to={`/user/${userId}/orders`} className={`sidebar-link ${currentPath === '/my' || currentPath === `/user/${userId}/orders` ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="orders">📦</span>
                        My Orders & Tracking
                    </Link>
                    <Link to={`/user/${userId}/favorites`} className={`sidebar-link ${currentPath === '/favorites' || currentPath === `/user/${userId}/favorites` ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="favorites">❤️</span>
                        Favorites
                    </Link>
                    <Link to={`/user/${userId}/profile`} className={`sidebar-link ${currentPath === '/profile' || currentPath === `/user/${userId}/profile` ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="profile">👤</span>
                        Profile Settings
                    </Link>
                    <Link to={`/user/${userId}/billing`} className={`sidebar-link ${currentPath === '/billing' || currentPath === `/user/${userId}/billing` ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="billing">💳</span>
                        Payment Plans
                    </Link>
                    <Link to={`/user/${userId}/support`} className={`sidebar-link ${currentPath === '/support' || currentPath === `/user/${userId}/support` ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="support">🆘</span>
                        Support
                    </Link>
                    <Link to={`/user/${userId}/notifications`} className={`sidebar-link ${currentPath === '/notifications' || currentPath === `/user/${userId}/notifications` ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="notifications">🔔</span>
                        Notifications
                    </Link>
                </>
            )}
            {(token && (effectiveRole === 'seller' || effectiveRole === 'admin')) && (
                <>
                    <Link to={communityId ? `/products?communityId=${communityId}` : '/products'} className={`sidebar-link ${currentPath === '/products' ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="products">🛍️</span>
                        My Products
                    </Link>
                    <Link to={communityId ? `/add-product?communityId=${communityId}` : '/add-product'} className={`sidebar-link ${currentPath === '/add-product' ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="add-product">➕</span>
                        Add Product
                    </Link>
                    <Link to={communityId ? `/order?communityId=${communityId}` : '/order'} className={`sidebar-link ${currentPath === '/order' ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="orders">📦</span>
                        My Orders & Tracking
                    </Link>
                    <Link to={communityId ? `/dashboard?communityId=${communityId}` : '/dashboard'} className={`sidebar-link ${currentPath === '/dashboard' ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="dashboard">📊</span>
                        Dashboard
                    </Link>
                    <Link to={communityId ? `/users?communityId=${communityId}` : '/users'} className={`sidebar-link ${currentPath === '/users' ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="users">👥</span>
                        User Management
                    </Link>
                    <Link to={communityId ? `/analytics?communityId=${communityId}` : '/analytics'} className={`sidebar-link ${currentPath === '/analytics' ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="analytics">📈</span>
                        Analytics
                    </Link>
                    <Link to={communityId ? `/settings?communityId=${communityId}` : '/settings'} className={`sidebar-link ${currentPath === '/settings' ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="settings">⚙️</span>
                        Seller Panel
                    </Link>
                    <Link to={communityId ? `/support?communityId=${communityId}` : '/support'} className={`sidebar-link ${currentPath === '/support' ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="support">🆘</span>
                        Support Center
                    </Link>
                    <Link to={communityId ? `/profile?communityId=${communityId}` : '/profile'} className={`sidebar-link ${currentPath === '/profile' ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="profile">👤</span>
                        Profile Settings
                    </Link>
                    <Link to={communityId ? `/billing?communityId=${communityId}` : '/billing'} className={`sidebar-link ${currentPath === '/billing' ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="billing">💳</span>
                        Billing & Plans
                    </Link>
                    {/* Sadece seller rolü için admin atama linki */}
                    {effectiveRole === 'seller' && (
                        (() => {
                            const sellerCommunityId = localStorage.getItem('sellerCommunityId');
                            const effectiveCommunityId = communityId || sellerCommunityId;
                            
                            return effectiveCommunityId ? (
                                <Link to={`/assign-admin?communityId=${effectiveCommunityId}`} className={`sidebar-link ${currentPath === '/assign-admin' ? 'active' : ''}`} onClick={handleMenuClick}>
                                    <span role="img" aria-label="admin-assign">🛡️</span>
                                    Assign Admin
                                </Link>
                            ) : (
                                <span className="sidebar-link disabled" style={{opacity: 0.5, cursor: 'not-allowed'}} title="No community selected">
                                    <span role="img" aria-label="admin-assign">🛡️</span>
                                    Assign Admin
                                </span>
                            );
                        })()
                    )}
                </>
            )}
            {/* Admin bu alanı görmesin */}
        </div>
    );

    // Avatarı belirle
    let avatarUrl = null;
    if (token && effectiveRole === 'seller' && communityLogo) {
      avatarUrl = communityLogo;
    } else if (token && user && user.profilePicture) {
      avatarUrl = user.profilePicture;
    }

    // Avatar ve logo debug logları
    console.log('token:', token);
    console.log('role:', role);
    console.log('user:', user);
    console.log('communityLogo:', communityLogo);
    console.log('avatarUrl:', avatarUrl);

    // Home sayfasında navbar'ı gösterme
    if (location.pathname === '/') {
      return null;
    }

    return (
        <nav className={`app-navbar ${isScrolled ? 'scrolled' : ''}`} ref={navbarRef}>
            <div className="nav-container">
                {/* Brand & Sidebar Trigger */}
                <div 
                    className={`nav-logo ${sidebarOpen ? 'sidebar-open' : ''}`} 
                    onClick={() => {
                        if (role === 'user') {
                            navigate('/communities');
                        } else if (role === 'seller' || role === 'admin') {
                            toggleSidebar();
                        } else {
                            navigate('/');
                        }
                    }}
                    title={
                        role === 'user' ? 'Go to Communities' : 
                        (role === 'seller' || role === 'admin') ? (sidebarOpen ? 'Close Sidebar' : 'Open Sidebar') : 
                        'Go to Home'
                    }
                >
                    {/* Show community logo if available, otherwise show diamond SVG */}
                    <span className="logo-icon">
                        {communityLogo ? (
                            <img 
                                src={communityLogo} 
                                alt={communityName || 'Store Logo'} 
                                className="community-logo-img"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'block';
                                }}
                            />
                        ) : (
                            <svg 
                                viewBox="0 0 32 32" 
                                width="32" 
                                height="32" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                                className="diamond-logo-svg"
                            >
                                <defs>
                                    <linearGradient id="diamondNavBar" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#f7c873" />
                                        <stop offset="0.5" stopColor="#c084fc" />
                                        <stop offset="1" stopColor="#818cf8" />
                                    </linearGradient>
                                </defs>
                                <polygon points="16,4 28,12 16,28 4,12" fill="url(#diamondNavBar)" stroke="#fff" strokeWidth="1.2" />
                                <polygon points="16,8 24,13 16,24 8,13" fill="#fff" fillOpacity="0.18" />
                            </svg>
                        )}
                    </span>
                    <span className="logo-text" style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em', background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        {communityName || 'Galeria'}
                    </span>
                </div>

                {/* Amazon-style Navigation Buttons */}
                <div className="amazon-nav-buttons">
                    <button className="amazon-nav-btn location-btn" title="Delivery Location">
                        <div className="btn-content">
                            <span className="btn-icon">📍</span>
                            <div className="btn-text-group">
                                <span className="btn-text-primary">Delivery to</span>
                                <span className="btn-text-secondary">Izmit 41100</span>
                            </div>
                        </div>
                    </button>
                    <button 
                        className="amazon-nav-btn orders-btn" 
                        title={role === 'seller' || role === 'admin' ? 'My Orders' : 'Orders'}
                        onClick={() => {
                            if (!token) {
                                setLoginModalFeature('orders');
                                setLoginModalOpen(true);
                                return;
                            }
                            if (role === 'seller' || role === 'admin') {
                                const params = new URLSearchParams(location.search);
                                const communityId = params.get('communityId');
                                if (communityId) {
                                    navigate(`/order?communityId=${communityId}`);
                                } else {
                                    navigate('/order');
                                }
                            } else if (role === 'user' && userId) {
                                navigate(`/user/${userId}/orders`);
                            } else if (role === 'user') {
                                // If user is logged in but no userId, redirect to login
                                navigate('/login');
                            } else {
                                navigate('/login');
                            }
                        }}
                    >
                        <div className="btn-content">
                            <span className="btn-icon">📦</span>
                            <div className="btn-text-group">
                                <span className="btn-text-primary">{role === 'seller' || role === 'admin' ? 'My Orders' : 'Orders'}</span>
                                <span className="btn-text-secondary">{role === 'seller' || role === 'admin' ? '& Tracking' : '& Tracking'}</span>
                            </div>
                        </div>
                    </button>
                    <button 
                        className="amazon-nav-btn plans-btn" 
                        title={role === 'seller' || role === 'admin' ? 'Billing & Plans' : 'Payment Plans'}
                        onClick={() => {
                            if (!token) {
                                setLoginModalFeature('plans');
                                setLoginModalOpen(true);
                                return;
                            }
                            if (role === 'seller' || role === 'admin') {
                                const params = new URLSearchParams(location.search);
                                const communityId = params.get('communityId');
                                if (communityId) {
                                    navigate(`/billing?communityId=${communityId}`);
                                } else {
                                    navigate('/billing');
                                }
                            } else if (role === 'user' && userId) {
                                navigate(`/user/${userId}/billing`);
                            } else if (role === 'user') {
                                // If user is logged in but no userId, redirect to login
                                navigate('/login');
                            } else {
                                navigate('/login');
                            }
                        }}
                    >
                        <div className="btn-content">
                            <span className="btn-icon">💳</span>
                            <div className="btn-text-group">
                                <span className="btn-text-primary">{role === 'seller' || role === 'admin' ? 'Billing' : 'Payment'}</span>
                                <span className="btn-text-secondary">{role === 'seller' || role === 'admin' ? '& Plans' : 'Plans'}</span>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Centered Search Bar */}
                <div className="navbar-center" ref={searchBarRef}>
                    <div className="search-section">
                        <div className="search-input-container-navbar">
                            <input
                                type="text"
                                className="search-input-navbar"
                                placeholder="Search everything..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter' && searchTerm.trim()) {
                                        handleGlobalSearch();
                                    }
                                }}
                                autoComplete="off"
                            />

                        </div>
                    </div>
                </div>

                {/* Right Side: Basket, Notifications & Avatar */}
                <div className="nav-actions">
                    {/* Basket for authenticated users - not for visitors */}
                    {token && role !== 'seller' && role !== 'admin' && (
                        <button 
                            className="basket-btn" 
                            onClick={() => {
                                if (userId) {
                                    navigate(`/user/${userId}/basket`);
                                } else if (role === 'user') {
                                    // If user is logged in but no userId, redirect to login
                                    navigate('/login');
                                } else {
                                    navigate('/login');
                                }
                            }}
                            title="Shopping Cart"
                            aria-label="Shopping Cart"
                            style={{
                                width: 32,
                                height: 32,
                                minWidth: 0,
                                minHeight: 0,
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(129, 140, 248, 0.08)',
                                border: '1px solid rgba(129, 140, 248, 0.15)',
                                borderRadius: '8px',
                                boxShadow: '0 1px 4px rgba(129, 140, 248, 0.08)',
                                transition: 'all 0.2s ease',
                                marginRight: 8,
                                cursor: 'pointer',
                                position: 'relative',
                                color: '#e2e8f0'
                            }}>
                            <span style={{fontSize: 18, color: '#e2e8f0'}}>🛒</span>
                            {basketCount > 0 && <span className="basket-count">{basketCount}</span>}
                        </button>
                    )}
                    

                    
                    {!token && (
                        <button 
                            className="google-login-navbar-btn"
                            onClick={() => navigate('/login')}
                            style={{
                                fontSize: '0.9rem', 
                                padding: '0.5rem 1rem', 
                                minHeight: 0, 
                                minWidth: 0, 
                                height: 36, 
                                background: 'rgba(22, 14, 14, 0.1)', 
                                color: '#fff', 
                                border: '1px solid rgba(255, 245, 245, 0.2)', 
                                borderRadius: 18, 
                                fontWeight: 600, 
                                boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px'
                            }}>
                            <span style={{fontSize: 16}}>👤</span>
                            Sign In
                        </button>
                    )}
                    {/* Add Product button for seller and admin */}
                    {(token && (effectiveRole === 'seller' || effectiveRole === 'admin')) && (
                        <button 
                            className="add-product-navbar-btn"
                            onClick={() => {
                                // communityId varsa URL'den al
                                const params = new URLSearchParams(location.search);
                                const communityId = params.get('communityId');
                                if (communityId) {
                                    navigate(`/add-product?communityId=${communityId}`);
                                } else {
                                    navigate('/add-product');
                                }
                            }}
                            title="Add Product"
                            style={{
                                width: 32,
                                height: 32,
                                minWidth: 0,
                                minHeight: 0,
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'transparent',
                                border: '1px solid rgba(102, 126, 234, 0.2)',
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(102, 126, 234, 0.1)',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                marginRight: 8,
                                cursor: 'pointer',
                                position: 'relative',
                                overflow: 'hidden',
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-1px) scale(1.02)';
                                e.target.style.boxShadow = '0 4px 16px rgba(102, 126, 234, 0.2)';
                                e.target.style.border = '1px solid rgba(102, 126, 234, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0) scale(1)';
                                e.target.style.boxShadow = '0 2px 8px rgba(102, 126, 234, 0.1)';
                                e.target.style.border = '1px solid rgba(102, 126, 234, 0.2)';
                            }}
                            onMouseDown={(e) => {
                                e.target.style.transform = 'translateY(0) scale(0.98)';
                            }}
                            onMouseUp={(e) => {
                                e.target.style.transform = 'translateY(-1px) scale(1.02)';
                            }}
                        >
                            {/* Minimal plus icon with gradient */}
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{
                                display: 'block',
                                verticalAlign: 'middle',
                                filter: 'drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))'
                            }}>
                                <defs>
                                    <linearGradient id="minimalPlusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                        <stop offset="0%" stopColor="#667eea"/>
                                        <stop offset="50%" stopColor="#764ba2"/>
                                        <stop offset="100%" stopColor="#f093fb"/>
                                    </linearGradient>
                                </defs>
                                <path d="M8 3v10M3 8h10" stroke="url(#minimalPlusGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>
                    )}
                    
                    {/* Notifications Bell */}
                    {token && (
                        <button 
                            className="notifications-btn"
                            onClick={() => {
                                if (role === 'seller' || role === 'admin') {
                                    const params = new URLSearchParams(location.search);
                                    const communityId = params.get('communityId');
                                    if (communityId) {
                                        navigate(`/notifications?communityId=${communityId}`);
                                    } else {
                                        navigate('/notifications');
                                    }
                                } else if (role === 'user' && userId) {
                                    navigate(`/user/${userId}/notifications`);
                                } else if (role === 'user') {
                                    // If user is logged in but no userId, redirect to login
                                    navigate('/login');
                                } else {
                                    navigate('/login');
                                }
                            }}
                            title="Notifications"
                            aria-label="Notifications"
                            style={{
                                width: 32,
                                height: 32,
                                minWidth: 0,
                                minHeight: 0,
                                padding: 0,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'rgba(129, 140, 248, 0.08)',
                                border: '1px solid rgba(129, 140, 248, 0.15)',
                                borderRadius: '8px',
                                boxShadow: '0 1px 4px rgba(129, 140, 248, 0.08)',
                                transition: 'all 0.2s ease',
                                marginRight: 8,
                                cursor: 'pointer',
                                position: 'relative'
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(129, 140, 248, 0.1)';
                                e.target.style.borderColor = 'rgba(129, 140, 248, 0.2)';
                                e.target.style.boxShadow = '0 2px 8px rgba(129, 140, 248, 0.12)';
                                e.target.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(129, 140, 248, 0.08)';
                                e.target.style.borderColor = 'rgba(129, 140, 248, 0.15)';
                                e.target.style.boxShadow = '0 1px 4px rgba(129, 140, 248, 0.08)';
                                e.target.style.transform = 'translateY(0)';
                            }}
                        >
                            <span style={{fontSize: 16, color: '#e2e8f0'}}>🔔</span>
                            {/* Notification count badge */}
                            <span style={{
                                position: 'absolute',
                                top: -4,
                                right: -4,
                                background: 'linear-gradient(135deg, #ef4444 0%, #f472b6 100%)',
                                color: '#fff',
                                borderRadius: '50%',
                                width: 14,
                                height: 14,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                border: '2px solid rgba(10, 15, 28, 0.95)',
                                boxShadow: '0 2px 6px rgba(239, 68, 68, 0.3)'
                            }}>
                                3
                            </span>
                        </button>
                    )}
                    {token  &&  (
                        <div style={{position: 'relative', display: 'inline-block'}}>
                            <button
                                className="avatar-btn navbar-logo-avatar"
                                ref={avatarBtnRef}
                                style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: '50%',
                                    overflow: 'hidden',
                                    marginLeft: 10,
                                    boxShadow: '0 1px 6px #c084fc33',
                                    border: 'none',
                                    background: 'none',
                                    padding: 0,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                aria-label="User Avatar"
                                tabIndex={0}
                                onClick={() => setAvatarDropdownOpen((v) => !v)}
                            >
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="User Avatar"
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            borderRadius: '50%'
                                        }}
                                    />
                                ) : (
                                    <span style={{fontSize: 22, color: '#818cf8'}}>👤</span>
                                )}
                            </button>
                            {avatarDropdownOpen && (
                                <div
                                    className="avatar-dropdown-menu"
                                    ref={avatarDropdownRef}
                                    style={{
                                        position: 'absolute',
                                        top: 44,
                                        right: 0,
                                        minWidth: 160,
                                        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
                                        backdropFilter: 'blur(20px)',
                                        border: '1px solid rgba(129, 140, 248, 0.2)',
                                        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 4px 16px rgba(129, 140, 248, 0.1)',
                                        borderRadius: 12,
                                        zIndex: 100,
                                        padding: '8px 0',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                        animation: 'dropdownFadeIn 0.2s ease-out'
                                    }}
                                >
                                    <button
                                        className="avatar-dropdown-item"
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            textAlign: 'left',
                                            padding: '12px 20px',
                                            fontSize: 14,
                                            color: '#e2e8f0',
                                            cursor: 'pointer',
                                            borderRadius: 8,
                                            transition: 'all 0.2s ease',
                                            fontWeight: 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'rgba(129, 140, 248, 0.15)';
                                            e.target.style.color = '#f1f5f9';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'none';
                                            e.target.style.color = '#e2e8f0';
                                        }}
                                        onClick={() => { 
                                            setAvatarDropdownOpen(false); 
                                            // Role'a göre doğru profile sayfasına git
                                            if (effectiveRole === 'seller' || effectiveRole === 'admin') {
                                                const params = new URLSearchParams(location.search);
                                                const communityId = params.get('communityId');
                                                if (communityId) {
                                                    navigate(`/profile?communityId=${communityId}`);
                                                } else {
                                                    navigate('/profile');
                                                }
                                            } else if (effectiveRole === 'user' && userId) {
                                                navigate(`/user/${userId}/profile`);
                                            } else {
                                                navigate('/profile');
                                            }
                                        }}
                                    >
                                        <span style={{fontSize: 16}}>👤</span>
                                        Profile
                                    </button>
                                    <div style={{
                                        height: '1px',
                                        background: 'linear-gradient(90deg, transparent 0%, rgba(129, 140, 248, 0.3) 50%, transparent 100%)',
                                        margin: '4px 16px'
                                    }}></div>
                                    <button
                                        className="avatar-dropdown-item"
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            textAlign: 'left',
                                            padding: '12px 20px',
                                            fontSize: 14,
                                            color: '#e2e8f0',
                                            cursor: 'pointer',
                                            borderRadius: 8,
                                            transition: 'all 0.2s ease',
                                            fontWeight: 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'rgba(129, 140, 248, 0.15)';
                                            e.target.style.color = '#f1f5f9';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'none';
                                            e.target.style.color = '#e2e8f0';
                                        }}
                                        onClick={() => { 
                                            setAvatarDropdownOpen(false);
                                            toggleDarkMode();
                                        }}
                                    >
                                        <span style={{fontSize: 16}}>{isDarkMode ? '🌙' : '☀️'}</span>
                                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                                    </button>
                                    <div style={{
                                        height: '1px',
                                        background: 'linear-gradient(90deg, transparent 0%, rgba(129, 140, 248, 0.3) 50%, transparent 100%)',
                                        margin: '4px 16px'
                                    }}></div>
                                    <button
                                        className="avatar-dropdown-item"
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            textAlign: 'left',
                                            padding: '12px 20px',
                                            fontSize: 14,
                                            color: '#e2e8f0',
                                            cursor: 'pointer',
                                            borderRadius: 8,
                                            transition: 'all 0.2s ease',
                                            fontWeight: 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'rgba(129, 140, 248, 0.15)';
                                            e.target.style.color = '#f1f5f9';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'none';
                                            e.target.style.color = '#e2e8f0';
                                        }}
                                        onClick={() => { 
                                            setAvatarDropdownOpen(false);
                                            // Role'a göre doğru settings sayfasına git
                                            if (effectiveRole === 'user' && userId) {
                                                navigate(`/user/${userId}/settings`);
                                            } else if (effectiveRole === 'seller' || effectiveRole === 'admin') {
                                                const params = new URLSearchParams(location.search);
                                                const communityId = params.get('communityId');
                                                if (communityId) {
                                                    navigate(`/settings?communityId=${communityId}`);
                                                } else {
                                                    navigate('/settings');
                                                }
                                            } else {
                                                navigate('/settings');
                                            }
                                        }}
                                    >
                                        <span style={{fontSize: 16}}>⚙️</span>
                                        Settings
                                    </button>
                                    <div style={{
                                        height: '1px',
                                        background: 'linear-gradient(90deg, transparent 0%, rgba(129, 140, 248, 0.3) 50%, transparent 100%)',
                                        margin: '4px 16px'
                                    }}></div>
                                    <button
                                        className="avatar-dropdown-item"
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            textAlign: 'left',
                                            padding: '12px 20px',
                                            fontSize: 14,
                                            color: '#f87171',
                                            cursor: 'pointer',
                                            borderRadius: 8,
                                            transition: 'all 0.2s ease',
                                            fontWeight: 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.background = 'rgba(248, 113, 113, 0.15)';
                                            e.target.style.color = '#fca5a5';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.background = 'none';
                                            e.target.style.color = '#f87171';
                                        }}
                                        onClick={() => { setAvatarDropdownOpen(false); handleLogout(); }}
                                    >
                                        <span style={{fontSize: 16}}>🚪</span>
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {/* Sidebar Overlay - Only for sellers and admins */}
            {sidebarOpen && (role === 'seller' || role === 'admin') && (
                <div 
                    className="sidebar-overlay" 
                    style={{ cursor: 'default' }}
                />
            )}


            {/* Seller/Admin Sidebar - Only for sellers and admins */}
            {(role === 'seller' || role === 'admin') && (
                <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} ref={sidebarRef}>
                <div className="sidebar-header">

                    
                    {/* Store Info for Seller/Admin */}
                    {token && (effectiveRole === 'seller' || effectiveRole === 'admin') && communityName ? (
                        <div className="sidebar-store-info" style={{ 
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            padding: '16px',
                            background: 'rgba(129, 140, 248, 0.1)',
                            borderRadius: 8,
                            border: '1px solid rgba(129, 140, 248, 0.2)',
                            marginBottom: 16
                        }}>
                            {communityLogo ? (
                                <img 
                                    src={communityLogo} 
                                    alt={communityName}
                                    style={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: '6px',
                                        objectFit: 'cover'
                                    }}
                                />
                            ) : (
                                <span style={{ fontSize: 20 }}>🏪</span>
                            )}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ 
                                    fontSize: '1rem', 
                                    fontWeight: 600, 
                                    color: '#e2e8f0',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                    marginBottom: 2
                                }}>
                                    {communityName}
                                </div>
                                <div style={{ 
                                    fontSize: '0.75rem', 
                                    color: '#a8b2ff',
                                    textTransform: 'capitalize'
                                }}>
                                    {effectiveRole === 'seller' ? 'Store Owner' : 'Administrator'}
                                </div>
                            </div>
                        </div>
                    ) : null}
                    
                    {/* Fixed Close Button - Always visible */}
                    <button 
                        className="sidebar-close-fixed" 
                        onClick={closeSidebar}
                        title="Close Sidebar"
                        aria-label="Close Sidebar"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </button>
                </div>
                {renderNavLinks()}
                </aside>
            )}
            
            {/* Login Modal for Visitors */}
            <LoginModal 
                isOpen={loginModalOpen}
                onClose={() => setLoginModalOpen(false)}
                feature={loginModalFeature}
            />
        </nav>
    );
};

export default Navbar;