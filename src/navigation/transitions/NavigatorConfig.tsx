// Navigation configuration with custom transitions
import React from 'react';
import { createStackNavigator, StackNavigationOptions } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { GameTheme } from '@/styles';
import { applyTransition, ScreenTransitions } from '@/styles/transitions';
import { AnimationDurations, AnimationEasings } from '@/styles/constants';
import { Platform } from 'react-native';

// Default navigation options with transitions
export const defaultScreenOptions: StackNavigationOptions = {
  ...applyTransition('default'),
  headerStyle: {
    backgroundColor: GameTheme.colors.surface,
    elevation: 0,
    shadowOpacity: 0,
    borderBottomWidth: 1,
    borderBottomColor: GameTheme.colors.border,
  },
  headerTintColor: GameTheme.colors.text,
  headerTitleStyle: {
    ...GameTheme.typography.header.h3,
  },
  headerBackTitleVisible: false,
};

// Screen-specific transition configurations
export const screenTransitions = {
  // Auth screens
  Login: applyTransition('modal'),
  Register: applyTransition('modal'),
  ForgotPassword: applyTransition('modal'),
  
  // Main game screens
  Home: applyTransition('default'),
  Game: applyTransition('game'),
  Matchmaking: applyTransition('portal'),
  
  // Result screens
  Victory: applyTransition('victory'),
  Defeat: applyTransition('victory'),
  
  // Collection screens
  Decks: applyTransition('default'),
  DeckBuilder: applyTransition('modal'),
  CardDetail: {
    ...applyTransition('default'),
    // Enable shared element transition
    sharedElements: (route: any) => {
      const { cardId } = route.params;
      return [`card.${cardId}`];
    },
  },
  
  // Settings and menus
  Settings: applyTransition('menu'),
  Profile: applyTransition('menu'),
  
  // Special effects
  CoinToss: applyTransition('glitch'),
  PackOpening: applyTransition('portal'),
};

// Navigation theme configuration
export const navigationTheme = {
  dark: true,
  colors: {
    primary: GameTheme.colors.primary,
    background: GameTheme.colors.background,
    card: GameTheme.colors.card,
    text: GameTheme.colors.text,
    border: GameTheme.colors.border,
    notification: GameTheme.colors.danger,
  },
};

// Custom transition examples for specific flows
export const customTransitionFlows = {
  // Match flow: Matchmaking -> CoinToss -> Game
  matchFlow: {
    Matchmaking: {
      ...applyTransition('portal'),
      transitionSpec: {
        open: {
          animation: 'timing',
          config: {
            duration: AnimationDurations.slow,
            easing: AnimationEasings.anticipate,
          },
        },
        close: ScreenTransitions.portal.transitionSpec.close,
      },
    },
    CoinToss: {
      ...applyTransition('glitch'),
      cardStyleInterpolator: ({ current, layouts }: any) => {
        return {
          cardStyle: {
            opacity: current.progress.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 0.2, 1],
            }),
            transform: [
              {
                rotateZ: current.progress.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: ['0deg', '180deg', '360deg'],
                }),
              },
            ],
          },
        };
      },
    },
    Game: {
      ...applyTransition('game'),
      gestureEnabled: false, // Disable swipe back during game
    },
  },
  
  // Pack opening flow
  packOpeningFlow: {
    Store: applyTransition('default'),
    PackSelection: {
      ...applyTransition('scale'),
      cardStyleInterpolator: ({ current }: any) => {
        return {
          cardStyle: {
            opacity: current.progress,
            transform: [
              {
                scale: current.progress.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1.2, 0.8, 1],
                }),
              },
            ],
          },
        };
      },
    },
    PackOpening: {
      ...applyTransition('portal'),
      presentation: 'transparentModal',
      cardOverlayEnabled: false,
    },
  },
};

// Platform-specific adjustments
export const getPlatformTransitions = () => {
  if (Platform.OS === 'ios') {
    return {
      ...defaultScreenOptions,
      gestureEnabled: true,
      gestureResponseDistance: {
        horizontal: 30,
        vertical: 80,
      },
    };
  } else {
    return {
      ...defaultScreenOptions,
      // Android-specific transitions
      ...ScreenTransitions.default,
      transitionSpec: {
        open: {
          animation: 'timing',
          config: {
            duration: AnimationDurations.fast,
          },
        },
        close: {
          animation: 'timing',
          config: {
            duration: AnimationDurations.fast,
          },
        },
      },
    };
  }
};

// Helper function to create navigator with transitions
export function createTransitionNavigator<T extends {}>(
  screens: T,
  customOptions?: StackNavigationOptions
) {
  const Stack = createStackNavigator();
  
  return (
    <Stack.Navigator
      screenOptions={{
        ...getPlatformTransitions(),
        ...customOptions,
      }}
    >
      {Object.entries(screens).map(([name, component]) => (
        <Stack.Screen
          key={name}
          name={name}
          component={component as any}
          options={screenTransitions[name as keyof typeof screenTransitions] || {}}
        />
      ))}
    </Stack.Navigator>
  );
}