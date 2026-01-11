import React, { useState } from 'react';
import { User, Bell, Moon, Shield, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import "../styles/Settings.css";

export default function Settings() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="settings-container">
        <Sidebar />
      <h1 className="settings-page-title">Settings</h1>

      {/* Profile Section */}
      <div className="settings-card">
        <div className="card-header">
          <User size={18} />
          <span>Profile Settings</span>
        </div>
        <div className="profile-row">
          <img src="https://ui-avatars.com/api/?name=Sarah+J&background=random" alt="Profile" className="settings-avatar" />
          <div className="profile-details">
            <h3>Sarah Johnson</h3>
            <p>sarah.johnson@campus.edu</p>
            <button className="edit-link">Edit Profile</button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="settings-card">
        <div className="card-header">
          <Bell size={18} />
          <span>Notifications</span>
        </div>
        <div className="settings-list">
          {['Likes', 'Comments', 'Follows', 'Mentions'].map((item) => (
            <div className="setting-row" key={item}>
              <span className="setting-label">{item}</span>
              <label className="switch">
                <input type="checkbox" defaultChecked />
                <span className="slider round"></span>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="settings-card">
        <div className="card-header">
          <Moon size={18} />
          <span>Appearance</span>
        </div>
        <div className="setting-row">
          <span className="setting-label">Dark Mode</span>
          <label className="switch">
            <input 
              type="checkbox" 
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <span className="slider round"></span>
          </label>
        </div>
      </div>

      {/* Security */}
      <div className="settings-card">
        <div className="card-header">
          <Shield size={18} />
          <span>Security</span>
        </div>
        <div className="settings-list">
          <button className="setting-action-row">
            <span>Change Password</span>
            <ChevronRight size={18} className="chevron" />
          </button>
          <button className="setting-action-row">
            <span>Two-Factor Authentication</span>
            <ChevronRight size={18} className="chevron" />
          </button>
          <button className="setting-action-row">
            <span>Active Sessions</span>
            <ChevronRight size={18} className="chevron" />
          </button>
        </div>
      </div>

      <button className="logout-big-btn" onClick={() => navigate('/login')}>
        Logout
      </button>
    </div>
  );
}