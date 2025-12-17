import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import '../../styles/navbar.css';

const Navbar = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();
    const { getTotalItems } = useCart();
    const navigate = useNavigate();

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const closeMenu = () => {
        setMenuOpen(false);
    };

    const handleLogout = async () => {
        await logout();
        closeMenu();
        navigate('/');
    };

    // Get first letter of username for avatar
    const getUserInitial = () => {
        if (user && user.username) {
            return user.username.charAt(0).toUpperCase();
        }
        return 'U';
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="navbar-logo" onClick={closeMenu}>
                    <span className="logo-icon">🍽️</span>
                    <span className="logo-text">Smart Dine</span>
                </Link>

                {/* Mobile Menu Toggle */}
                <div className="menu-toggle" onClick={toggleMenu}>
                    <span className={`hamburger ${menuOpen ? 'active' : ''}`}></span>
                </div>

                {/* Navigation Links */}
                <ul className={`nav-menu ${menuOpen ? 'active' : ''}`}>
                    <li className="nav-item">
                        <NavLink to="/" className="nav-link" onClick={closeMenu}>
                            Home
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/menu" className="nav-link" onClick={closeMenu}>
                            Menu
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/about" className="nav-link" onClick={closeMenu}>
                            About
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/book-table" className="nav-link" onClick={closeMenu}>
                            Book Table
                        </NavLink>
                    </li>
                    <li className="nav-item">
                        <NavLink to="/order-online" className="nav-link" onClick={closeMenu}>
                            Order Online
                        </NavLink>
                    </li>
                </ul>

                {/* Right Side - Cart & Auth */}
                <div className="navbar-right">
                    {/* Cart Icon */}
                    <Link to="/cart" className="cart-icon" onClick={closeMenu}>
                        <span className="cart-emoji">🛒</span>
                        {getTotalItems() > 0 && (
                            <span className="cart-count">{getTotalItems()}</span>
                        )}
                    </Link>

                    {/* Auth Section */}
                    {isAuthenticated ? (
                        <div className="user-section">
                            <div className="user-avatar" title={user?.username}>
                                {getUserInitial()}
                            </div>
                            <button className="logout-btn" onClick={handleLogout}>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="login-btn" onClick={closeMenu}>
                                Login
                            </Link>
                            <Link to="/register" className="signup-btn" onClick={closeMenu}>
                                Sign Up
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;