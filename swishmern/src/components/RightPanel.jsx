import UserCard from "./UserCard"
import SuggestedUser from "./SuggestedUser"
import "../styles/right-panel.css"

export default function RightPanel() {
  const suggestedUsers = [
    {
      id: 1,
      name: "alex.t",
      role: "STUDENT",
      bio: "CS Junior | Full-stack Dev",
      image: "/student-alex-studying.png",
    },
    {
      id: 2,
      name: "maya.creates",
      role: "STUDENT",
      bio: "Design Major | UI/UX Enthusiast",
      image: "/student-maya.jpg",
    },
    {
      id: 3,
      name: "marcus.j",
      role: "STUDENT",
      bio: "Engineering Senior | Robotics",
      image: "/student-marcus.jpg",
    },
  ]

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
          <a href="#">See All</a>
        </div>
        {suggestedUsers.map((user) => (
          <SuggestedUser key={user.id} {...user} />
        ))}
      </div>

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
