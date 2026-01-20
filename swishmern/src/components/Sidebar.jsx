import React from 'react';
import { useState,useEffect } from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { Home, Search, PlusSquare, Bell, User, Settings, LogOut, Shield, CalendarDays } from 'lucide-react';
import Logo from './ui/Logo';
import '../styles/sidebar.css';

const API_BASE_URL = "http://localhost:5000/api";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  useEffect(() => {
      // Get user info from localStorage
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        const userData = JSON.parse(storedUser);
        const userId = userData._id || userData.id;
        if (userId) {
          fetchUnreadNotifications(userId);
        }
      } else {
        // Redirect to login if not authenticated
        navigate("/login");
      }
  }, [navigate]);

  // Fetch unread notifications count
  const fetchUnreadNotifications = async (userId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/notifications/${userId}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        }
      });
      const unreadCount = (response.data.notifications || []).filter(n => !n.isRead).length;
      setUnreadNotificationCount(unreadCount);
    } catch (error) {
      console.error("Error fetching notifications count:", error);
    }
  };

  // Listen for notification updates
  useEffect(() => {
    const handleNotificationUpdate = () => {
      if (user) {
        const userId = user._id || user.id;
        if (userId) {
          fetchUnreadNotifications(userId);
        }
      }
    };

    window.addEventListener('notificationsUpdated', handleNotificationUpdate);
    return () => window.removeEventListener('notificationsUpdated', handleNotificationUpdate);
  }, [user]);

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

  const NavItem = ({ icon: Icon, path, label, badge = 0 }) => {
    const isActive = location.pathname === path || (path.startsWith('/profile') && location.pathname.startsWith('/profile'));
    return (
      <NavLink to={path} className={`nav-item ${isActive ? 'active' : ''}`}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Icon size={20} />
          {badge > 0 && (
            <span className="notification-badge">{badge > 99 ? '99+' : badge}</span>
          )}
        </div>
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
        <NavItem icon={PlusSquare} path="/create-post" label="Create" />
        <NavItem icon={Bell} path="/notifications" label="Notifications" badge={unreadNotificationCount} />
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