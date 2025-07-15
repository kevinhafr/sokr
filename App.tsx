import './src/utils/polyfills'; // Import polyfills first
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppProvider } from './src/contexts/AppProvider';
import RootNavigator from './src/navigation/RootNavigator';
import { useTheme } from './src/contexts/ThemeContext';
import { useFonts } from './src/hooks/useFonts';
import { useAuthDeepLink } from './src/hooks/useAuthDeepLink';

function AppContent() {
  const { colors, isDark } = useTheme();
  const fontsLoaded = useFonts();
  useAuthDeepLink(); // Handle magic link authentication
  
  if (!fontsLoaded) {
    return (
      <View style={[styles.container, styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <RootNavigator />
    </View>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});