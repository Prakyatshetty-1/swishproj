import { useState } from "react"
import { Heart, MessageCircle } from "lucide-react"
import "../styles/post-grid.css"

export default function PostsGrid({ posts }) {
  const [hoveredPostId, setHoveredPostId] = useState(null)

  return (
    <div className="posts-grid">
      {posts.map((post) => (
        <div
          key={post.id}
          className="grid-post-item"
          onMouseEnter={() => setHoveredPostId(post.id)}
          onMouseLeave={() => setHoveredPostId(null)}
        >
          <img src={post.postImage || "/placeholder.svg"} alt="Post" className="grid-post-image" />

          {hoveredPostId === post.id && (
            <div className="grid-post-overlay">
              <div className="grid-post-stats">
                <button className="stat-button">
                  <Heart size={24} fill="white" color="white" />
                  <span>{post.likes}</span>
                </button>
                <button className="stat-button">
                  <MessageCircle size={24} color="white" />
                  <span>{post.commentCount}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
