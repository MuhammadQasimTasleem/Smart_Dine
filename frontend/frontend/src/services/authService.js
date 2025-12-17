import api from "./api";

// Register a new user
export const register = async (username, email, password) => {
  try {
    const response = await api.post("/auth/register/", {
      username,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Login user
export const login = async (email, password) => {
  try {
    const response = await api.post("/auth/login/", {
      email,
      password,
    });
    if (response.data.token) {
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Logout user
export const logout = async () => {
  try {
    const token = localStorage.getItem("token");
    if (token) {
      await api.post("/auth/logout/", {}, {
        headers: { Authorization: `Token ${token}` }
      });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
};

// Get current user profile
export const getProfile = async () => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.get("/auth/profile/", {
      headers: { Authorization: `Token ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get user profile (alias)
export const getUserProfile = getProfile;

// Update user profile
export const updateProfile = async (data) => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.put("/auth/profile/", data, {
      headers: { Authorization: `Token ${token}` }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update user profile (alias)
export const updateUserProfile = updateProfile;

// Verify email
export const verifyEmail = async (token) => {
  try {
    const response = await api.get(`/auth/verify-email/${token}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Resend verification email
export const resendVerification = async (email) => {
  try {
    const response = await api.post("/auth/resend-verification/", { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Forgot password - request reset link
export const forgotPassword = async (email) => {
  try {
    const response = await api.post("/auth/forgot-password/", { email });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Verify reset token
export const verifyResetToken = async (token) => {
  try {
    const response = await api.get(`/auth/verify-reset-token/${token}/`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Reset password
export const resetPassword = async (token, password, confirmPassword) => {
  try {
    const response = await api.post(`/auth/reset-password/${token}/`, {
      password,
      confirm_password: confirmPassword,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem("token");
  return !!token;
};

// Get stored user data
export const getStoredUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

// Get auth token
export const getToken = () => {
  return localStorage.getItem("token");
};

// Default export with all functions
const authService = {
  register,
  login,
  logout,
  getProfile,
  getUserProfile,
  updateProfile,
  updateUserProfile,
  verifyEmail,
  resendVerification,
  forgotPassword,
  verifyResetToken,
  resetPassword,
  isAuthenticated,
  getStoredUser,
  getToken,
};

export default authService;