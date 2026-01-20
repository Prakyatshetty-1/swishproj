import { useState } from "react"
import { useNavigate } from "react-router-dom"
import "../styles/suggested-user.css"

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000/api";

export default function SuggestedUser({ name, role, bio, image, userId, onFollowChange }) {
  const navigate = useNavigate()
  const [isFollowing, setIsFollowing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleNameClick = () => {
    if (userId) {
      navigate(`/profile/${userId}`)
    }
  }

  const handleFollowClick = async () => {
    try {
      setIsLoading(true)
      
      const currentUser = localStorage.getItem("user")
      if (!currentUser) {
        console.error("User not found in localStorage")
        return
      }

      const user = JSON.parse(currentUser)
      const currentUserId = user.id || user._id

      const endpoint = isFollowing ? '/auth/unfollow' : '/auth/follow'
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({
          currentUserId,
          targetUserId: userId
        })
      })

      if (!response.ok) {
        throw new Error("Failed to update follow status")
      }

      const data = await response.json()
      setIsFollowing(!isFollowing)
      
      // Notify parent component of the change
      if (onFollowChange) {
        onFollowChange()
      }

      console.log(data.message)
    } catch (error) {
      console.error("Error updating follow status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="suggested-user">
      <div className="suggested-user-info">
        <img src={image || "/placeholder.svg"} alt={name} />
        <div className="user-details">
          <span className="user-name" onClick={handleNameClick} style={{ cursor: 'pointer', color: '#0066cc' }}>
            {name}
          </span>
          <span className="user-role">{role}</span>
          <p className="user-bio">{bio}</p>
        </div>
      </div>
      <button 
        className={`follow-btn ${isFollowing ? 'following' : ''}`}
        onClick={handleFollowClick}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  )
}
