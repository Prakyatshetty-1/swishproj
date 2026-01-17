import { useNavigate } from "react-router-dom"
import "../styles/user-card.css"

export default function UserCard({ name, role, userId }) {
  const navigate = useNavigate()

  const handleNameClick = () => {
    if (userId) {
      navigate(`/profile/${userId}`)
    }
  }

  return (
    <div className="user-card">
      <div className="user-card-header">
        <img src="/professor-avatar.png" alt={name} />
        <div>
          <h3 onClick={handleNameClick} style={{ cursor: userId ? 'pointer' : 'default', color: userId ? '#0066cc' : 'inherit' }}>
            {name}
          </h3>
          <p>{role}</p>
        </div>
      </div>
      <button className="switch-btn">Switch</button>
    </div>
  )
}
