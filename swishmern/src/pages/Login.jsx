import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/ui/Button"; 
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";
import Logo from "../components/ui/Logo";

import "../styles/Login.css";

const API_BASE_URL = "http://localhost:5000/api";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when user starts typing
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, {
        email: formData.email,
        password: formData.password,
        rememberMe: rememberMe,
      });

      if (response.data && response.data.accessToken && response.data.user) {
        // Store tokens and user info in localStorage
        localStorage.setItem("accessToken", response.data.accessToken);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("onboardingComplete", response.data.user.onboardingComplete ? 'true' : 'false');

        setIsLoading(false);
        
        // Dispatch custom event to notify App of auth state change
        window.dispatchEvent(new Event('authStateChanged'));
        
        // Delay slightly to ensure App has processed the auth state change
        setTimeout(() => {
          navigate("/home", { replace: true });
        }, 50);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || "Login failed. Please try again.");
      console.error("Login error:", err);
    }
  }

  return (
    <div className="auth-page">
      
      {/* Logo pinned to top-left */}
      <div className="auth-logo-container">
        <Logo />
      </div>

      <div className="login-card animate-scale-in">
        <div className="login-header">
          <h1 className="login-title">Welcome Back!</h1>
          <p className="login-subtitle">Sign in to your campus account.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message" style={{color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem'}}>{error}</div>}
          
          <div className="form-group">
            <label className="form-label">Campus Email</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                name="email"
                type="email"
                placeholder="you@campus.edu"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-row">
              <label className="form-label">Password</label>
              {/* Removed Forgot Password from here */}
            </div>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* --- NEW SECTION: Remember Me & Forgot Password --- */}
          <div className="form-options">
            <label className="remember-me">
              <input 
                type="checkbox" 
                checked={rememberMe} 
                onChange={(e) => setRememberMe(e.target.checked)} 
              />
              <span>Remember me</span>
            </label>
            <Link to="/forgot-password" class="forgot-link">
              Forgot password?
            </Link>
          </div>
          {/* ----------------------------------------------- */}

          <Button type="submit" variant="brand" className="submit-btn" disabled={isLoading}>
            {isLoading ? (
              <div className="spinner" /> 
            ) : (
              <>Sign In <ArrowRight size={18} style={{marginLeft: 8}} /></>
            )}
          </Button>
        </form>

        <div className="divider">
          <span>or continue with</span>
        </div>

        <div className="social-grid">
          <button className="social-btn">
            {/* Google Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button className="social-btn">
            {/* GitHub Icon */}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            GitHub
          </button>
        </div>

        <p className="auth-footer">
          Don't have an account? 
          <Link to="/signup" className="link-primary">Sign up here</Link>
        </p>
      </div>
    </div>
  );
}