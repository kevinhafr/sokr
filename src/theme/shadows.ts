import { Platform } from 'react-native';

export const shadows = {
  xs: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    android: {
      elevation: 2,
    },
    web: {
      boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.09)',
    },
  }),
  
  sm: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 3,
    },
    android: {
      elevation: 4,
    },
    web: {
      boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.18), 0px 1px 2px -1px rgba(0, 0, 0, 0.18)',
    },
  }),
  
  md: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
    },
    android: {
      elevation: 6,
    },
    web: {
      boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.18), 0px 2px 4px -1px rgba(0, 0, 0, 0.18)',
    },
  }),
  
  lg: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
    },
    android: {
      elevation: 8,
    },
    web: {
      boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.18), 0px 4px 6px -1px rgba(0, 0, 0, 0.18)',
    },
  }),
  
  xl: Platform.select({
    ios: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 10,
    },
    android: {
      elevation: 12,
    },
    web: {
      boxShadow: '0px 1px 2px 0px rgba(0, 0, 0, 0.18), 0px 8px 10px -1px rgba(0, 0, 0, 0.18)',
    },
  }),
} as const;