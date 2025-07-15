import { StyleSheet } from 'react-native';
import { GameTheme } from '../styles/gameTheme';

// Hook simplifié pour les styles
export function useStyles<T extends StyleSheet.NamedStyles<T>>(
  createStyles: (theme: typeof GameTheme) => T
): T {
  return StyleSheet.create(createStyles(GameTheme));
}