import { menuAPI } from '../../services/api';
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

// Fetch menu items for a food stall
export const fetchMenuItems = (stallId, category = null) => async (dispatch) => {
  try {
    dispatch({ type: MENU_ITEMS_REQUEST });
    
    let response;
    if (category) {
      response = await menuAPI.getMenuItemsByCategory(stallId, category);
    } else {
      response = await menuAPI.getMenuItems(stallId);
    }
    
    dispatch({
      type: MENU_ITEMS_SUCCESS,
      payload: response.data
    });
  } catch (error) {
    dispatch({
      type: MENU_ITEMS_FAILURE,
      payload: error.response && error.response.data.detail
        ? error.response.data.detail
        : error.message
    });
  }
};

// Create a new menu item
export const createMenuItem = (stallId, formData, onSuccess) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_MENU_ITEM_REQUEST });
    
    const response = await menuAPI.createMenuItem(stallId, formData);
    
    dispatch({
      type: CREATE_MENU_ITEM_SUCCESS,
      payload: response.data
    });
    
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({
      type: CREATE_MENU_ITEM_FAILURE,
      payload: error.response && error.response.data.detail
        ? error.response.data.detail
        : error.message
    });
  }
};

// Update a menu item
export const updateMenuItem = (itemId, formData, onSuccess) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_MENU_ITEM_REQUEST });
    
    const response = await menuAPI.updateMenuItem(itemId, formData);
    
    dispatch({
      type: UPDATE_MENU_ITEM_SUCCESS,
      payload: response.data
    });
    
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({
      type: UPDATE_MENU_ITEM_FAILURE,
      payload: error.response && error.response.data.detail
        ? error.response.data.detail
        : error.message
    });
  }
};

// Delete a menu item
export const deleteMenuItem = (itemId, onSuccess) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_MENU_ITEM_REQUEST });
    
    await menuAPI.deleteMenuItem(itemId);
    
    dispatch({
      type: DELETE_MENU_ITEM_SUCCESS,
      payload: itemId
    });
    
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({
      type: DELETE_MENU_ITEM_FAILURE,
      payload: error.response && error.response.data.detail
        ? error.response.data.detail
        : error.message
    });
  }
};

// Delete a category and all its menu items
export const deleteCategory = (stallId, category, onSuccess) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_CATEGORY_REQUEST });
    
    await menuAPI.deleteCategory(stallId, category);
    
    dispatch({
      type: DELETE_CATEGORY_SUCCESS,
      payload: { stallId, category }
    });
    
    if (onSuccess) onSuccess();
  } catch (error) {
    dispatch({
      type: DELETE_CATEGORY_FAILURE,
      payload: error.response && error.response.data.detail
        ? error.response.data.detail
        : error.message
    });
  }
};