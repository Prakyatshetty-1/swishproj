import "../styles/suggested-user.css"

export default function SuggestedUser({ name, role, bio, image }) {
  return (
    <div className="suggested-user">
      <div className="suggested-user-info">
        <img src={image || "/placeholder.svg"} alt={name} />
        <div className="user-details">
          <span className="user-name">{name}</span>
          <span className="user-role">{role}</span>
          <p className="user-bio">{bio}</p>
        </div>
      </div>
      <button className="follow-btn">Follow</button>
    </div>
  )
}
