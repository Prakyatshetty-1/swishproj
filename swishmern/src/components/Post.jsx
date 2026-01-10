import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, BadgeCheck } from "lucide-react"


export default function Post({
  author,
  authorRole,
  timeAgo,
  authorImage,
  postImage,
  likes = 234,
  caption,
  commentCount = 3,
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
            <span className="post-time">{timeAgo}</span>
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
          </p>
        </div>

        <button className="view-comments">View all {commentCount} comments</button>
      </div>
    </div>
  )
}
