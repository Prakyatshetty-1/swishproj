import React from 'react';
import { useState,useEffect } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Home, Search, PlusSquare, Bell, User, Settings, LogOut, Shield, CalendarDays, MessageCircle } from 'lucide-react';
import Logo from './ui/Logo';
import '../styles/sidebar.css';

const API_BASE_URL = "http://localhost:5000/api";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
      // Get user info from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      } else {
        // Redirect to login if not authenticated
        navigate("/login");
      }
  }, [navigate]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const userId = user?.id || user?._id;
      const refreshToken = localStorage.getItem("refreshToken");

      if (userId && refreshToken) {
        // Call logout API
        await axios.post(`${API_BASE_URL}/auth/logout`, {
          userId: userId,
          refreshToken: refreshToken,
        });
      }

      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("onboardingComplete");

      console.log("✅ Logout successful, localStorage cleared");

      // Dispatch auth state change event BEFORE navigation
      window.dispatchEvent(new Event('authStateChanged'));

      setIsLoading(false);
      
      // Navigate to landing page
      navigate("/", { replace: true });
      
    } catch (error) {
      setIsLoading(false);
      console.error("❌ Logout error:", error);
      
      // Still clear localStorage and redirect even if API call fails
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("onboardingComplete");
      
      // Dispatch auth state change event
      window.dispatchEvent(new Event('authStateChanged'));
      
      // Navigate to landing page
      navigate("/", { replace: true });
    }
  };

  const NavItem = ({ icon: Icon, path, label }) => {
    const isActive = location.pathname === path || (path.startsWith('/profile') && location.pathname.startsWith('/profile'));
    return (
      <NavLink to={path} className={`nav-item ${isActive ? 'active' : ''}`}>
        <Icon size={20} />
        <span className="nav-label">{label}</span>
      </NavLink>
    );
  };

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <Logo />
      </div>

      <nav className="sidebar-nav-section">
        <NavItem icon={Home} path="/home" label="Home" />
        <NavItem icon={Search} path="/explore" label="Explore" />
        <NavItem icon={CalendarDays} path="/events" label="Events" />
        <NavItem icon={MessageCircle} path="/messages" label="Messages" />
        <NavItem icon={PlusSquare} path="/create-post" label="Create" />
        <NavItem icon={Bell} path="/notifications" label="Notifications" />
        <NavItem icon={User} path="/profile" label="Profile" />
      </nav>

      <div className="sidebar-footer-section">
        <nav className="secondary-nav">
          <NavItem icon={Settings} path="/settings" label="Settings" />
          
          {user?.role === 'admin' && (
            <NavItem icon={Shield} path="/admin" label="Admin" />
          )}
          
          <button onClick={handleLogout} className="logout-item">
            <LogOut size={20} />
            <span className="nav-label">Logout</span>
          </button>
        </nav>

        <div className="user-mini-profile">
          <img src={user?.avatarUrl} alt={user?.name} className="user-avatar-sm" />
          <div className="user-info-text">
            <p className="u-name">{user?.name}</p>
            <p className="u-role">{user?.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}