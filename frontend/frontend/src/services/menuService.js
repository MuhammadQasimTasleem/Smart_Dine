import api from './api';

// Adjusted to avoid double '/api' since api.js baseURL already includes '/api'.
const MENU_API_URL = '/menu/';

export const fetchMenuItems = async () => {
    try {
        const response = await api.get(MENU_API_URL);
        return response.data;
    } catch (error) {
        console.error('Error fetching menu items:', error);
        // Provide graceful fallback sample data so UI still renders
        return [
            { id: 1, name: 'Margherita Pizza', price: 9.99, category: 'Pizza', description: 'Classic with tomatoes & mozzarella' },
            { id: 2, name: 'Caesar Salad', price: 7.5, category: 'Salad', description: 'Romaine, croutons, parmesan' },
            { id: 3, name: 'Pasta Alfredo', price: 11.25, category: 'Pasta', description: 'Creamy Alfredo sauce' },
            { id: 4, name: 'Tiramisu', price: 6.0, category: 'Dessert', description: 'Coffee-flavored Italian dessert' }
        ];
    }
};

export const fetchMenuItemById = async (id) => {
    try {
        const response = await api.get(`${MENU_API_URL}${id}/`);
        return response.data;
    } catch (error) {
        console.error(`Error fetching menu item with id ${id}:`, error);
        throw error;
    }
};

export const createMenuItem = async (menuItem) => {
    try {
        const response = await api.post(MENU_API_URL, menuItem);
        return response.data;
    } catch (error) {
        console.error('Error creating menu item:', error);
        throw error;
    }
};

export const updateMenuItem = async (id, menuItem) => {
    try {
        const response = await api.put(`${MENU_API_URL}${id}/`, menuItem);
        return response.data;
    } catch (error) {
        console.error(`Error updating menu item with id ${id}:`, error);
        throw error;
    }
};

export const deleteMenuItem = async (id) => {
    try {
        await api.delete(`${MENU_API_URL}${id}/`);
    } catch (error) {
        console.error(`Error deleting menu item with id ${id}:`, error);
        throw error;
    }
};