import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { forgotPassword } from '../services/authService';
import '../styles/auth.css';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            const response = await forgotPassword(email);
            setSuccess(response.message || 'Password reset link sent! Check your email.');
        } catch (err) {
            setError(err.message || 'Failed to send reset link. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <form className="auth-form" onSubmit={handleSubmit}>
                <h2>Forgot Password</h2>
                <p className="form-description">
                    Enter your email address and we'll send you a link to reset your password.
                </p>
                
                {error && <div className="auth-error">{error}</div>}
                {success && <div className="auth-success">{success}</div>}
                
                {!success && (
                    <>
                        <div className="input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="you@example.com"
                            />
                        </div>
                        <button type="submit" className="auth-btn" disabled={loading}>
                            {loading ? 'Sending...' : 'Send Reset Link'}
                        </button>
                    </>
                )}
                
                <p className="switch-link">
                    Remember your password? <Link to="/login">Back to Login</Link>
                </p>
            </form>
        </div>
    );
};

export default ForgotPassword;
