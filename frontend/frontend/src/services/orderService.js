import api from './api';

const orderService = {
    placeOrder: async (orderData) => {
        try {
            const response = await api.post('/orders/', orderData);
            return response.data;
        } catch (error) {
            throw new Error('Error placing order: ' + error.message);
        }
    },

    getOrderHistory: async (userId) => {
        try {
            const response = await api.get(`/orders/history/${userId}/`);
            return response.data;
        } catch (error) {
            throw new Error('Error fetching order history: ' + error.message);
        }
    },

    trackOrder: async (orderId) => {
        try {
            const response = await api.get(`/orders/track/${orderId}/`);
            return response.data;
        } catch (error) {
            throw new Error('Error tracking order: ' + error.message);
        }
    }
};

export default orderService;