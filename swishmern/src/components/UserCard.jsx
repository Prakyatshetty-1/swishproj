import "../styles/user-card.css"

export default function UserCard({ name, role }) {
  return (
    <div className="user-card">
      <div className="user-card-header">
        <img src="/professor-avatar.png" alt={name} />
        <div>
          <h3>{name}</h3>
          <p>{role}</p>
        </div>
      </div>
      <button className="switch-btn">Switch</button>
    </div>
  )
}
