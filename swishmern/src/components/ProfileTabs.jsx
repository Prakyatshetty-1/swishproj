"use client"

import { Grid3x3, Bookmark } from "lucide-react"
import "../styles/profile-tabs.css"

export default function ProfileTabs({ activeTab, setActiveTab }) {
  return (
    <div className="profile-tabs">
      <button className={`tab ${activeTab === "posts" ? "active" : ""}`} onClick={() => setActiveTab("posts")}>
        <Grid3x3 size={20} />
        <span>Posts</span>
      </button>
      <button className={`tab ${activeTab === "saved" ? "active" : ""}`} onClick={() => setActiveTab("saved")}>
        <Bookmark size={20} />
        <span>Saved</span>
      </button>
    </div>
  )
}
