import React from "react"
import { useState,useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import Sidebar from "../components/Sidebar"
import ProfileHeader from "../components/ProfileHeader"
import ProfileTabs from "../components/ProfileTabs"
import PostsGrid from "../components/PostsGrid"
import EditProfile from "../components/EditProfile"
import "../styles/profile.css"

const API_BASE_URL = "http://localhost:5000/api";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [viewedUser, setViewedUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  
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

  useEffect(() => {
    if (userId && user) {
      // Convert both to strings for comparison
      const userIdString = String(userId);
      const currentUserIdString = String(user.id || user._id);
      
      // Viewing another user's profile
      if (userIdString === currentUserIdString) {
        // If userId matches current user, fetch fresh own profile data
        setIsOwnProfile(true);
        setViewedUser(null);
        fetchCurrentUserProfile(currentUserIdString);
      } else {
        // Fetch other user's profile data
        fetchUserProfile(userId);
      }
    } else if (user && !userId) {
      // Viewing own profile - fetch fresh data
      setIsOwnProfile(true);
      setViewedUser(null);
      const currentUserIdString = String(user.id || user._id);
      fetchCurrentUserProfile(currentUserIdString);
    }
  }, [userId, user]);

  const fetchCurrentUserProfile = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      const freshUser = data.user || data;
      
      // Update both state and localStorage with fresh data
      setUser(freshUser);
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const updatedUser = {
        ...storedUser,
        followers: freshUser.followers,
        following: freshUser.following,
        posts: freshUser.posts,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Error fetching current user profile:", error);
    }
  };

  const fetchUserProfile = async (id) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/user/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      setViewedUser(data.user || data);
      setIsOwnProfile(false);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      // Fallback: redirect back to own profile
      navigate("/profile");
    } finally {
      setIsLoading(false);
    }
  };




  const profileData = isOwnProfile ? user : viewedUser;

  const userData = {
    name: profileData?.name,
    role: profileData?.role,
    about: profileData?.about || "Hi there!",
    bio: `${profileData?.year} | ${profileData?.department} | Div ${profileData?.division}`,
    location: "Campus, University",
    website: "campus.edu",
    posts: profileData?.posts || 0,
    followers: profileData?.followers || 0,
    following: profileData?.following || 0,
    avatar: profileData?.avatarUrl || "/placeholder.svg",
  }

  const userPosts = [
    {
      id: 1,
      author: "Prof. James Chen",
      authorRole: "Faculty",
      timeAgo: "3 hours ago",
      authorImage: userData.avatar,
      postImage: "/placeholder.svg",
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
      postImage: "/placeholder.svg",
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

  if (!user || (isLoading && viewedUser === null)) {
    return (
      <div className="app-container">
        <div className="left-sidebar-wrapper">
          <Sidebar />
        </div>
        <div className="profile-main">
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-container">
      <div className="left-sidebar-wrapper">
        <Sidebar />
      </div>
      <div className="profile-main">
        <ProfileHeader 
          userData={userData} 
          onEditClick={() => setIsEditModalOpen(true)}
          isOwnProfile={isOwnProfile}
        />
        {isOwnProfile ? (
          <>
            <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            {activeTab === "posts" && <PostsGrid posts={userPosts} />}
            {activeTab === "saved" && <PostsGrid posts={userPosts.slice(0, 1)} />}
          </>
        ) : (
          <>
            <div className="profile-tabs">
              <div className="tab active">
                <span>Posts</span>
              </div>
            </div>
            <PostsGrid posts={userPosts} />
          </>
        )}
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
