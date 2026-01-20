import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'

import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Explore from './pages/Explore'
import Events from './pages/Events'
import CreatePost from './pages/CreatePost'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import ProfilePage from './pages/ProfilePage'
import AdminDashboard from './pages/AdminDashboard'
import SetPassword from './components/SetPassword'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);

  // Admin emails list from environment
  const ADMIN_EMAILS = ['prakyatshetty5@gmail.com', 'admin2@example.com'];

  useEffect(() => {
    // Check if user has valid tokens
    const checkAuth = () => {
      const accessToken = localStorage.getItem('accessToken');
      const userStr = localStorage.getItem('user');
      const onboardingComplete = localStorage.getItem('onboardingComplete');
      
      console.log('Checking auth:', { 
        accessToken: !!accessToken, 
        user: !!userStr,
        onboardingComplete 
      });
      
      if (accessToken && userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Check if user is admin (via email or role)
        const adminCheck = ADMIN_EMAILS.includes(userData.email?.toLowerCase()) || userData.role === 'admin';
        setIsAdmin(adminCheck);
        
        // Set onboarding as complete for admins, otherwise check localStorage
        if (adminCheck) {
          setHasCompletedOnboarding(true);
        } else {
          setHasCompletedOnboarding(onboardingComplete === 'true');
        }
      } else {
        setIsAuthenticated(false);
        setHasCompletedOnboarding(false);
        setIsAdmin(false);
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();

    // Listen for storage changes (when login/logout happens in another tab)
    window.addEventListener('storage', checkAuth);
    
    // Listen for custom auth event (when login/logout happens in same tab)
    window.addEventListener('authStateChanged', checkAuth);
    
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('authStateChanged', checkAuth);
    };
  }, []);

  // Root route - redirect based on auth and onboarding status
  const RootRoute = () => {
    if (isLoading) {
      return <div className="loading-screen">Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <LandingPage />;
    }
    
    // If authenticated but hasn't completed onboarding
    if (!hasCompletedOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
    
    return <Navigate to="/home" replace />;
  };

  // ProtectedRoute component - redirects to login if not authenticated
  const ProtectedRoute = ({ element, requireOnboarding = true }) => {
    if (isLoading) {
      return <div className="loading-screen">Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    // If route requires onboarding to be complete, check it
    if (requireOnboarding && !hasCompletedOnboarding) {
      return <Navigate to="/onboarding" replace />;
    }
    
    console.log('ProtectedRoute check passed:', { isAuthenticated, hasCompletedOnboarding });
    return element;
  };

  // AdminRoute component - only admins can access
  const AdminRoute = ({ element }) => {
    if (isLoading) {
      return <div className="loading-screen">Loading...</div>;
    }
    
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    if (!isAdmin) {
      return <Navigate to="/home" replace />;
    }
    
    console.log('AdminRoute check passed - user is admin');
    return element;
  };

  // AuthRoute component - redirects to appropriate page if already authenticated
  const AuthRoute = ({ element }) => {
    if (isLoading) {
      return <div className="loading-screen">Loading...</div>;
    }
    
    if (isAuthenticated) {
      // If authenticated but not onboarded, go to onboarding
      if (!hasCompletedOnboarding) {
        return <Navigate to="/onboarding" replace />;
      }
      // If authenticated and onboarded, go to home
      return <Navigate to="/home" replace />;
    }
    
    return element;
  };

  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<RootRoute />}/>
        <Route path="/login" element={<AuthRoute element={<Login/>}/>}/>
        <Route path="/signup" element={<AuthRoute element={<Signup/>}/>}/>
        <Route path="/forgot-password" element={<AuthRoute element={<ForgotPassword/>}/>}/>
        <Route path="/onboarding" element={<ProtectedRoute element={<Onboarding/>} requireOnboarding={false} />}/>
        <Route path="/set-password" element={<ProtectedRoute element={<SetPassword/>} requireOnboarding={false} />}/>
        <Route path="/home" element={<ProtectedRoute element={<Home/>} requireOnboarding={true} />}/>
        <Route path="/explore" element={<ProtectedRoute element={<Explore/>} requireOnboarding={true} />}/>
        <Route path="/events" element={<ProtectedRoute element={<Events/>} requireOnboarding={true} />}/>
        <Route path="/create-post" element={<ProtectedRoute element={<CreatePost/>} requireOnboarding={true} />}/>
        <Route path="/notifications" element={<ProtectedRoute element={<Notifications/>} requireOnboarding={true} />}/>
        <Route path="/settings" element={<ProtectedRoute element={<Settings/>} requireOnboarding={true} />}/>
        <Route path="/profile" element={<ProtectedRoute element={<ProfilePage/>} requireOnboarding={true} />}/>
        <Route path="/profile/:userId" element={<ProtectedRoute element={<ProfilePage/>} requireOnboarding={true} />}/>
        <Route path="/admin" element={<AdminRoute element={<AdminDashboard/>} />}/>

      </Routes>
    </BrowserRouter>
  )
}

export default App;