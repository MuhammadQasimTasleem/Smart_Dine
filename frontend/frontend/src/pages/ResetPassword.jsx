import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { verifyResetToken, resetPassword } from '../services/authService';
import '../styles/auth.css';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Password validation rules
  const validatePassword = (password) => {
    const rules = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasDigit: /\d/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/.test(password),
    };
    return rules;
  };

  const getPasswordStrength = () => {
    const rules = validatePassword(formData.password);
    const passed = Object.values(rules).filter(Boolean).length;
    if (passed === 0) return { label: "", color: "", percent: 0 };
    if (passed <= 2) return { label: "Weak", color: "#e74c3c", percent: 25 };
    if (passed <= 3) return { label: "Fair", color: "#f39c12", percent: 50 };
    if (passed <= 4) return { label: "Good", color: "#3498db", percent: 75 };
    return { label: "Strong", color: "#27ae60", percent: 100 };
  };

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await verifyResetToken(token);
        setIsValidToken(response.valid);
      } catch (error) {
        setMessage(error.response?.data?.message || 'Invalid or expired reset link.');
        setIsValidToken(false);
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setErrors({});

    const newErrors = {};

    // Password validation
    const passwordRules = validatePassword(formData.password);
    if (!formData.password) {
      newErrors.password = "Password is required.";
    } else if (!Object.values(passwordRules).every(Boolean)) {
      newErrors.password = "Password does not meet all requirements.";
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password.";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match.";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    try {
      const response = await resetPassword(token, formData.password, formData.confirmPassword);
      if (response.success) {
        setIsSuccess(true);
      } else {
        setMessage(response.message || 'Failed to reset password.');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to reset password. Please try again.';
      const errorType = error.response?.data?.error;
      
      if (errorType === 'weak_password') {
        setErrors({ password: errorMessage });
      } else if (errorType === 'password_mismatch') {
        setErrors({ confirmPassword: errorMessage });
      } else {
        setMessage(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRules = validatePassword(formData.password);
  const passwordStrength = getPasswordStrength();

  if (isValidating) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="loading-spinner"></div>
          <p>Validating reset link...</p>
        </div>
      </div>
    );
  }

  if (!isValidToken) {
    return (
      <div className="auth-container">
        <div className="auth-card error-card">
          <div className="error-icon">✕</div>
          <h2>Invalid Reset Link</h2>
          <p>{message || 'This password reset link is invalid or has expired.'}</p>
          <Link to="/forgot-password" className="auth-button">
            Request New Link
          </Link>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-card success-card">
          <div className="success-icon">✓</div>
          <h2>Password Reset Successful!</h2>
          <p>Your password has been changed successfully.</p>
          <Link to="/login" className="auth-button">
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Reset Password</h2>
        <p className="auth-subtitle">Enter your new password below</p>

        {message && <div className="error-message">{message}</div>}

        <div className="form-group">
          <label htmlFor="password">New Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Enter new password"
            value={formData.password}
            onChange={handleChange}
            className={errors.password ? "input-error" : ""}
          />
          {errors.password && <span className="field-error">{errors.password}</span>}

          {/* Password Strength Indicator */}
          {formData.password && (
            <div className="password-strength">
              <div className="strength-bar">
                <div 
                  className="strength-fill" 
                  style={{ 
                    width: `${passwordStrength.percent}%`, 
                    backgroundColor: passwordStrength.color 
                  }}
                ></div>
              </div>
              <span className="strength-label" style={{ color: passwordStrength.color }}>
                {passwordStrength.label}
              </span>
            </div>
          )}

          {/* Password Requirements Checklist */}
          <div className="password-requirements">
            <p className="requirements-title">Password must contain:</p>
            <ul className="requirements-list">
              <li className={passwordRules.minLength ? "valid" : "invalid"}>
                {passwordRules.minLength ? "✓" : "○"} At least 8 characters
              </li>
              <li className={passwordRules.hasUppercase ? "valid" : "invalid"}>
                {passwordRules.hasUppercase ? "✓" : "○"} One uppercase letter (A-Z)
              </li>
              <li className={passwordRules.hasLowercase ? "valid" : "invalid"}>
                {passwordRules.hasLowercase ? "✓" : "○"} One lowercase letter (a-z)
              </li>
              <li className={passwordRules.hasDigit ? "valid" : "invalid"}>
                {passwordRules.hasDigit ? "✓" : "○"} One digit (0-9)
              </li>
              <li className={passwordRules.hasSpecial ? "valid" : "invalid"}>
                {passwordRules.hasSpecial ? "✓" : "○"} One special character (!@#$%^&*)
              </li>
            </ul>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm new password"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={errors.confirmPassword ? "input-error" : ""}
          />
          {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <span className="field-success">✓ Passwords match</span>
          )}
        </div>

        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? 'Resetting...' : 'Reset Password'}
        </button>

        <p className="auth-footer">
          Remember your password? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default ResetPassword;
