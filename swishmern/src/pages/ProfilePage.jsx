import React from "react"
import { useState,useEffect } from "react"
import { useNavigate } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import ProfileHeader from "../components/ProfileHeader"
import ProfileTabs from "../components/ProfileTabs"
import PostsGrid from "../components/PostsGrid"
import EditProfile from "../components/EditProfile"
import "../styles/profile.css"

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  useEffect(() => {
    // Get user info from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      // Redirect to login if not authenticated
      navigate("/login");
    }
  }, [navigate]);




  const userData = {
    name: user?.name,
    role: user?.role,
    about: user?.about || "Hi there!",
    bio: `${user?.year} | ${user?.department} | Div ${user?.division}`,
    location: "Campus, University",
    website: "campus.edu",
    posts: user?.posts || 0,
    followers: user?.followers || 0,
    following: user?.following || 0,
    avatar: user?.avatarUrl || "/placeholder.svg",
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

  const handleEditSave = (updatedUser) => {
    setUser(updatedUser)
  }

  if (!user) {
    return (
      <div className="app-container">
        <Sidebar />
        <div className="profile-main">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="profile-main">
        <ProfileHeader 
          userData={userData} 
          onEditClick={() => setIsEditModalOpen(true)}
        />
        <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {activeTab === "posts" && <PostsGrid posts={userPosts} />}
        {activeTab === "saved" && <PostsGrid posts={userPosts.slice(0, 1)} />}
      </div>

      {isEditModalOpen && (
        <EditProfile
          user={user}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleEditSave}
        />
      )}
    </div>
  )
}
