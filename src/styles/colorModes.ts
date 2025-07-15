// Color Modes for Different Game States and Themes
import { CoreColors } from './constants';

export const ColorModes = {
  // Default Dark Mode (Current theme)
  dark: CoreColors,
  
  // Tournament Mode - High contrast for competitive play
  tournament: {
    ...CoreColors,
    background: '#000000',
    surface: '#0A0A0A',
    card: '#141414',
    primary: '#00FF00',
    secondary: '#FFD700',
    text: '#FFFFFF',
    textSecondary: '#E0E0E0',
    border: '#333333',
  },
  
  // Night Mode - Reduced blue light
  night: {
    ...CoreColors,
    background: '#1A0F0A',
    surface: '#2A1A15',
    card: '#3A2520',
    primary: '#FFB74D',
    secondary: '#FFA726',
    text: '#FFE0B2',
    textSecondary: '#BCAAA4',
    border: '#4A3530',
  },
  
  // Neon Mode - Cyberpunk aesthetic
  neon: {
    ...CoreColors,
    background: '#0A0014',
    surface: '#14001F',
    card: '#1F0029',
    primary: '#FF00FF',
    secondary: '#00FFFF',
    text: '#FFFFFF',
    textSecondary: '#FF00FF',
    danger: '#FF0080',
    success: '#00FF80',
    border: '#FF00FF',
    glow: '#FF00FF',
  },
  
  // Championship Mode - Gold & prestigious
  championship: {
    ...CoreColors,
    background: '#0F0A00',
    surface: '#1A1500',
    card: '#252000',
    primary: '#FFD700',
    secondary: '#FFA500',
    text: '#FFFFFF',
    textSecondary: '#FFD700',
    border: '#665500',
    rarityLegendary: '#FFFFFF',
  },
  
  // Ice Mode - Cool blue theme
  ice: {
    ...CoreColors,
    background: '#001A33',
    surface: '#002244',
    card: '#003366',
    primary: '#00D4FF',
    secondary: '#66E0FF',
    text: '#E6F7FF',
    textSecondary: '#B3E5FF',
    border: '#0066AA',
    glow: '#00D4FF',
  },
  
  // Fire Mode - Intense red/orange theme
  fire: {
    ...CoreColors,
    background: '#1A0000',
    surface: '#330000',
    card: '#4D0000',
    primary: '#FF4500',
    secondary: '#FF6347',
    text: '#FFFFFF',
    textSecondary: '#FFB3B3',
    danger: '#FF0000',
    border: '#660000',
    glow: '#FF4500',
  },
};

// Special event color schemes
export const EventThemes = {
  christmas: {
    primary: '#FF0000',
    secondary: '#00FF00',
    accent: '#FFFFFF',
    background: '#0F1F0F',
  },
  halloween: {
    primary: '#FF6600',
    secondary: '#9D00FF',
    accent: '#000000',
    background: '#1A0A00',
  },
  worldCup: {
    primary: '#FFD700',
    secondary: '#C0C0C0',
    accent: '#CD7F32',
    background: '#001A00',
  },
  easter: {
    primary: '#FFB3E6',
    secondary: '#B3E6FF',
    accent: '#FFFFB3',
    background: '#1A1A0F',
  },
};

// Team color schemes (for club-specific themes)
export const TeamColors = {
  psg: {
    primary: '#004170',
    secondary: '#ED2939',
    accent: '#FFFFFF',
  },
  realMadrid: {
    primary: '#FFFFFF',
    secondary: '#FEBE10',
    accent: '#00529F',
  },
  barcelona: {
    primary: '#A50044',
    secondary: '#004D98',
    accent: '#FFED02',
  },
  bayern: {
    primary: '#DC052D',
    secondary: '#FFFFFF',
    accent: '#0066B2',
  },
  liverpool: {
    primary: '#C8102E',
    secondary: '#00B2A9',
    accent: '#F6EB61',
  },
  juventus: {
    primary: '#000000',
    secondary: '#FFFFFF',
    accent: '#FCDD09',
  },
};

// Helper function to apply color mode
export const applyColorMode = (mode: keyof typeof ColorModes) => {
  return ColorModes[mode] || ColorModes.dark;
};

// Helper function to blend team colors with game theme
export const createTeamTheme = (teamKey: keyof typeof TeamColors) => {
  const team = TeamColors[teamKey];
  return {
    ...CoreColors,
    primary: team.primary,
    secondary: team.secondary,
    accent: team.accent,
    primaryLight: team.primary + '80',
    primaryDark: team.primary + 'CC',
  };
};