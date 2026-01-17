import React, { useState, useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { useNavigate } from 'react-router-dom';
import { redirectToCheckout } from '../services/paymentService';
import orderService from '../services/orderService';
import '../styles/checkout.css';

const Checkout = () => {
    const { cartItems, totalAmount, clearCart } = useContext(CartContext);
    const navigate = useNavigate();
    
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        zipCode: '',
        paymentMethod: 'cod',
        cardNumber: '',
        cardExpiry: '',
        cardCvc: '',
        saveInfo: false,
        notes: ''
    });
    
    const [isProcessing, setIsProcessing] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const calculateTotal = () => {
        const subtotal = totalAmount || 0;
        const delivery = 150;
        const tax = subtotal * 0.05;
        return subtotal + delivery + tax;
    };

    const saveOrderToDatabase = async (paymentStatus = 'pending', stripePaymentId = '') => {
        const orderData = {
            customer_name: formData.firstName + ' ' + formData.lastName,
            customer_email: formData.email,
            customer_phone: formData.phone,
            customer_address: `${formData.address}, ${formData.city}${formData.zipCode ? ', ' + formData.zipCode : ''}`,
            order_type: 'delivery',
            payment_status: paymentStatus,
            stripe_payment_id: stripePaymentId,
            special_instructions: formData.notes || '',
            items: cartItems.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity
            }))
        };
        
        const response = await orderService.placeOrder(orderData);
        return response;
    };

    const handleCheckout = async (e) => {
        e.preventDefault();
        setIsProcessing(true);
        
        try {
            if (formData.paymentMethod === 'card') {
                // Save order first with pending payment status
                const orderResponse = await saveOrderToDatabase('pending');
                
                // Redirect to Stripe checkout
                await redirectToCheckout({
                    order_type: 'food_order',
                    order_id: orderResponse.order_id,
                    total_amount: calculateTotal(),
                    name: formData.firstName + ' ' + formData.lastName,
                    email: formData.email,
                    items: cartItems.map(item => ({
                        name: item.name,
                        description: item.description || item.name + ' - Delicious food item',
                        price: item.price,
                        quantity: item.quantity
                    }))
                });
            } else {
                // Cash on Delivery or Easypaisa/JazzCash
                const paymentMethod = formData.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Easypaisa/JazzCash';
                
                // Save order to database
                const orderResponse = await saveOrderToDatabase('pending');
                
                clearCart();
                
                // Show success message
                alert(`🎉 Order placed successfully! Thank you for your order!\n\nOrder ID: #${orderResponse.order_id}\nPayment Method: ${paymentMethod}\nTotal: Rs. ${calculateTotal().toFixed(0)}`);
                navigate('/');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Order failed: ' + (error.message || 'Something went wrong. Please try again.'));
            setIsProcessing(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="checkout-page">
                <section className="checkout-hero">
                    <div className="hero-content">
                        <h1>Checkout</h1>
                        <p>Complete your order</p>
                    </div>
                </section>
                <div className="checkout-container">
                    <div className="empty-checkout">
                        <span className="empty-icon">🛒</span>
                        <h2>Your cart is empty</h2>
                        <p>Add some items to proceed with checkout</p>
                        <button onClick={() => navigate('/menu')} className="shop-btn">
                            Browse Menu
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            {/* Hero Section */}
            <section className="checkout-hero">
                <div className="hero-content">
                    <h1>Checkout</h1>
                    <p>Complete your order</p>
                </div>
            </section>

            <div className="checkout-container">
                <form onSubmit={handleCheckout} className="checkout-form">
                    <div className="checkout-content">
                        {/* Left Column - Forms */}
                        <div className="form-sections">
                            {/* Personal Information */}
                            <div className="form-section">
                                <h2>👤 Personal Information</h2>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>First Name *</label>
                                        <input
                                            type="text"
                                            name="firstName"
                                            value={formData.firstName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name *</label>
                                        <input
                                            type="text"
                                            name="lastName"
                                            value={formData.lastName}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email *</label>
                                        <input
                                            type="email"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Phone Number *</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+92 300 1234567"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Delivery Address */}
                            <div className="form-section">
                                <h2>📍 Delivery Address</h2>
                                <div className="form-group full-width">
                                    <label>Street Address *</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        placeholder="House/Building number, Street name, Area"
                                        required
                                    />
                                </div>
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>City *</label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={formData.city}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Zip/Postal Code</label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={formData.zipCode}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="form-section">
                                <h2>💳 Payment Method</h2>
                                <div className="payment-methods">
                                    <label className={`payment-method ${formData.paymentMethod === 'cod' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="cod"
                                            checked={formData.paymentMethod === 'cod'}
                                            onChange={handleChange}
                                        />
                                        <span className="method-icon">💵</span>
                                        <div className="method-info">
                                            <span className="method-name">Cash on Delivery</span>
                                            <span className="method-desc">Pay when you receive your order</span>
                                        </div>
                                    </label>
                                    
                                    <label className={`payment-method ${formData.paymentMethod === 'card' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="card"
                                            checked={formData.paymentMethod === 'card'}
                                            onChange={handleChange}
                                        />
                                        <span className="method-icon">💳</span>
                                        <div className="method-info">
                                            <span className="method-name">Credit/Debit Card</span>
                                            <span className="method-desc">Visa, Mastercard, UnionPay</span>
                                        </div>
                                    </label>
                                    
                                    <label className={`payment-method ${formData.paymentMethod === 'easypaisa' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="easypaisa"
                                            checked={formData.paymentMethod === 'easypaisa'}
                                            onChange={handleChange}
                                        />
                                        <span className="method-icon">📱</span>
                                        <div className="method-info">
                                            <span className="method-name">Easypaisa / JazzCash</span>
                                            <span className="method-desc">Pay via mobile wallet</span>
                                        </div>
                                    </label>
                                </div>

                                {/* Card payment note */}
                                {formData.paymentMethod === 'card' && (
                                    <div className="card-details">
                                        <p className="stripe-note">🔒 You will be redirected to Stripe's secure payment page to complete your card payment.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Order Summary */}
                        <div className="order-summary">
                            <h2>📋 Order Summary</h2>
                            
                            <div className="summary-items">
                                {cartItems.map(item => (
                                    <div key={item.id} className="summary-item">
                                        <img src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'} alt={item.name} />
                                        <div className="item-details">
                                            <span className="item-name">{item.name}</span>
                                            <span className="item-qty">Qty: {item.quantity}</span>
                                        </div>
                                        <span className="item-price">Rs. {(item.price * item.quantity).toFixed(0)}</span>
                                    </div>
                                ))}
                            </div>
                            
                            <div className="summary-calculations">
                                <div className="calc-row">
                                    <span>Subtotal</span>
                                    <span>Rs. {(totalAmount || 0).toFixed(0)}</span>
                                </div>
                                <div className="calc-row">
                                    <span>Delivery Fee</span>
                                    <span>Rs. 150</span>
                                </div>
                                <div className="calc-row">
                                    <span>Tax (5%)</span>
                                    <span>Rs. {((totalAmount || 0) * 0.05).toFixed(0)}</span>
                                </div>
                                <div className="calc-row total">
                                    <span>Total</span>
                                    <span>Rs. {calculateTotal().toFixed(0)}</span>
                                </div>
                            </div>
                            
                            <button 
                                type="submit" 
                                className="place-order-btn"
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processing...' : `🍽️ Place Order - Rs. ${calculateTotal().toFixed(0)}`}
                            </button>
                            
                            <p className="secure-note">
                                🔒 Your payment information is secure and encrypted
                            </p>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Checkout;