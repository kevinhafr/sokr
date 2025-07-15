import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { RootStackParamList } from './types';
import { useAuth } from '../contexts/AuthContext';
import { navigationTheme, screenTransitions, defaultScreenOptions } from './transitions/NavigatorConfig';
import { GameTheme } from '../styles';
import AuthNavigator from './AuthNavigator';
import MainTabNavigator from './MainTabNavigator';
import GameScreenWrapper from '../screens/GameScreenWrapper';
import MatchmakingScreen from '../screens/MatchmakingScreen';
import CoinTossScreen from '../screens/CoinTossScreen';
import DeckBuilderScreen from '../screens/DeckBuilderScreen';
import DeckSelectionScreen from '../screens/DeckSelectionScreen';

const Stack = createStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { userId, isLoading } = useAuth();

  console.log('RootNavigator - Auth state:', { userId, isLoading });

  if (isLoading) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator screenOptions={defaultScreenOptions}>
        {!userId ? (
          <Stack.Screen 
            name="Auth" 
            component={AuthNavigator}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen 
              name="Main" 
              component={MainTabNavigator}
              options={{ headerShown: false }}
            />
            <Stack.Screen 
              name="Matchmaking" 
              component={MatchmakingScreen}
              options={{
                ...screenTransitions.Matchmaking,
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen 
              name="Game" 
              component={GameScreenWrapper}
              options={{
                ...screenTransitions.Game,
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen 
              name="CoinToss" 
              component={CoinTossScreen}
              options={{
                ...screenTransitions.CoinToss,
                headerShown: false,
                gestureEnabled: false,
              }}
            />
            <Stack.Screen 
              name="DeckBuilder" 
              component={DeckBuilderScreen}
              options={{
                ...screenTransitions.DeckBuilder,
                headerShown: true,
                title: 'Créer un deck',
                headerStyle: {
                  backgroundColor: GameTheme.colors.surface,
                  elevation: 0,
                  shadowOpacity: 0,
                  borderBottomWidth: 1,
                  borderBottomColor: GameTheme.colors.border,
                },
                headerTintColor: GameTheme.colors.text,
                headerTitleStyle: GameTheme.typography.header.h3,
              }}
            />
            <Stack.Screen 
              name="DeckSelection" 
              component={DeckSelectionScreen}
              options={{
                headerShown: true,
                title: 'Choisir un deck',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}