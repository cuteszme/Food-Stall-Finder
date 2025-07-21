import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

// Import reducers
import { authReducer } from './reducers/authReducers';
import { foodStallsReducer, foodStallDetailsReducer } from './reducers/foodStallReducers';
import { menuReducer } from './reducers/menuReducers';
import { reviewsReducer } from './reducers/reviewReducers';

const reducer = combineReducers({
  auth: authReducer,
  foodStalls: foodStallsReducer,
  foodStallDetails: foodStallDetailsReducer,
  menu: menuReducer,
  reviews: reviewsReducer,
});

// Get user info from local storage if available
const userInfoFromStorage = async () => {
  try {
    const jsonValue = await AsyncStorage.getItem('userInfo');
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (e) {
    console.log('Error reading user info from storage:', e);
    return null;
  }
};

const initialState = {
  auth: {
    userInfo: userInfoFromStorage(),
    isLoggedIn: !!userInfoFromStorage(),
    userType: userInfoFromStorage()?.user_type || null,
  },
};

const middleware = [thunk];

const store = createStore(
  reducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default store;