import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add a request interceptor for handling loading states
axiosInstance.interceptors.request.use(
  (config) => {
    // You could trigger a loading state here
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle errors globally
    const errorMessage = error.response?.data?.message || 'An error occurred';
    console.error('API Error:', errorMessage);
    
    // Handle unauthorized errors (401)
    if (error.response?.status === 401) {
      // Redirect to login or handle token expiration
      if (typeof window !== 'undefined') {
        // Client-side only
        if (window.location.pathname.includes('/department')) {
          // window.location.href = '/department/login';
        } else {
          // window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;