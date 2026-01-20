// Admin utilities
const ADMIN_EMAILS = ['prakyatshetty5@gmail.com', 'admin2@example.com'];

/**
 * Check if a user is an admin
 * @param {Object} user - User object from localStorage
 * @returns {Boolean} - True if user is admin
 */
export const isUserAdmin = (user) => {
  if (!user) return false;
  
  // Check if email is in admin list or role is admin
  return (
    ADMIN_EMAILS.includes(user.email?.toLowerCase()) || 
    user.role === 'admin'
  );
};

/**
 * Get admin status
 * @returns {Boolean} - True if current user is admin
 */
export const checkAdminStatus = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return false;
  
  try {
    const user = JSON.parse(userStr);
    return isUserAdmin(user);
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
};

/**
 * Get admin emails list
 * @returns {Array} - Array of admin emails
 */
export const getAdminEmails = () => {
  return ADMIN_EMAILS;
};
