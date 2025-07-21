import { foodStallAPI } from '../../services/api';
import {
  FOOD_STALLS_REQUEST,
  FOOD_STALLS_SUCCESS,
  FOOD_STALLS_FAILURE,
  FOOD_STALL_DETAILS_REQUEST,
  FOOD_STALL_DETAILS_SUCCESS,
  FOOD_STALL_DETAILS_FAILURE,
  CREATE_FOOD_STALL_REQUEST,
  CREATE_FOOD_STALL_SUCCESS,
  CREATE_FOOD_STALL_FAILURE,
  UPDATE_FOOD_STALL_REQUEST,
  UPDATE_FOOD_STALL_SUCCESS,
  UPDATE_FOOD_STALL_FAILURE,
  DELETE_FOOD_STALL_REQUEST,
  DELETE_FOOD_STALL_SUCCESS,
  DELETE_FOOD_STALL_FAILURE
} from '../constants/foodStallConstants';

// Fetch all food stalls (with optional location filter)
export const fetchFoodStalls = (locationParams = null) => async (dispatch) => {
  try {
    dispatch({ type: FOOD_STALLS_REQUEST });
    
    let response;
    if (locationParams) {
      const { latitude, longitude, radius } = locationParams;
      response = await foodStallAPI.getFoodStallsByLocation(latitude, longitude, radius);
    } else {
      response = await foodStallAPI.getAllFoodStalls();
    }
    
    dispatch({
      type: FOOD_STALLS_SUCCESS,
      payload: response.data
    });
  } catch (error) {
    dispatch({
      type: FOOD_STALLS_FAILURE,
      payload: error.response && error.response.data.detail
        ? error.response.data.detail
        : error.message
    });
  }
};

// Fetch food stall details
export const fetchFoodStallDetails = (stallId) => async (dispatch) => {
  try {
    dispatch({ type: FOOD_STALL_DETAILS_REQUEST });
    
    const response = await foodStallAPI.getFoodStallById(stallId);
    
    dispatch({
      type: FOOD_STALL_DETAILS_SUCCESS,
      payload: response.data
    });
  } catch (error) {
    dispatch({
      type: FOOD_STALL_DETAILS_FAILURE,
      payload: error.response && error.response.data.detail
        ? error.response.data.detail
        : error.message
    });
  }
};

// Create a new food stall
export const createFoodStall = (formData, onSuccess) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_FOOD_STALL_REQUEST });
    
    const response = await foodStallAPI.createFoodStall(formData);
    
    dispatch({
      type: CREATE_FOOD_STALL_SUCCESS,
      payload: response.data
    });
    
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({
      type: CREATE_FOOD_STALL_FAILURE,
      payload: error.response && error.response.data.detail
        ? error.response.data.detail
        : error.message
    });
  }
};

// Update an existing food stall
export const updateFoodStall = (stallId, formData, onSuccess) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_FOOD_STALL_REQUEST });
    
    const response = await foodStallAPI.updateFoodStall(stallId, formData);
    
    dispatch({
      type: UPDATE_FOOD_STALL_SUCCESS,
      payload: response.data
    });
    
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({
      type: UPDATE_FOOD_STALL_FAILURE,
      payload: error.response && error.response.data.detail
        ? error.response.data.detail
        : error.message
    });
  }
};

// Delete a food stall
export const deleteFoodStall = (stallId, onSuccess) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_FOOD_STALL_REQUEST });
    
    await foodStallAPI.deleteFoodStall(stallId);
    
    dispatch({
      type: DELETE_FOOD_STALL_SUCCESS,
      payload: stallId
    });
    
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({
      type: DELETE_FOOD_STALL_FAILURE,
      payload: error.response && error.response.data.detail
        ? error.response.data.detail
        : error.message
    });
  }
};

// Fetch owner's food stalls
export const fetchOwnerFoodStalls = () => async (dispatch) => {
  try {
    dispatch({ type: FOOD_STALLS_REQUEST });
    
    const response = await foodStallAPI.getOwnerFoodStalls();
    
    dispatch({
      type: FOOD_STALLS_SUCCESS,
      payload: response.data
    });
  } catch (error) {
    dispatch({
      type: FOOD_STALLS_FAILURE,
      payload: error.response && error.response.data.detail
        ? error.response.data.detail
        : error.message
    });
  }
};