import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ForgotPassword from './pages/ForgotPassword'
import Onboarding from './pages/Onboarding'
import HomePage from './pages/HomePage'
import Home from './pages/Home'
import ProfilePage from './pages/ProfilePage'
import SetPassword from './components/SetPassword'
import './App.css'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    // Check if user has valid tokens
    const checkAuth = () => {
      const accessToken = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      const onboardingComplete = localStorage.getItem('onboardingComplete');
      
      console.log('Checking auth:', { 
        accessToken: !!accessToken, 
        user: !!user,
        onboardingComplete 
      });
      
      if (accessToken && user) {
        setIsAuthenticated(true);
        setHasCompletedOnboarding(onboardingComplete === 'true');
      } else {
        setIsAuthenticated(false);
        setHasCompletedOnboarding(false);
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
      console.log('Not authenticated, redirecting to login');
      return <Navigate to="/login" replace />;
    }
    
    // If route requires onboarding to be complete, check it
    if (requireOnboarding && !hasCompletedOnboarding) {
      console.log('Onboarding not complete, redirecting to onboarding');
      return <Navigate to="/onboarding" replace />;
    }
    
    console.log('ProtectedRoute check passed:', { isAuthenticated, hasCompletedOnboarding });
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
        <Route path="/home" element={<ProtectedRoute element={<HomePage/>} requireOnboarding={true} />}/>
        <Route path="/homee" element={<ProtectedRoute element={<Home/>} requireOnboarding={true} />}/>
        <Route path="/profile" element={<ProtectedRoute element={<ProfilePage/>} requireOnboarding={true} />}/>

      </Routes>
    </BrowserRouter>
  )
}

export default App;