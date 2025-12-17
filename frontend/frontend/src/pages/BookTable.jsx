import React, { useState } from 'react';
import { getTables } from '../data/tableData';
import { redirectToCheckout } from '../services/paymentService';
import '../styles/reservation.css';

const BookTable = () => {
  const tables = getTables();
  const [selectedTable, setSelectedTable] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: 2,
    occasion: '',
    notes: ''
  });

  const handleTableSelect = (table) => {
    if (!table.isAvailable) return;
    setSelectedTable(table);
    setShowForm(true);
    setShowPayment(false);
  };

  const closeModal = () => {
    setShowForm(false);
    setShowPayment(false);
    setPaymentMethod('');
  };

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleProceedToPayment = (e) => {
    e.preventDefault();
    setShowPayment(true);
  };

  const handleConfirmReservation = async () => {
    if (paymentMethod === 'card') {
      setIsProcessing(true);
      try {
        await redirectToCheckout({
          order_type: 'table_reservation',
          total_amount: 500,
          name: formData.name,
          email: formData.email || formData.name + '@customer.com',
          items: [{
            name: `Table ${selectedTable.number} Reservation`,
            description: `${selectedTable.type} - ${formData.guests} guests on ${formData.date} at ${formData.time}`,
            price: 500,
            quantity: 1
          }]
        });
      } catch (error) {
        alert('Payment failed: ' + (error.error || 'Unknown error occurred'));
        setIsProcessing(false);
      }
    } else {
      alert(`Reservation Confirmed!\nTable: ${selectedTable.number}\nDate: ${formData.date}\nTime: ${formData.time}\nGuests: ${formData.guests}\nPayment: Pay at Restaurant`);
      closeModal();
      setSelectedTable(null);
    }
  };

  return (
    <div className="book-table-page">
      <div className="book-table-hero">
        <h1>Reserve Your Table</h1>
        <p>Choose from our elegant dining spaces</p>
      </div>

      <div className="tables-container">
        <div className="tables-grid">
          {tables.map((table, index) => (
            <div
              key={table.id}
              className={`table-card ${!table.isAvailable ? 'unavailable' : ''} ${selectedTable?.id === table.id ? 'selected' : ''}`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => handleTableSelect(table)}
            >
              <div className="table-card-image">
                <img src={table.image} alt={`Table ${table.number}`} />
                <div className="table-card-overlay">
                  {table.isAvailable ? (
                    <span className="book-hint">Click to Reserve</span>
                  ) : (
                    <span className="unavailable-hint">Not Available</span>
                  )}
                </div>
                <span className={`status-badge ${table.isAvailable ? 'available' : 'booked'}`}>
                  {table.isAvailable ? 'Available' : 'Booked'}
                </span>
              </div>
              <div className="table-card-content">
                <h3>Table {table.number}</h3>
                <div className="table-details">
                  <span className="detail-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                    {table.seats} Seats
                  </span>
                  <span className="detail-item">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    {table.type}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reservation Modal */}
      {showForm && selectedTable && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div className="reservation-modal" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>&times;</button>

            {!showPayment ? (
              <>
                <div className="modal-header-reservation">
                  <img src={selectedTable.image} alt={`Table ${selectedTable.number}`} />
                  <div className="modal-table-info">
                    <h2>Table {selectedTable.number}</h2>
                    <p>{selectedTable.type} • {selectedTable.seats} Seats</p>
                  </div>
                </div>

                <form className="reservation-form-modal" onSubmit={handleProceedToPayment}>
                  <div className="form-section">
                    <h3>📍 Reservation Details</h3>
                    
                    <div className="form-grid">
                      <div className="form-row">
                        <label>Full Name *</label>
                        <input type="text" name="name" value={formData.name} onChange={handleFormChange} required placeholder="Enter your full name" />
                      </div>
                      <div className="form-row">
                        <label>Phone Number *</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleFormChange} required placeholder="03XX-XXXXXXX" />
                      </div>
                    </div>

                    <div className="form-row">
                      <label>Email</label>
                      <input type="email" name="email" value={formData.email} onChange={handleFormChange} placeholder="your@email.com (optional)" />
                    </div>

                    <div className="form-row">
                      <label>Reservation Date *</label>
                      <input type="date" name="date" value={formData.date} onChange={handleFormChange} required min={new Date().toISOString().split('T')[0]} />
                    </div>

                    <div className="form-row">
                      <label>Preferred Time *</label>
                      <input type="time" name="time" value={formData.time} onChange={handleFormChange} required />
                    </div>

                    <div className="form-grid">
                      <div className="form-row">
                        <label>Number of Guests *</label>
                        <select name="guests" value={formData.guests} onChange={handleFormChange} required>
                          {[...Array(selectedTable.seats)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1} {i === 0 ? 'Guest' : 'Guests'}</option>
                          ))}
                        </select>
                      </div>
                      <div className="form-row">
                        <label>Occasion</label>
                        <select name="occasion" value={formData.occasion} onChange={handleFormChange}>
                          <option value="">Select (Optional)</option>
                          <option value="birthday">Birthday</option>
                          <option value="anniversary">Anniversary</option>
                          <option value="date">Date Night</option>
                          <option value="business">Business</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="form-row">
                      <label>Special Requests</label>
                      <textarea name="notes" value={formData.notes} onChange={handleFormChange} placeholder="Any special requirements or preferences?" rows="3" />
                    </div>
                  </div>

                  <button type="submit" className="proceed-btn">Proceed to Confirmation</button>
                </form>
              </>
            ) : (
              <div className="payment-section">
                <h2>Confirm & Pay</h2>
                <p className="payment-subtitle">Secure your reservation</p>

                <div className="reservation-summary">
                  <div className="summary-item">
                    <span>Table</span>
                    <strong>Table {selectedTable.number} ({selectedTable.type})</strong>
                  </div>
                  <div className="summary-item">
                    <span>Date & Time</span>
                    <strong>{formData.date} at {formData.time}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Guests</span>
                    <strong>{formData.guests} {formData.guests > 1 ? 'Guests' : 'Guest'}</strong>
                  </div>
                  <div className="summary-item">
                    <span>Reservation Fee</span>
                    <strong className="fee">Rs. 500</strong>
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
                    className={`payment-option ${paymentMethod === 'cash' ? 'selected' : ''}`}
                    onClick={() => setPaymentMethod('cash')}
                  >
                    <div className="payment-icon">🏪</div>
                    <div className="payment-info">
                      <h4>Pay at Restaurant</h4>
                      <p>Pay when you arrive</p>
                    </div>
                  </div>
                </div>

                <div className="payment-actions">
                  <button className="back-btn" onClick={() => setShowPayment(false)}>Back</button>
                  <button 
                    className="confirm-btn" 
                    disabled={!paymentMethod || isProcessing}
                    onClick={handleConfirmReservation}
                  >
                    {isProcessing ? 'Processing...' : (paymentMethod === 'card' ? 'Pay Rs. 500' : 'Confirm Reservation')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookTable;