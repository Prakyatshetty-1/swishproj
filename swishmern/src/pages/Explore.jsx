import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, Heart, MessageCircle, User } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { posts, trendingTags } from "../data/mockData";

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

  const gridImages = posts.slice(0, 9);

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
          {trendingTags.map((tag) => (
            <button key={tag} className="tag-pill">
              {tag}
            </button>
          ))}
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
          <div className="explore-grid">
            {gridImages.map((post, index) => (
              <Link
                key={post.id}
                to={`/profile/${post.user.id}`}
                className={`explore-item ${index === 0 ? "featured" : ""}`}
              >
                <img
                  src={post.image}
                  alt="Post"
                  className="explore-image"
                  loading="lazy"
                />
                
                {/* Hover Overlay */}
                <div className="explore-overlay">
                  <div className="overlay-stats">
                    <div className="stat-box">
                      <Heart className="w-6 h-6 fill-current" />
                      <span className="stat-count">{post.likes}</span>
                    </div>
                    <div className="stat-box">
                      <MessageCircle className="w-6 h-6 fill-current" />
                      <span className="stat-count">{post.comments.length}</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Load more placeholder */}
          <div className="load-more">
            <p>Scroll down to load more content</p>
          </div>
        </>
      )}
    </div>
  );
}