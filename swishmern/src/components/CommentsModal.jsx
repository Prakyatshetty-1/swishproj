import { X, Heart } from "lucide-react";
import axios from "axios";
import "../styles/comments-modal.css";

const API_BASE_URL = "http://localhost:5000/api";

export default function CommentsModal({ 
  isOpen, 
  onClose, 
  comments, 
  postAuthor, 
  currentUserId, 
  postId,        
  onPostUpdate  
}) {
  if (!isOpen) return null;

  const sortedComments = [...comments].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB - dateA;
  });

  // New Function to Handle Comment Likes
  const handleCommentLike = async (commentId) => {
    if (!currentUserId) return;

    try {
      const res = await axios.post(`${API_BASE_URL}/posts/comment/like`, {
        postId,
        commentId,
        userId: currentUserId
      });

      // Update the parent state with the new post data
      if (onPostUpdate && res.data.post) {
        onPostUpdate(res.data.post);
      }
    } catch (err) {
      console.error("Failed to like comment", err);
    }
  };

  return (
    <div className="comments-modal-overlay" onClick={onClose}>
      <div className="comments-modal" onClick={(e) => e.stopPropagation()}>
        <div className="comments-modal-header">
          <h2>Comments ({comments.length})</h2>
          <button className="comments-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="comments-modal-content">
          {sortedComments.length === 0 ? (
            <div className="no-comments">
              <p>No comments yet. Be the first to comment!</p>
            </div>
          ) : (
            sortedComments.map((comment, index) => {
              // Check if currently liked by user
              const isLiked = comment.likes && comment.likes.includes(currentUserId);
              const likeCount = comment.likes ? comment.likes.length : 0;

              return (
                <div key={index} className="modal-comment">
                  <img
                    src={comment.userId?.avatarUrl || "https://ui-avatars.com/api/?name=User"}
                    alt={comment.userId?.name || "User"}
                    className="modal-comment-avatar"
                  />
                  
                  <div className="modal-comment-content" style={{flex: 1}}>
                    <div className="modal-comment-header">
                      <strong className="modal-comment-author">
                        {comment.userId?.name || "Unknown User"}
                      </strong>
                      <span className="modal-comment-time">
                        {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString() : "Recently"}
                      </span>
                    </div>
                    <p className="modal-comment-text">{comment.text}</p>
                    
                    {/* Like Count Text */}
                    {likeCount > 0 && (
                      <span style={{fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px', display:'block'}}>
                        {likeCount} {likeCount === 1 ? 'like' : 'likes'}
                      </span>
                    )}
                  </div>

                  {/* Comment Like Heart Button */}
                  <button 
                    onClick={() => handleCommentLike(comment._id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      color: isLiked ? '#ef4444' : '#cbd5e1'
                    }}
                  >
                    <Heart size={16} fill={isLiked ? '#ef4444' : 'none'} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}