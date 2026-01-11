import React from 'react';
import { Heart, MessageCircle, UserPlus, AtSign, CheckCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import "../styles/Notifications.css";

const notifications = [
  { id: 1, type: 'like', user: 'Emma Williams', text: 'liked your post', time: '2m ago', avatar: 'https://ui-avatars.com/api/?name=Emma+W', read: false },
  { id: 2, type: 'comment', user: 'Dr. Michael Chen', text: 'commented on your post', time: '15m ago', avatar: 'https://ui-avatars.com/api/?name=Michael+C', read: false },
  { id: 3, type: 'follow', user: 'Alex Thompson', text: 'started following you', time: '1h ago', avatar: 'https://ui-avatars.com/api/?name=Alex+T', read: true },
  { id: 4, type: 'mention', user: 'Sarah Johnson', text: 'mentioned you in a comment', time: '2h ago', avatar: 'https://ui-avatars.com/api/?name=Sarah+J', read: true },
];

export default function Notifications() {
  
  const getIcon = (type) => {
    switch(type) {
      case 'like': return <Heart size={12} fill="currentColor" />;
      case 'comment': return <MessageCircle size={12} fill="currentColor" />;
      case 'follow': return <UserPlus size={12} />;
      case 'mention': return <AtSign size={12} />;
      default: return null;
    }
  };

  const getBadgeClass = (type) => {
    switch(type) {
      case 'like': return 'badge-like';
      case 'comment': return 'badge-comment';
      case 'follow': return 'badge-follow';
      default: return 'badge-comment';
    }
  };

  return (
    <div className="notifications-container">
      <Sidebar />
      <div className="notif-header">
        <h1 className="notif-title">Notifications</h1>
        <button className="mark-read-btn">
          <CheckCircle size={16} /> Mark all read
        </button>
      </div>

      <div className="notif-list">
        {notifications.map((notif) => (
          <div key={notif.id} className={`notif-item ${!notif.read ? 'unread' : ''}`}>
            <div className="notif-avatar-wrapper">
              <img src={notif.avatar} alt="User" className="notif-avatar" />
              <div className={`notif-icon-badge ${getBadgeClass(notif.type)}`}>
                {getIcon(notif.type)}
              </div>
            </div>

            <div className="notif-content">
              <p className="notif-text">
                <span className="user-name-bold">{notif.user}</span> {notif.text}
              </p>
              <span className="notif-time">{notif.time}</span>
            </div>

            {(notif.type === 'like' || notif.type === 'comment') && (
               // Mock Post Thumbnail
              <div className="notif-post-thumb" style={{background: '#e2e8f0'}}></div> 
            )}
          </div>
        ))}
      </div>
    </div>
  );
}