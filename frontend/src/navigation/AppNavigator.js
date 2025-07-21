import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { Ionicons } from '@expo/vector-icons';

// Auth Screens
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';

// Customer Screens
import HomeScreen from '../screens/customer/HomeScreen';
import FoodStallDetailScreen from '../screens/customer/FoodStallDetailScreen';
import ReviewScreen from '../screens/customer/ReviewScreen';
import ProfileScreen from '../screens/customer/ProfileScreen';
import MapScreen from '../screens/customer/MapScreen';

// Owner Screens
import MyStallsScreen from '../screens/owner/MyStallsScreen';
import AddEditStallScreen from '../screens/owner/AddEditStallScreen';
import ManageMenuScreen from '../screens/owner/ManageMenuScreen';
import AddEditMenuItemScreen from '../screens/owner/AddEditMenuItemScreen';
import OwnerProfileScreen from '../screens/owner/OwnerProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Customer Tab Navigator
const CustomerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Map') {
            iconName = focused ? 'map' : 'map-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: '#FF6B6B',
        inactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

// Owner Tab Navigator
const OwnerTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === 'My Stalls') {
            iconName = focused ? 'restaurant' : 'restaurant-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
      tabBarOptions={{
        activeTintColor: '#4ECDC4',
        inactiveTintColor: 'gray',
      }}
    >
      <Tab.Screen name="My Stalls" component={MyStallsScreen} />
      <Tab.Screen name="Profile" component={OwnerProfileScreen} />
    </Tab.Navigator>
  );
};

// Main App Navigator
const AppNavigator = () => {
  const { isLoggedIn, userType } = useSelector(state => state.auth);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {!isLoggedIn ? (
        // Auth Stack
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : userType === 'customer' ? (
        // Customer Stack
        <>
          <Stack.Screen name="CustomerTabs" component={CustomerTabNavigator} />
          <Stack.Screen 
            name="FoodStallDetail" 
            component={FoodStallDetailScreen} 
            options={{ headerShown: true, title: "Food Stall" }}
          />
          <Stack.Screen 
            name="Review" 
            component={ReviewScreen} 
            options={{ headerShown: true, title: "Write a Review" }}
          />
        </>
      ) : (
        // Owner Stack
        <>
          <Stack.Screen name="OwnerTabs" component={OwnerTabNavigator} />
          <Stack.Screen 
            name="AddEditStall" 
            component={AddEditStallScreen} 
            options={({ route }) => ({ 
              headerShown: true, 
              title: route.params?.stall ? "Edit Food Stall" : "Add Food Stall" 
            })}
          />
          <Stack.Screen 
            name="ManageMenu" 
            component={ManageMenuScreen} 
            options={{ headerShown: true, title: "Manage Menu" }}
          />
          <Stack.Screen 
            name="AddEditMenuItem" 
            component={AddEditMenuItemScreen} 
            options={({ route }) => ({ 
              headerShown: true, 
              title: route.params?.item ? "Edit Menu Item" : "Add Menu Item" 
            })}
          />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;