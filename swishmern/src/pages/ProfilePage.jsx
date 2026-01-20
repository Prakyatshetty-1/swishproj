import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios"; // Added axios
import { formatDistanceToNow } from "date-fns"; // Added for time formatting
import Sidebar from "../components/Sidebar";
import ProfileHeader from "../components/ProfileHeader";
import ProfileTabs from "../components/ProfileTabs";
import PostsGrid from "../components/PostsGrid";
import EditProfile from "../components/EditProfile";
import "../styles/profile.css";

const API_BASE_URL = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:5000/api";

export default function ProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams();

  // User Data States
  const [user, setUser] = useState(null);
  const [viewedUser, setViewedUser] = useState(null);

  // Posts State (Replaces Mock Data)
  const [posts, setPosts] = useState([]);

  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOwnProfile, setIsOwnProfile] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");
  const [savedPosts, setSavedPosts] = useState([]);

  // Follow States
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  // 1. Check Authentication on Mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  // 2. Determine Whose Profile to Show
  useEffect(() => {
    if (userId && user) {
      const userIdString = String(userId);
      const currentUserIdString = String(user.id || user._id);

      if (userIdString === currentUserIdString) {
        setIsOwnProfile(true);
        setViewedUser(null);
        fetchCurrentUserProfile(currentUserIdString);
      } else {
        fetchUserProfile(userId);
      }
    } else if (user && !userId) {
      setIsOwnProfile(true);
      setViewedUser(null);
      const currentUserIdString = String(user.id || user._id);
      fetchCurrentUserProfile(currentUserIdString);
    }
  }, [userId, user]);

  // 3. Determine Active Profile Data
  const profileData = isOwnProfile ? user : viewedUser;

  // 4. Fetch Posts for the Active Profile (NEW LOGIC)
  useEffect(() => {
    if (profileData) {
      const targetId = profileData._id || profileData.id;
      if (targetId) fetchUserPosts(targetId);
    }
  }, [profileData]);

  // 5. Add a useEffect to fetch saved posts when the tab changes to "saved"
  useEffect(() => {
    if (activeTab === "saved" && profileData) {
      const fetchSaved = async () => {
        try {
          const userId = profileData._id || profileData.id;
          const res = await axios.get(`${API_BASE_URL}/posts/saved/${userId}`);

          // Format the data for your PostsGrid
          const formatted = res.data.map(post => ({
            id: post._id,
            author: post.userId?.name || "Unknown",
            // ... map other fields just like you do for regular posts ...
            postImage: post.img,
            // etc.
          }));

          setSavedPosts(formatted);
        } catch (err) {
          console.error("Error fetching saved posts", err);
        }
      };
      fetchSaved();
    }
  }, [activeTab, profileData]);

  const fetchUserPosts = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/posts/profile/${id}`);

      // Map MongoDB data to the format PostsGrid expects
      const formattedPosts = response.data.map(post => ({
        id: post._id,
        author: post.userId?.name || "Unknown User",
        authorRole: post.userId?.role || "Student",
        authorImage: post.userId?.avatarUrl || "/placeholder.svg",
        postImage: post.img, // Map 'img' from DB to 'postImage' for component
        likes: post.likes ? post.likes.length : 0,
        caption: post.caption,
        commentCount: post.comments ? post.comments.length : 0,
        timeAgo: post.createdAt
          ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
          : "Just now"
      }));

      setPosts(formattedPosts);
    } catch (error) {
      console.error("Error fetching user posts:", error);
    }
  };

  // --- Profile Data Fetching Logic (Existing) ---
  const fetchCurrentUserProfile = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/user/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        },
      });

      if (!response.ok) throw new Error("Failed to fetch user profile");

      const data = await response.json();
      const freshUser = data.user || data;

      setUser(freshUser);
      // Update local storage
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const updatedUser = {
        ...storedUser,
        followers: freshUser.followers,
        following: freshUser.following,
        posts: freshUser.posts,
        followingList: freshUser.followingList,
        followersList: freshUser.followersList,
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

      if (!response.ok) throw new Error("Failed to fetch user profile");

      const data = await response.json();
      const fetchedUser = data.user || data;
      setViewedUser(fetchedUser);
      setIsOwnProfile(false);
      if (user && user.followingList) {
        const isCurrentlyFollowing = user.followingList.some(
          (followId) => String(followId) === String(id)
        );
        setIsFollowing(isCurrentlyFollowing);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      navigate("/profile");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Follow / Unfollow Logic (Existing) ---
  const handleFollow = async () => {
    if (!user || !viewedUser) return;

    console.log("🔗 FOLLOW REQUEST:", {
      currentUserId: user.id || user._id,
      targetUserId: viewedUser._id || viewedUser.id,
      currentUser: user,
      viewedUser: viewedUser
    });

    try {
      setIsFollowLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/follow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({
          currentUserId: user.id || user._id,
          targetUserId: viewedUser._id || viewedUser.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Follow error response:", errorData);
        // If already following, just update state to show unfollow
        if (errorData.message === 'You are already following this user') {
          console.log("✅ Already following, updating UI to show Unfollow");
          setIsFollowing(true);
          setIsFollowLoading(false);
          return;
        }
        throw new Error(errorData.message || "Failed to follow user");
      }

      setIsFollowing(true);
      setViewedUser(prev => ({ ...prev, followers: prev.followers + 1 }));
      setUser(prev => ({
        ...prev,
        following: prev.following + 1,
        followingList: [...(prev.followingList || []), viewedUser._id || viewedUser.id]
      }));
    } catch (error) {
      console.error("Error following user:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!user || !viewedUser) return;
    try {
      setIsFollowLoading(true);
      const response = await fetch(`${API_BASE_URL}/auth/unfollow`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        },
        body: JSON.stringify({
          currentUserId: user.id || user._id,
          targetUserId: viewedUser._id || viewedUser.id
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Unfollow error response:", errorData);
        throw new Error(errorData.message || "Failed to unfollow user");
      }

      setIsFollowing(false);
      setViewedUser(prev => ({ ...prev, followers: Math.max(0, prev.followers - 1) }));
      setUser(prev => ({
        ...prev,
        following: Math.max(0, prev.following - 1),
        followingList: (prev.followingList || []).filter(
          id => String(id) !== String(viewedUser._id || viewedUser.id)
        )
      }));
    } catch (error) {
      console.error("Error unfollowing user:", error);
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleEditSave = (updatedUser) => {
    setUser(updatedUser);
  };

  // --- Prepare Data for Header ---
  const userData = {
    name: profileData?.name,
    role: profileData?.role,
    about: profileData?.about || "Hi there!",
    bio: `${profileData?.year || ''} | ${profileData?.department || ''} | Div ${profileData?.division || ''}`,
    location: "Campus, University",
    website: "campus.edu",
    posts: posts.length, // Use real posts length
    followers: profileData?.followers || 0,
    following: profileData?.following || 0,
    avatar: profileData?.avatarUrl || "/placeholder.svg",
  };

  if (!user || (isLoading && viewedUser === null)) {
    return (
      <div className="app-container">
        <div className="left-sidebar-wrapper">
          <Sidebar />
        </div>
        <div className="profile-main">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
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
          isFollowing={isFollowing}
          onFollow={handleFollow}
          onUnfollow={handleUnfollow}
          isFollowLoading={isFollowLoading}
        />

        {isOwnProfile ? (
          <>
            <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />
            {activeTab === "posts" && <PostsGrid posts={posts} />}
            {activeTab === "saved" && (
              <>
                {savedPosts.length > 0 ? (
                  <PostsGrid posts={savedPosts} />
                ) : (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                    No saved posts yet.
                  </div>
                )}
              </>
            )}
          </>
        ) : (
          <>
            <div className="profile-tabs">
              <div className="tab active">
                <span>Posts</span>
              </div>
            </div>
            <PostsGrid posts={posts} />
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
  );
}