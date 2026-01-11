import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Heart, MessageCircle } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { posts, trendingTags } from "../data/mockData";

import "../styles/Explore.css";

export default function Explore() {
  const [searchQuery, setSearchQuery] = useState("");

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
            onChange={(e) => setSearchQuery(e.target.value)}
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

      {/* Image Grid */}
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
    </div>
  );
}