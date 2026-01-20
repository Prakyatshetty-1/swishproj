import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/AdminDashboard.css';

const AdminDashboard = ({ token }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const API_URL = 'http://localhost:5000/api/admin';

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/dashboard-stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setStats(response.data.stats);
      setLoading(false);
    } catch (error) {
      setMessage('Error fetching dashboard stats');
      setLoading(false);
    }
  };

  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/users?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users);
      setCurrentPage(page);
      setLoading(false);
    } catch (error) {
      setMessage('Error fetching users');
      setLoading(false);
    }
  };

  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/posts?page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPosts(response.data.posts);
      setCurrentPage(page);
      setLoading(false);
    } catch (error) {
      setMessage('Error fetching posts');
      setLoading(false);
    }
  };

  const searchUsers = async () => {
    if (!searchQuery.trim()) {
      fetchUsers();
      return;
    }

    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/search-users?query=${searchQuery}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data.users);
      setLoading(false);
    } catch (error) {
      setMessage('Error searching users');
      setLoading(false);
    }
  };

  const banUser = async (userId, reason) => {
    try {
      const response = await axios.post(
        `${API_URL}/ban-user`,
        { userId, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('User banned successfully');
      fetchUsers(currentPage);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error banning user');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const unbanUser = async (userId) => {
    try {
      const response = await axios.post(
        `${API_URL}/unban-user`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('User unbanned successfully');
      fetchUsers(currentPage);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error unbanning user');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const deletePost = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const response = await axios.post(
        `${API_URL}/delete-post`,
        { postId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Post deleted successfully');
      fetchPosts(currentPage);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error deleting post');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const setAdminRole = async (userId) => {
    if (!window.confirm('Make this user an admin?')) return;

    try {
      const response = await axios.post(
        `${API_URL}/set-admin`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('User promoted to admin');
      fetchUsers(currentPage);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error promoting user');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const removeAdminRole = async (userId) => {
    if (!window.confirm('Remove admin role from this user?')) return;

    try {
      const response = await axios.post(
        `${API_URL}/remove-admin`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage('Admin role removed');
      fetchUsers(currentPage);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      setMessage('Error removing admin role');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
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
            fetchDashboardStats();
          }}
        >
          Dashboard
        </button>
        <button
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('users');
            fetchUsers(1);
          }}
        >
          Users
        </button>
        <button
          className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('posts');
            fetchPosts(1);
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
              onKeyPress={(e) => e.key === 'Enter' && searchUsers()}
            />
            <button onClick={searchUsers}>Search</button>
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
                          onClick={() => unbanUser(user._id)}
                        >
                          Unban
                        </button>
                      ) : (
                        <>
                          <button
                            className="btn-ban"
                            onClick={() => {
                              const reason = prompt('Ban reason:');
                              if (reason) banUser(user._id, reason);
                            }}
                          >
                            Ban
                          </button>
                          {user.role !== 'admin' ? (
                            <button
                              className="btn-admin"
                              onClick={() => setAdminRole(user._id)}
                            >
                              Make Admin
                            </button>
                          ) : (
                            <button
                              className="btn-remove-admin"
                              onClick={() => removeAdminRole(user._id)}
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
                <div className="post-header">
                  <h4>{post.userId?.name || 'Unknown User'}</h4>
                  <span className="post-email">{post.userId?.email}</span>
                </div>
                <p className="post-caption">{post.caption}</p>
                <div className="post-stats">
                  <span>{post.likes?.length || 0} likes</span>
                  <span>{post.comments?.length || 0} comments</span>
                </div>
                <button
                  className="btn-delete-post"
                  onClick={() => deletePost(post._id)}
                >
                  Delete Post
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
