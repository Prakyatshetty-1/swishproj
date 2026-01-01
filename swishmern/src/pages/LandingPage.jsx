import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button"; // Assumes you updated this to the CSS version
import { ArrowRight, Users, Shield, Zap, Heart, Sparkles } from "lucide-react";

// Animations
import SplitText from "../components/ui/SplitText";
import Iridescence from "../components/ui/Iridescence";

// The Styles
import "../styles/Landing.css"; 

export default function Landing() {
  return (
    <div className="landing-page">

      {/* Background Animation Wrapper */}
      <div className="background-wrapper">
        <Iridescence
          color={[0.3, 0.5, 1.0]}
          mouseReact={true}
          amplitude={0.1}
          speed={1.0}
        />
      </div>

      {/* Navbar - Pinned to Top Left */}
      <nav className="landing-nav">
        <div className="nav-logo-container">
          <div className="nav-logo-icon">
            <Sparkles size={20} fill="currentColor" />
          </div>
          <span className="nav-logo-text">Swish</span>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          
          {/* Left Content: Text & CTA */}
          <div className="hero-content">
            <div className="hero-badge">
              <Sparkles size={16} />
              <span>Now Available for Students & Faculty</span>
            </div>

            <h1 className="hero-title">
              <SplitText
                text="The Exclusive Social Network for"
                className="split-text-anim"
                delay={50}
                animationFrom={{ opacity: 0, transform: 'translate3d(0,50px,0)' }}
                animationTo={{ opacity: 1, transform: 'translate3d(0,0,0)' }}
                threshold={0.2}
                rootMargin="-50px"
              />
              <span className="text-gradient">Your Campus</span>
            </h1>

            <p className="hero-subtitle">
              Connect with students and faculty. Share your campus life.
              Build meaningful relationships within your university community.
            </p>

            <div className="hero-buttons">
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                <Button variant="brand" className="btn-lg">
                  Join Community
                  <ArrowRight size={20} style={{ marginLeft: '8px' }} />
                </Button>
              </Link>
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <Button variant="hero" className="btn-lg">
                  Login
                </Button>
              </Link>
            </div>

            {/* Stats Row */}
            <div className="hero-stats">
              <div className="stat-item">
                <p className="stat-number">2.8K+</p>
                <p className="stat-label">Active Users</p>
              </div>
              <div className="stat-item">
                <p className="stat-number">12K+</p>
                <p className="stat-label">Daily Posts</p>
              </div>
              <div className="stat-item">
                <p className="stat-number">98%</p>
                <p className="stat-label">Verified Campus</p>
              </div>
            </div>
          </div>

          {/* Right Content: Phone Mockup */}
          <div className="hero-visual">
            <div className="phone-frame">
              <div className="phone-screen">
                <div className="phone-notch">
                  <div className="notch-speaker"></div>
                </div>

                <div className="app-preview">
                  {/* Mock Stories */}
                  <div className="story-row">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="story-circle"></div>
                    ))}
                  </div>

                  {/* Mock Post */}
                  <div className="mock-post">
                    <div className="post-header">
                      <div className="post-avatar"></div>
                      <div className="post-info">
                        <div className="post-line-long"></div>
                        <div className="post-line-short"></div>
                      </div>
                    </div>
                    <div className="post-image-placeholder">
                      <Heart size={48} className="heart-icon-faded" />
                    </div>
                    <div className="post-footer">
                       <div className="post-line-medium"></div>
                       <div className="post-line-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Icons */}
            <div className="floating-card user-card">
              <Users size={24} className="icon-primary" />
            </div>
            <div className="floating-card zap-card">
              <Zap size={24} className="icon-primary" />
            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="features-title">
            Why Choose <span className="text-gradient">Swish</span>?
          </h2>
          
          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Shield size={24} className="icon-primary" />
              </div>
              <h3 className="feature-heading">Campus Verified</h3>
              <p className="feature-desc">
                Only verified students and faculty can join your campus network.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Users size={24} className="icon-primary" />
              </div>
              <h3 className="feature-heading">Real Connections</h3>
              <p className="feature-desc">
                Connect with classmates, professors, and campus organizations.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon-wrapper">
                <Zap size={24} className="icon-primary" />
              </div>
              <h3 className="feature-heading">Stay Updated</h3>
              <p className="feature-desc">
                Never miss campus events, announcements, or trending topics.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}