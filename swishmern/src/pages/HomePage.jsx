import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Home.css";

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000/api";

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get user info from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Redirect to login if not authenticated
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const userId = user?.id || user?._id;
      const refreshToken = localStorage.getItem("refreshToken");

      if (userId && refreshToken) {
        // Call logout API
        await axios.post(`${API_BASE_URL}/auth/logout`, {
          userId: userId,
          refreshToken: refreshToken,
        });
      }

      // Clear localStorage
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("onboardingComplete");

      console.log("✅ Logout successful, localStorage cleared");

      // Dispatch auth state change event BEFORE navigation
      window.dispatchEvent(new Event('authStateChanged'));

      setIsLoading(false);
      
      // Navigate to landing page
      navigate("/", { replace: true });
      
    } catch (error) {
      setIsLoading(false);
      console.error("❌ Logout error:", error);
      
      // Still clear localStorage and redirect even if API call fails
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      localStorage.removeItem("onboardingComplete");
      
      // Dispatch auth state change event
      window.dispatchEvent(new Event('authStateChanged'));
      
      // Navigate to landing page
      navigate("/", { replace: true });
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
        <h1>Welcome to the Home Page!!!</h1>
        <button
          onClick={handleLogout}
          disabled={isLoading}
          style={{
            padding: "0.5rem 1.5rem",
            backgroundColor: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: "0.375rem",
            cursor: isLoading ? "not-allowed" : "pointer",
            fontSize: "1rem",
            fontWeight: "500",
            opacity: isLoading ? 0.7 : 1,
          }}
        >
          {isLoading ? "Logging out..." : "Logout"}
        </button>
      </div>

      {user && (
        <div style={{ backgroundColor: "#f3f4f6", padding: "1.5rem", borderRadius: "0.5rem" }}>
          <h2>User Profile</h2>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
          {user.department && <p><strong>Department:</strong> {user.department}</p>}
          {user.year && <p><strong>Year:</strong> {user.year}</p>}
          {user.division && <p><strong>Division:</strong> {user.division}</p>}
          {user.avatarUrl && (
            <div style={{ marginTop: "1rem" }}>
              <p><strong>Avatar:</strong></p>
              <img
                src={user.avatarUrl}
                alt="User Avatar"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  marginTop: "0.5rem"
                }}
              />
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: "2rem", display: "flex", justifyContent: "center" }}>
        <button
          onClick={() => navigate("/home")}
          style={{
            padding: "0.5rem 2rem",
            backgroundColor: "#3b82f6",
            color: "white",
            border: "none",
            borderRadius: "0.375rem",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "500"
          }}
        >
          Close
        </button>
      </div>
    </div>
  );
}