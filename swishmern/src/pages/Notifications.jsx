import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, UserPlus, AtSign, CheckCircle, Trash2, Loader } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import "../styles/Notifications.css";

const API_BASE_URL = "http://localhost:5000/api";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        const userId = user._id || user.id;
        if (userId) {
          fetchNotifications(userId);
        } else {
          console.error("User ID not found in stored user data");
        }
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
  }, []);

  const fetchNotifications = async (userId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/notifications/${userId}`, {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        },
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
          },
        }
      );

      if (response.ok) {
        setNotifications(
          notifications.map((n) =>
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!currentUser) return;

    const userId = currentUser._id || currentUser.id;
    if (!userId) {
      console.error("User ID not available");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${userId}/read-all`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
          },
        }
      );

      if (response.ok) {
        setNotifications(
          notifications.map((n) => ({ ...n, isRead: true }))
        );
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
          },
        }
      );

      if (response.ok) {
        setNotifications(notifications.filter((n) => n._id !== notificationId));
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const handleClearAll = async () => {
    if (!currentUser) return;

    const userId = currentUser._id || currentUser.id;
    if (!userId) {
      console.error("User ID not available");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/notifications/${userId}/clear-all`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
          },
        }
      );

      if (response.ok) {
        setNotifications([]);
      }
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'like': return <Heart size={12} fill="currentColor" />;
      // ✅ ADDED: Icon for comment likes
      case 'comment_like': return <Heart size={12} fill="currentColor" />; 
      case 'comment': return <MessageCircle size={12} fill="currentColor" />;
      case 'follow': return <UserPlus size={12} />;
      default: return null;
    }
  };

  const getBadgeClass = (type) => {
    switch(type) {
      case 'like': return 'badge-like';
      // ✅ ADDED: Badge color for comment likes (Same as like)
      case 'comment_like': return 'badge-like';
      case 'comment': return 'badge-comment';
      case 'follow': return 'badge-follow';
      default: return 'badge-comment';
    }
  };

  const formatTime = (createdAt) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return date.toLocaleDateString();
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="notifications-container">
      <Sidebar />
      <div className="notif-header">
        <h1 className="notif-title">
          Notifications {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </h1>
        <div className="header-actions">
          {notifications.length > 0 && unreadCount > 0 && (
            <button className="mark-read-btn" onClick={handleMarkAllAsRead}>
              <CheckCircle size={16} /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button className="clear-all-btn" onClick={handleClearAll}>
              Clear all
            </button>
          )}
        </div>
      </div>

      <div className="notif-list">
        {isLoading ? (
          <div className="loading-state">
            <Loader size={32} className="spinner" />
            <p>Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <AtSign size={48} />
            <p>No notifications yet</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div key={notif._id} className={`notif-item ${!notif.isRead ? 'unread' : ''}`}>
              <div className="notif-avatar-wrapper">
                <img 
                  src={notif.senderId?.avatarUrl || "https://ui-avatars.com/api/?name=User"} 
                  alt={notif.senderId?.name} 
                  className="notif-avatar" 
                />
                <div className={`notif-icon-badge ${getBadgeClass(notif.type)}`}>
                  {getIcon(notif.type)}
                </div>
              </div>

              <div className="notif-content">
                <p className="notif-text">
                  <span className="user-name-bold">{notif.senderId?.name || "Unknown User"}</span> 
                  {/* ✅ UPDATED: Handle text vs message field just in case */}
                  {" "}{notif.text || notif.message}
                </p>
                <span className="notif-time">{formatTime(notif.createdAt)}</span>
              </div>

              {/* ✅ UPDATED: Show thumbnail for comment_like as well */}
              {(notif.type === 'like' || notif.type === 'comment' || notif.type === 'comment_like') && notif.postId?.img && (
                <div 
                  className="notif-post-thumb" 
                  style={{backgroundImage: `url(${notif.postId.img})`}}
                ></div> 
              )}

              <div className="notif-actions">
                {!notif.isRead && (
                  <button 
                    className="action-btn mark-read" 
                    onClick={() => handleMarkAsRead(notif._id)}
                    title="Mark as read"
                  >
                    ●
                  </button>
                )}
                <button 
                  className="action-btn delete" 
                  onClick={() => handleDeleteNotification(notif._id)}
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}