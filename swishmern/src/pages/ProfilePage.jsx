import React from "react"
import Sidebar from "../components/Sidebar"
import ProfileHeader from "../components/ProfileHeader"
import ProfileTabs from "../components/ProfileTabs"
import PostsGrid from "../components/PostsGrid"
import "../styles/profile.css"

export default function ProfilePage() {
  const userData = {
    name: "Prof. James Chen",
    username: "@prof.chen",
    role: "Faculty",
    bio: "Physics Department | Quantum Computing Researcher | Coffee enthusiast ☕",
    location: "Campus, University",
    website: "campus.edu",
    posts: 156,
    followers: 1523,
    following: 234,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Prof",
  }

  const userPosts = [
    {
      id: 1,
      author: "Prof. James Chen",
      authorRole: "Faculty",
      timeAgo: "3 hours ago",
      authorImage: userData.avatar,
      postImage: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800",
      likes: 234,
      caption:
        "Another successful Physics 101 lecture today! The students' engagement with quantum mechanics concepts was incredible. Science never gets old! 🎓 #CampusLife #Physics",
      commentCount: 3,
    },
    {
      id: 2,
      author: "Prof. James Chen",
      authorRole: "Faculty",
      timeAgo: "1 day ago",
      authorImage: userData.avatar,
      postImage: "https://images.unsplash.com/photo-1507842217343-583f7270bfba?w=800",
      likes: 189,
      caption:
        "Great research discussion with the team. New breakthroughs in quantum computing! #ResearchLife #QuantumComputing",
      commentCount: 5,
    },
  ]

  const [activeTab, setActiveTab] = React.useState("posts")

  return (
    <div className="app-container">
      <Sidebar />
      <div className="profile-main">
        <ProfileHeader userData={userData} />
        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "posts" && <PostsGrid posts={userPosts} />}
        {activeTab === "saved" && <PostsGrid posts={userPosts.slice(0, 1)} />}
      </div>
    </div>
  )
}
