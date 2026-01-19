import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, Circle, Send, Paperclip, Smile, Image as ImageIcon, Phone, VideoIcon, Info, ArrowLeft, Settings as SettingsIcon, MessageCircle } from 'lucide-react';
import { io } from 'socket.io-client';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import '../styles/Messages.css';

const API_BASE_URL = 'http://localhost:5000';

const getConversationId = (userId, otherUserId) => {
  if (!userId || !otherUserId) return 'unknown';
  return [userId, otherUserId].sort().join(':');
};

const formatTime = (date) => {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};

export default function Messages() {
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messagesByConversation, setMessagesByConversation] = useState({});
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [typingUser, setTypingUser] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [chatTheme, setChatTheme] = useState('default');
  const [wallpaper, setWallpaper] = useState('none');

  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const currentUserId = user?.id || user?._id || user?.uid;

  const themes = useMemo(() => ([
    { id: 'default', name: 'Default', color: '#8b5cf6' },
    { id: 'blue', name: 'Ocean Blue', color: '#3b82f6' },
    { id: 'pink', name: 'Pink', color: '#ec4899' },
    { id: 'green', name: 'Forest Green', color: '#10b981' },
    { id: 'orange', name: 'Sunset Orange', color: '#f97316' }
  ]), []);

  const wallpapers = useMemo(() => ([
    { id: 'none', name: 'None', preview: null },
    { id: 'gradient1', name: 'Purple Gradient', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'gradient2', name: 'Ocean', preview: 'linear-gradient(135deg, #667eea 0%, #42a5f5 100%)' },
    { id: 'pattern1', name: 'Dots', preview: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)' },
    { id: 'gradient3', name: 'Sunset', preview: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)' }
  ]), []);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // Fetch real conversations from API
    const fetchConversations = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(`${API_BASE_URL}/api/messages/conversations`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(response.data);
      } catch (error) {
        console.error('Failed to fetch conversations:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchConversations();
  }, []);

  useEffect(() => {
    const socket = io(API_BASE_URL, {
      transports: ['websocket'],
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      if (currentUserId) {
        socket.emit('user:join', {
          userId: currentUserId,
          name: user?.name || user?.username || 'User'
        });
      }
    });

    socket.on('presence:update', (onlineIds) => {
      setOnlineUsers(new Set(onlineIds));
    });

    socket.on('message:new', (incomingMessage) => {
      const conversationId = incomingMessage.conversationId;
      setMessagesByConversation((prev) => {
        const current = prev[conversationId] || [];
        return { ...prev, [conversationId]: [...current, incomingMessage] };
      });

      if (incomingMessage.senderId !== currentUserId && selectedConversation) {
        const selectedId = getConversationId(currentUserId, selectedConversation.user.id);
        if (selectedId === conversationId) {
          socket.emit('message:read', { messageId: incomingMessage.id, conversationId });
        }
      }
    });

    socket.on('message:delivered', ({ messageId, conversationId }) => {
      setMessagesByConversation((prev) => {
        const current = prev[conversationId] || [];
        const updated = current.map((msg) =>
          msg.id === messageId ? { ...msg, status: 'delivered', deliveredAt: Date.now() } : msg
        );
        return { ...prev, [conversationId]: updated };
      });
    });

    socket.on('message:read', ({ messageId, conversationId, readAt }) => {
      setMessagesByConversation((prev) => {
        const current = prev[conversationId] || [];
        const updated = current.map((msg) =>
          msg.id === messageId ? { ...msg, status: 'read', readAt } : msg
        );
        return { ...prev, [conversationId]: updated };
      });
    });

    socket.on('typing', ({ conversationId, userId, isTyping: typing }) => {
      if (!selectedConversation) return;
      const selectedId = getConversationId(currentUserId, selectedConversation.user.id);
      if (selectedId !== conversationId) return;
      if (userId === currentUserId) return;
      setTypingUser(userId);
      setIsTyping(typing);
    });

    return () => {
      socket.disconnect();
    };
  }, [currentUserId, selectedConversation, user]);

  useEffect(() => {
    if (!selectedConversation || !currentUserId || !socketRef.current) return;
    const conversationId = getConversationId(currentUserId, selectedConversation.user.id);
    socketRef.current.emit('conversation:join', { conversationId });

    // Fetch messages from API
    const fetchMessages = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const response = await axios.get(
          `${API_BASE_URL}/api/messages/conversations/${conversationId}/messages`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessagesByConversation((prev) => ({
          ...prev,
          [conversationId]: response.data
        }));

        // Mark messages as read
        await axios.put(
          `${API_BASE_URL}/api/messages/conversations/${conversationId}/read`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages();
  }, [selectedConversation, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesByConversation, isTyping, selectedConversation]);

  const filteredConversations = conversations.filter((conv) =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    setShowThemeSettings(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !currentUserId || !socketRef.current) return;

    const conversationId = getConversationId(currentUserId, selectedConversation.user.id);
    const messageId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

    const message = {
      id: messageId,
      conversationId,
      senderId: currentUserId,
      receiverId: selectedConversation.user.id,
      text: newMessage,
      timestamp: formatTime(new Date()),
      status: 'sent',
      sentAt: Date.now(),
      type: 'text'
    };

    // Optimistically add message to UI
    setMessagesByConversation((prev) => {
      const current = prev[conversationId] || [];
      return { ...prev, [conversationId]: [...current, message] };
    });

    // Send to backend API
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(
        `${API_BASE_URL}/api/messages/send`,
        {
          conversationId,
          receiverId: selectedConversation.user.id,
          text: newMessage,
          type: 'text'
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Failed to send message:', error);
    }

    // Send via Socket.IO for real-time delivery
    socketRef.current.emit('message:send', { conversationId, message });
    socketRef.current.emit('typing:stop', { conversationId, userId: currentUserId });
    setNewMessage('');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !selectedConversation || !currentUserId || !socketRef.current) return;

    const conversationId = getConversationId(currentUserId, selectedConversation.user.id);
    const messageId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const fileType = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'file';

    const message = {
      id: messageId,
      conversationId,
      senderId: currentUserId,
      receiverId: selectedConversation.user.id,
      type: fileType,
      mediaUrl: URL.createObjectURL(file),
      text: file.name,
      timestamp: formatTime(new Date()),
      status: 'sent',
      sentAt: Date.now()
    };

    setMessagesByConversation((prev) => {
      const current = prev[conversationId] || [];
      return { ...prev, [conversationId]: [...current, message] };
    });

    socketRef.current.emit('message:send', { conversationId, message });
  };

  const handleTyping = (value) => {
    setNewMessage(value);
    if (!selectedConversation || !currentUserId || !socketRef.current) return;

    const conversationId = getConversationId(currentUserId, selectedConversation.user.id);
    socketRef.current.emit('typing:start', { conversationId, userId: currentUserId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit('typing:stop', { conversationId, userId: currentUserId });
    }, 1200);
  };

  const getWallpaperStyle = () => {
    const selected = wallpapers.find((w) => w.id === wallpaper);
    if (!selected || wallpaper === 'none') return {};

    if (wallpaper === 'pattern1') {
      return {
        background: selected.preview,
        backgroundSize: '20px 20px',
        backgroundColor: 'var(--bg-secondary)'
      };
    }
    return { background: selected.preview };
  };

  const getThemeColor = () => {
    return themes.find((t) => t.id === chatTheme)?.color || '#8b5cf6';
  };

  const selectedConversationId = selectedConversation
    ? getConversationId(currentUserId, selectedConversation.user.id)
    : null;

  const messages = selectedConversationId ? (messagesByConversation[selectedConversationId] || []) : [];

  return (
    <div className="messages-container-wrapper">
      <Sidebar />
      <div className="messages-page">
        <div className={`conversations-sidebar ${selectedConversation ? 'hidden-mobile' : ''}`}>
          <div className="messages-header">
            <h1 className="messages-title">Messages</h1>
          </div>

          <div className="messages-search">
            <div className="search-input-wrapper">
              <Search className="search-icon" size={20} />
              <input
                type="text"
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="conversations-list">
            {isLoading ? (
              <div className="messages-loading">
                <div className="spinner"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="no-conversations">
                <p>{searchQuery ? 'No conversations found' : 'No messages yet'}</p>
                <p className="no-conversations-subtitle">
                  {searchQuery ? 'Try a different search' : 'Start connecting with your campus community'}
                </p>
              </div>
            ) : (
              filteredConversations.map((conversation) => {
                const timestamp = conversation.lastMessage.timestamp;
                const displayTime = timestamp 
                  ? formatDistanceToNow(new Date(timestamp), { addSuffix: true })
                  : '';
                
                return (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${conversation.lastMessage.unread ? 'unread' : ''} ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                    onClick={() => handleConversationClick(conversation)}
                  >
                    <div className="conversation-avatar-wrapper">
                      <img
                        src={conversation.user.avatarUrl}
                        alt={conversation.user.name}
                        className="conversation-avatar"
                      />
                      {onlineUsers.has(conversation.user.id) && (
                        <Circle className="online-indicator" size={12} fill="currentColor" />
                      )}
                    </div>

                    <div className="conversation-content">
                      <div className="conversation-header">
                        <h3 className="conversation-name">{conversation.user.name}</h3>
                        <span className="conversation-time">{displayTime}</span>
                      </div>
                      <div className="conversation-message">
                        <p className={conversation.lastMessage.unread ? 'unread-message' : ''}>
                          {conversation.lastMessage.text}
                        </p>
                        {conversation.lastMessage.unread && (
                          <div className="unread-badge"></div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {selectedConversation ? (
          <div className="chat-window">
            <div className="chat-header">
              <button className="back-button" onClick={() => setSelectedConversation(null)}>
                <ArrowLeft size={20} />
              </button>
              <div className="chat-header-user">
                <img src={selectedConversation.user.avatarUrl} alt={selectedConversation.user.name} className="chat-avatar" />
                <div className="chat-user-info">
                  <h3>{selectedConversation.user.name}</h3>
                  <span className="chat-status">
                    {onlineUsers.has(selectedConversation.user.id) ? 'Active now' : 'Offline'}
                  </span>
                </div>
              </div>
              <div className="chat-actions">
                <button className="chat-action-btn" onClick={() => setShowThemeSettings(!showThemeSettings)}>
                  <SettingsIcon size={20} />
                </button>
                <button className="chat-action-btn">
                  <Phone size={20} />
                </button>
                <button className="chat-action-btn">
                  <VideoIcon size={20} />
                </button>
                <button className="chat-action-btn">
                  <Info size={20} />
                </button>
              </div>
            </div>

            {showThemeSettings && (
              <div className="theme-settings-panel">
                <div className="theme-section">
                  <h4>Chat Theme</h4>
                  <div className="theme-options">
                    {themes.map((theme) => (
                      <button
                        key={theme.id}
                        className={`theme-option ${chatTheme === theme.id ? 'active' : ''}`}
                        style={{ backgroundColor: theme.color }}
                        onClick={() => setChatTheme(theme.id)}
                        title={theme.name}
                      >
                        {chatTheme === theme.id && <span className="check-mark">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="theme-section">
                  <h4>Wallpaper</h4>
                  <div className="wallpaper-options">
                    {wallpapers.map((wp) => (
                      <button
                        key={wp.id}
                        className={`wallpaper-option ${wallpaper === wp.id ? 'active' : ''}`}
                        style={wp.preview ? { background: wp.preview } : { background: '#fff' }}
                        onClick={() => setWallpaper(wp.id)}
                        title={wp.name}
                      >
                        {wallpaper === wp.id && <span className="check-mark">✓</span>}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="messages-area" style={getWallpaperStyle()}>
              <div className="messages-container">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.senderId === currentUserId ? 'sent' : 'received'}`}
                  >
                    {message.senderId !== currentUserId && (
                      <img src={selectedConversation.user.avatarUrl} alt="" className="message-avatar" />
                    )}
                    <div className="message-content" style={message.senderId === currentUserId ? { backgroundColor: getThemeColor() } : {}}>
                      {message.type === 'image' && (
                        <div className="message-media">
                          <img src={message.mediaUrl} alt="Shared" className="message-image" />
                        </div>
                      )}
                      {message.type === 'video' && (
                        <div className="message-media">
                          <video controls className="message-video">
                            <source src={message.mediaUrl} type="video/mp4" />
                          </video>
                        </div>
                      )}
                      {message.text && <p className="message-text">{message.text}</p>}
                      <div className="message-meta">
                        <span className="message-time">{message.timestamp}</span>
                        {message.senderId === currentUserId && (
                          <span className={`message-status ${message.status}`}>
                            {message.status === 'read' ? (
                              <span className="status-read">
                                <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
                                  <path d="M5.5 9.5L1.5 5.5L0 7L5.5 12.5L15.5 2.5L14 1L5.5 9.5Z" />
                                  <path d="M10.5 9.5L6.5 5.5L5 7L10.5 12.5L20.5 2.5L19 1L10.5 9.5Z" />
                                </svg>
                                {message.readAt && (
                                  <span className="seen-duration">
                                    Seen {formatDistanceToNow(new Date(message.readAt), { addSuffix: true })}
                                  </span>
                                )}
                              </span>
                            ) : message.status === 'delivered' ? (
                              <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
                                <path d="M5.5 9.5L1.5 5.5L0 7L5.5 12.5L15.5 2.5L14 1L5.5 9.5Z" />
                                <path d="M10.5 9.5L6.5 5.5L5 7L10.5 12.5L20.5 2.5L19 1L10.5 9.5Z" />
                              </svg>
                            ) : (
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                                <path d="M4.5 9.5L0.5 5.5L2 4L4.5 6.5L10 1L11.5 2.5L4.5 9.5Z" />
                              </svg>
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="message received">
                    <img src={selectedConversation.user.avatarUrl} alt="" className="message-avatar" />
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                      <span className="typing-label">
                        {typingUser ? `${selectedConversation.user.name} is typing…` : 'Typing…'}
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <form className="message-input-area" onSubmit={handleSendMessage}>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*,video/*"
                onChange={handleFileUpload}
              />
              <button type="button" className="input-action-btn" onClick={() => fileInputRef.current?.click()}>
                <Paperclip size={20} />
              </button>
              <button type="button" className="input-action-btn" onClick={() => fileInputRef.current?.click()}>
                <ImageIcon size={20} />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
                className="message-input"
              />
              <button type="button" className="input-action-btn">
                <Smile size={20} />
              </button>
              <button type="submit" className="send-button" disabled={!newMessage.trim()}>
                <Send size={20} />
              </button>
            </form>
          </div>
        ) : (
          <div className="no-chat-selected">
            <div className="no-chat-content">
              <div className="no-chat-icon">
                <MessageCircle size={40} />
              </div>
              <h2>Your Messages</h2>
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
