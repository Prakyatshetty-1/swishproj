import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "../components/ui/Button"; 
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Camera, AlertCircle } from "lucide-react";
import Logo from "../components/ui/Logo";
import { signInWithGoogle } from "../lib/googleAuth";

import "../styles/Signup.css";

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000/api";

export default function Signup() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isBanned, setIsBanned] = useState(false);
  const [bannedReason, setBannedReason] = useState("");
  
  // State for Form Data
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  // State for Profile Image Preview
  const [profileImage, setProfileImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  function handleChange(e) {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(""); // Clear error when user starts typing
  }

  // Handle Image Selection
  function handleImageUpload(e) {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      setImageFile(file);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    try {
      // Convert image to base64 if exists
      let avatarUrl = null;
      
      if (imageFile) {
        avatarUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = () => reject(new Error("Failed to read file"));
          reader.readAsDataURL(imageFile);
        });
      }
      
      // Submit signup
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        avatarUrl: avatarUrl,
      });

      // Store tokens and user info in localStorage
      localStorage.setItem("accessToken", response.data.accessToken);
      localStorage.setItem("refreshToken", response.data.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.data.user));
      // DO NOT set onboardingComplete here - user needs to complete onboarding first
      localStorage.removeItem("onboardingComplete");

      console.log("✅ Signup successful, tokens stored");

      setIsLoading(false);
      
      // Dispatch auth state change event
      window.dispatchEvent(new Event('authStateChanged'));
      
      // Navigate to onboarding
      navigate("/onboarding", { replace: true });

    } catch (err) {
      setIsLoading(false);
      const message = err.response?.data?.message || err.message || "Signup failed. Please try again.";
      
      // Check if user is banned
      if (err.response?.status === 403 && err.response?.data?.isBanned) {
        setIsBanned(true);
        setBannedReason(err.response?.data?.bannedReason || "No reason provided");
      } else {
        setError(message);
      }
      console.error("❌ Signup error:", err);
    }
  }

  return (
    <div className="auth-page">
      
      {/* Logo pinned to top-left */}
      <div className="auth-logo-container">
        <Logo />
      </div>

      {/* Ban Notification Modal */}
      {isBanned && (
        <div className="ban-modal-overlay" onClick={() => setIsBanned(false)}>
          <div className="ban-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="ban-modal-header">
              <AlertCircle size={32} color="#ef4444" />
              <h2>Account Banned</h2>
            </div>
            <p className="ban-modal-message">
              Your account has been suspended and you cannot sign up.
            </p>
            {bannedReason && (
              <div className="ban-reason">
                <strong>Reason:</strong> {bannedReason}
              </div>
            )}
            <p className="ban-modal-footer">
              If you believe this is a mistake, please contact support.
            </p>
            <button 
              className="ban-modal-close-btn"
              onClick={() => setIsBanned(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      <div className="signup-card">
        <div className="signup-header">
          <h1 className="signup-title">Join Swish</h1>
          <p className="signup-subtitle">Create your exclusive campus account.</p>
        </div>

        {/* Profile Picture Upload Section */}
        <div className="profile-upload-section">
          <label className="profile-upload-wrapper">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleImageUpload}
              style={{ display: 'none' }} 
            />
            <div className="profile-placeholder">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="profile-img-preview" />
              ) : (
                <User className="text-gray-400" size={40} />
              )}
            </div>
            <div className="camera-btn">
              <Camera size={16} />
            </div>
          </label>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div className="error-message" style={{color: '#ef4444', marginBottom: '1rem', fontSize: '0.875rem'}}>{error}</div>}
          
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div className="input-wrapper">
              <User className="input-icon" size={18} />
              <input
                name="name"
                type="text"
                placeholder="John Doe"
                className="form-input"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Email */}
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

          {/* Password */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={18} />
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
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

          {/* Submit Button */}
          <Button type="submit" variant="brand" className="submit-btn" disabled={isLoading}>
            {isLoading ? (
              <div className="spinner" /> 
            ) : (
              <>Create Account <ArrowRight size={18} style={{marginLeft: 8}} /></>
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="divider">
          <span>or continue with</span>
        </div>

        {/* Social Buttons */}
        <div className="social-grid">
          <button 
            type="button"
            className="social-btn"
            onClick={async () => {
              setIsLoading(true);
              setError("");
              try {
                const result = await signInWithGoogle();
                // If new Google signup, redirect to set password
                if (result?.user && result.user.passwordSetupRequired === true) {
                  setTimeout(() => {
                    navigate('/set-password', { replace: true });
                  }, 50);
                } else {
                  // Redirect after successful signup/login
                  setTimeout(() => {
                    navigate("/home", { replace: true });
                  }, 50);
                }
              } catch (err) {
                setIsLoading(false);
                setError(err.message || "Google sign in failed. Please try again.");
                console.error("Google sign in error:", err);
              }
            }}
            disabled={isLoading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Google
          </button>
          <button className="social-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.17 6.839 9.49.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.604-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.463-1.11-1.463-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.167 22 16.418 22 12c0-5.523-4.477-10-10-10z"/>
            </svg>
            GitHub
          </button>
        </div>

        {/* Footer Links */}
        <p className="auth-footer-text">
          By signing up, you agree to our <a href="#" className="link-text">Terms</a> and <a href="#" className="link-text">Privacy Policy</a>
        </p>

        <p className="login-redirect">
          Already have an account? 
          <Link to="/login" className="link-primary">Sign in</Link>
        </p>
      </div>
    </div>
  );
}