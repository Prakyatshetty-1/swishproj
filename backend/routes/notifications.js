import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  updateNotificationPreferences,
  getNotificationPreferences,
} from '../controllers/notificationcon.js';

const router = express.Router();

// Get all notifications for a user
router.get('/:userId', getNotifications);

// Get unread notifications count
router.get('/:userId/unread-count', getUnreadCount);

// Get notification preferences
router.get('/:userId/preferences', getNotificationPreferences);

// Mark a notification as read
router.put('/:notificationId/read', markNotificationAsRead);

// Mark all notifications as read
router.put('/:userId/read-all', markAllNotificationsAsRead);

// Update notification preferences
router.put('/:userId/preferences', updateNotificationPreferences);

// Delete a notification
router.delete('/:notificationId', deleteNotification);

// Delete all notifications for a user
router.delete('/:userId/clear-all', deleteAllNotifications);

export default router;
