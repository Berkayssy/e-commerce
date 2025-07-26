import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBasket } from '../contexts/BasketContext';
import { useSearch } from '../contexts/SearchContext';
import gsap from 'gsap';
import axios from 'axios';
import './Navbar.css';

// Fonksiyonu component DIŞINA taşı
function getCommunityIdFromUrl(locationSearch) {
    const params = new URLSearchParams(locationSearch);
    return params.get('communityId');
}

const Navbar = () => {
    const { token, role, logout, user } = useAuth();
    const { basket } = useBasket();
    const { searchTerm, setSearchTerm, selectedCategory, setSelectedCategory } = useSearch();
    const basketCount = basket.length;
    const navigate = useNavigate();
    const location = useLocation();
    const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [communityLogo, setCommunityLogo] = useState(null);
    const [communityName, setCommunityName] = useState(null);
    const categories = ["All Categories", "Luxury Car", "Sport Car", "Classic Car"];
    const [avatarDropdownOpen, setAvatarDropdownOpen] = useState(false);
    const avatarBtnRef = useRef(null);
    const avatarDropdownRef = useRef(null);

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
        setCategoryMenuOpen(false);
    }, [location.pathname]);

    // Close category menu on outside click
    useEffect(() => {
        if (!categoryMenuOpen) return;
        
        const handleClick = (e) => {
            if (
              !e.target.closest('.category-dropdown-navbar') &&
              !e.target.closest('.category-menu-navbar')
            ) {
                setCategoryMenuOpen(false);
            }
        };
        
        window.addEventListener('click', handleClick, true);
        return () => window.removeEventListener('click', handleClick, true);
    }, [categoryMenuOpen]);

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

    // Sidebar toggle fonksiyonu
    const toggleSidebar = () => {
        console.log('Sidebar toggled:', !sidebarOpen);
        setSidebarOpen(!sidebarOpen);
    };

    // Sidebar ve kategori menüsünü kapatır
    const closeSidebar = () => {
        setSidebarOpen(false);
        setCategoryMenuOpen(false);
    };

    // Sidebar menüde tıklamaların yayılmasını engeller
    const handleMenuClick = (e) => {
        e.stopPropagation();
        // Sidebar'ı kapatma - sadece X butonuna tıklandığında kapanacak
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

    // Sidebar nav-linklerini render eder
    const communityId = getCommunityIdFromUrl(location.search);
    const currentPath = location.pathname;
    
    const renderNavLinks = () => (
        <div className="sidebar-links">
            {token && effectiveRole === 'user' && (
                <>
                    <Link to="/communities" className={`sidebar-link ${currentPath === '/communities' ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="stores">🛍️</span>
                        All Stores
                    </Link>
                    <Link to="/order" className={`sidebar-link ${currentPath === '/order' ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="orders">📦</span>
                        My Orders
                    </Link>
                    <Link to="/profile" className={`sidebar-link ${currentPath === '/profile' ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="profile">👤</span>
                        Profile Settings
                    </Link>
                    <Link to="/billing" className={`sidebar-link ${currentPath === '/billing' ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="billing">💳</span>
                        Billing & Plans
                    </Link>
                    <Link to="/support" className={`sidebar-link ${currentPath === '/support' ? 'active' : ''}`} onClick={handleMenuClick}>
                        <span role="img" aria-label="support">🆘</span>
                        Support
                    </Link>
                    <Link to="/notifications" className={`sidebar-link ${currentPath === '/notifications' ? 'active' : ''}`} onClick={handleMenuClick}>
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
                        My Orders
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

    return (
        <nav className={`app-navbar ${isScrolled ? 'scrolled' : ''}`} ref={navbarRef}>
            <div className="nav-container">
                {/* Brand & Sidebar Trigger */}
                <div 
                    className={`nav-logo ${sidebarOpen ? 'sidebar-open' : ''}`} 
                    onClick={toggleSidebar}
                    title={sidebarOpen ? 'Close Sidebar' : 'Open Sidebar'}
                >
                    {/* Always show diamond SVG as logo icon */}
                    <span className="logo-icon" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg viewBox="0 0 32 32" width="32" height="32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                    </span>
                    <span className="logo-text" style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em', background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Galeria</span>
                </div>

                {/* Centered Search Bar */}
                <div className="navbar-center" ref={searchBarRef}>
                    {token && (
                        <div className="search-section">
                            <div className="category-dropdown-navbar">
                                <button
                                    type="button"
                                    className="category-btn-navbar"
                                    onClick={() => setCategoryMenuOpen(!categoryMenuOpen)}
                                >
                                    {selectedCategory}
                                    <span className="dropdown-icon-navbar">▼</span>
                                </button>
                                {categoryMenuOpen && (
                                    <ul className="category-menu-navbar">
                                        {categories.map((cat) => (
                                            <li
                                                key={cat}
                                                className={cat === selectedCategory ? "active" : ""}
                                                onClick={() => {
                                                    setSelectedCategory(cat);
                                                    setCategoryMenuOpen(false);
                                                }}
                                            >
                                                {cat}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                            <div className="search-input-container-navbar">
                                <input
                                    type="text"
                                    className="search-input-navbar"
                                    placeholder="Search products..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    autoComplete="off"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Side: Basket & Avatar */}
                <div className="nav-actions">
                    {!token && (
                        <button 
                            className="google-login-navbar-btn"
                            onClick={() => navigate('/login')}
                            style={{fontSize: '1rem', padding: '0.38rem 1.1rem', minHeight: 0, minWidth: 0, height: 36, background: '#fff', color: '#6366f1', border: '1.5px solid #6366f1', borderRadius: 6, fontWeight: 600, boxShadow: '0 1px 4px #c7d2fe33'}}>
                            <span style={{marginRight: 8, fontSize: 18, verticalAlign: 'middle'}}>🔒</span>
                            Google ile Giriş Yap
                        </button>
                    )}
                    {token && effectiveRole === 'user' && (
                        <button 
                            className="basket-btn redesigned-basket-btn compact-basket-btn purple-basket-btn logout-size-basket-btn" 
                            onClick={() => navigate("/basket")}
                            title="Shopping Cart"
                            aria-label="Shopping Cart"
                            style={{marginRight: '0.18rem'}}>
                            {/* Shopping cart icon */}
                            <svg width="19" height="19" viewBox="0 0 21 21" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false" style={{display: 'block', verticalAlign: 'middle'}}>
                                <circle cx="7.5" cy="17.5" r="1.3" fill="#fff" stroke="#6366f1" strokeWidth="1.1"/>
                                <circle cx="15.5" cy="17.5" r="1.3" fill="#fff" stroke="#6366f1" strokeWidth="1.1"/>
                                <path d="M2.5 3.5h2l2.2 8.2a1.1 1.1 0 0 0 1.05 0.8h6.1a1.1 1.1 0 0 0 1.05-0.8l1.5-5.7H5.5" stroke="#fff" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                            </svg>
                            {basketCount > 0 && <span className="basket-count redesigned-basket-count compact-basket-count purple-basket-count logout-size-basket-count">{basketCount}</span>}
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
                                marginRight: 12,
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
            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div 
                    className="sidebar-overlay" 
                    style={{ cursor: 'default' }}
                />
            )}
            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} ref={sidebarRef}>
                <div className="sidebar-header">
                    {/* Mağaza Bilgileri */}
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
                            <span style={{ 
                                fontSize: '1rem', 
                                fontWeight: 600, 
                                color: '#e2e8f0',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap'
                            }}>{communityName}</span>
                        </div>
                    ) : (
                        <div className="sidebar-brand">
                            <span className="logo-icon" style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <svg viewBox="0 0 32 32" width="24" height="24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                            </span>
                            <span className="logo-text" style={{ fontSize: '1.2rem', fontWeight: 700, letterSpacing: '-0.01em', background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Galeria</span>
                        </div>
                    )}
                    
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
        </nav>
    );
};

export default Navbar;