import React, { createContext, useState, useEffect, useContext } from "react";

// Helper functions to avoid circular dependency issues
const getStoredUser = () => {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

const checkAuth = () => {
  return !!localStorage.getItem("token");
};

export const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const storedUser = getStoredUser();
    if (storedUser && checkAuth()) {
      setUser(storedUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const { login: loginService } = await import("../services/authService");
      const response = await loginService(email, password);
      if (response.token) {
        setUser(response);
        setIsAuthenticated(true);
        return { success: true, data: response };
      }
      return { success: false, message: response.message || "Login failed" };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      return { success: false, message, error: error.response?.data };
    }
  };

  const logout = async () => {
    try {
      const { logout: logoutService } = await import("../services/authService");
      await logoutService();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (userData) => {
    setUser((prev) => ({ ...prev, ...userData }));
    const stored = getStoredUser();
    if (stored) {
      localStorage.setItem("user", JSON.stringify({ ...stored, ...userData }));
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    updateUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;