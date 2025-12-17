import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { verifyEmail } from '../services/authService';
import '../styles/auth.css';

const VerifyEmail = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying'); // verifying, success, error, expired
    const [message, setMessage] = useState('');

    useEffect(() => {
        const verify = async () => {
            try {
                const response = await verifyEmail(token);
                setStatus('success');
                setMessage(response.message || 'Email verified successfully!');
                
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } catch (error) {
                if (error.error === 'token_expired') {
                    setStatus('expired');
                    setMessage(error.message || 'Verification link has expired.');
                } else if (error.error === 'invalid_token') {
                    setStatus('error');
                    setMessage(error.message || 'Invalid verification link.');
                } else if (error.already_verified) {
                    setStatus('success');
                    setMessage('Email already verified. You can now login.');
                    setTimeout(() => {
                        navigate('/login');
                    }, 2000);
                } else {
                    setStatus('error');
                    setMessage(error.message || 'Verification failed. Please try again.');
                }
            }
        };

        if (token) {
            verify();
        } else {
            setStatus('error');
            setMessage('Invalid verification link.');
        }
    }, [token, navigate]);

    return (
        <div className="auth-container">
            <div className="auth-form verify-email-container">
                {status === 'verifying' && (
                    <>
                        <div className="verify-icon loading">⏳</div>
                        <h2>Verifying Your Email</h2>
                        <p>Please wait while we verify your email address...</p>
                        <div className="loading-spinner"></div>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <div className="verify-icon success">✅</div>
                        <h2>Email Verified!</h2>
                        <p className="auth-success">{message}</p>
                        <p>Redirecting to login page...</p>
                        <Link to="/login" className="auth-button">
                            Go to Login
                        </Link>
                    </>
                )}

                {status === 'expired' && (
                    <>
                        <div className="verify-icon expired">⏰</div>
                        <h2>Link Expired</h2>
                        <p className="auth-error">{message}</p>
                        <p>Please request a new verification email.</p>
                        <Link to="/login" className="auth-button">
                            Go to Login
                        </Link>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <div className="verify-icon error">❌</div>
                        <h2>Verification Failed</h2>
                        <p className="auth-error">{message}</p>
                        <Link to="/register" className="auth-button">
                            Register Again
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
