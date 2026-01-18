import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, MessageCircle, User, X } from "lucide-react";
import Sidebar from "../components/Sidebar";

import "../styles/Explore.css";

const API_BASE_URL = "http://localhost:5000/api";

// Debounce hook for search
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  const timerRef = useRef(null);

  useEffect(() => {
    timerRef.current = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(timerRef.current);
  }, [value, delay]);

  return debouncedValue;
};

export default function Explore() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 500); // 500ms delay
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  
  // Pagination states
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [totalPosts, setTotalPosts] = useState(0);

  // Hashtag states
  const [trendingHashtags, setTrendingHashtags] = useState([]);
  const [selectedHashtag, setSelectedHashtag] = useState(null);
  const [isLoadingHashtags, setIsLoadingHashtags] = useState(false);

  useEffect(() => {
    // Get current user from localStorage
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }
  }, []);

  // Fetch trending hashtags
  const fetchTrendingHashtags = async () => {
    try {
      setIsLoadingHashtags(true);
      const response = await fetch(`${API_BASE_URL}/posts/trending/hashtags`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch trending hashtags");
      }

      const data = await response.json();
      setTrendingHashtags(data.trendingHashtags || []);
      console.log("✅ Loaded trending hashtags:", data.trendingHashtags);
    } catch (error) {
      console.error("Error fetching trending hashtags:", error);
    } finally {
      setIsLoadingHashtags(false);
    }
  };

  // Fetch posts from backend
  const fetchPosts = async (page = 1, hashtag = null) => {
    try {
      setIsLoadingPosts(true);
      let url;
      
      if (hashtag) {
        // Fetch posts by hashtag
        url = `${API_BASE_URL}/posts/hashtag/${encodeURIComponent(hashtag)}?page=${page}&limit=10`;
      } else {
        // Fetch all posts
        url = `${API_BASE_URL}/posts/feed?page=${page}&limit=10`;
      }

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch posts");
      }

      const data = await response.json();
      
      if (page === 1) {
        // First page, replace all posts
        setPosts(data.posts || []);
      } else {
        // Append new posts
        setPosts((prevPosts) => [...prevPosts, ...(data.posts || [])]);
      }

      setCurrentPage(page);
      setHasMore(data.hasMore || false);
      setTotalPosts(data.totalPosts || 0);
      console.log(`✅ Loaded ${data.posts?.length || 0} posts for page ${page}`);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Load initial posts and trending hashtags
  useEffect(() => {
    fetchTrendingHashtags();
    if (!searchQuery.trim()) {
      fetchPosts(1, selectedHashtag);
    }
  }, []);

  useEffect(() => {
    // This effect runs when debouncedQuery changes
    if (debouncedQuery.trim() === "") {
      setSearchResults([]);
      console.log("🔍 Search cleared");
      return;
    }

    performSearch(debouncedQuery);
  }, [debouncedQuery]);

  const performSearch = async (query) => {
    try {
      setIsSearching(true);
      console.log(`🔍 User searching for: "${query}"`);

      const response = await fetch(`${API_BASE_URL}/auth/search-users?query=${encodeURIComponent(query)}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      const users = data.users || [];

      console.log(`✅ Found ${users.length} matching users for search: "${query}"`, users);
      setSearchResults(users);
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleLoadMore = () => {
    if (hasMore && !isLoadingPosts) {
      fetchPosts(currentPage + 1, selectedHashtag);
    }
  };

  const handleHashtagClick = (hashtag) => {
    setSelectedHashtag(hashtag);
    setCurrentPage(1);
    setPosts([]);
    fetchPosts(1, hashtag);
  };

  const handleClearHashtag = () => {
    setSelectedHashtag(null);
    setCurrentPage(1);
    setPosts([]);
    fetchPosts(1);
  };

  return (
    <div className="explore-container">
        <Sidebar />
      {/* Search bar and tags */}
      <div className="explore-header">
        <div className="search-wrapper">
          <Search className="search-icon" size={20} />
          <input
            type="text"
            placeholder="Search students, faculty, or posts..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="explore-search-input"
          />
        </div>
        
        {/* Trending Tags */}
        <div className="tags-scroll-container">
          {selectedHashtag && (
            <button 
              onClick={handleClearHashtag}
              className="tag-pill active"
            >
              #{selectedHashtag}
              <X size={16} className="tag-close-icon" />
            </button>
          )}
          {trendingHashtags.length > 0 ? (
            trendingHashtags.map((item) => (
              <button 
                key={item.hashtag} 
                className={`tag-pill ${selectedHashtag === item.hashtag ? 'active' : ''}`}
                onClick={() => handleHashtagClick(item.hashtag)}
              >
                #{item.hashtag}
                <span className="tag-count">{item.count}</span>
              </button>
            ))
          ) : (
            <p className="no-tags">No trending hashtags yet</p>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchQuery.trim() !== "" && (
        <div className="search-results-container">
          {isSearching && <p className="search-status">Searching...</p>}
          
          {!isSearching && searchResults.length === 0 && (
            <p className="search-status">No users found for "{searchQuery}"</p>
          )}

          {!isSearching && searchResults.length > 0 && (
            <div className="search-results">
              <h3 className="results-title">Found {searchResults.length} user(s)</h3>
              <div className="users-grid">
                {searchResults.map((user) => (
                  <div
                    key={user._id || user.id}
                    className="search-user-card"
                  >
                    <img
                      src={user.avatarUrl || "/placeholder.svg"}
                      alt={user.name}
                      className="search-user-avatar"
                    />
                    <h4 className="search-user-name">{user.name}</h4>
                    <p className="search-user-role">{user.role}</p>
                    <p className="search-user-email">{user.email}</p>
                    <div className="search-user-stats">
                      <span>{user.followers} followers</span>
                      <span>{user.posts} posts</span>
                    </div>
                    <button
                      className="view-profile-btn"
                      onClick={() => navigate(`/profile/${user._id || user.id}`)}
                    >
                      View Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Image Grid - Only show when no search is active */}
      {searchQuery.trim() === "" && (
        <>
          {selectedHashtag && (
            <div className="hashtag-header">
              <h2>Posts with #{selectedHashtag}</h2>
              <p className="hashtag-count">{totalPosts} post{totalPosts !== 1 ? 's' : ''}</p>
            </div>
          )}
          <div className="explore-grid">
            {posts.length > 0 ? (
              posts.map((post, index) => (
                <Link
                  key={post._id}
                  to={`/profile/${post.userId._id}`}
                  className={`explore-item ${index === 0 ? "featured" : ""}`}
                >
                  <img
                    src={post.img}
                    alt={post.caption || "Post"}
                    className="explore-image"
                    loading="lazy"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="explore-overlay">
                    <div className="overlay-stats">
                      <div className="stat-box">
                        <Heart className="w-6 h-6 fill-current" />
                        <span className="stat-count">{post.likes?.length || 0}</span>
                      </div>
                      <div className="stat-box">
                        <MessageCircle className="w-6 h-6 fill-current" />
                        <span className="stat-count">{post.comments?.length || 0}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="no-posts">No posts found</p>
            )}
          </div>

          {/* Load more button */}
          {hasMore && (
            <div className="load-more">
              <button 
                onClick={handleLoadMore}
                disabled={isLoadingPosts}
                className="load-more-btn"
              >
                {isLoadingPosts ? "Loading..." : "Load More"}
              </button>
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <div className="load-more">
              <p>No more posts to load</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}