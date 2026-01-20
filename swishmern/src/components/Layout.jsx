import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  
  useEffect(() => {
    // Get initial state from localStorage
    const savedState = localStorage.getItem("sidebarCollapsed");
    if (savedState !== null) {
      setSidebarCollapsed(savedState === 'true');
    }
    
    // Listen for sidebar toggle events
    const handleSidebarToggle = (event) => {
      setSidebarCollapsed(event.detail.isCollapsed);
    };
    window.addEventListener('sidebarToggle', handleSidebarToggle);
    
    return () => {
      window.removeEventListener('sidebarToggle', handleSidebarToggle);
    };
  }, []);
  
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ 
        flex: 1, 
        marginLeft: sidebarCollapsed ? '80px' : '260px',
        minHeight: '100vh', 
        backgroundColor: '#f8fafc',
        transition: 'margin-left 0.3s ease'
      }}>
        <Outlet /> 
      </main>
    </div>
  );
}