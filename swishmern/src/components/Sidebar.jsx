import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Home, Compass, Calendar, PlusSquare, Bell, User, LogOut, Settings, Shield } from "lucide-react";
import axios from "axios";
import "../styles/Sidebar.css";

const API_BASE_URL = "http://localhost:5000/api";

export default function Sidebar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);

  // 1. Load User Data on Mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const userId = user?.id || user?._id;

  // 2. Robust Logout Function (From Legacy Code)
  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const refreshToken = localStorage.getItem("refreshToken");

      if (userId && refreshToken) {
        // Call logout API
        await axios.post(`${API_BASE_URL}/auth/logout`, {
          userId: userId,
          refreshToken: refreshToken,
        });
      }
    } catch (error) {
      console.error("❌ Logout error:", error);
    } finally {
      // Always clean up locally, even if API fails
      localStorage.clear();
      console.log("✅ Logout successful, localStorage cleared");
      
      // Dispatch auth state change event
      window.dispatchEvent(new Event('authStateChanged'));
      
      setIsLoading(false);
      navigate("/", { replace: true });
    }
  };

  return (
    <aside className="app-sidebar">
      {/* --- HEADER --- */}
      <div className="sidebar-header">
        <h1 className="logo-text">Swish</h1>
      </div>

      {/* --- MAIN NAVIGATION --- */}
      <nav className="sidebar-nav-section">
        <NavLink to="/home" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <Home size={22} />
          <span className="nav-label">Home</span>
        </NavLink>

        <NavLink to="/explore" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <Compass size={22} />
          <span className="nav-label">Explore</span>
        </NavLink>

        <NavLink to="/events" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <Calendar size={22} />
          <span className="nav-label">Events</span>
        </NavLink>

        <NavLink to="/create-post" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <PlusSquare size={22} />
          <span className="nav-label">Create</span>
        </NavLink>

        <NavLink to="/notifications" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
          <Bell size={22} />
          <span className="nav-label">Notifications</span>
        </NavLink>

        <NavLink 
          to={userId ? `/profile/${userId}` : "/login"} 
          className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
        >
          <User size={22} />
          <span className="nav-label">Profile</span>
        </NavLink>
      </nav>

      {/* --- FOOTER SECTION (Merged Features) --- */}
      <div className="sidebar-footer-section">
        <nav className="secondary-nav">
          {/* Settings Link */}
          <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
            <Settings size={22} />
            <span className="nav-label">Settings</span>
          </NavLink>
          
          {/* Admin Link (Conditional) */}
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <Shield size={22} />
              <span className="nav-label">Admin</span>
            </NavLink>
          )}
          
          {/* Logout Button */}
          <button onClick={handleLogout} className="logout-item" disabled={isLoading}>
            <LogOut size={22} />
            <span className="nav-label">{isLoading ? "Logging out..." : "Logout"}</span>
          </button>
        </nav>

        {/* User Mini Profile */}
        {user && (
          <div className="user-mini-profile">
            <img 
              src={user.avatarUrl || `https://ui-avatars.com/api/?name=${user.name}`} 
              alt={user.name} 
              className="user-avatar-sm" 
            />
            <div className="user-info-text">
              <div className="u-name">{user.name}</div>
              <div className="u-role">{user.role || "Student"}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}