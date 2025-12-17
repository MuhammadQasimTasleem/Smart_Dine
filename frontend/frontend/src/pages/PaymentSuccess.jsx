import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getSessionStatus } from '../services/paymentService';
import { useCart } from '../context/CartContext';
import '../styles/payment.css';

const PaymentSuccess = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { clearCart } = useCart();
    const [status, setStatus] = useState('loading');
    const [customerEmail, setCustomerEmail] = useState('');

    useEffect(() => {
        const sessionId = searchParams.get('session_id');
        
        if (sessionId) {
            getSessionStatus(sessionId)
                .then((data) => {
                    setStatus(data.status);
                    setCustomerEmail(data.customer_email || '');
                    if (data.status === 'paid') {
                        clearCart();
                    }
                })
                .catch(() => {
                    setStatus('error');
                });
        } else {
            setStatus('success');
            clearCart();
        }
    }, [searchParams, clearCart]);

    return (
        <div className="payment-result-page">
            <div className="payment-result-container success">
                <div className="result-icon">✅</div>
                <h1>Payment Successful!</h1>
                <p>Thank you for your order. Your payment has been processed successfully.</p>
                {customerEmail && (
                    <p className="email-note">A confirmation email has been sent to <strong>{customerEmail}</strong></p>
                )}
                <div className="result-actions">
                    <button className="primary-btn" onClick={() => navigate('/')}>
                        Go to Home
                    </button>
                    <button className="secondary-btn" onClick={() => navigate('/menu')}>
                        Order More
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;