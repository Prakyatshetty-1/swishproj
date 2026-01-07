
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/Setpassword.css';
import { Lock, Eye } from 'lucide-react';

const API_BASE_URL = "http://localhost:5000/api";

const SetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || 'null');
    if (!user || !user.id) {
      // No authenticated user, go to login
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!password || !confirmPassword) {
      setError('Please enter and confirm your new password');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user || !user.id) {
      setError('User session not found. Please log in again.');
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.post(`${API_BASE_URL}/auth/set-password`, {
        userId: user.id,
        password,
      });

      if (response.data && response.data.user) {
        // Update localStorage user with returned user info (hasPassword true)
        const updatedUser = { ...user, ...response.data.user };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        // Ensure onboardingComplete flag remains consistent
        if (response.data.user.onboardingComplete !== undefined) {
          localStorage.setItem('onboardingComplete', response.data.user.onboardingComplete ? 'true' : 'false');
        }

        // Notify app of auth change
        window.dispatchEvent(new Event('authStateChanged'));

        setIsLoading(false);
        navigate('/home', { replace: true });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setIsLoading(false);
      setError(err.response?.data?.message || err.message || 'Failed to set password');
      console.error('Set password error:', err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-logo-container" />

      <div className="login-card">
        <div className="login-header">
          <h1 className="login-title">Set a Password</h1>
          <p className="login-subtitle">Create a password to enable traditional login for your Google account.</p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && <div style={{ color: '#ef4444', marginBottom: '1rem' }}>{error}</div>}

          <div className="form-group">
            <label className="form-label" htmlFor="password">New Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                className="form-input"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                <Eye size={20} />
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-wrapper">
              <Lock className="input-icon" size={20} />
              <input
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                id="confirmPassword"
                className="form-input"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
              <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                <Eye size={20} />
              </button>
            </div>
          </div>

          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Saving...' : 'Set Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetPassword;