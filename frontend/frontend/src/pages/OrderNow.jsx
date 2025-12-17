import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { redirectToCheckout } from '../services/paymentService';
import '../styles/orderNow.css';

const OrderNow = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const item = location.state?.item;
  
  const [quantity, setQuantity] = useState(1);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    deliveryDate: '',
    deliveryTime: '',
    notes: ''
  });

  // If no item selected, redirect back to menu
  if (!item) {
    return (
      <div className="order-now-page">
        <div className="order-now-hero">
          <h1>Order Now</h1>
          <p>Select an item from our menu to order</p>
        </div>
        <div className="no-item-container">
          <div className="no-item-message">
            <span className="no-item-icon">🍽️</span>
            <h2>No Item Selected</h2>
            <p>Please select an item from our menu to place an order.</p>
            <button className="browse-menu-btn" onClick={() => navigate('/menu')}>
              Browse Menu
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1 && newQuantity <= 10) {
      setQuantity(newQuantity);
    }
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setShowPayment(true);
  };

  const getTotalPrice = () => {
    return item.price * quantity;
  };

  const handleConfirmOrder = async () => {
    if (paymentMethod === 'card') {
      setIsProcessing(true);
      try {
        await redirectToCheckout({
          order_type: 'food_order',
          total_amount: getTotalPrice(),
          name: formData.name,
          email: formData.email || formData.name + '@customer.com',
          items: [{
            name: item.name,
            description: `${item.description} - Qty: ${quantity}`,
            price: item.price,
            quantity: quantity
          }]
        });
      } catch (error) {
        alert('Payment failed: ' + (error.error || 'Unknown error occurred'));
        setIsProcessing(false);
      }
    } else {
      alert(`Order Confirmed!\nItem: ${item.name}\nQuantity: ${quantity}\nTotal: Rs. ${getTotalPrice()}\nDelivery: ${formData.address}, ${formData.city}\nPayment: Cash on Delivery`);
      navigate('/menu');
    }
  };

  const closeModal = () => {
    setShowPayment(false);
    setPaymentMethod('');
  };

  return (
    <div className="order-now-page">
      <div className="order-now-hero">
        <h1>Order Now</h1>
        <p>Complete your order details</p>
      </div>

      <div className="order-now-container">
        <div className="order-now-content">
          {/* Item Preview Card */}
          <div className="order-item-card">
            <div className="order-item-image">
              <img src={item.image} alt={item.name} />
              {item.isVeg !== undefined && (
                <span className={`veg-badge ${item.isVeg ? 'veg' : 'non-veg'}`}>
                  {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
                </span>
              )}
            </div>
            <div className="order-item-info">
              <span className="item-category">{item.category}</span>
              <h2>{item.name}</h2>
              <p>{item.description}</p>
              <div className="item-rating">
                {item.rating && <span>⭐ {item.rating}</span>}
              </div>
              <div className="item-price-qty">
                <span className="item-price">Rs. {item.price}</span>
                <div className="quantity-selector">
                  <button onClick={() => handleQuantityChange(-1)}>−</button>
                  <span>{quantity}</span>
                  <button onClick={() => handleQuantityChange(1)}>+</button>
                </div>
              </div>
              <div className="item-total">
                <span>Total:</span>
                <strong>Rs. {getTotalPrice()}</strong>
              </div>
            </div>
          </div>

          {/* Order Form */}
          <div className="order-form-card">
            <h3>📍 Delivery Details</h3>
            <form onSubmit={handleProceedToPayment}>
              <div className="form-grid">
                <div className="form-row">
                  <label>Full Name *</label>
                  <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleFormChange} 
                    required 
                    placeholder="Enter your full name" 
                  />
                </div>
                <div className="form-row">
                  <label>Phone Number *</label>
                  <input 
                    type="tel" 
                    name="phone" 
                    value={formData.phone} 
                    onChange={handleFormChange} 
                    required 
                    placeholder="03XX-XXXXXXX" 
                  />
                </div>
              </div>

              <div className="form-row">
                <label>Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleFormChange} 
                  placeholder="your@email.com (optional)" 
                />
              </div>

              <div className="form-row">
                <label>Delivery Address *</label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleFormChange} 
                  required 
                  placeholder="House/Street/Area" 
                />
              </div>

              <div className="form-grid">
                <div className="form-row">
                  <label>City *</label>
                  <select name="city" value={formData.city} onChange={handleFormChange} required>
                    <option value="">Select City</option>
                    <option value="Lahore">Lahore</option>
                    <option value="Karachi">Karachi</option>
                    <option value="Islamabad">Islamabad</option>
                    <option value="Rawalpindi">Rawalpindi</option>
                    <option value="Faisalabad">Faisalabad</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-row">
                  <label>Preferred Delivery Time</label>
                  <select name="deliveryTime" value={formData.deliveryTime} onChange={handleFormChange}>
                    <option value="">ASAP</option>
                    <option value="30min">In 30 minutes</option>
                    <option value="1hour">In 1 hour</option>
                    <option value="2hours">In 2 hours</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <label>Special Instructions</label>
                <textarea 
                  name="notes" 
                  value={formData.notes} 
                  onChange={handleFormChange} 
                  placeholder="Any special requests? (e.g., less spicy, extra sauce)" 
                  rows="3" 
                />
              </div>

              <button type="submit" className="proceed-btn">Proceed to Payment</button>
            </form>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="payment-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>
            
            <div className="payment-section">
              <h2>Confirm & Pay</h2>
              <p className="payment-subtitle">Complete your order</p>

              <div className="order-summary">
                <div className="summary-item">
                  <span>Item</span>
                  <strong>{item.name}</strong>
                </div>
                <div className="summary-item">
                  <span>Quantity</span>
                  <strong>{quantity}</strong>
                </div>
                <div className="summary-item">
                  <span>Delivery</span>
                  <strong>{formData.address}, {formData.city}</strong>
                </div>
                <div className="summary-item total">
                  <span>Total Amount</span>
                  <strong className="fee">Rs. {getTotalPrice()}</strong>
                </div>
              </div>

              <div className="payment-options">
                <div 
                  className={`payment-option ${paymentMethod === 'card' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  <div className="payment-icon">💳</div>
                  <div className="payment-info">
                    <h4>Pay Now with Card</h4>
                    <p>Secure payment via Stripe</p>
                  </div>
                </div>
                <div 
                  className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}
                  onClick={() => setPaymentMethod('cod')}
                >
                  <div className="payment-icon">💵</div>
                  <div className="payment-info">
                    <h4>Cash on Delivery</h4>
                    <p>Pay when you receive</p>
                  </div>
                </div>
              </div>

              <div className="payment-actions">
                <button className="back-btn" onClick={closeModal}>Back</button>
                <button 
                  className="confirm-btn" 
                  disabled={!paymentMethod || isProcessing}
                  onClick={handleConfirmOrder}
                >
                  {isProcessing ? 'Processing...' : (paymentMethod === 'card' ? `Pay Rs. ${getTotalPrice()}` : 'Confirm Order')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderNow;
