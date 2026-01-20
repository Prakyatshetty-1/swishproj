import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import "../styles/user-card.css"
const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000/api";
export default function UserCard({ name, role, userId }) {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  

  useEffect(() => {
    // Get current user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser)
        setCurrentUser(user)
      } catch (error) {
        console.error("Error parsing user from localStorage:", error)
      }
    }
  }, [])

  const handleNameClick = () => {
    if (currentUser) {
      navigate(`/profile/${currentUser.id || currentUser._id}`)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const userId = currentUser?.id || currentUser?._id;
      const refreshToken = localStorage.getItem("refreshToken");

      if (userId && refreshToken) {
        // Call logout API
        const response = await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
          },
          body: JSON.stringify({
            userId: userId,
            refreshToken: refreshToken,
          })
        });

        if (!response.ok) {
          console.warn("Logout API call failed, but clearing locally");
        }
      }

      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("onboardingComplete");

      console.log("✅ Logout successful, localStorage cleared");

      // Dispatch auth state change event BEFORE navigation
      window.dispatchEvent(new Event('authStateChanged'));

      setIsLoggingOut(false);
      
      // Navigate to landing page
      navigate("/", { replace: true });
      
    } catch (error) {
      console.error("❌ Logout error:", error);
      
      // Still clear localStorage and redirect even if API call fails
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("onboardingComplete");
      
      // Dispatch auth state change event
      window.dispatchEvent(new Event('authStateChanged'));
      
      setIsLoggingOut(false);
      
      // Navigate to landing page
      navigate("/", { replace: true });
    }
  };

  if (!currentUser) {
    return null
  }

  return (
    <div className="user-card">
      <div className="user-card-header">
        <img src={currentUser.avatarUrl || "/placeholder.svg"} alt={currentUser.name} />
        <div>
          <h3 onClick={handleNameClick} style={{ cursor: 'pointer', color: '#0066cc' }}>
            {currentUser.name}
          </h3>
          <p>{currentUser.role}</p>
        </div>
      </div>
      <button 
        className="switch-btn" 
        onClick={handleLogout}
        disabled={isLoggingOut}
      >
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  )
}
