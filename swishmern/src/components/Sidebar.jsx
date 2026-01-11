import React from 'react';
import { NavLink, useNavigate, useLocation, Link } from 'react-router-dom';
import { Home, Search, PlusSquare, Bell, User, Settings, LogOut, Shield, CalendarDays } from 'lucide-react';
import Logo from './ui/Logo';
import '../styles/Sidebar.css';

// Mock Current User
const currentUser = {
  name: "Sarah Johnson",
  role: "student", 
  avatar: "https://ui-avatars.com/api/?name=Sarah+J&background=0D8ABC&color=fff"
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate('/login');
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
        <NavItem icon={Home} path="/homee" label="Home" />
        <NavItem icon={Search} path="/explore" label="Explore" />
        <NavItem icon={CalendarDays} path="/events" label="Events" />
        <NavItem icon={PlusSquare} path="/create-post" label="Create" />
        <NavItem icon={Bell} path="/notifications" label="Notifications" />
        <NavItem icon={User} path="/profile" label="Profile" />
      </nav>

      <div className="sidebar-footer-section">
        <nav className="secondary-nav">
          <NavItem icon={Settings} path="/settings" label="Settings" />
          
          {currentUser.role === 'admin' && (
            <NavItem icon={Shield} path="/admin" label="Admin" />
          )}
          
          <button onClick={handleLogout} className="logout-item">
            <LogOut size={20} />
            <span className="nav-label">Logout</span>
          </button>
        </nav>

        <div className="user-mini-profile">
          <img src={currentUser.avatar} alt={currentUser.name} className="user-avatar-sm" />
          <div className="user-info-text">
            <p className="u-name">{currentUser.name}</p>
            <p className="u-role">{currentUser.role}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}