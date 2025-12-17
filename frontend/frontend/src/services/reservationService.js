import api from './api';

// Fixed: removed duplicate '/api' since api.js baseURL already includes '/api'
const BASE_URL = '/reservations';

export const createReservation = async (reservationData) => {
    try {
        const response = await api.post(`${BASE_URL}/create/`, reservationData);
        return response.data;
    } catch (error) {
        throw new Error('Error creating reservation: ' + error.message);
    }
};

export const getReservations = async (userId) => {
    try {
        const response = await api.get(`${BASE_URL}/user/${userId}/`);
        return response.data;
    } catch (error) {
        throw new Error('Error fetching reservations: ' + error.message);
    }
};

export const cancelReservation = async (reservationId) => {
    try {
        const response = await api.delete(`${BASE_URL}/cancel/${reservationId}/`);
        return response.data;
    } catch (error) {
        throw new Error('Error canceling reservation: ' + error.message);
    }
};