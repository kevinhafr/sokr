// Premium Gradients for AAA Gaming Experience
import { LinearGradient } from 'expo-linear-gradient';

export const Gradients = {
  // Background gradients
  backgroundPremium: {
    colors: ['#0A0E27', '#151A36', '#1E2444'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  backgroundDark: {
    colors: ['#000000', '#0A0E27', '#151A36'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  
  // Card gradients
  cardPremium: {
    colors: ['#1E2444', '#2A3152', '#151A36'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  cardLegendary: {
    colors: ['#FFD700', '#FFA500', '#FF8C00'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  cardEpic: {
    colors: ['#B744FF', '#8B00FF', '#6A0DAD'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  cardRare: {
    colors: ['#00B4D8', '#0077B6', '#005F8F'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  
  // Button gradients
  buttonPrimary: {
    colors: ['#00FF87', '#00CC6A', '#00A050'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  buttonPremium: {
    colors: ['#FFD700', '#FFED4E', '#FFD700'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  buttonDanger: {
    colors: ['#FF4757', '#FF3838', '#CC0000'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  
  // Special effects gradients
  glowPrimary: {
    colors: ['rgba(0, 255, 135, 0)', 'rgba(0, 255, 135, 0.5)', 'rgba(0, 255, 135, 0)'],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  glowGold: {
    colors: ['rgba(255, 215, 0, 0)', 'rgba(255, 215, 0, 0.6)', 'rgba(255, 215, 0, 0)'],
    start: { x: 0, y: 0.5 },
    end: { x: 1, y: 0.5 },
  },
  
  // Overlay gradients
  overlayTop: {
    colors: ['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0)'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  overlayBottom: {
    colors: ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.8)'],
    start: { x: 0, y: 0 },
    end: { x: 0, y: 1 },
  },
  
  // Gaming specific gradients
  healthBar: {
    colors: ['#00FF00', '#00CC00', '#009900'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  energyBar: {
    colors: ['#00B4D8', '#0099FF', '#0077CC'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  experienceBar: {
    colors: ['#FFD700', '#FFA500', '#FF8C00'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 0 },
  },
  
  // Victory/Defeat gradients
  victory: {
    colors: ['#FFD700', '#00FF87', '#FFD700'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
  defeat: {
    colors: ['#FF4757', '#CC0000', '#990000'],
    start: { x: 0, y: 0 },
    end: { x: 1, y: 1 },
  },
};

// Helper function to create custom gradients
export const createGradient = (colors: string[], angle = 45) => {
  const angleRad = (angle * Math.PI) / 180;
  return {
    colors,
    start: { x: 0.5 - Math.sin(angleRad) * 0.5, y: 0.5 + Math.cos(angleRad) * 0.5 },
    end: { x: 0.5 + Math.sin(angleRad) * 0.5, y: 0.5 - Math.cos(angleRad) * 0.5 },
  };
};

// Animated gradient configurations
export const AnimatedGradients = {
  rainbow: {
    colors: ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'],
    duration: 5000,
  },
  pulse: {
    colors: ['#00FF87', '#00CC6A', '#00FF87'],
    duration: 2000,
  },
  shimmer: {
    colors: ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.3)', 'rgba(255, 255, 255, 0)'],
    duration: 1500,
  },
};