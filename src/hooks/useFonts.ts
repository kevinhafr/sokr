import { useFonts as useExpoFonts } from 'expo-font';

export function useFonts() {
  const [fontsLoaded] = useExpoFonts({
    'Geist': require('@/assets/fonts/Geist-Regular.ttf'),
    'BebasNeue': require('@/assets/fonts/BebasNeue-Regular.ttf'),
  });

  return fontsLoaded;
}