import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import '../styles/cart.css';

const Cart = () => {
    const { cartItems, removeFromCart, updateQuantity, totalAmount, clearCart } = useContext(CartContext);

    const handleQuantityChange = (itemId, newQuantity) => {
        if (newQuantity >= 1) {
            updateQuantity(itemId, newQuantity);
        }
    };

    return (
        <div className="cart-page">
            {/* Hero Section */}
            <section className="cart-hero">
                <div className="hero-content">
                    <h1>Your Cart</h1>
                    <p>Review your items before checkout</p>
                </div>
            </section>

            <div className="cart-container">
                {cartItems.length === 0 ? (
                    <div className="empty-cart-message">
                        <span className="empty-icon">🛒</span>
                        <h2>Your cart is empty</h2>
                        <p>Looks like you haven't added any items yet</p>
                        <Link to="/menu" className="browse-menu-btn">
                            Browse Our Menu
                        </Link>
                    </div>
                ) : (
                    <div className="cart-content">
                        <div className="cart-items-section">
                            <div className="section-header">
                                <h2>Cart Items ({cartItems.length})</h2>
                                <button className="clear-cart-btn" onClick={clearCart}>
                                    Clear All
                                </button>
                            </div>
                            
                            <div className="cart-items-list">
                                {cartItems.map(item => (
                                    <div key={item.id} className="cart-item-card">
                                        <div className="item-image">
                                            <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'} alt={item.name} />
                                        </div>
                                        <div className="item-info">
                                            <h3>{item.name}</h3>
                                            <p className="item-description">{item.description}</p>
                                            <span className="item-price">Rs. {item.price}</span>
                                        </div>
                                        <div className="item-quantity">
                                            <button 
                                                onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                                                disabled={item.quantity <= 1}
                                            >
                                                −
                                            </button>
                                            <span>{item.quantity}</span>
                                            <button onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>
                                                +
                                            </button>
                                        </div>
                                        <div className="item-total">
                                            <span>Rs. {(item.price * item.quantity).toFixed(0)}</span>
                                        </div>
                                        <button 
                                            className="remove-item-btn"
                                            onClick={() => removeFromCart(item.id)}
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="cart-summary-section">
                            <div className="summary-card">
                                <h3>Order Summary</h3>
                                
                                <div className="summary-row">
                                    <span>Subtotal</span>
                                    <span>Rs. {totalAmount?.toFixed(0) || 0}</span>
                                </div>
                                <div className="summary-row">
                                    <span>Delivery Fee</span>
                                    <span>Rs. 150</span>
                                </div>
                                <div className="summary-row">
                                    <span>Tax (5%)</span>
                                    <span>Rs. {((totalAmount || 0) * 0.05).toFixed(0)}</span>
                                </div>
                                
                                <div className="summary-divider"></div>
                                
                                <div className="summary-row total">
                                    <span>Total</span>
                                    <span>Rs. {((totalAmount || 0) + 150 + (totalAmount || 0) * 0.05).toFixed(0)}</span>
                                </div>
                                
                                <Link to="/checkout" className="checkout-btn">
                                    Proceed to Checkout
                                </Link>
                                
                                <Link to="/menu" className="continue-shopping">
                                    ← Continue Shopping
                                </Link>
                            </div>
                            
                            <div className="promo-card">
                                <h4>Have a promo code?</h4>
                                <div className="promo-input">
                                    <input type="text" placeholder="Enter code" />
                                    <button>Apply</button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Cart;