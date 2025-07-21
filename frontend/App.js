import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { Provider as StoreProvider } from 'react-redux';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import store from './src/redux/store';
import { theme } from './src/utils/theme';

export default function App() {
  return (
    <StoreProvider store={store}>
      <PaperProvider theme={theme}>
        <SafeAreaProvider>
          <NavigationContainer>
            <StatusBar barStyle="dark-content" />
            <AppNavigator />
          </NavigationContainer>
        </SafeAreaProvider>
      </PaperProvider>
    </StoreProvider>
  );
}