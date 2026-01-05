import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Onboarding from './pages/Onboarding'
import HomePage from './pages/HomePage'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user has valid tokens
    const checkAuth = () => {
      const accessToken = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      
      if (accessToken && user) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    };

    checkAuth();
    setIsLoading(false);

    // Listen for storage changes (when login/logout happens in another tab)
    window.addEventListener('storage', checkAuth);
    
    // Listen for custom auth event (when login/logout happens in same tab)
    window.addEventListener('authStateChanged', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authStateChanged', checkAuth);
    };
  }, []);

  // Root route - redirect to home if authenticated, otherwise to landing page
  const RootRoute = () => {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    return isAuthenticated ? <Navigate to="/home" replace /> : <LandingPage />;
  };

  // ProtectedRoute component - redirects to login if not authenticated
  const ProtectedRoute = ({ element }) => {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    return isAuthenticated ? element : <Navigate to="/login" replace />;
  };

  // AuthRoute component - redirects to home if already authenticated
  const AuthRoute = ({ element }) => {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    return isAuthenticated ? <Navigate to="/home" replace /> : element;
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRoute />}/>
        <Route path="/login" element={<AuthRoute element={<Login/>}/>}/>
        <Route path="/signup" element={<AuthRoute element={<Signup/>}/>}/>
        <Route path="/forgot-password" element={<AuthRoute element={<ForgotPassword/>}/>}/>
        <Route path="/onboarding" element={<ProtectedRoute element={<Onboarding/>}/>}/>
        <Route path="/home" element={<ProtectedRoute element={<HomePage/>}/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;