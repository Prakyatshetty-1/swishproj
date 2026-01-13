import { useState, useEffect } from "react"
import UserCard from "./UserCard"
import SuggestedUser from "./SuggestedUser"
import AllUsersModal from "./AllUsersModal"
import "../styles/right-panel.css"
const API_BASE_URL = "http://localhost:5000/api";

export default function RightPanel() {
  const [suggestedUsers, setSuggestedUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [showAllUsers, setShowAllUsers] = useState(false)

  useEffect(() => {
    fetchSuggestedUsers()
  }, [])

  const fetchSuggestedUsers = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/auth/users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch users")
      }

      const data = await response.json()
      const users = (data.users || data).slice(0, 3) // Get only first 3 users
      setSuggestedUsers(users)
    } catch (error) {
      console.error("Error fetching suggested users:", error)
      // Fallback to empty array if API fails
      setSuggestedUsers([])
    } finally {
      setLoading(false)
    }
  }

  const trendingTopics = [
    "#CampusLife",
    "#StudyGram",
    "#ResearchLife",
    "#Hackathon2024",
    "#GraduationSeason",
    "#CampusEvents",
  ]

  return (
    <div className="right-panel">
      <UserCard name="prof.chen" role="Prof. James Chen" />

      <div className="suggested-section">
        <div className="section-header">
          <h3>Suggested for you</h3>
          <button
            className="see-all-btn"
            onClick={() => setShowAllUsers(true)}
          >
            See All
          </button>
        </div>
        {loading ? (
          <div className="loading-users">Loading users...</div>
        ) : suggestedUsers.length === 0 ? (
          <div className="no-users">No users available</div>
        ) : (
          suggestedUsers.map((user) => (
            <SuggestedUser
              key={user._id || user.id}
              name={user.name}
              role={user.role || "STUDENT"}
              bio={user.about || user.bio || ""}
              image={user.avatarUrl || user.image || "/placeholder.svg"}
            />
          ))
        )}
      </div>

      <AllUsersModal isOpen={showAllUsers} onClose={() => setShowAllUsers(false)} />

      <div className="trending-section">
        <h3>Trending on Campus</h3>
        <div className="trending-grid">
          {trendingTopics.map((topic, index) => (
            <a key={index} href="#" className="trending-item">
              {topic}
            </a>
          ))}
        </div>
      </div>

      <footer className="right-panel-footer">
        <a href="#">About</a>
        <a href="#">Help</a>
        <a href="#">Privacy</a>
        <a href="#">Terms</a>
        <p>© 2026 Swish Campus Network</p>
      </footer>
    </div>
  )
}
