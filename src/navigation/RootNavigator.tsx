import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { useAuth } from '../contexts/AuthContext';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import GameScreenWrapper from '../screens/GameScreenWrapper';
import MatchmakingScreen from '../screens/MatchmakingScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { userId, isLoading } = useAuth();

  console.log('RootNavigator - Auth state:', { userId, isLoading });

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!userId ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen 
              name="Matchmaking" 
              component={MatchmakingScreen}
              options={{
                gestureEnabled: false,
                animationEnabled: true,
              }}
            />
            <Stack.Screen 
              name="Game" 
              component={GameScreenWrapper}
              options={{
                gestureEnabled: false,
                animationEnabled: true,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}