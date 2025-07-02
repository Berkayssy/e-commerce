import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBasket } from '../contexts/BasketContext';
import { useSearch } from '../contexts/SearchContext';
import gsap from 'gsap';
import './Navbar.css';

const Navbar = () => {
    const { token, role, logout } = useAuth();
    const { basket } = useBasket();
    const { searchTerm, setSearchTerm, selectedCategory, setSelectedCategory } = useSearch();
    const basketCount = basket.length;
    const navigate = useNavigate();
    const location = useLocation();
    const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const categories = ["All Categories", "Luxury Car", "Sport Car", "Classic Car"];

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

    // Sidebar animation
    useEffect(() => {
        if (sidebarRef.current) {
            if (sidebarOpen) {
                gsap.set(sidebarRef.current, { x: -320 });
                gsap.to(sidebarRef.current, { 
                    x: 0, 
                    duration: 0.4, 
                    ease: 'power2.out' 
                });
            } else {
                gsap.to(sidebarRef.current, { 
                    x: -320, 
                    duration: 0.3, 
                    ease: 'power2.in' 
                });
            }
        }
    }, [sidebarOpen]);

    // Kullanıcı çıkış işlemini gerçekleştirir
    const handleLogout = () => {
        logout();
        navigate("/");
    };

    // Sidebar ve kategori menüsünü kapatır
    const closeSidebar = () => {
        setSidebarOpen(false);
        setCategoryMenuOpen(false);
    };

    // Sidebar menüde tıklamaların yayılmasını engeller
    const handleMenuClick = (e) => {
        e.stopPropagation();
    };

    // Sidebar nav-linklerini render eder
    const renderNavLinks = () => (
        <div className="sidebar-links">
            {token && role === 'user' && (
                <>
                    <Link to="/products" className="sidebar-link" onClick={handleMenuClick}>
                        <span role="img" aria-label="products">🛍️</span>
                        Products
                    </Link>
                    <Link to="/order" className="sidebar-link" onClick={handleMenuClick}>
                        <span role="img" aria-label="orders">📦</span>
                        My Orders
                    </Link>
                    <Link to="/profile" className="sidebar-link" onClick={handleMenuClick}>
                        <span role="img" aria-label="profile">👤</span>
                        Profile Settings
                    </Link>
                    <Link to="/billing" className="sidebar-link" onClick={handleMenuClick}>
                        <span role="img" aria-label="billing">💳</span>
                        Billing & Plans
                    </Link>
                    <Link to="/support" className="sidebar-link" onClick={handleMenuClick}>
                        <span role="img" aria-label="support">🆘</span>
                        Support
                    </Link>
                    <Link to="/notifications" className="sidebar-link" onClick={handleMenuClick}>
                        <span role="img" aria-label="notifications">🔔</span>
                        Notifications
                    </Link>
                </>
            )}
            {token && role === 'admin' && (
                <>
                    <Link to="/products" className="sidebar-link" onClick={handleMenuClick}>
                        <span role="img" aria-label="products">🛍️</span>
                        All Products
                    </Link>
                    <Link to="/add-product" className="sidebar-link" onClick={handleMenuClick}>
                        <span role="img" aria-label="add-product">➕</span>
                        Add Product
                    </Link>
                    <Link to="/order" className="sidebar-link" onClick={handleMenuClick}>
                        <span role="img" aria-label="orders">📦</span>
                        All Orders
                    </Link>
                    <Link to="/dashboard" className="sidebar-link" onClick={handleMenuClick}>
                        <span role="img" aria-label="dashboard">📊</span>
                        Dashboard
                    </Link>
                    <Link to="/users" className="sidebar-link" onClick={handleMenuClick}>
                        <span role="img" aria-label="users">👥</span>
                        User Management
                    </Link>
                    <Link to="/analytics" className="sidebar-link" onClick={handleMenuClick}>
                        <span role="img" aria-label="analytics">📈</span>
                        Analytics
                    </Link>
                    <Link to="/settings" className="sidebar-link" onClick={handleMenuClick}>
                        <span role="img" aria-label="settings">⚙️</span>
                        Admin Settings
                    </Link>
                    <Link to="/support" className="sidebar-link" onClick={handleMenuClick}>
                        <span role="img" aria-label="support">🆘</span>
                        Support Center
                    </Link>
                </>
            )}
        </div>
    );

    return (
        <nav className={`app-navbar ${isScrolled ? 'scrolled' : ''}`} ref={navbarRef}>
            <div className="nav-container">
                {/* Brand & Sidebar Trigger */}
                <div className="nav-logo" onClick={() => setSidebarOpen(true)}>
                    <span className="logo-icon">💼</span>
                    <span className="logo-text">CommerceSaaS</span>
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

                {/* Right Side: Basket & Logout */}
                <div className="nav-actions">
                    {token && role === 'admin' && (
                        <button 
                            className="add-product-navbar-btn" 
                            onClick={() => navigate("/add-product")}
                            title="Add Product"
                        >
                            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                                <rect x="7" y="2" width="1" height="11" rx="0.5" fill="currentColor"/>
                                <rect x="2" y="7" width="11" height="1" rx="0.5" fill="currentColor"/>
                            </svg>
                        </button>
                    )}
                    {token && role === 'user' && (
                        <button 
                            className="basket-btn" 
                            onClick={() => navigate("/basket")}
                            title="Shopping Cart"
                        >
                            🛒
                            {basketCount > 0 && <span className="basket-count">{basketCount}</span>}
                        </button>
                    )}
                    <button 
                        className="logout-btn" 
                        onClick={handleLogout}
                        title="Logout"
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Sidebar Overlay */}
            {sidebarOpen && (
                <div className="sidebar-overlay" onClick={closeSidebar} />
            )}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} ref={sidebarRef}>
                <div className="sidebar-header">
                    <span className="logo-icon">💼</span>
                    <span className="logo-text">CommerceSaaS</span>
                    <button className="sidebar-close" onClick={closeSidebar}>×</button>
                </div>
                {renderNavLinks()}
            </aside>
        </nav>
    );
};

export default Navbar;