import axios from '../Services/axios';

// Get user notification preferences
export const getNotificationPreferences = async () => {
  try {
    const response = await axios.get('/notifications/preferences');
    return {
      success: true,
      preferences: response.data
    };
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch notification preferences'
    };
  }
};

// Update user notification preferences
export const updateNotificationPreferences = async (preferences) => {
  try {
    const response = await axios.put('/notifications/preferences', preferences);
    return {
      success: true,
      preferences: response.data
    };
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update notification preferences'
    };
  }
};

// Get user notifications with pagination
export const getNotifications = async (page = 1, perPage = 20) => {
  try {
    const response = await axios.get('/notifications', {
      params: { page, per_page: perPage }
    });
    return {
      success: true,
      notifications: response.data.notifications || [],
      pagination: response.data.pagination || {}
    };
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch notifications',
      notifications: [],
      pagination: {}
    };
  }
};

// Get unread notification count
export const getUnreadCount = async () => {
  try {
    const response = await axios.get('/notifications/unread-count');
    return {
      success: true,
      count: response.data.unread_count || 0
    };
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch unread count',
      count: 0
    };
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await axios.put(`/notifications/${notificationId}/read`);
    return {
      success: true,
      message: response.data.message
    };
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to mark notification as read'
    };
  }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const response = await axios.put('/notifications/mark-all-read');
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to mark all notifications as read'
    };
  }
};

// Delete notification
export const deleteNotification = async (notificationId) => {
  try {
    await axios.delete(`/notifications/${notificationId}`);
    return {
      success: true
    };
  } catch (error) {
    console.error('Error deleting notification:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete notification'
    };
  }
};

// Bulk enable/disable email notifications
export const bulkUpdateEmailNotifications = async (enabled) => {
  try {
    const response = await axios.put('/notifications/preferences/bulk', {
      notification_type: 'email',
      enabled
    });
    return {
      success: true,
      message: response.data.message,
      preferences: response.data.preferences
    };
  } catch (error) {
    console.error('Error bulk updating email notifications:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update email notifications'
    };
  }
};

// Bulk enable/disable in-app notifications
export const bulkUpdateInAppNotifications = async (enabled) => {
  try {
    const response = await axios.put('/notifications/preferences/bulk', {
      notification_type: 'inapp',
      enabled
    });
    return {
      success: true,
      message: response.data.message,
      preferences: response.data.preferences
    };
  } catch (error) {
    console.error('Error bulk updating in-app notifications:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update in-app notifications'
    };
  }
};

// Reset notification preferences to defaults
export const resetNotificationPreferences = async () => {
  try {
    const response = await axios.post('/notifications/preferences/reset');
    return {
      success: true,
      message: response.data.message,
      preferences: response.data.preferences
    };
  } catch (error) {
    console.error('Error resetting notification preferences:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to reset notification preferences'
    };
  }
};

// Admin functions (for organization admins and platform admins)

// Send bulk notification (admin only)
export const sendBulkNotification = async (notificationData) => {
  try {
    const response = await axios.post('/notifications/bulk/broadcast', notificationData);
    return {
      success: true,
      message: response.data.message,
      stats: response.data.stats
    };
  } catch (error) {
    console.error('Error sending bulk notification:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send bulk notification'
    };
  }
};

// Preview bulk notification recipients (admin only)
export const previewBulkNotificationRecipients = async (filters) => {
  try {
    const response = await axios.post('/notifications/bulk/preview', filters);
    return {
      success: true,
      recipients: response.data.recipients || [],
      count: response.data.count || 0
    };
  } catch (error) {
    console.error('Error previewing bulk notification recipients:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to preview recipients',
      recipients: [],
      count: 0
    };
  }
};

// Get bulk notification statistics (admin only)
export const getBulkNotificationStats = async () => {
  try {
    const response = await axios.get('/notifications/bulk/stats');
    return {
      success: true,
      stats: response.data
    };
  } catch (error) {
    console.error('Error fetching bulk notification stats:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch notification stats'
    };
  }
};

export default {
  getNotificationPreferences,
  updateNotificationPreferences,
  getNotifications,
  markNotificationAsRead,
  getUnreadCount,
  markAllAsRead,
  deleteNotification,
  bulkUpdateEmailNotifications,
  bulkUpdateInAppNotifications,
  resetNotificationPreferences,
  sendBulkNotification,
  previewBulkNotificationRecipients,
  getBulkNotificationStats
};
