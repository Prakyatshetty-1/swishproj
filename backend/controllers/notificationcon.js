import Notification from '../models/Notification.js';
import User from '../models/User.js';
import Post from '../models/Post.js';

// Create a follow notification
export const createFollowNotification = async (recipientId, senderId) => {
  try {
    const sender = await User.findById(senderId);
    
    if (!sender) {
      return;
    }

    // Check if recipient has follow notifications enabled
    const recipient = await User.findById(recipientId);
    if (recipient && recipient.notificationPreferences?.follows === false) {
      console.log(`Follow notification skipped - recipient has disabled follows`);
      return;
    }

    // Check if notification already exists
    const existingNotification = await Notification.findOne({
      recipientId,
      senderId,
      type: 'follow',
    });

    if (!existingNotification) {
      const notification = new Notification({
        recipientId,
        senderId,
        type: 'follow',
        message: `${sender.name} started following you`,
      });

      await notification.save();
    }
  } catch (error) {
    console.error('Error creating follow notification:', error);
  }
};

// Create a like notification
export const createLikeNotification = async (postId, senderId) => {
  try {
    const post = await Post.findById(postId);
    if (!post) return;

    const sender = await User.findById(senderId);
    if (!sender) return;

    // Don't send notification to self
    if (post.userId.toString() === senderId.toString()) {
      return;
    }

    // Check if recipient has like notifications enabled
    const recipient = await User.findById(post.userId);
    if (recipient && recipient.notificationPreferences?.likes === false) {
      console.log(`✅ Like notification skipped - recipient has disabled likes`);
      return;
    }

    // Check if notification for this like already exists (within last 24 hours)
    const existingNotification = await Notification.findOne({
      recipientId: post.userId,
      senderId,
      type: 'like',
      postId,
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    if (!existingNotification) {
      const notification = new Notification({
        recipientId: post.userId,
        senderId,
        type: 'like',
        postId,
        message: `${sender.name} liked your post`,
      });

      await notification.save();
    }
  } catch (error) {
    console.error('Error creating like notification:', error);
  }
};

// Create a comment notification
export const createCommentNotification = async (postId, senderId) => {
  try {
    const post = await Post.findById(postId);
    if (!post) return;

    const sender = await User.findById(senderId);
    if (!sender) return;

    // Don't send notification to self
    if (post.userId.toString() === senderId.toString()) {
      return;
    }

    // Check if recipient has comment notifications enabled
    const recipient = await User.findById(post.userId);
    if (recipient && recipient.notificationPreferences?.comments === false) {
      console.log(`✅ Comment notification skipped - recipient has disabled comments`);
      return;
    }

    const notification = new Notification({
      recipientId: post.userId,
      senderId,
      type: 'comment',
      postId,
      message: `${sender.name} commented on your post`,
    });

    await notification.save();
  } catch (error) {
    console.error('Error creating comment notification:', error);
  }
};

export const createCommentLikeNotification = async (postId, commentId, senderId, recipientId) => {
  try {
    // 1. Don't notify if you like your own comment
    if (senderId.toString() === recipientId.toString()) return;

    // 2. Check if notification already exists (to prevent spamming like/unlike)
    const existingNotification = await Notification.findOne({
      recipient: recipientId,
      sender: senderId,
      post: postId,
      type: "comment_like" // Unique type for this action
    });

    if (existingNotification) return;

    // 3. Create Notification
    const newNotification = new Notification({
      recipient: recipientId,
      sender: senderId,
      post: postId,
      type: "comment_like",
      text: "liked your comment", // Optional text for UI
      read: false
    });

    await newNotification.save();
  } catch (err) {
    console.error("Error creating comment like notification:", err);
  }
};


// Get all notifications for a user
export const getNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId || userId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'User ID is required and must be valid',
      });
    }

    const notifications = await Notification.find({ recipientId: userId })
      .populate('senderId', 'name avatarUrl email')
      .populate('postId', 'img caption')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notifications.length,
      notifications,
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching notifications',
      error: error.message,
    });
  }
};

// Get unread notifications count
export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId || userId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'User ID is required and must be valid',
        unreadCount: 0,
      });
    }

    const unreadCount = await Notification.countDocuments({
      recipientId: userId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      unreadCount,
    });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching unread count',
      error: error.message,
    });
  }
};

// Mark notification as read
export const markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      notification,
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking notification as read',
      error: error.message,
    });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId || userId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'User ID is required and must be valid',
      });
    }

    const result = await Notification.updateMany(
      { recipientId: userId, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Error marking all notifications as read',
      error: error.message,
    });
  }
};

// Delete a notification
export const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;

    const notification = await Notification.findByIdAndDelete(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting notification',
      error: error.message,
    });
  }
};

// Delete all notifications for a user
export const deleteAllNotifications = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId || userId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'User ID is required and must be valid',
      });
    }

    const result = await Notification.deleteMany({ recipientId: userId });

    res.status(200).json({
      success: true,
      message: 'All notifications deleted successfully',
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error('Error deleting all notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting all notifications',
      error: error.message,
    });
  }
};

// Get notification preferences
export const getNotificationPreferences = async (req, res) => {
  try {
    const { userId } = req.params;

    // Validate userId
    if (!userId || userId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'User ID is required and must be valid',
      });
    }

    const user = await User.findById(userId, 'notificationPreferences');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      preferences: user.notificationPreferences || {
        likes: true,
        comments: true,
        follows: true,
      },
    });
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting notification preferences',
      error: error.message,
    });
  }
};

// Update notification preferences
export const updateNotificationPreferences = async (req, res) => {
  try {
    const { userId } = req.params;
    const { likes, comments, follows } = req.body;

    // Validate userId
    if (!userId || userId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'User ID is required and must be valid',
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      {
        notificationPreferences: {
          likes: likes !== undefined ? likes : true,
          comments: comments !== undefined ? comments : true,
          follows: follows !== undefined ? follows : true,
        },
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    console.log(`✅ Notification preferences updated for user:`, user.email);

    res.status(200).json({
      success: true,
      message: 'Notification preferences updated successfully',
      preferences: user.notificationPreferences,
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating notification preferences',
      error: error.message,
    });
  }
};
