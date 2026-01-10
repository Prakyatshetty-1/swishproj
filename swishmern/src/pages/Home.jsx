import Sidebar from "../components/Sidebar"
import Feed from "../components/Feed"
import RightPanel from "../components/RightPanel"
import "../styles/Home.css"

export default function Home() {
  return (
    <div className="app-container">
      <Sidebar />
      <Feed />
      <RightPanel />
    </div>
  )
}
