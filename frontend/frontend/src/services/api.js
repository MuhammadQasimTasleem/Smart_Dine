import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// --- ADD THIS SECTION ---
// Request interceptor to add the auth token header to every request
// Only sets token if the config doesn't already have Authorization header
api.interceptors.request.use(
    (config) => {
        // Don't override if Authorization header is already set
        if (config.headers.Authorization) {
            return config;
        }
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Token ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
// ------------------------

// Example API calls
export const fetchMenuItems = async () => {
    try {
        const response = await api.get('/menu/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const fetchReservations = async () => {
    try {
        const response = await api.get('/reservations/');
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const createOrder = async (orderData) => {
    try {
        const response = await api.post('/orders/', orderData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// Add more API functions as needed

export default api;