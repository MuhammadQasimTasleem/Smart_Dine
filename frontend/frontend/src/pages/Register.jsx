import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "../services/authService";
import "../styles/auth.css";

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

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

  // Username validation
  const validateUsername = (username) => {
    const errors = [];
    if (username.length < 3) {
      errors.push("Username must be at least 3 characters long.");
    }
    if (username.length > 30) {
      errors.push("Username must be less than 30 characters.");
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username) && username.length > 0) {
      errors.push("Username can only contain letters, numbers, and underscores.");
    }
    return errors;
  };

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email) && email.length > 0) {
      return "Please enter a valid email address.";
    }
    return null;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear specific error when user starts typing
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
    setMessage("");
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrors({});

    // Validate all fields
    const newErrors = {};

    // Username validation
    const usernameErrors = validateUsername(formData.username);
    if (!formData.username.trim()) {
      newErrors.username = "Username is required.";
    } else if (usernameErrors.length > 0) {
      newErrors.username = usernameErrors[0];
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required.";
    } else {
      const emailError = validateEmail(formData.email);
      if (emailError) {
        newErrors.email = emailError;
      }
    }

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
      const response = await register(
        formData.username,
        formData.email,
        formData.password
      );
      
      if (response.success) {
        setIsSuccess(true);
        setMessage(response.message || "Registration successful! Please check your email to verify your account.");
      } else {
        setMessage(response.message || "Registration failed. Please try again.");
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Registration failed. Please try again.";
      const errorType = error.response?.data?.error;
      
      if (errorType === 'username_exists') {
        setErrors({ username: errorMessage });
      } else if (errorType === 'email_exists') {
        setErrors({ email: errorMessage });
      } else if (errorType === 'weak_password') {
        setErrors({ password: errorMessage });
      } else if (errorType === 'invalid_username') {
        setErrors({ username: errorMessage });
      } else if (errorType === 'invalid_email') {
        setErrors({ email: errorMessage });
      } else {
        setMessage(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const passwordRules = validatePassword(formData.password);
  const passwordStrength = getPasswordStrength();

  if (isSuccess) {
    return (
      <div className="auth-container">
        <div className="auth-card success-card">
          <div className="success-icon">✓</div>
          <h2>Registration Successful!</h2>
          <p className="success-message">
            We've sent a verification email to <strong>{formData.email}</strong>
          </p>
          <p className="success-instructions">
            Please check your inbox and click the verification link to activate your account.
          </p>
          <div className="success-note">
            <small>Didn't receive the email? Check your spam folder or wait a few minutes.</small>
          </div>
          <Link to="/login" className="auth-button">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <form className="auth-card" onSubmit={handleSubmit}>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join Smart Dine today</p>

        {message && <div className="error-message">{message}</div>}

        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            name="username"
            placeholder="Choose a username"
            value={formData.username}
            onChange={handleChange}
            className={errors.username ? "input-error" : ""}
          />
          {errors.username && <span className="field-error">{errors.username}</span>}
          <small className="field-hint">3-30 characters, letters, numbers, and underscores only</small>
        </div>

        <div className="form-group">
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "input-error" : ""}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Create a strong password"
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
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Confirm your password"
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
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login here</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;