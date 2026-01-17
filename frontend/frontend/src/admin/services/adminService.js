import api from "../../services/api";

const ADMIN_API = "/admin-panel";

// Get admin token from localStorage
const getAdminToken = () => {
  const token = localStorage.getItem("adminToken");
  return token;
};

// Create config with auth header for admin requests
const getAdminConfig = () => {
  const token = getAdminToken();
  if (!token) {
    console.warn("No admin token found in localStorage");
    return {};
  }
  return {
    headers: { 
      Authorization: `Token ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// ============================
// AUTHENTICATION
// ============================

export const adminLogin = async (email, password) => {
  const response = await api.post(`${ADMIN_API}/login/`, { email, password });
  if (response.data.token) {
    localStorage.setItem("adminToken", response.data.token);
    localStorage.setItem("adminUser", JSON.stringify(response.data));
  }
  return response.data;
};

export const adminLogout = async () => {
  try {
    const config = getAdminConfig();
    await api.post(`${ADMIN_API}/logout/`, {}, config);
  } catch (error) {
    console.error("Logout error:", error);
  }
  localStorage.removeItem("adminToken");
  localStorage.removeItem("adminUser");
};

export const checkAdmin = async () => {
  const config = getAdminConfig();
  const response = await api.get(`${ADMIN_API}/check/`, config);
  return response.data;
};

export const isAdminAuthenticated = () => {
  return !!getAdminToken();
};

export const getAdminUser = () => {
  const user = localStorage.getItem("adminUser");
  return user ? JSON.parse(user) : null;
};

// ============================
// DASHBOARD
// ============================

export const getDashboardStats = async () => {
  const config = getAdminConfig();
  const response = await api.get(`${ADMIN_API}/dashboard/stats/`, config);
  return response.data;
};

// ============================
// CATEGORIES
// ============================

export const getCategories = async () => {
  const config = getAdminConfig();
  const response = await api.get(`${ADMIN_API}/categories/`, config);
  return response.data;
};

export const getCategory = async (id) => {
  const config = getAdminConfig();
  const response = await api.get(`${ADMIN_API}/categories/${id}/`, config);
  return response.data;
};

export const createCategory = async (data) => {
  const config = getAdminConfig();
  const response = await api.post(`${ADMIN_API}/categories/`, data, config);
  return response.data;
};

export const updateCategory = async (id, data) => {
  const config = getAdminConfig();
  const response = await api.put(`${ADMIN_API}/categories/${id}/`, data, config);
  return response.data;
};

export const deleteCategory = async (id) => {
  const config = getAdminConfig();
  const response = await api.delete(`${ADMIN_API}/categories/${id}/`, config);
  return response.data;
};

// ============================
// MENU ITEMS
// ============================

export const getMenuItems = async (params = {}) => {
  const config = getAdminConfig();
  const response = await api.get(`${ADMIN_API}/menu/`, { ...config, params });
  return response.data;
};

export const getMenuItem = async (id) => {
  const config = getAdminConfig();
  const response = await api.get(`${ADMIN_API}/menu/${id}/`, config);
  return response.data;
};

export const createMenuItem = async (data) => {
  const config = getAdminConfig();
  const response = await api.post(`${ADMIN_API}/menu/`, data, config);
  return response.data;
};

export const updateMenuItem = async (id, data) => {
  const config = getAdminConfig();
  const response = await api.put(`${ADMIN_API}/menu/${id}/`, data, config);
  return response.data;
};

export const deleteMenuItem = async (id) => {
  const config = getAdminConfig();
  const response = await api.delete(`${ADMIN_API}/menu/${id}/`, config);
  return response.data;
};

// ============================
// ORDERS
// ============================

export const getOrders = async (params = {}) => {
  const config = getAdminConfig();
  const response = await api.get(`${ADMIN_API}/orders/`, { ...config, params });
  return response.data;
};

export const getOrder = async (id) => {
  const config = getAdminConfig();
  const response = await api.get(`${ADMIN_API}/orders/${id}/`, config);
  return response.data;
};

export const updateOrder = async (id, data) => {
  const config = getAdminConfig();
  const response = await api.put(`${ADMIN_API}/orders/${id}/`, data, config);
  return response.data;
};

export const updateOrderStatus = async (id, status) => {
  const config = getAdminConfig();
  const response = await api.put(`${ADMIN_API}/orders/${id}/status/`, { status }, config);
  return response.data;
};

export const deleteOrder = async (id) => {
  const config = getAdminConfig();
  const response = await api.delete(`${ADMIN_API}/orders/${id}/`, config);
  return response.data;
};

// ============================
// RESERVATIONS
// ============================

export const getReservations = async (params = {}) => {
  const config = getAdminConfig();
  const response = await api.get(`${ADMIN_API}/reservations/`, { ...config, params });
  return response.data;
};

export const getReservation = async (id) => {
  const config = getAdminConfig();
  const response = await api.get(`${ADMIN_API}/reservations/${id}/`, config);
  return response.data;
};

export const updateReservation = async (id, data) => {
  const config = getAdminConfig();
  const response = await api.put(`${ADMIN_API}/reservations/${id}/`, data, config);
  return response.data;
};

export const updateReservationStatus = async (id, status, tableNumber = null) => {
  const config = getAdminConfig();
  const data = { status };
  if (tableNumber) data.table_number = tableNumber;
  const response = await api.put(`${ADMIN_API}/reservations/${id}/status/`, data, config);
  return response.data;
};

export const deleteReservation = async (id) => {
  const config = getAdminConfig();
  const response = await api.delete(`${ADMIN_API}/reservations/${id}/`, config);
  return response.data;
};

// ============================
// USERS
// ============================

export const getUsers = async (params = {}) => {
  const config = getAdminConfig();
  const response = await api.get(`${ADMIN_API}/users/`, { ...config, params });
  return response.data;
};

export const getUser = async (id) => {
  const config = getAdminConfig();
  const response = await api.get(`${ADMIN_API}/users/${id}/`, config);
  return response.data;
};

export const updateUser = async (id, data) => {
  const config = getAdminConfig();
  const response = await api.put(`${ADMIN_API}/users/${id}/`, data, config);
  return response.data;
};

export const toggleUserStatus = async (id) => {
  const config = getAdminConfig();
  const response = await api.put(`${ADMIN_API}/users/${id}/toggle-status/`, {}, config);
  return response.data;
};

export const deleteUser = async (id) => {
  const config = getAdminConfig();
  const response = await api.delete(`${ADMIN_API}/users/${id}/`, config);
  return response.data;
};

// ============================
// REPORTS
// ============================

export const getSalesReport = async (days = 30) => {
  const config = getAdminConfig();
  const response = await api.get(`${ADMIN_API}/reports/sales/`, { ...config, params: { days } });
  return response.data;
};

export const getPopularItems = async (limit = 10) => {
  const config = getAdminConfig();
  const response = await api.get(`${ADMIN_API}/reports/popular-items/`, { ...config, params: { limit } });
  return response.data;
};
