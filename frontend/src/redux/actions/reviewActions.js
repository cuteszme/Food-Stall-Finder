import { reviewAPI } from '../../services/api';
import {
  REVIEWS_REQUEST,
  REVIEWS_SUCCESS,
  REVIEWS_FAILURE,
  CREATE_REVIEW_REQUEST,
  CREATE_REVIEW_SUCCESS,
  CREATE_REVIEW_FAILURE,
  UPDATE_REVIEW_REQUEST,
  UPDATE_REVIEW_SUCCESS,
  UPDATE_REVIEW_FAILURE,
  DELETE_REVIEW_REQUEST,
  DELETE_REVIEW_SUCCESS,
  DELETE_REVIEW_FAILURE
} from '../constants/reviewConstants';

// Fetch reviews for a food stall
export const fetchReviews = (stallId) => async (dispatch) => {
  try {
    dispatch({ type: REVIEWS_REQUEST });
    
    const response = await reviewAPI.getReviews(stallId);
    
    dispatch({
      type: REVIEWS_SUCCESS,
      payload: response.data
    });
  } catch (error) {
    dispatch({
      type: REVIEWS_FAILURE,
      payload: error.response && error.response.data.detail
        ? error.response.data.detail
        : error.message
    });
  }
};

// Create a new review
export const createReview = (stallId, reviewData, onSuccess) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_REVIEW_REQUEST });
    
    const response = await reviewAPI.createReview(stallId, reviewData);
    
    dispatch({
      type: CREATE_REVIEW_SUCCESS,
      payload: response.data
    });
    
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({
      type: CREATE_REVIEW_FAILURE,
      payload: error.response && error.response.data.detail
        ? error.response.data.detail
        : error.message
    });
  }
};

// Update a review
export const updateReview = (reviewId, reviewData, onSuccess) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_REVIEW_REQUEST });
    
    const response = await reviewAPI.updateReview(reviewId, reviewData);
    
    dispatch({
      type: UPDATE_REVIEW_SUCCESS,
      payload: response.data
    });
    
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({
      type: UPDATE_REVIEW_FAILURE,
      payload: error.response && error.response.data.detail
        ? error.response.data.detail
        : error.message
    });
  }
};

// Delete a review
export const deleteReview = (reviewId, onSuccess) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_REVIEW_REQUEST });
    
    await reviewAPI.deleteReview(reviewId);
    
    dispatch({
      type: DELETE_REVIEW_SUCCESS,
      payload: reviewId
    });
    
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({
      type: DELETE_REVIEW_FAILURE,
      payload: error.response && error.response.data.detail
        ? error.response.data.detail
        : error.message
    });
  }
};