import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, BadgeCheck, MapPin } from "lucide-react";
import "../styles/Home.css";

export default function Post({
  author,
  authorRole,
  timeAgo,
  authorImage,
  postImage,
  likes,
  caption,
  commentCount,
  location,
  hashtags = []
}) {
  return (
    <div className="post">
      <div className="post-header">
        <div className="post-author-info">
          <img src={authorImage || "/placeholder.svg"} alt={author} className="author-avatar" />
          <div className="author-details">
            <div className="author-name-role">
              <span className="author-name">{author}</span>
              {authorRole && (
                <div className="author-role-badge">
                  <BadgeCheck size={14} />
                  <span>{authorRole}</span>
                </div>
              )}
            </div>
            {location && (
              <div className="post-location">
                 {location}
              </div>
            )}

            {/* if you want time to be displayed below the location on posts.*/}

            {/* <span className="post-time" style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8' }}>
              {timeAgo}
            </span> */}
          </div>
        </div>
        <button className="more-options">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <img src={postImage || "/placeholder.svg"} alt="Post content" className="post-image" />

      <div className="post-engagement">
        <div className="post-actions">
          <button className="action-btn">
            <Heart size={20} />
          </button>
          <button className="action-btn">
            <MessageCircle size={20} />
          </button>
          <button className="action-btn">
            <Share2 size={20} />
          </button>
          <button className="action-btn bookmark-btn">
            <Bookmark size={20} />
          </button>
        </div>

        <div className="post-stats">
          <span className="likes-count">{likes} likes</span>
        </div>

        <div className="post-caption">
          <p>
            <strong>{author}</strong> {caption}
            {hashtags && hashtags.length > 0 && (
              <span className="post-hashtags">
                {hashtags.map((tag, index) => (
                  <span key={index} className="hashtag">{tag} </span>
                ))}
              </span>
            )}
          </p>
        </div>
        {/* if you want time to be displayed above the view all comments on posts.*/}
        {location && <div className="post-time-bottom">{timeAgo}</div>}

        <button className="view-comments">View all {commentCount} comments</button>
      </div>
    </div>
  )
}
