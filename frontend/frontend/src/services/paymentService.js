import api from './api';
import { loadStripe } from '@stripe/stripe-js';

let stripePromise = null;

// Get Stripe instance
export const getStripe = async () => {
    if (!stripePromise) {
        // Fetch publishable key from backend
        const response = await api.get('/payments/config/');
        stripePromise = loadStripe(response.data.publishableKey);
    }
    return stripePromise;
};

// Create checkout session and redirect to Stripe
export const createCheckoutSession = async (orderData) => {
    try {
        const response = await api.post('/payments/create-checkout-session/', orderData);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Payment failed' };
    }
};

// Redirect to Stripe Checkout
export const redirectToCheckout = async (orderData) => {
    try {
        const { url } = await createCheckoutSession(orderData);
        if (url) {
            window.location.href = url;
        }
    } catch (error) {
        throw error;
    }
};

// Create Payment Intent for custom payment flow
export const createPaymentIntent = async (amount, orderType, customerInfo) => {
    try {
        const response = await api.post('/payments/create-payment-intent/', {
            amount,
            order_type: orderType,
            ...customerInfo
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Payment failed' };
    }
};

// Get session status
export const getSessionStatus = async (sessionId) => {
    try {
        const response = await api.get(`/payments/session-status/?session_id=${sessionId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to get session status' };
    }
};

export default {
    getStripe,
    createCheckoutSession,
    redirectToCheckout,
    createPaymentIntent,
    getSessionStatus
};