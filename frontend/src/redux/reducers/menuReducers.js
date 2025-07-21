import {
  MENU_ITEMS_REQUEST,
  MENU_ITEMS_SUCCESS,
  MENU_ITEMS_FAILURE,
  CREATE_MENU_ITEM_REQUEST,
  CREATE_MENU_ITEM_SUCCESS,
  CREATE_MENU_ITEM_FAILURE,
  UPDATE_MENU_ITEM_REQUEST,
  UPDATE_MENU_ITEM_SUCCESS,
  UPDATE_MENU_ITEM_FAILURE,
  DELETE_MENU_ITEM_REQUEST,
  DELETE_MENU_ITEM_SUCCESS,
  DELETE_MENU_ITEM_FAILURE,
  DELETE_CATEGORY_REQUEST,
  DELETE_CATEGORY_SUCCESS,
  DELETE_CATEGORY_FAILURE
} from '../constants/menuConstants';

export const menuReducer = (state = { menuItems: [], loading: false }, action) => {
  switch (action.type) {
    case MENU_ITEMS_REQUEST:
    case CREATE_MENU_ITEM_REQUEST:
    case UPDATE_MENU_ITEM_REQUEST:
    case DELETE_MENU_ITEM_REQUEST:
    case DELETE_CATEGORY_REQUEST:
      return { ...state, loading: true };
      
    case MENU_ITEMS_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        menuItems: action.payload,
        error: null
      };
      
    case CREATE_MENU_ITEM_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        menuItems: [...state.menuItems, action.payload],
        error: null
      };
      
    case UPDATE_MENU_ITEM_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        menuItems: state.menuItems.map(item => 
          item.id === action.payload.id ? action.payload : item
        ),
        error: null
      };
      
    case DELETE_MENU_ITEM_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        menuItems: state.menuItems.filter(item => item.id !== action.payload),
        error: null
      };
      
    case DELETE_CATEGORY_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        menuItems: state.menuItems.filter(item => 
          !(item.food_stall_id === action.payload.stallId && 
            item.category === action.payload.category)
        ),
        error: null
      };
      
    case MENU_ITEMS_FAILURE:
    case CREATE_MENU_ITEM_FAILURE:
    case UPDATE_MENU_ITEM_FAILURE:
    case DELETE_MENU_ITEM_FAILURE:
    case DELETE_CATEGORY_FAILURE:
      return { 
        ...state, 
        loading: false, 
        error: action.payload 
      };
      
    default:
      return state;
  }
};