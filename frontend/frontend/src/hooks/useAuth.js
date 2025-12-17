import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/authService';

const useAuth = () => {
    const { setUser } = useContext(AuthContext);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const user = await authService.getCurrentUser();
                setUser(user);
            } catch (err) {
                setError(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [setUser]);

    const login = async (credentials) => {
        setLoading(true);
        try {
            const user = await authService.login(credentials);
            setUser(user);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await authService.logout();
            setUser(null);
        } catch (err) {
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        error,
        login,
        logout,
    };
};

export default useAuth;

// Re-export useAuth from AuthContext for backward compatibility
export { useAuth } from "../context/AuthContext";