import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/payment.css';

const PaymentCancelled = () => {
    const navigate = useNavigate();

    return (
        <div className="payment-result-page">
            <div className="payment-result-container cancelled">
                <div className="result-icon">❌</div>
                <h1>Payment Cancelled</h1>
                <p>Your payment was cancelled. No charges have been made to your account.</p>
                <p className="sub-text">If you experienced any issues, please try again or contact our support.</p>
                <div className="result-actions">
                    <button className="primary-btn" onClick={() => navigate('/cart')}>
                        Return to Cart
                    </button>
                    <button className="secondary-btn" onClick={() => navigate('/')}>
                        Go to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentCancelled;