import React, { useState, useEffect } from 'react';
import { User, Bell, Moon, Shield, ChevronRight, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import EditProfile from '../components/EditProfile';
import "../styles/Settings.css";

const API_BASE_URL = "http://localhost:5000/api";

export default function Settings() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    likes: true,
    comments: true,
    follows: true,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        
        // Fetch notification preferences from backend
        const userId = user._id || user.id;
        if (userId) {
          fetchNotificationPreferences(userId);
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }

    // Load notification settings from localStorage as backup
    const storedSettings = localStorage.getItem("notificationSettings");
    if (storedSettings) {
      try {
        const settings = JSON.parse(storedSettings);
        setNotificationSettings(settings);
      } catch (error) {
        console.error("Error parsing notification settings:", error);
      }
    }

    setIsLoading(false);
  }, []);

  const fetchNotificationPreferences = async (userId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${userId}/preferences`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setNotificationSettings(data.preferences);
          // Save to localStorage as backup
          localStorage.setItem("notificationSettings", JSON.stringify(data.preferences));
        }
      }
    } catch (error) {
      console.error("Error fetching notification preferences:", error);
    }
  };

  const handleNotificationToggle = (type) => {
    const updatedSettings = {
      ...notificationSettings,
      [type]: !notificationSettings[type],
    };
    setNotificationSettings(updatedSettings);
    // Save to localStorage
    localStorage.setItem("notificationSettings", JSON.stringify(updatedSettings));
    // Save to backend
    saveNotificationPreferences(updatedSettings);
  };

  const saveNotificationPreferences = async (preferences) => {
    if (!currentUser) return;

    const userId = currentUser._id || currentUser.id;
    if (!userId) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${userId}/preferences`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
          },
          body: JSON.stringify(preferences),
        }
      );

      if (response.ok) {
        console.log(`✅ Notification preferences saved successfully`);
      }
    } catch (error) {
      console.error("Error saving notification preferences:", error);
    }
  };

  const handleEditProfile = () => {
    setShowEditProfile(true);
  };

  const handleEditProfileClose = () => {
    setShowEditProfile(false);
  };

  const handleEditProfileSave = (updatedUser) => {
    setCurrentUser(updatedUser);
    setShowEditProfile(false);
  };

  if (isLoading) {
    return (
      <div className="settings-container">
        <Sidebar />
        <div className="loading-state">
          <Loader size={32} className="spinner" />
          <p>Loading settings...</p>
        </div>
      </div>
    );
  }

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
        {currentUser ? (
          <div className="profile-row">
            <img 
              src={currentUser.avatarUrl || "https://ui-avatars.com/api/?name=User&background=random"} 
              alt={currentUser.name} 
              className="settings-avatar" 
            />
            <div className="profile-details">
              <h3>{currentUser.name}</h3>
              <p>{currentUser.email}</p>
              {currentUser.role && <p className="profile-role">{currentUser.role}</p>}
              <button className="edit-link" onClick={handleEditProfile}>Edit Profile</button>
            </div>
          </div>
        ) : (
          <p>User information not available</p>
        )}
      </div>

      {/* Notifications */}
      <div className="settings-card">
        <div className="card-header">
          <Bell size={18} />
          <span>Notifications</span>
        </div>
        <div className="settings-list">
          {[
            { key: 'likes', label: 'Likes' },
            { key: 'comments', label: 'Comments' },
            { key: 'follows', label: 'Follows' },
          ].map((item) => (
            <div className="setting-row" key={item.key}>
              <span className="setting-label">{item.label}</span>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={notificationSettings[item.key]}
                  onChange={() => handleNotificationToggle(item.key)}
                />
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

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <EditProfile 
          user={currentUser}
          onClose={handleEditProfileClose}
          onSave={handleEditProfileSave}
        />
      )}
    </div>
  );
}