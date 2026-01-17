import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { resendVerification } from '../services/authService';
import '../styles/auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const [showResend, setShowResend] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleEmailChange = (e) => {
        setEmail(e.target.value);
        setError('');
        setSuccess('');
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setShowResend(false);
        setLoading(true);

        try {
            const response = await login({ email, password });
            
            if (response.success) {
                setSuccess(response.message || 'Login successful!');
                
                // Redirect to home after successful login
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            }
        } catch (err) {
            // Handle specific error types from backend
            const errorType = err.error || '';
            const errorMessage = err.message || 'Login failed. Please try again.';
            
            switch (errorType) {
                case 'not_registered':
                    setError('No account found with this email. Please register first.');
                    break;
                case 'invalid_credentials':
                    setError('Invalid credentials. Please check your password.');
                    break;
                case 'missing_email':
                case 'missing_password':
                case 'missing_fields':
                    setError('Please provide both email and password.');
                    break;
                case 'invalid_email':
                    setError('Please enter a valid email address.');
                    break;
                case 'email_not_verified':
                    setError('Please verify your email before logging in. Check your inbox for the verification link.');
                    setShowResend(true);
                    break;
                default:
                    setError(errorMessage);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleResendVerification = async () => {
        setResendLoading(true);
        setError('');
        setSuccess('');
        
        try {
            const response = await resendVerification(email);
            setSuccess(response.message || 'Verification email sent! Please check your inbox.');
            setShowResend(false);
        } catch (err) {
            if (err.error === 'already_verified') {
                setSuccess('Your email is already verified. You can login now.');
                setShowResend(false);
            } else {
                setError(err.message || 'Failed to resend verification email.');
            }
        } finally {
            setResendLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Welcome Back</h2>
                
                {error && <div className="auth-error">{error}</div>}
                {success && <div className="auth-success">{success}</div>}
                
                {showResend && (
                    <button 
                        type="button" 
                        className="resend-btn"
                        onClick={handleResendVerification}
                        disabled={resendLoading}
                    >
                        {resendLoading ? 'Sending...' : 'Resend Verification Email'}
                    </button>
                )}
                
                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={handleEmailChange}
                        required
                        placeholder="you@example.com"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                        placeholder="••••••••"
                    />
                </div>
                <p className="forgot-password-link">
                    <Link to="/forgot-password">Forgot your password?</Link>
                </p>
                <button type="submit" className="auth-btn" disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <p className="switch-link">
                    No account? <Link to="/register">Create one</Link>
                </p>
            </form>
        </div>
    );
};

export default Login;