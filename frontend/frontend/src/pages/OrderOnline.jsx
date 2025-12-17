import React, { useState } from 'react';
import { getMenuItems, getCategories } from '../data/menuData';
import { redirectToCheckout } from '../services/paymentService';
import '../styles/order.css';

const OrderOnline = () => {
    const menuItems = getMenuItems();
    const categories = getCategories();
    
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [cart, setCart] = useState([]);
    const [showCheckout, setShowCheckout] = useState(false);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [itemQuantity, setItemQuantity] = useState(1);
    const [specialInstructions, setSpecialInstructions] = useState('');
    
    const [checkoutForm, setCheckoutForm] = useState({
        name: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        paymentMethod: 'cod'
    });
    
    const [showQuickOrder, setShowQuickOrder] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    // Filter menu items based on category and search
    const filteredItems = menuItems.filter(item => {
        const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const handleItemClick = (item) => {
        setSelectedItem(item);
        setItemQuantity(1);
        setSpecialInstructions('');
        setShowOrderModal(true);
        setShowQuickOrder(false);
    };

    const handleQuickOrder = (item) => {
        setSelectedItem(item);
        setItemQuantity(1);
        setSpecialInstructions('');
        setShowOrderModal(true);
        setShowQuickOrder(true);
    };

    const addToCart = () => {
        const cartItem = {
            ...selectedItem,
            quantity: itemQuantity,
            specialInstructions,
            totalPrice: selectedItem.price * itemQuantity
        };
        
        // Check if item already in cart
        const existingIndex = cart.findIndex(item => item.id === selectedItem.id);
        if (existingIndex >= 0) {
            const updatedCart = [...cart];
            updatedCart[existingIndex].quantity += itemQuantity;
            updatedCart[existingIndex].totalPrice = updatedCart[existingIndex].price * updatedCart[existingIndex].quantity;
            setCart(updatedCart);
        } else {
            setCart([...cart, cartItem]);
        }
        
        setShowOrderModal(false);
        setSelectedItem(null);
    };

    const removeFromCart = (itemId) => {
        setCart(cart.filter(item => item.id !== itemId));
    };

    const updateQuantity = (itemId, newQuantity) => {
        if (newQuantity < 1) return;
        const updatedCart = cart.map(item => {
            if (item.id === itemId) {
                return { ...item, quantity: newQuantity, totalPrice: item.price * newQuantity };
            }
            return item;
        });
        setCart(updatedCart);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + item.totalPrice, 0);
    };

    const handleCheckoutChange = (e) => {
        const { name, value } = e.target;
        setCheckoutForm({ ...checkoutForm, [name]: value });
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        
        if (checkoutForm.paymentMethod === 'card') {
            setIsProcessing(true);
            try {
                const totalAmount = getCartTotal() + 150;
                await redirectToCheckout({
                    order_type: 'food_order',
                    total_amount: totalAmount,
                    name: checkoutForm.name,
                    email: checkoutForm.email || checkoutForm.name + '@customer.com',
                    items: cart.map(item => ({
                        name: item.name,
                        description: item.description || item.name + ' - Delicious food item',
                        price: item.price,
                        quantity: item.quantity
                    }))
                });
            } catch (error) {
                alert('Payment failed: ' + (error.error || 'Unknown error occurred'));
                setIsProcessing(false);
            }
        } else {
            // Cash on Delivery
            const totalAmount = getCartTotal() + 150;
            alert('🎉 Order placed successfully! Your delicious food is on the way!\n\nPayment Method: Cash on Delivery\nTotal: Rs. ' + totalAmount);
            setCart([]);
            setShowCheckout(false);
            setCheckoutForm({
                name: '',
                email: '',
                phone: '',
                address: '',
                city: '',
                paymentMethod: 'cod'
            });
        }
    };

    return (
        <div className="order-online-page">
            {/* Hero Section */}
            <section className="order-hero">
                <div className="hero-content">
                    <h1>Order Online</h1>
                    <p>Fresh food delivered to your doorstep</p>
                </div>
            </section>

            <div className="order-container">
                {/* Search and Filter Section */}
                <div className="order-filters">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search for dishes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    
                    <div className="category-filters">
                        <button
                            className={`filter-btn ${selectedCategory === 'All' ? 'active' : ''}`}
                            onClick={() => setSelectedCategory('All')}
                        >
                            All
                        </button>
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="order-content">
                    {/* Menu Items Grid */}
                    <div className="menu-items-grid">
                        {filteredItems.map(item => (
                            <div 
                                key={item.id} 
                                className="menu-item-card"
                                onClick={() => handleItemClick(item)}
                            >
                                <div className="item-image">
                                    <img src={item.image} alt={item.name} />
                                    <span className="item-category">{item.category}</span>
                                </div>
                                <div className="item-details">
                                    <h3>{item.name}</h3>
                                    <p className="item-description">{item.description}</p>
                                    <div className="item-footer">
                                        <span className="item-price">Rs. {item.price}</span>
                                        <div className="item-actions">
                                            <button className="add-btn" onClick={(e) => { e.stopPropagation(); handleItemClick(item); }}>+ Add</button>
                                            <button className="order-now-btn" onClick={(e) => { e.stopPropagation(); handleQuickOrder(item); }}>Order Now</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Cart Sidebar */}
                    <div className="cart-sidebar">
                        <div className="cart-header">
                            <h3>🛒 Your Cart</h3>
                            <span className="cart-count">{cart.length} items</span>
                        </div>
                        
                        {cart.length === 0 ? (
                            <div className="empty-cart">
                                <span className="empty-icon">🍽️</span>
                                <p>Your cart is empty</p>
                                <span>Add some delicious items!</span>
                            </div>
                        ) : (
                            <>
                                <div className="cart-items">
                                    {cart.map(item => (
                                        <div key={item.id} className="cart-item">
                                            <img src={item.image} alt={item.name} />
                                            <div className="cart-item-info">
                                                <h4>{item.name}</h4>
                                                <span className="cart-item-price">Rs. {item.price}</span>
                                            </div>
                                            <div className="quantity-controls">
                                                <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                                                <span>{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                                            </div>
                                            <button 
                                                className="remove-btn"
                                                onClick={() => removeFromCart(item.id)}
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                
                                <div className="cart-summary">
                                    <div className="summary-row">
                                        <span>Subtotal</span>
                                        <span>Rs. {getCartTotal()}</span>
                                    </div>
                                    <div className="summary-row">
                                        <span>Delivery</span>
                                        <span>Rs. 150</span>
                                    </div>
                                    <div className="summary-row total">
                                        <span>Total</span>
                                        <span>Rs. {getCartTotal() + 150}</span>
                                    </div>
                                    
                                    <button 
                                        className="checkout-btn"
                                        onClick={() => setShowCheckout(true)}
                                    >
                                        Proceed to Checkout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Add to Cart Modal */}
            {showOrderModal && selectedItem && (
                <div className="modal-overlay" onClick={() => setShowOrderModal(false)}>
                    <div className="order-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setShowOrderModal(false)}>✕</button>
                        
                        <div className="modal-item-image">
                            <img src={selectedItem.image} alt={selectedItem.name} />
                        </div>
                        
                        <div className="modal-item-info">
                            <span className="modal-category">{selectedItem.category}</span>
                            <h2>{selectedItem.name}</h2>
                            <p className="modal-description">{selectedItem.description}</p>
                            <span className="modal-price">Rs. {selectedItem.price}</span>
                        </div>
                        
                        <div className="quantity-selector">
                            <label>Quantity:</label>
                            <div className="qty-controls">
                                <button onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}>-</button>
                                <span>{itemQuantity}</span>
                                <button onClick={() => setItemQuantity(itemQuantity + 1)}>+</button>
                            </div>
                        </div>
                        
                        <div className="special-instructions">
                            <label>Special Instructions:</label>
                            <textarea
                                placeholder="Any special requests? (e.g., less spicy, no onions)"
                                value={specialInstructions}
                                onChange={(e) => setSpecialInstructions(e.target.value)}
                            />
                        </div>
                        
                        <div className="modal-total">
                            <span>Total:</span>
                            <span className="total-price">Rs. {selectedItem.price * itemQuantity}</span>
                        </div>
                        
                        <div className="modal-actions">
                            {showQuickOrder ? (
                                <button className="order-now-modal-btn" onClick={() => {
                                    addToCart();
                                    setShowCheckout(true);
                                }}>
                                    Order Now - Rs. {selectedItem.price * itemQuantity}
                                </button>
                            ) : (
                                <button className="add-to-cart-btn" onClick={addToCart}>
                                    Add to Cart - Rs. {selectedItem.price * itemQuantity}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            {showCheckout && (
                <div className="modal-overlay" onClick={() => setShowCheckout(false)}>
                    <div className="checkout-modal" onClick={e => e.stopPropagation()}>
                        <button className="close-modal" onClick={() => setShowCheckout(false)}>✕</button>
                        
                        <h2>Checkout</h2>
                        
                        <form onSubmit={handlePlaceOrder}>
                            <div className="form-section">
                                <h3>📍 Delivery Details</h3>
                                
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Full Name *</label>
                                        <input
                                            type="text"
                                            name="name"
                                            value={checkoutForm.name}
                                            onChange={handleCheckoutChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={checkoutForm.phone}
                                            onChange={handleCheckoutChange}
                                            required
                                        />
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={checkoutForm.email}
                                        onChange={handleCheckoutChange}
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>Delivery Address *</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={checkoutForm.address}
                                        onChange={handleCheckoutChange}
                                        placeholder="House/Building, Street, Area"
                                        required
                                    />
                                </div>
                                
                                <div className="form-group">
                                    <label>City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        value={checkoutForm.city}
                                        onChange={handleCheckoutChange}
                                        required
                                    />
                                </div>
                            </div>
                            
                            <div className="form-section">
                                <h3>💳 Payment Method</h3>
                                
                                <div className="payment-options">
                                    <label className={`payment-option ${checkoutForm.paymentMethod === 'cod' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={checkoutForm.paymentMethod === 'cod'}
                                            onChange={handleCheckoutChange}
                                        />
                                        <span className="payment-icon">💵</span>
                                        <div className="payment-info">
                                            <span className="payment-name">Cash on Delivery</span>
                                            <span className="payment-desc">Pay when you receive your order</span>
                                        </div>
                                    </label>
                                    
                                    <label className={`payment-option ${checkoutForm.paymentMethod === 'card' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="card"
                                            checked={checkoutForm.paymentMethod === 'card'}
                                            onChange={handleCheckoutChange}
                                        />
                                        <span className="payment-icon">💳</span>
                                        <div className="payment-info">
                                            <span className="payment-name">Credit/Debit Card</span>
                                            <span className="payment-desc">Visa, Mastercard, UnionPay</span>
                                        </div>
                                    </label>
                                    
                                    <label className={`payment-option ${checkoutForm.paymentMethod === 'easypaisa' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="easypaisa"
                                            checked={checkoutForm.paymentMethod === 'easypaisa'}
                                            onChange={handleCheckoutChange}
                                        />
                                        <span className="payment-icon">📱</span>
                                        <div className="payment-info">
                                            <span className="payment-name">Easypaisa / JazzCash</span>
                                            <span className="payment-desc">Pay via mobile wallet</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                            
                            <div className="order-summary">
                                <h3>📋 Order Summary</h3>
                                <div className="summary-items">
                                    {cart.map(item => (
                                        <div key={item.id} className="summary-item">
                                            <span>{item.quantity}x {item.name}</span>
                                            <span>Rs. {item.totalPrice}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="summary-totals">
                                    <div className="summary-line">
                                        <span>Subtotal</span>
                                        <span>Rs. {getCartTotal()}</span>
                                    </div>
                                    <div className="summary-line">
                                        <span>Delivery Fee</span>
                                        <span>Rs. 150</span>
                                    </div>
                                    <div className="summary-line grand-total">
                                        <span>Grand Total</span>
                                        <span>Rs. {getCartTotal() + 150}</span>
                                    </div>
                                </div>
                            </div>
                            
                            <button type="submit" className="place-order-btn" disabled={isProcessing}>
                                {isProcessing ? 'Processing...' : `🍽️ Place Order - Rs. ${getCartTotal() + 150}`}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderOnline;