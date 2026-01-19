import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MoreVertical, Circle, Send, Paperclip, Smile, Image as ImageIcon, Video, Phone, VideoIcon, Info, ArrowLeft, Settings as SettingsIcon } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import '../styles/Messages.css';

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
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

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
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    // Mock conversations data
    setTimeout(() => {
      const mockConversations = [
        {
          id: 1,
          user: {
            name: 'Sarah Johnson',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
            username: '@sarahjohnson'
          },
          lastMessage: {
            text: 'Hey! Are you coming to the study group tomorrow?',
            timestamp: '2m ago',
            unread: true
          },
          online: true
        },
        {
          id: 2,
          user: {
            name: 'Mike Chen',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
            username: '@mikechen'
          },
          lastMessage: {
            text: 'Thanks for sharing those notes!',
            timestamp: '1h ago',
            unread: false
          },
          online: false
        },
        {
          id: 3,
          user: {
            name: 'Emma Davis',
            avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
            username: '@emmadavis'
          },
          lastMessage: {
            text: 'Did you see the new assignment?',
            timestamp: '3h ago',
            unread: true
          },
          online: true
        }
      ];
      setConversations(mockConversations);
      setIsLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      // Mock messages data with various types
      const mockMessages = [
        {
          id: 1,
          senderId: selectedConversation.user.username,
          text: 'Hey! How are you doing?',
          timestamp: '10:30 AM',
          read: true,
          type: 'text'
        },
        {
          id: 2,
          senderId: 'me',
          text: 'I\'m good! Just finished my assignment.',
          timestamp: '10:32 AM',
          read: true,
          delivered: true,
          type: 'text'
        },
        {
          id: 3,
          senderId: selectedConversation.user.username,
          text: 'Nice! Can you share your notes?',
          timestamp: '10:33 AM',
          read: true,
          type: 'text'
        },
        {
          id: 4,
          senderId: 'me',
          type: 'image',
          mediaUrl: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400',
          text: 'Here are some photos from the lecture',
          timestamp: '10:35 AM',
          read: true,
          delivered: true
        },
        {
          id: 5,
          senderId: selectedConversation.user.username,
          text: 'Perfect! Thanks so much 🙏',
          timestamp: '10:36 AM',
          read: true,
          type: 'text'
        },
        {
          id: 6,
          senderId: 'me',
          type: 'video',
          mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
          thumbnail: 'https://images.unsplash.com/photo-1492619375914-88005aa9e8fb?w=400',
          text: 'Check out this tutorial video',
          timestamp: '10:40 AM',
          read: false,
          delivered: true
        },
        {
          id: 7,
          senderId: 'me',
          text: 'Let me know if you need anything else!',
          timestamp: '10:41 AM',
          read: false,
          delivered: false,
          type: 'text'
        }
      ];
      setMessages(mockMessages);
      
      // Simulate typing indicator
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 2000);
      }, 1000);
    }
  }, [selectedConversation]);

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
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        senderId: 'me',
        text: newMessage,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        read: false,
        delivered: false,
        type: 'text'
      };
      setMessages([...messages, message]);
      setNewMessage('');
      
      // Simulate delivery after 1 second
      setTimeout(() => {
        setMessages(prev => prev.map(msg => 
          msg.id === message.id ? { ...msg, delivered: true } : msg
        ));
      }, 1000);
      
      // Simulate typing response
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          
          // Mark as read when response comes
          setMessages(prev => prev.map(msg => 
            msg.senderId === 'me' ? { ...msg, read: true } : msg
          ));
          
          const response = {
            id: messages.length + 2,
            senderId: selectedConversation.user.username,
            text: 'Got it! Thanks for the message.',
            timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            read: false,
            type: 'text'
          };
          setMessages(prev => [...prev, response]);
        }, 2000);
      }, 500);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const fileType = file.type.startsWith('image') ? 'image' : file.type.startsWith('video') ? 'video' : 'file';
      const message = {
        id: messages.length + 1,
        senderId: 'me',
        type: fileType,
        mediaUrl: URL.createObjectURL(file),
        text: file.name,
        timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        read: false
      };
      setMessages([...messages, message]);
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
      <div className="messages-page">
        {/* Conversations List */}
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
              filteredConversations.map((conversation) => (
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
                    {conversation.online && (
                      <Circle className="online-indicator" size={12} fill="currentColor" />
                    )}
                  </div>

                  <div className="conversation-content">
                    <div className="conversation-header">
                      <h3 className="conversation-name">{conversation.user.name}</h3>
                      <span className="conversation-time">{conversation.lastMessage.timestamp}</span>
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
              ))
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
                    {selectedConversation.online ? 'Active now' : 'Offline'}
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
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.senderId === 'me' ? 'sent' : 'received'}`}
                  >
                    {message.senderId !== 'me' && (
                      <img src={selectedConversation.user.avatarUrl} alt="" className="message-avatar" />
                    )}
                    <div className="message-content" style={message.senderId === 'me' ? { backgroundColor: getThemeColor() } : {}}>
                      {message.type === 'image' && (
                        <div className="message-media">
                          <img src={message.mediaUrl} alt="Shared" className="message-image" />
                        </div>
                      )}
                      {message.type === 'video' && (
                        <div className="message-media">
                          <video controls className="message-video" poster={message.thumbnail}>
                            <source src={message.mediaUrl} type="video/mp4" />
                          </video>
                        </div>
                      )}
                      {message.text && <p className="message-text">{message.text}</p>}
                      <div className="message-meta">
                        <span className="message-time">{message.timestamp}</span>
                        {message.senderId === 'me' && (
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
                ))}
                
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
                onChange={(e) => setNewMessage(e.target.value)}
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
    </div>
  );
}
