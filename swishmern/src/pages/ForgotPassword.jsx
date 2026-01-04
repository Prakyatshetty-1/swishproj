import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import Logo from '../components/ui/Logo';

// Import CSS
import '../styles/ForgotPassword.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');     
  const [loading, setLoading] = useState(false); 

  const handleSubmit = (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!email) {
      setError("Email field cannot be empty");
      return;
    }

    setLoading(true);

    // SIMULATION: Replace this with your actual MERN backend call later
    setTimeout(() => {
      // Mock Success
      setLoading(false);
      setMessage('Password reset email sent! Please check your inbox.');
      setEmail('');
      
      // Mock Error example (uncomment to test):
      // setError('No user found with this email address.');
    }, 1500);
  };

  return (
    <div className="auth-page">
      
      {/* 1. Reusable Logo pinned to top-left */}
      <div className="auth-logo-container">
        <Logo />
      </div>

      <div className="forgot-card">
        <div className="text-center">
          <h2 className="forgot-title">Forgot Password?</h2>
          <p className="forgot-subtitle">
            No worries! Enter your email below and we’ll send you a reset link.
          </p>
        </div>

        {/* Display Success or Error Messages */}
        {message && <div className="message-success">{message}</div>}
        {error && <div className="message-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <div className="input-wrapper">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your registered email"
                className="form-input"
                required
              />
            </div>
          </div>

          <Button 
            type="submit" 
            variant="brand" 
            className="submit-btn" 
            disabled={loading}
          >
             {loading ? (
              <div className="spinner" /> 
            ) : (
              <>Send Reset Link <ArrowRight size={18} style={{marginLeft: 8}} /></>
            )}
          </Button>
        </form>

        <p className="auth-footer">
          Remembered your password?{' '}
          <Link to="/login" className="link-primary">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}