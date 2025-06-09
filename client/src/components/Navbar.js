import { Link, useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { useBasket } from '../contexts/BasketContext';

const Navbar = () => {
    const { token, role, logout } = useAuth();
    const { basket } = useBasket();
    const basketCount = basket.length;

    const navigate = useNavigate();

    const handleLogout = () => {
        logout(); // clear token
        navigate("/login"); // redirect to login page
    };

    return (
        <nav className="navbar">
            <div className='navbar-container'>
                {token && (role === 'user' ? (<Link className='navbar-brand' to="/">Home</Link>) : null)}
                {token && (
                    <div className='navbar-nav'>
                        {token && (role === 'user' ? (<Link className='nav-link' to="/products">Products</Link>) : role === 'admin' ? (<Link className='nav-link' to="/products">All Products</Link>) : null)}
                        {token && (role === 'user' ? (<Link className='nav-link' to="/order">My Orders</Link>) : role === 'admin' ? (<Link className='nav-link' to="/order">All Orders</Link>) : null)}
                        {token && (role === 'user' ? (<button className={`nav-button ${basketCount > 0 ? "basket-full" : ""}`} onClick={() => navigate("/basket")}>Basket{basketCount > 0 ? ` (${basketCount})` : ""}</button>) : role === 'admin' ? (<button className='nav-button' onClick={() => navigate("/dashboard")}>New Product</button>) : null)}
                        <button className='nav-button' onClick={handleLogout}>Logout</button>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;