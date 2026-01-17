import { createContext, useContext, useState, useEffect } from "react";
import {
  adminLogin as loginService,
  adminLogout as logoutService,
  checkAdmin,
  isAdminAuthenticated,
  getAdminUser,
} from "../services/adminService";

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // On mount, check if we have stored admin credentials
    const checkStoredAuth = () => {
      const token = localStorage.getItem("adminToken");
      const storedUser = getAdminUser();
      
      if (token && storedUser) {
        setAdmin(storedUser);
      }
      setLoading(false);
    };
    
    checkStoredAuth();
  }, []);

  const login = async (email, password) => {
    setError(null);
    setLoading(true);
    try {
      const response = await loginService(email, password);
      
      if (response.token) {
        setAdmin(response);
        return response;
      } else {
        throw new Error("Login failed. No token received.");
      }
    } catch (err) {
      // Handle axios error response
      const errorMessage = err.response?.data?.error || 
                          err.response?.data?.message || 
                          err.message || 
                          "Login failed. Please try again.";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await logoutService();
    } catch (err) {
      console.error("Logout error:", err);
    }
    setAdmin(null);
  };

  const value = {
    admin,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!admin,
    setError,
  };

  return (
    <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
  );
};

export default AdminContext;
