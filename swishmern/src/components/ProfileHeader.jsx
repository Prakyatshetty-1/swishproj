import { BadgeCheck, Settings, MapPin, Link } from "lucide-react"
import "../styles/profile-header.css"

export default function ProfileHeader({ userData, onEditClick, isOwnProfile = true }) {
  return (
    <div className="profile-header-container">
      <div className="profile-header">
        <div className="profile-avatar-section">
          <div className="profile-avatar">
            <img src={userData.avatar || "/placeholder.svg"} alt={userData.name} />
            <div className="verified-badge">
              <BadgeCheck size={24} />
            </div>
          </div>
        </div>

        <div className="profile-info">
          <div className="profile-name-section">
            <h1 className="profile-name">{userData.name}</h1>
            <span className="profile-role">{userData.role}</span>
          </div>

          <div className="profile-sections">
            <div className="profile-about">
              <h3 className="section-title">About Me</h3>
              <p className="section-content">{userData.about || "Hi there!"}</p>
            </div>
            <div className="profile-bio-section">
              <h3 className="section-title">Bio</h3>
              <p className="section-content">{userData.bio}</p>
            </div>
          </div>

          <div className="profile-meta">
            <div className="meta-item">
              <MapPin size={16} />
              <span>{userData.location}</span>
            </div>
            <div className="meta-item">
              <Link size={16} />
              <a href={`https://${userData.website}`} target="_blank" rel="noopener noreferrer">
                {userData.website}
              </a>
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat">
              <span className="stat-number">{userData.posts}</span>
              <span className="stat-label">posts</span>
            </div>
            <div className="stat">
              <span className="stat-number">{userData.followers.toLocaleString()}</span>
              <span className="stat-label">followers</span>
            </div>
            <div className="stat">
              <span className="stat-number">{userData.following}</span>
              <span className="stat-label">following</span>
            </div>
          </div>

          {isOwnProfile && (
            <div className="profile-actions">
              <button className="edit-profile-btn" onClick={onEditClick}>Edit Profile</button>
              <button className="settings-btn">
                <Settings size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
