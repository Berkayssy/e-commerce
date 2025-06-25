import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBasket } from '../contexts/BasketContext';
import { useSearch } from '../contexts/SearchContext';
import './Navbar.css';

const Navbar = () => {
    const { token, role, logout } = useAuth();
    const { basket } = useBasket();
    const { searchTerm, setSearchTerm, selectedCategory, setSelectedCategory } = useSearch();
    const basketCount = basket.length;
    const navigate = useNavigate();
    const [showBasket, setShowBasket] = useState(() => {
        const savedBasket = localStorage.getItem('basket');
        return savedBasket ? JSON.parse(savedBasket).length > 0 : false;
    });
    const [basketAdded, setBasketAdded] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [isHovering, setIsHovering] = useState(false);
    const prevBasketCount = useRef(basketCount);
    const [categoryMenuOpen, setCategoryMenuOpen] = useState(false);
    const categories = ["All Categories", "Luxury Car", "Sport Car", "Classic Car"];

    useEffect(() => {
        if (basketCount < prevBasketCount.current) {
            setIsRemoving(true);
            setTimeout(() => {
                setIsRemoving(false);
                if (basketCount === 0) {
                    setShowBasket(false);
                    localStorage.removeItem('basket');
                }
            }, 300);
        } else if (basketCount > prevBasketCount.current) {
            setShowBasket(true);
            setBasketAdded(true);
            setTimeout(() => {
                setBasketAdded(false);
            }, 500);
        }
        prevBasketCount.current = basketCount;
    }, [basketCount]);

    useEffect(() => {
        if (!categoryMenuOpen) return;
        const handleClick = (e) => {
            if (!e.target.closest('.amazon-category-dropdown') && !e.target.closest('.amazon-category-menu')) {
                setCategoryMenuOpen(false);
            }
        };
        window.addEventListener('click', handleClick, true);
        return () => window.removeEventListener('click', handleClick, true);
    }, [categoryMenuOpen]);

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleSearch = (e) => {
        e.preventDefault();
    };

    return (
        <nav className="navbar">
            <div className='navbar-container'>
                {token && (role === 'user' ? (<Link className='navbar-brand' to="/">Home</Link>) : null)}
                {token && (
                    <div className='navbar-nav'>
                        {token && (role === 'user' ? (<Link className='nav-link' to="/products">Products</Link>) : role === 'admin' ? (<Link className='nav-link' to="/products">All Products</Link>) : null)}
                        {token && (role === 'user' ? (<Link className='nav-link' to="/order">My Orders</Link>) : role === 'admin' ? (<Link className='nav-link' to="/order">All Orders</Link>) : null)}
                        <form className="amazon-searchbar" onSubmit={handleSearch}>
                            <div className="amazon-category-dropdown-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                                <button
                                    type="button"
                                    className="amazon-category-dropdown"
                                    onClick={e => {
                                        e.stopPropagation();
                                        setCategoryMenuOpen((open) => !open);
                                    }}
                                    aria-haspopup="listbox"
                                    aria-expanded={categoryMenuOpen}
                                >
                                    <span>{selectedCategory}</span>
                                    <span className="dropdown-arrow">▼</span>
                                </button>
                            </div>
                            {categoryMenuOpen && (
                                <ul className="amazon-category-menu" onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: '100%', left: 480, width: '10%' }}>
                                    {categories.map((cat) => (
                                        <li
                                            key={cat}
                                            className={cat === selectedCategory ? "selected" : ""}
                                            onClick={e => {
                                                e.stopPropagation();
                                                setSelectedCategory(cat);
                                                setCategoryMenuOpen(false);
                                            }}
                                        >
                                            {cat}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            <input
                                className="amazon-search-input"
                                type="text"
                                placeholder="Search everything"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                onClick={e => e.stopPropagation()}
                            />
                            <button className="amazon-search-btn" type="submit">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <circle cx="9" cy="9" r="7" stroke="#fff" strokeWidth="2"/>
                                    <line x1="14.2" y1="14.2" x2="18" y2="18" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                            </button>
                        </form>
                    </div>
                )}
                <div className='navbar-nav-right'>
                    {token && role === 'user' && (
                        <button
                            className={`nav-button ${showBasket ? 'animated-drop-in' : ''} ${basketAdded ? "basket-added" : ""} ${isRemoving ? "basket-removing" : ""} ${isHovering ? "basket-hovering" : ""}`}
                            onClick={() => navigate("/basket")}
                            onMouseEnter={() => setIsHovering(true)}
                            onMouseLeave={() => setIsHovering(false)}
                        >
                            <span>
                                Basket{basketCount > 0 ? ` (${basketCount})` : ""}
                            </span>
                        </button>
                    )}
                    {token && role === 'admin' && (
                        <button 
                            className='admin-nav-button' 
                            onClick={() => navigate("/dashboard")}
                        >
                           Dashboard
                        </button>
                    )}
                    {token && <button className='logout-nav-button' onClick={handleLogout}>Logout</button>}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;