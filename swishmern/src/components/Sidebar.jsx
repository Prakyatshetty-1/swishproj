import "../styles/sidebar.css"

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon">⭐</div>
        <h1>Swish</h1>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-item active">
          <span className="nav-icon">🏠</span>
          <span>Home</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">🔍</span>
          <span>Explore</span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">✏️</span>
          <span>Create</span>
          <span className="nav-dot"></span>
        </div>
        <div className="nav-item">
          <span className="nav-icon">👤</span>
          <span>Profile</span>
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <img src="/professor-avatar.png" alt="Prof. James Chen" />
          <div>
            <p>Prof. James Chen</p>
            <span>@prof.chen</span>
          </div>
        </div>
        <button className="logout-btn">Log out</button>
      </div>
    </div>
  )
}
