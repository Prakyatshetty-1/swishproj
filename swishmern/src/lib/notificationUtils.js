// Check if a specific notification type is enabled
export const isNotificationEnabled = (type) => {
  try {
    const settings = JSON.parse(localStorage.getItem("notificationSettings") || "{}");
    // If settings exist, use them. Otherwise, default to true (enabled)
    return settings[type] !== false;
  } catch (error) {
    console.error("Error checking notification settings:", error);
    return true; // Default to enabled if error
  }
};

// Get all notification settings
export const getNotificationSettings = () => {
  try {
    const settings = JSON.parse(localStorage.getItem("notificationSettings") || "{}");
    return {
      likes: settings.likes !== false,
      comments: settings.comments !== false,
      follows: settings.follows !== false,
    };
  } catch (error) {
    console.error("Error getting notification settings:", error);
    return {
      likes: true,
      comments: true,
      follows: true,
    };
  }
};

// Save notification settings
export const saveNotificationSettings = (settings) => {
  try {
    localStorage.setItem("notificationSettings", JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving notification settings:", error);
  }
};
