import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal, BadgeCheck, MapPin, X } from "lucide-react";
import { useState, useEffect } from "react";
import axios from "axios";
import "../styles/Home.css";

const API_BASE_URL = "http://localhost:5000/api";

export default function Post({
  id,
  author,
  authorRole,
  timeAgo,
  authorImage,
  postImage,
  likes,
  caption,
  commentCount,
  location,
  hashtags = [],
  postData,
  currentUserId,
  onPostUpdate
}) {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [isLoadingComment, setIsLoadingComment] = useState(false);
  const [isLoadingLike, setIsLoadingLike] = useState(false);

  // Initialize likes and comments on mount
  useEffect(() => {
    if (postData) {
      // Check if current user liked the post
      const userLiked = postData?.likes?.some(like => {
        const likeId = typeof like === 'string' ? like : like?._id;
        const userId = typeof currentUserId === 'string' ? currentUserId : currentUserId?._id;
        return likeId === userId;
      });
      setIsLiked(userLiked || false);
      setLikeCount(postData.likes?.length || 0);
      
      // Initialize comments
      const postComments = Array.isArray(postData.comments) ? postData.comments : [];
      setComments(postComments);
    }
  }, [postData, currentUserId]);

  const handleLike = async () => {
  // Debug logs
  console.log('Current User ID:', currentUserId);
  console.log('Post ID:', id);
  
  if (!currentUserId) {
    alert("Please log in to like posts");
    return;
  }

  try {
    setIsLoadingLike(true);
    const response = await axios.post(`${API_BASE_URL}/posts/like`, {
      postId: id,
      userId: currentUserId
    });
    
    console.log('Like response:', response.data); // Debug log
    
    // Toggle the like state
    setIsLiked(!isLiked);
    setLikeCount(response.data.likes.length);
    
    // Update parent component with full post data
    if (onPostUpdate && response.data.post) {
      onPostUpdate(response.data.post);
    }
  } catch (err) {
    console.error("Error liking post:", err);
    console.error("Error details:", err.response?.data); // More detailed error
    alert("Failed to like post. Please try again.");
  } finally {
    setIsLoadingLike(false);
  }
};

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      setIsLoadingComment(true);
      const response = await axios.post(`${API_BASE_URL}/posts/comment`, {
        postId: id,
        userId: currentUserId,
        text: commentText
      });
      
      const updatedComments = Array.isArray(response.data.post.comments) ? response.data.post.comments : [];
      setComments(updatedComments);
      setCommentText("");
      
      // Update parent component
      if (onPostUpdate) {
        onPostUpdate(response.data.post);
      }
    } catch (err) {
      console.error("Error adding comment:", err);
    } finally {
      setIsLoadingComment(false);
    }
  };

  const displayedComments = showAllComments ? comments : comments.slice(0, 6);

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
          </div>
        </div>
        <button className="more-options">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <img src={postImage || "/placeholder.svg"} alt="Post content" className="post-image" />

      <div className="post-engagement">
        <div className="post-actions">
          <button 
            className={`action-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
            disabled={isLoadingLike}
            style={{ color: isLiked ? '#ef4444' : '#e2e8f0' }}
          >
            <Heart size={20} fill={isLiked ? '#ef4444' : 'none'} />
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
          <span className="likes-count">{likeCount} likes</span>
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
        
        {location && <div className="post-time-bottom">{timeAgo}</div>}

        {/* Comments Section */}
        {comments && comments.length > 0 && (
          <div className="comments-section" style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
            {displayedComments.map((comment, index) => (
              <div key={index} className="comment" style={{ marginBottom: '8px', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <img 
                    src={comment.userId?.avatarUrl || "https://ui-avatars.com/api/?name=User"} 
                    alt="commenter"
                    style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                  />
                  <div>
                    <strong>{comment.userId?.name || "Unknown User"}</strong> {comment.text}
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
                      {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {comments.length > 6 && !showAllComments && (
              <button 
                onClick={() => setShowAllComments(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  marginTop: '8px',
                  padding: 0
                }}
              >
                View all {comments.length} comments
              </button>
            )}
            
            {showAllComments && comments.length > 6 && (
              <button 
                onClick={() => setShowAllComments(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  marginTop: '8px',
                  padding: 0
                }}
              >
                Hide comments
              </button>
            )}
          </div>
        )}

        {/* Add Comment Input */}
        <form onSubmit={handleAddComment} style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
          <input 
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            disabled={isLoadingComment || !currentUserId}
            style={{
              flex: 1,
              padding: '8px 12px',
              borderRadius: '20px',
              border: '1px solid #e2e8f0',
              fontSize: '0.875rem',
              outline: 'none',
              backgroundColor: '#f1f5f9'
            }}
          />
          <button 
            type="submit"
            disabled={!commentText.trim() || isLoadingComment || !currentUserId}
            style={{
              padding: '8px 16px',
              background: commentText.trim() && !isLoadingComment && currentUserId ? '#3b82f6' : '#cbd5e1',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              cursor: commentText.trim() && !isLoadingComment && currentUserId ? 'pointer' : 'not-allowed',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            {isLoadingComment ? 'Posting...' : 'Post'}
          </button>
        </form>
      </div>
    </div>
  )
}
