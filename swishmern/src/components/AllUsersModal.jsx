import { useState, useEffect } from "react"
import SuggestedUser from "./SuggestedUser"
import "../styles/all-users-modal.css"
const API_BASE_URL = "http://localhost:5000/api";

export default function AllUsersModal({ isOpen, onClose }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (isOpen) {
      fetchAllUsers()
    }
  }, [isOpen])

  const fetchAllUsers = async () => {
    try {
      setLoading(true)
      setError(null)
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
      setUsers(data.users || data)
    } catch (err) {
      console.error("Error fetching users:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>All Users</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-body">
          {loading ? (
            <div className="loading">Loading users...</div>
          ) : error ? (
            <div className="error">Error: {error}</div>
          ) : users.length === 0 ? (
            <div className="empty">No users found</div>
          ) : (
            <div className="users-list">
              {users.map((user) => (
                <SuggestedUser
                  key={user._id || user.id}
                  name={user.name}
                  role={user.role || "STUDENT"}
                  bio={user.about || user.bio || ""}
                  image={user.avatarUrl || user.image || "/placeholder.svg"}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
