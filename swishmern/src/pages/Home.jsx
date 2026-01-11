import Sidebar from "../components/Sidebar"
import Feed from "../components/Feed"
import RightPanel from "../components/RightPanel"
import "../styles/Home.css"

export default function Home() {
  return (
    <div className="home-container">
      
      <div className="left-sidebar-wrapper">
        <Sidebar />
      </div>
      <div className="middle-feed-wrapper">
        <div className="feed-content">
          <Feed />
        </div>
      </div>
      <div className="right-panel-wrapper">
        <RightPanel />
      </div>

    </div>
  )
}
