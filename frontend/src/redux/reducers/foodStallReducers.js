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

// Food stalls list reducer
export const foodStallsReducer = (state = { foodStalls: [], loading: false }, action) => {
  switch (action.type) {
    case FOOD_STALLS_REQUEST:
    case CREATE_FOOD_STALL_REQUEST:
    case UPDATE_FOOD_STALL_REQUEST:
    case DELETE_FOOD_STALL_REQUEST:
      return { ...state, loading: true };
      
    case FOOD_STALLS_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        foodStalls: action.payload,
        error: null
      };
      
    case CREATE_FOOD_STALL_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        foodStalls: [...state.foodStalls, action.payload],
        error: null
      };
      
    case UPDATE_FOOD_STALL_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        foodStalls: state.foodStalls.map(stall => 
          stall.id === action.payload.id ? action.payload : stall
        ),
        error: null
      };
      
    case DELETE_FOOD_STALL_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        foodStalls: state.foodStalls.filter(stall => stall.id !== action.payload),
        error: null
      };
      
    case FOOD_STALLS_FAILURE:
    case CREATE_FOOD_STALL_FAILURE:
    case UPDATE_FOOD_STALL_FAILURE:
    case DELETE_FOOD_STALL_FAILURE:
      return { 
        ...state, 
        loading: false, 
        error: action.payload 
      };
      
    default:
      return state;
  }
};

// Food stall details reducer
export const foodStallDetailsReducer = (state = { foodStall: null, loading: false }, action) => {
  switch (action.type) {
    case FOOD_STALL_DETAILS_REQUEST:
      return { ...state, loading: true };
      
    case FOOD_STALL_DETAILS_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        foodStall: action.payload,
        error: null
      };
      
    case FOOD_STALL_DETAILS_FAILURE:
      return { 
        ...state, 
        loading: false, 
        error: action.payload 
      };
      
    default:
      return state;
  }
};