import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Base URL for API
// const API_URL = 'https://api.foodstallfinder.com';  // Change to your actual API URL

// For local development with Expo
const API_URL = 'http://192.168.56.1:8000';  // Replace with your local IP

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization header with JWT token
api.interceptors.request.use(
  async (config) => {
    const userInfo = await AsyncStorage.getItem('userInfo');
    if (userInfo) {
      const { access_token } = JSON.parse(userInfo);
      if (access_token) {
        config.headers.Authorization = `Bearer ${access_token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    return api.post('/auth/login', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  register: (userData) => {
    return api.post('/auth/register', userData);
  },
  
  logout: async () => {
    await AsyncStorage.removeItem('userInfo');
  },
};

// User API
export const userAPI = {
  getProfile: () => {
    return api.get('/users/me');
  },
  
  updateProfile: (userData) => {
    return api.put('/users/me', userData);
  }
};

// Food Stall API
export const foodStallAPI = {
  getAllFoodStalls: () => {
    return api.get('/foodstalls/');
  },
  
  getFoodStallsByLocation: (latitude, longitude, radius) => {
    return api.get(`/foodstalls/?latitude=${latitude}&longitude=${longitude}&radius=${radius}`);
  },
  
  getFoodStallById: (stallId) => {
    return api.get(`/foodstalls/${stallId}`);
  },
  
  getOwnerFoodStalls: () => {
    return api.get('/foodstalls/owner');
  },
  
  createFoodStall: (formData) => {
    return api.post('/foodstalls/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  updateFoodStall: (stallId, formData) => {
    return api.put(`/foodstalls/${stallId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  deleteFoodStall: (stallId) => {
    return api.delete(`/foodstalls/${stallId}`);
  },
};

// Menu API
export const menuAPI = {
  getMenuItems: (stallId) => {
    return api.get(`/menus/items/${stallId}`);
  },
  
  getMenuItemsByCategory: (stallId, category) => {
    return api.get(`/menus/items/${stallId}?category=${category}`);
  },
  
  createMenuItem: (stallId, formData) => {
    return api.post(`/menus/items/${stallId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  updateMenuItem: (itemId, formData) => {
    return api.put(`/menus/items/${itemId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  deleteMenuItem: (itemId) => {
    return api.delete(`/menus/items/${itemId}`);
  },
  
  deleteCategory: (stallId, category) => {
    return api.delete(`/menus/categories/${stallId}/${category}`);
  },
};

// Reviews API
export const reviewAPI = {
  getReviews: (stallId) => {
    return api.get(`/reviews/${stallId}`);
  },
  
  createReview: (stallId, reviewData) => {
    return api.post(`/reviews/${stallId}`, reviewData);
  },
  
  updateReview: (reviewId, reviewData) => {
    return api.put(`/reviews/${reviewId}`, reviewData);
  },
  
  deleteReview: (reviewId) => {
    return api.delete(`/reviews/${reviewId}`);
  },
};

export default api;