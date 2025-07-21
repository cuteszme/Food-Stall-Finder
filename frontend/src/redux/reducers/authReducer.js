import {
  USER_LOGIN_REQUEST,
  USER_LOGIN_SUCCESS,
  USER_LOGIN_FAILURE,
  USER_REGISTER_REQUEST,
  USER_REGISTER_SUCCESS,
  USER_REGISTER_FAILURE,
  USER_LOGOUT
} from '../constants/authConstants';

export const authReducer = (state = { loading: false, userInfo: null, isLoggedIn: false }, action) => {
  switch (action.type) {
    case USER_LOGIN_REQUEST:
    case USER_REGISTER_REQUEST:
      return { ...state, loading: true };
      
    case USER_LOGIN_SUCCESS:
    case USER_REGISTER_SUCCESS:
      return {
        ...state,
        loading: false,
        userInfo: action.payload,
        isLoggedIn: true,
        userType: action.payload.user_type,
        error: null
      };
      
    case USER_LOGIN_FAILURE:
    case USER_REGISTER_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
      
    case USER_LOGOUT:
      return {
        ...state,
        userInfo: null,
        isLoggedIn: false,
        userType: null
      };
      
    default:
      return state;
  }
};