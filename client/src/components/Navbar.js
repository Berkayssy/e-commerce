import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBasket } from '../contexts/BasketContext';
import './Navbar.css';

const Navbar = () => {
    const { token, role, logout } = useAuth();
    const { basket } = useBasket();
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

    const handleLogout = () => {
        logout();
        navigate("/");
    };

    const handleMouseEnter = () => {
        setIsHovering(true);
    };

    const handleMouseLeave = () => {
        setIsHovering(false);
    };

    return (
        <nav className="navbar">
            <div className='navbar-container'>
                {token && (role === 'user' ? (<Link className='navbar-brand' to="/">Home</Link>) : null)}
                {token && (
                    <div className='navbar-nav'>
                        {token && (role === 'user' ? (<Link className='nav-link' to="/products">Products</Link>) : role === 'admin' ? (<Link className='nav-link' to="/products">All Products</Link>) : null)}
                        {token && (role === 'user' ? (<Link className='nav-link' to="/order">My Orders</Link>) : role === 'admin' ? (<Link className='nav-link' to="/order">All Orders</Link>) : null)}
                    </div>
                )}
                <div className='navbar-nav-right'>
                    {token && role === 'user' && (
                        <button
                            className={`nav-button ${showBasket ? 'animated-drop-in' : ''} ${basketAdded ? "basket-added" : ""} ${isRemoving ? "basket-removing" : ""} ${isHovering ? "basket-hovering" : ""}`}
                            onClick={() => navigate("/basket")}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
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
                            New Product
                        </button>
                    )}
                    {token && <button className='logout-nav-button' onClick={handleLogout}>Logout</button>}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;