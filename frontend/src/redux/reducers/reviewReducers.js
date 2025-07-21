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

export const reviewsReducer = (state = { reviews: [], loading: false }, action) => {
  switch (action.type) {
    case REVIEWS_REQUEST:
    case CREATE_REVIEW_REQUEST:
    case UPDATE_REVIEW_REQUEST:
    case DELETE_REVIEW_REQUEST:
      return { ...state, loading: true };
      
    case REVIEWS_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        reviews: action.payload,
        error: null
      };
      
    case CREATE_REVIEW_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        reviews: [...state.reviews, action.payload],
        error: null
      };
      
    case UPDATE_REVIEW_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        reviews: state.reviews.map(review => 
          review.id === action.payload.id ? action.payload : review
        ),
        error: null
      };
      
    case DELETE_REVIEW_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        reviews: state.reviews.filter(review => review.id !== action.payload),
        error: null
      };
      
    case REVIEWS_FAILURE:
    case CREATE_REVIEW_FAILURE:
    case UPDATE_REVIEW_FAILURE:
    case DELETE_REVIEW_FAILURE:
      return { 
        ...state, 
        loading: false, 
        error: action.payload 
      };
      
    default:
      return state;
  }
};