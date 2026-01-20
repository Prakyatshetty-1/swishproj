import { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import '../styles/AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [token, setToken] = useState(null);

  const API_URL = 'http://localhost:5000/api/admin';

  useEffect(() => {
    // Get token from localStorage
    const accessToken = localStorage.getItem('accessToken');
    console.log('📱 AdminDashboard useEffect - Token from localStorage:', {
      exists: !!accessToken,
      length: accessToken?.length,
      first50: accessToken?.substring(0, 50),
    });
    if (accessToken) {
      setToken(accessToken);
      console.log('📱 Setting token state and testing token endpoint first');
      // Test the token first
      testToken(accessToken);
    } else {
      setMessage('No authentication token found');
    }
  }, []);

  const testToken = async (authToken) => {
    try {
      const testUrl = `${API_URL}/test-token`;
      const headers = { Authorization: `Bearer ${authToken}` };
      console.log('🧪 Testing token at:', testUrl);
      console.log('🧪 Headers being sent:', headers);
      console.log('🧪 Full auth value:', `Bearer ${authToken.substring(0, 50)}...`);
      
      const response = await axios.get(testUrl, { headers });
      console.log('✅ Test token response:', response.data);
      // If test passes, now fetch the actual data
      fetchDashboardStats(authToken);
    } catch (error) {
      console.error('❌ Test token failed:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.response?.headers,
      });
    }
  };

  const fetchDashboardStats = async (authToken = token) => {
    if (!authToken) {
      console.log('❌ No auth token available');
      setMessage('No authentication token');
      return;
    }

    try {
      setLoading(true);
      const fullUrl = `${API_URL}/dashboard-stats`;
      console.log('📡 API Request Details:', {
        url: fullUrl,
        tokenLength: authToken.length,
        tokenFirst30: authToken.substring(0, 30),
        headerValue: `Bearer ${authToken.substring(0, 30)}...`,
      });
      const response = await axios.get(fullUrl, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log('✅ Dashboard stats response:', response.data);
      setStats(response.data.stats);
      setMessage('');
      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching dashboard stats:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });
      setMessage(error.response?.data?.message || 'Error fetching dashboard stats');
      setLoading(false);
    }
  };

  const fetchUsers = async (page = 1, authToken = token) => {
    if (!authToken) {
      setMessage('No authentication token');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching users, page:', page);
      const response = await axios.get(`${API_URL}/users?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log('Users response:', response.data);
      setUsers(response.data.users);
      setCurrentPage(page);
      setMessage('');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching users:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Error fetching users');
      setLoading(false);
    }
  };

  const fetchPosts = async (page = 1, authToken = token) => {
    if (!authToken) {
      setMessage('No authentication token');
      return;
    }

    try {
      setLoading(true);
      console.log('Fetching posts, page:', page);
      const response = await axios.get(`${API_URL}/posts?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log('Posts response:', response.data);
      setPosts(response.data.posts);
      setCurrentPage(page);
      setMessage('');
      setLoading(false);
    } catch (error) {
      console.error('Error fetching posts:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Error fetching posts');
      setLoading(false);
    }
  };

  const searchUsers = async (query, authToken = token) => {
    if (!query.trim()) {
      fetchUsers(1, authToken);
      return;
    }

    if (!authToken) {
      setMessage('No authentication token');
      return;
    }

    try {
      setLoading(true);
      console.log('Searching users with query:', query);
      const response = await axios.get(`${API_URL}/search-users?query=${query}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      console.log('Search response:', response.data);
      setUsers(response.data.users);
      setLoading(false);
    } catch (error) {
      console.error('Error searching users:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Error searching users');
      setLoading(false);
    }
  };

  const banUser = async (userId, reason, authToken = token) => {
    if (!authToken) {
      setMessage('No authentication token');
      return;
    }

    try {
      console.log('Banning user:', userId);
      const response = await axios.post(
        `${API_URL}/ban-user`,
        { userId, reason },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('Ban response:', response.data);
      setMessage('User banned successfully');
      fetchUsers(currentPage, authToken);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error banning user:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Error banning user');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const unbanUser = async (userId, authToken = token) => {
    if (!authToken) {
      setMessage('No authentication token');
      return;
    }

    try {
      console.log('Unbanning user:', userId);
      const response = await axios.post(
        `${API_URL}/unban-user`,
        { userId },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('Unban response:', response.data);
      setMessage('User unbanned successfully');
      fetchUsers(currentPage, authToken);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error unbanning user:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Error unbanning user');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deletePost = async (postId, authToken = token) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    if (!authToken) {
      setMessage('No authentication token');
      return;
    }

    try {
      console.log('Deleting post:', postId);
      const response = await axios.post(
        `${API_URL}/delete-post`,
        { postId },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('Delete response:', response.data);
      setMessage('Post deleted successfully');
      fetchPosts(currentPage, authToken);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error deleting post:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Error deleting post');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const setAdminRole = async (userId, authToken = token) => {
    if (!window.confirm('Make this user an admin?')) return;

    if (!authToken) {
      setMessage('No authentication token');
      return;
    }

    try {
      console.log('Setting admin role for user:', userId);
      const response = await axios.post(
        `${API_URL}/set-admin`,
        { userId },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('Set admin response:', response.data);
      setMessage('User promoted to admin');
      fetchUsers(currentPage, authToken);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error promoting user:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Error promoting user');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const removeAdminRole = async (userId, authToken = token) => {
    if (!window.confirm('Remove admin role from this user?')) return;

    if (!authToken) {
      setMessage('No authentication token');
      return;
    }

    try {
      console.log('Removing admin role from user:', userId);
      const response = await axios.post(
        `${API_URL}/remove-admin`,
        { userId },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      console.log('Remove admin response:', response.data);
      setMessage('Admin role removed');
      fetchUsers(currentPage, authToken);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error removing admin role:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Error removing admin role');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <div className="admin-page-layout">
      <Sidebar />
      <div className="admin-dashboard">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage users and content</p>
        </div>

      {message && <div className="admin-message">{message}</div>}

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('dashboard');
            fetchDashboardStats(token);
          }}
        >
          Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('users');
            fetchUsers(1, token);
          }}
        >
          Users
        </button>
        <button
          className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('posts');
            fetchPosts(1, token);
          }}
        >
          Posts
        </button>
      </div>

      {loading && <div className="loading">Loading...</div>}

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && stats && (
        <div className="dashboard-stats">
          <div className="stat-card">
            <div className="stat-number">{stats.totalUsers}</div>
            <div className="stat-label">Total Users</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.totalPosts}</div>
            <div className="stat-label">Total Posts</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{stats.activeUsers}</div>
            <div className="stat-label">Active Users</div>
          </div>
          <div className="stat-card banned">
            <div className="stat-number">{stats.bannedUsers}</div>
            <div className="stat-label">Banned Users</div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="admin-section">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && searchUsers(searchQuery, token)}
            />
            <button onClick={() => searchUsers(searchQuery, token)}>Search</button>
          </div>

          <div className="users-table">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Followers</th>
                  <th>Posts</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className={user.isBanned ? 'banned-user' : ''}>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge ${user.role}`}>{user.role}</span>
                    </td>
                    <td>{user.followers}</td>
                    <td>{user.posts}</td>
                    <td>
                      <span className={`status-badge ${user.isBanned ? 'banned' : 'active'}`}>
                        {user.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td className="actions">
                      {user.isBanned ? (
                        <button
                          className="btn-unban"
                          onClick={() => unbanUser(user._id, token)}
                        >
                          Unban
                        </button>
                      ) : (
                        <>
                          <button
                            className="btn-ban"
                            onClick={() => {
                              const reason = prompt('Ban reason:');
                              if (reason) banUser(user._id, reason, token);
                            }}
                          >
                            Ban
                          </button>
                          {user.role !== 'admin' ? (
                            <button
                              className="btn-admin"
                              onClick={() => setAdminRole(user._id, token)}
                            >
                              Make Admin
                            </button>
                          ) : (
                            <button
                              className="btn-remove-admin"
                              onClick={() => removeAdminRole(user._id, token)}
                            >
                              Remove Admin
                            </button>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="admin-section">
          <div className="posts-list">
            {posts.map((post) => (
              <div key={post._id} className="post-item">
                {post.img && (
                  <div className="post-image-container">
                    <img 
                      src={post.img} 
                      alt="Post preview" 
                      className="post-image"
                    />
                  </div>
                )}
                <div className="post-header">
                  <h4>{post.userId?.name || 'Unknown User'}</h4>
                  <span className="post-email">{post.userId?.email}</span>
                </div>
                <p className="post-caption">{post.caption}</p>
                <div className="post-stats">
                  <span>❤️ {post.likes?.length || 0} likes</span>
                  <span>💬 {post.comments?.length || 0} comments</span>
                </div>
                <button
                  className="btn-delete-post"
                  onClick={() => deletePost(post._id, token)}
                >
                  Delete Post
                </button>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
