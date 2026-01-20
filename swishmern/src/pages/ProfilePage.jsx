import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios"; // Added axios
import { formatDistanceToNow } from "date-fns"; // Added for time formatting
import Sidebar from "../components/Sidebar";
import ProfileHeader from "../components/ProfileHeader";
import ProfileTabs from "../components/ProfileTabs";
import PostsGrid from "../components/PostsGrid";
import EditProfile from "../components/EditProfile";
import "../styles/profile.css";

const API_BASE_URL = "http://localhost:5000/api";

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
  
  // Follow States
  const [isFollowing, setIsFollowing] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  
  // Use ref to track if we've already fetched data for this profile
  const lastFetchedProfileId = useRef(null);
  
  // 1. Check Authentication on Mount
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      navigate("/login");
    }
    
    // Cleanup on unmount
    return () => {
      lastFetchedProfileId.current = null;
    };
  }, [navigate]);

  // 2. Determine Whose Profile to Show
  useEffect(() => {
    if (!user) return; // Wait for user to be loaded
    
    const currentUserIdString = String(user.id || user._id);
    const targetProfileId = userId || currentUserIdString;
    
    // Prevent re-fetching if we're already viewing this profile
    if (lastFetchedProfileId.current === targetProfileId) {
      return;
    }
    
    lastFetchedProfileId.current = targetProfileId;
    
    if (userId) {
      const userIdString = String(userId);
      
      if (userIdString === currentUserIdString) {
        setIsOwnProfile(true);
        setViewedUser(null);
        fetchCurrentUserProfile(currentUserIdString);
      } else {
        setIsOwnProfile(false);
        fetchUserProfile(userId);
      }
    } else {
      // No userId in URL means viewing own profile
      setIsOwnProfile(true);
      setViewedUser(null);
      fetchCurrentUserProfile(currentUserIdString);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, user?._id, user?.id]); // Depend on userId and user ID (but not entire user object)

  // 3. Determine Active Profile Data
  const profileData = isOwnProfile ? user : viewedUser;

  // 4. Fetch Posts for the Active Profile (NEW LOGIC)
  useEffect(() => {
    if (!profileData) return;
    
    const targetId = profileData._id || profileData.id;
    if (targetId) {
      fetchUserPosts(targetId);
    }
  }, [profileData?._id, profileData?.id]); // Only re-fetch when ID changes

  const fetchUserPosts = async (id) => {
    if (!id) return;
    
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
      setPosts([]); // Set empty array on error
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
      
      // Update user state without triggering re-fetch
      setUser(prevUser => ({
        ...prevUser,
        followers: freshUser.followers,
        following: freshUser.following,
        posts: freshUser.posts,
        followingList: freshUser.followingList,
        followersList: freshUser.followersList,
      }));
      
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
      
      // Check if following
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
    // Update the user state with the new data
    setUser(prevUser => ({
      ...prevUser,
      ...updatedUser
    }));
    
    // Update localStorage
    localStorage.setItem("user", JSON.stringify(updatedUser));
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
                <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>
                    No saved posts yet.
                </div>
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