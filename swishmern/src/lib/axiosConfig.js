import axios from 'axios';

const API_BASE_URL = "http://localhost:5000/api";

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Check if token is expired
const isTokenExpired = (token) => {
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiry = payload.exp * 1000; // Convert to milliseconds
    return Date.now() >= expiry;
  } catch (error) {
    return true;
  }
};

// Logout and clear everything
const performLogout = (reason = 'Session expired') => {
  console.log(`🚪 Logging out: ${reason}`);
  localStorage.clear();
  sessionStorage.clear();
  window.location.href = '/login';
};

// Check session validity on app load
export const validateSession = async () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  // No tokens at all - not logged in
  if (!accessToken && !refreshToken) {
    return false;
  }
  
  // Check if refresh token is expired
  if (isTokenExpired(refreshToken)) {
    performLogout('Refresh token expired');
    return false;
  }
  
  // Access token is valid
  if (!isTokenExpired(accessToken)) {
    return true;
  }
  
  // Access token expired but refresh token is valid - try to refresh
  try {
    console.log('🔄 Access token expired, refreshing...');
    const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
      refreshToken: refreshToken
    });
    
    const { accessToken: newAccessToken } = response.data;
    localStorage.setItem('accessToken', newAccessToken);
    console.log('✅ Token refreshed successfully');
    return true;
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    performLogout('Failed to refresh session');
    return false;
  }
};

// Request interceptor - Add token to all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors and refresh token
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!refreshToken) {
        // No refresh token, logout immediately
        performLogout('No refresh token available');
        return Promise.reject(error);
      }

      // Check if refresh token is expired
      if (isTokenExpired(refreshToken)) {
        performLogout('Refresh token expired');
        return Promise.reject(error);
      }

      try {
        // Try to refresh the token
        const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
          refreshToken: refreshToken
        });

        const { accessToken } = response.data;
        
        // Save new token
        localStorage.setItem('accessToken', accessToken);
        
        // Update the failed request with new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        
        // Process queued requests
        processQueue(null, accessToken);
        isRefreshing = false;
        
        // Retry original request
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user immediately
        console.error('Token refresh failed:', refreshError);
        processQueue(refreshError, null);
        isRefreshing = false;
        
        performLogout('Session expired - refresh failed');
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
export { API_BASE_URL };
