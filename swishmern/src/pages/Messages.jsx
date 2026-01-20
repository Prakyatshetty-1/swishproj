import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, Circle, Send, Paperclip, Smile, Image as ImageIcon, Video, Phone, VideoIcon, Info, ArrowLeft, Settings as SettingsIcon, Plus, X, Download } from 'lucide-react';
import { io } from 'socket.io-client';
import axiosInstance, { API_BASE_URL, validateSession } from '../lib/axiosConfig';
import { formatDistanceToNow } from 'date-fns';
import Sidebar from '../components/Sidebar';
import '../styles/Messages.css';

const SOCKET_URL = "http://localhost:5000";

export default function Messages() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showThemeSettings, setShowThemeSettings] = useState(false);
  const [chatTheme, setChatTheme] = useState('default');
  const [wallpaper, setWallpaper] = useState('none');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [socket, setSocket] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const themes = [
    { id: 'default', name: 'Default', color: '#8b5cf6' },
    { id: 'blue', name: 'Ocean Blue', color: '#3b82f6' },
    { id: 'pink', name: 'Pink', color: '#ec4899' },
    { id: 'green', name: 'Forest Green', color: '#10b981' },
    { id: 'orange', name: 'Sunset Orange', color: '#f97316' }
  ];

  const wallpapers = [
    { id: 'none', name: 'None', preview: null },
    { id: 'gradient1', name: 'Purple Gradient', preview: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
    { id: 'gradient2', name: 'Ocean', preview: 'linear-gradient(135deg, #667eea 0%, #42a5f5 100%)' },
    { id: 'pattern1', name: 'Dots', preview: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)' },
    { id: 'gradient3', name: 'Sunset', preview: 'linear-gradient(135deg, #ff6b6b 0%, #feca57 100%)' }
  ];

  useEffect(() => {
    const initializeApp = async () => {
      // Validate session first
      const isValid = await validateSession();
      if (!isValid) {
        // Session expired, validateSession already handles logout
        return;
      }

      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        navigate("/login");
        return;
      }
      
      const userData = JSON.parse(storedUser);
      setUser(userData);
      
      // Get sidebar state from localStorage
      const savedState = localStorage.getItem("sidebarCollapsed");
      if (savedState !== null) {
        setSidebarCollapsed(savedState === 'true');
      }
      
      // Listen for sidebar toggle events
      const handleSidebarToggle = (event) => {
        setSidebarCollapsed(event.detail.isCollapsed);
      };
      window.addEventListener('sidebarToggle', handleSidebarToggle);
      
      // Initialize Socket.IO
      const token = localStorage.getItem("accessToken");
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: token,
          userId: userData._id || userData.id
        }
      });
      
      newSocket.on('connect', () => {
        console.log('✅ Connected to Socket.IO server');
        newSocket.emit('user-online', userData._id || userData.id);
      });
    
    // Listen for incoming messages
    newSocket.on('receive-message', (message) => {
      console.log('📩 Received message:', message);
      
      // Only add to messages if viewing the same conversation
      if (selectedConversation && message.conversationId === selectedConversation.id) {
        setMessages(prev => [...prev, message]);
        
        // Mark as read immediately since user is viewing it
        newSocket.emit('mark-as-read', {
          conversationId: message.conversationId,
          userId: userData._id || userData.id
        });
      }
      
      // Always update conversation list to show new message
      fetchConversations();
    });
    
    // Listen for user status changes
    newSocket.on('user-status-change', ({ userId, online }) => {
      console.log(`User ${userId} is ${online ? 'online' : 'offline'}`);
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        if (online) {
          newSet.add(userId);
        } else {
          newSet.delete(userId);
        }
        return newSet;
      });
    });
    
    // Listen for typing indicator
    newSocket.on('user-typing', ({ conversationId, isTyping: typing }) => {
      if (selectedConversation && selectedConversation.id === conversationId) {
        setIsTyping(typing);
      }
    });
    
    // Listen for message delivered
    newSocket.on('message-delivered', ({ messageId }) => {
      console.log('✓ Message delivered:', messageId);
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, delivered: true } : msg
      ));
      // Update conversations to reflect delivery
      fetchConversations();
    });
    
    // Listen for messages read
    newSocket.on('messages-read', ({ conversationId }) => {
      if (selectedConversation && selectedConversation.id === conversationId) {
        setMessages(prev => prev.map(msg => ({ ...msg, read: true })));
      }
    });
    
    setSocket(newSocket);
    
    // Fetch conversations
    fetchConversations();
    
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
      newSocket.disconnect();
    };
  };
  
  initializeApp();
  }, [navigate]);
  
  // Fetch conversations from backend
  const fetchConversations = async () => {
    try {
      const response = await axiosInstance.get('/messages/conversations');
      
      setConversations(response.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch conversations:', error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      
      // Mark messages as read
      if (socket) {
        socket.emit('mark-as-read', {
          conversationId: selectedConversation.id,
          userId: user._id || user.id
        });
      }
    }
  }, [selectedConversation]);
  
  // Fetch messages for a conversation
  const fetchMessages = async (conversationId) => {
    try {
      const response = await axiosInstance.get(
        `/messages/conversations/${conversationId}/messages`
      );
      
      setMessages(response.data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredConversations = conversations.filter(conv =>
    conv.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    setShowThemeSettings(false);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() && socket && selectedConversation) {
      const tempId = `temp-${Date.now()}`;
      const messageData = {
        conversationId: selectedConversation.id,
        senderId: user._id || user.id,
        recipientId: selectedConversation.user._id,
        text: newMessage,
        type: 'text'
      };
      
      // Optimistically add to UI with temp ID
      const tempMessage = {
        _id: tempId,
        sender: user,
        text: newMessage,
        type: 'text',
        createdAt: new Date(),
        delivered: false,
        read: false
      };
      
      setMessages(prev => [...prev, tempMessage]);
      const messageText = newMessage;
      setNewMessage('');
      
      // Send via socket
      socket.emit('send-message', messageData);
      
      // Listen for confirmation to replace temp message
      const handleMessageSent = (serverMessage) => {
        if (serverMessage.text === messageText && serverMessage.conversationId === selectedConversation.id) {
          setMessages(prev => prev.map(msg => 
            msg._id === tempId ? serverMessage : msg
          ));
        }
      };
      
      // One-time listener for this specific message
      socket.once('message-sent', handleMessageSent);
      
      // Stop typing indicator
      socket.emit('typing', {
        recipientId: selectedConversation.user._id,
        conversationId: selectedConversation.id,
        isTyping: false
      });
    }
  };
  
  // Handle typing
  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (socket && selectedConversation) {
      socket.emit('typing', {
        recipientId: selectedConversation.user._id,
        conversationId: selectedConversation.id,
        isTyping: true
      });
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', {
          recipientId: selectedConversation.user._id,
          conversationId: selectedConversation.id,
          isTyping: false
        });
      }, 1000);
    }
  };

  // Fetch all users for new chat
  const fetchAllUsers = async () => {
    try {
      const currentUserId = user._id || user.id;
      
      console.log('Current user ID:', currentUserId);
      
      // Pass includeAll=true to get ALL users, not just those not following
      const response = await axiosInstance.get(`/auth/users?includeAll=true&excludeUserId=${currentUserId}`);
      
      // Backend returns { users: [...] }, so access response.data.users
      let users = response.data.users || response.data;
      
      // Double-check to filter out current user on frontend
      users = users.filter(u => u._id !== currentUserId);
      
      console.log('Fetched users for messaging:', users);
      console.log('Total users available:', users.length);
      setAllUsers(users);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      setAllUsers([]);
    }
  };
  
  // Start new conversation
  const handleStartConversation = async (selectedUser) => {
    try {
      console.log('Starting conversation with user:', selectedUser);
      console.log('Creating conversation with userId:', selectedUser._id);
      
      const response = await axiosInstance.post(
        '/messages/conversations',
        { userId: selectedUser._id }
      );
      
      console.log('Conversation created:', response.data);
      
      // Add to conversations list if not already there
      setConversations(prev => {
        const exists = prev.some(c => c.id === response.data.id);
        if (exists) {
          console.log('Conversation already exists in list');
          return prev;
        }
        console.log('Adding new conversation to list');
        return [response.data, ...prev];
      });
      
      // Select the conversation
      console.log('Selecting conversation:', response.data);
      setSelectedConversation(response.data);
      setShowNewChatModal(false);
      setUserSearchQuery('');
      
      console.log('Conversation started successfully!');
    } catch (error) {
      console.error('Failed to create conversation:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Failed to start conversation: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !socket || !selectedConversation) return;

    try {
      // Show loading state
      const tempId = `temp-${Date.now()}`;
      const fileType = file.type.startsWith('image') ? 'image' : 
                       file.type.startsWith('video') ? 'video' : 'file';
      
      const tempMessage = {
        _id: tempId,
        sender: user,
        type: fileType,
        text: `Uploading ${file.name}...`,
        createdAt: new Date(),
        delivered: false,
        read: false,
        uploading: true
      };
      
      setMessages(prev => [...prev, tempMessage]);

      // Upload file to server
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await axiosInstance.post(
        '/messages/upload',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      // Send message with uploaded file URL
      const messageData = {
        conversationId: selectedConversation.id,
        senderId: user._id || user.id,
        recipientId: selectedConversation.user._id,
        text: file.name,
        type: uploadResponse.data.type,
        mediaUrl: uploadResponse.data.url,
        thumbnail: uploadResponse.data.thumbnail
      };

      // Remove temp message
      setMessages(prev => prev.filter(msg => msg._id !== tempId));

      // Send via socket
      socket.emit('send-message', messageData);

      // Listen for confirmation
      const handleMediaSent = (serverMessage) => {
        if (serverMessage.mediaUrl === uploadResponse.data.url) {
          setMessages(prev => {
            // Avoid duplicates
            if (!prev.some(msg => msg._id === serverMessage._id)) {
              return [...prev, serverMessage];
            }
            return prev;
          });
        }
      };

      socket.once('message-sent', handleMediaSent);

    } catch (error) {
      console.error('Failed to upload file:', error);
      alert('Failed to upload file: ' + (error.response?.data?.message || error.message));
      
      // Remove failed upload message
      setMessages(prev => prev.filter(msg => !msg.uploading));
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getWallpaperStyle = () => {
    const selected = wallpapers.find(w => w.id === wallpaper);
    if (!selected || wallpaper === 'none') return {};
    
    if (wallpaper === 'pattern1') {
      return {
        background: selected.preview,
        backgroundSize: '20px 20px',
        backgroundColor: '#f9fafb'
      };
    }
    return { background: selected.preview };
  };

  const getThemeColor = () => {
    return themes.find(t => t.id === chatTheme)?.color || '#8b5cf6';
  };

  return (
    <div className="messages-container-wrapper">
      <Sidebar />
      <div className="messages-page" style={{ marginLeft: sidebarCollapsed ? '80px' : '260px' }}>
        {/* Conversations List */}
        <div className={`conversations-sidebar ${selectedConversation ? 'hidden-mobile' : ''}`}>
          <div className="messages-header">
            <h1 className="messages-title">Messages</h1>
            <button className="new-chat-btn" onClick={() => { setShowNewChatModal(true); fetchAllUsers(); }} title="New conversation">
              <Plus size={20} />
            </button>
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
                const isOnline = onlineUsers.has(conversation.user._id);
                return (
                  <div
                    key={conversation.id}
                    className={`conversation-item ${conversation.unreadCount > 0 ? 'unread' : ''} ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                    onClick={() => handleConversationClick(conversation)}
                  >
                    <div className="conversation-avatar-wrapper">
                      <img
                        src={conversation.user.avatarUrl}
                        alt={conversation.user.name}
                        className="conversation-avatar"
                      />
                      {isOnline && (
                        <Circle className="online-indicator" size={12} fill="currentColor" />
                      )}
                    </div>

                    <div className="conversation-content">
                      <div className="conversation-header">
                        <h3 className="conversation-name">{conversation.user.name}</h3>
                        {conversation.lastMessage && (
                          <span className="conversation-time">
                            {formatDistanceToNow(new Date(conversation.lastMessage.timestamp), { addSuffix: true })}
                          </span>
                        )}
                      </div>
                      <div className="conversation-message">
                        <p className={conversation.unreadCount > 0 ? 'unread-message' : ''}>
                          {conversation.lastMessage?.text || 'No messages yet'}
                        </p>
                        {conversation.unreadCount > 0 && (
                          <div className="unread-badge">{conversation.unreadCount}</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Window */}
        {selectedConversation ? (
          <div className="chat-window">
            {/* Chat Header */}
            <div className="chat-header">
              <button className="back-button" onClick={() => setSelectedConversation(null)}>
                <ArrowLeft size={20} />
              </button>
              <div className="chat-header-user">
                <img src={selectedConversation.user.avatarUrl} alt={selectedConversation.user.name} className="chat-avatar" />
                <div className="chat-user-info">
                  <h3>{selectedConversation.user.name}</h3>
                  <span className="chat-status">
                    {onlineUsers.has(selectedConversation.user._id) ? 'Active now' : 'Offline'}
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

            {/* Theme Settings Panel */}
            {showThemeSettings && (
              <div className="theme-settings-panel">
                <div className="theme-section">
                  <h4>Chat Theme</h4>
                  <div className="theme-options">
                    {themes.map(theme => (
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
                    {wallpapers.map(wp => (
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

            {/* Messages Area */}
            <div className="messages-area" style={getWallpaperStyle()}>
              <div className="messages-container">
                {messages.map((message) => {
                  const isMine = message.sender?._id === user._id || message.sender?._id === user.id;
                  return (
                    <div
                      key={message._id}
                      className={`message ${isMine ? 'sent' : 'received'}`}
                    >
                      {!isMine && (
                        <img src={selectedConversation.user.avatarUrl} alt="" className="message-avatar" />
                      )}
                      <div className="message-content" style={isMine ? { backgroundColor: getThemeColor() } : {}}>
                        {message.uploading && (
                          <div className="message-uploading">
                            <div className="spinner"></div>
                          </div>
                        )}
                        {message.type === 'image' && message.mediaUrl && (
                          <div className="message-media">
                            <img 
                              src={message.mediaUrl} 
                              alt="Shared" 
                              className="message-image"
                              loading="lazy"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div style={{ display: 'none' }} className="message-error">
                              Failed to load image
                            </div>
                            <a
                              href={message.mediaUrl}
                              download={message.text || 'image'}
                              className="media-download-btn"
                              title="Download image"
                            >
                              <Download size={16} />
                            </a>
                          </div>
                        )}
                        {message.type === 'video' && message.mediaUrl && (
                          <div className="message-media">
                            <video 
                              controls 
                              className="message-video" 
                              poster={message.thumbnail}
                              preload="metadata"
                            >
                              <source src={message.mediaUrl} type="video/mp4" />
                              Your browser does not support video playback.
                            </video>
                            <a
                              href={message.mediaUrl}
                              download={message.text || 'video'}
                              className="media-download-btn"
                              title="Download video"
                            >
                              <Download size={16} />
                            </a>
                          </div>
                        )}
                        {message.type === 'file' && message.mediaUrl && (
                          <div className="message-file">
                            <a 
                              href={message.mediaUrl} 
                              download={message.text || 'file'}
                              className="file-link"
                            >
                              <Paperclip size={16} />
                              <span>{message.text || 'Download File'}</span>
                              <Download size={16} style={{ marginLeft: 'auto' }} />
                            </a>
                          </div>
                        )}
                        {message.text && message.type === 'text' && <p className="message-text">{message.text}</p>}
                        <div className="message-meta">
                          <span className="message-time">
                            {new Date(message.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {isMine && (
                            <span className={`message-status ${message.read ? 'read' : message.delivered ? 'delivered' : 'sent'}`}>
                              {message.read ? (
                                <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
                                  <path d="M5.5 9.5L1.5 5.5L0 7L5.5 12.5L15.5 2.5L14 1L5.5 9.5Z" />
                                  <path d="M10.5 9.5L6.5 5.5L5 7L10.5 12.5L20.5 2.5L19 1L10.5 9.5Z" />
                                </svg>
                              ) : message.delivered ? (
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
                  );
                })}
                
                {/* Typing Indicator */}
                {isTyping && (
                  <div className="message received">
                    <img src={selectedConversation.user.avatarUrl} alt="" className="message-avatar" />
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Message Input */}
            <form className="message-input-area" onSubmit={handleSendMessage}>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                onChange={handleFileUpload}
              />
              <button 
                type="button" 
                className="input-action-btn" 
                onClick={() => fileInputRef.current?.click()}
                title="Attach file"
              >
                <Paperclip size={20} />
              </button>
              <button 
                type="button" 
                className="input-action-btn" 
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = handleFileUpload;
                  input.click();
                }}
                title="Send image"
              >
                <ImageIcon size={20} />
              </button>
              <input
                type="text"
                placeholder="Type a message..."
                value={newMessage}
                onChange={handleTyping}
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
              <div className="no-chat-icon">💬</div>
              <h2>Your Messages</h2>
              <p>Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
      
      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="modal-overlay" onClick={() => setShowNewChatModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Message</h2>
              <button className="modal-close-btn" onClick={() => setShowNewChatModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search users..."
                value={userSearchQuery}
                onChange={(e) => setUserSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div className="modal-users-list">
              {allUsers.length === 0 ? (
                <div style={{ 
                  padding: '2rem', 
                  textAlign: 'center', 
                  color: 'var(--text-secondary)' 
                }}>
                  <p>No users found. Loading...</p>
                </div>
              ) : (
                allUsers
                  .filter(u => 
                    u.name?.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                    u.username?.toLowerCase().includes(userSearchQuery.toLowerCase())
                  )
                  .map(selectedUser => (
                    <div
                      key={selectedUser._id}
                      className="modal-user-item"
                      onClick={() => {
                        console.log('User clicked:', selectedUser);
                        handleStartConversation(selectedUser);
                      }}
                    >
                      <img src={selectedUser.avatarUrl || '/default-avatar.png'} alt={selectedUser.name} />
                      <div className="modal-user-info">
                        <h4>{selectedUser.name}</h4>
                        <p>@{selectedUser.username}</p>
                      </div>
                      {onlineUsers.has(selectedUser._id) && (
                        <Circle className="online-indicator-small" size={10} fill="currentColor" />
                      )}
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
