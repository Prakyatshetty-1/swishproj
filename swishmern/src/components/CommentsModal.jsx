import { X } from "lucide-react";
import "../styles/comments-modal.css";

export default function CommentsModal({ isOpen, onClose, comments, postAuthor }) {
  if (!isOpen) return null;

  // Sort comments by date (latest first)
  const sortedComments = [...comments].sort((a, b) => {
    const dateA = new Date(a.createdAt || 0);
    const dateB = new Date(b.createdAt || 0);
    return dateB - dateA;
  });

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
            sortedComments.map((comment, index) => (
              <div key={index} className="modal-comment">
                <img
                  src={comment.userId?.avatarUrl || "https://ui-avatars.com/api/?name=User"}
                  alt={comment.userId?.name || "User"}
                  className="modal-comment-avatar"
                />
                <div className="modal-comment-content">
                  <div className="modal-comment-header">
                    <strong className="modal-comment-author">
                      {comment.userId?.name || "Unknown User"}
                    </strong>
                    <span className="modal-comment-time">
                      {comment.createdAt
                        ? new Date(comment.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })
                        : "Recently"}
                    </span>
                  </div>
                  <p className="modal-comment-text">{comment.text}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
