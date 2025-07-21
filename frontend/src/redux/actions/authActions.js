import { authAPI } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAILURE,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAILURE,
  USER_LOGOUT
} from '../constants/authConstants';

// User login
export const login = (email, password) => async (dispatch) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST });
    
    const response = await authAPI.login(email, password);
    const userData = response.data;
    
    // Save user info to AsyncStorage
    await AsyncStorage.setItem('userInfo', JSON.stringify(userData));
    
    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: userData
    });
  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAILURE,
      payload: error.response && error.response.data.detail
        ? error.response.data.detail
        : error.message
    });
  }
};

// User registration
export const register = (userData) => async (dispatch) => {
  try {
    dispatch({ type: USER_REGISTER_REQUEST });
    
    const response = await authAPI.register(userData);
    const registeredUserData = response.data;
    
    // Save user info to AsyncStorage
    await AsyncStorage.setItem('userInfo', JSON.stringify(registeredUserData));
    
    dispatch({
      type: USER_REGISTER_SUCCESS,
      payload: registeredUserData
    });
  } catch (error) {
    dispatch({
      type: USER_REGISTER_FAILURE,
      payload: error.response && error.response.data.detail
        ? error.response.data.detail
        : error.message
    });
  }
};

// Update user profile
export const updateUserProfile = (userData, onSuccess) => async (dispatch, getState) => {
  try {
    dispatch({ type: USER_LOGIN_REQUEST });
    
    const { auth: { userInfo } } = getState();
    
    const response = await userAPI.updateProfile(userData);
    const updatedUserData = {
      ...userInfo,
      ...response.data
    };
    
    // Save updated user info to AsyncStorage
    await AsyncStorage.setItem('userInfo', JSON.stringify(updatedUserData));
    
    dispatch({
      type: USER_LOGIN_SUCCESS,
      payload: updatedUserData
    });
    
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({
      type: USER_LOGIN_FAILURE,
      payload: error.response && error.response.data.detail
        ? error.response.data.detail
        : error.message
    });
  }
};

// User logout
export const logout = () => async (dispatch) => {
  await authAPI.logout();
  await AsyncStorage.removeItem('userInfo');
  
  dispatch({ type: USER_LOGOUT });
};