import React from 'react';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

export type IconName = 
  | 'home' 
  | 'cards' 
  | 'shop' 
  | 'profile'
  | 'trophy'
  | 'lightning'
  | 'target'
  | 'settings'
  | 'help'
  | 'logout'
  | 'ball'
  | 'whistle'
  | 'timer'
  | 'dice'
  | 'goal'
  | 'player'
  | 'star'
  | 'lock'
  | 'crown'
  | 'plus'
  | 'check';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

export const Icon: React.FC<IconProps> = ({ name, size = 24, color = '#000000' }) => {
  const icons: Record<IconName, JSX.Element> = {
    home: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
    ),
    cards: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="4" y="4" width="10" height="14" rx="2" stroke={color} strokeWidth="2"/>
        <Rect x="10" y="7" width="10" height="14" rx="2" fill={color} fillOpacity="0.2" stroke={color} strokeWidth="2"/>
      </Svg>
    ),
    shop: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M3 9H21L19 21H5L3 9Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M3 9L4 3H20L21 9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M8 9V6C8 4.89543 8.89543 4 10 4H14C15.1046 4 16 4.89543 16 6V9" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
    ),
    profile: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth="2"/>
        <Path d="M6 21V19C6 16.7909 7.79086 15 10 15H14C16.2091 15 18 16.7909 18 19V21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </Svg>
    ),
    trophy: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M7 4V13C7 15.2091 8.79086 17 11 17H13C15.2091 17 17 15.2091 17 13V4" stroke={color} strokeWidth="2"/>
        <Path d="M4 4H7V8C7 9.10457 6.10457 10 5 10H4V4Z" stroke={color} strokeWidth="2"/>
        <Path d="M17 4H20V10H19C17.8954 10 17 9.10457 17 8V4Z" stroke={color} strokeWidth="2"/>
        <Path d="M12 17V21" stroke={color} strokeWidth="2"/>
        <Path d="M8 21H16" stroke={color} strokeWidth="2"/>
      </Svg>
    ),
    lightning: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M13 2L3 14H12L11 22L21 10H12L13 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
    ),
    target: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
        <Circle cx="12" cy="12" r="6" stroke={color} strokeWidth="2"/>
        <Circle cx="12" cy="12" r="2" fill={color}/>
      </Svg>
    ),
    settings: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2"/>
        <Path d="M12 1V6M12 18V23M4.22 4.22L7.76 7.76M16.24 16.24L19.78 19.78M1 12H6M18 12H23M4.22 19.78L7.76 16.24M16.24 7.76L19.78 4.22" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </Svg>
    ),
    help: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
        <Path d="M9 9C9 7.34315 10.3431 6 12 6C13.6569 6 15 7.34315 15 9C15 10.6569 13.6569 12 12 12V14" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <Circle cx="12" cy="18" r="1" fill={color}/>
      </Svg>
    ),
    logout: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M15 3H19C20.1046 3 21 3.89543 21 5V19C21 20.1046 20.1046 21 19 21H15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <Path d="M10 17L15 12L10 7" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <Path d="M15 12H3" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </Svg>
    ),
    ball: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="2"/>
        <Path d="M12 2L12 22" stroke={color} strokeWidth="2"/>
        <Path d="M2 12H22" stroke={color} strokeWidth="2"/>
        <Path d="M6.34 6.34L17.66 17.66" stroke={color} strokeWidth="2"/>
        <Path d="M17.66 6.34L6.34 17.66" stroke={color} strokeWidth="2"/>
      </Svg>
    ),
    whistle: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="10" width="10" height="8" rx="4" stroke={color} strokeWidth="2"/>
        <Path d="M13 14H20L21 10H13" stroke={color} strokeWidth="2"/>
        <Circle cx="8" cy="14" r="1" fill={color}/>
      </Svg>
    ),
    timer: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="13" r="9" stroke={color} strokeWidth="2"/>
        <Path d="M12 4V8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <Path d="M12 13L16 17" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <Path d="M9 2H15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </Svg>
    ),
    dice: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="4" y="4" width="16" height="16" rx="2" stroke={color} strokeWidth="2"/>
        <Circle cx="8" cy="8" r="1.5" fill={color}/>
        <Circle cx="16" cy="8" r="1.5" fill={color}/>
        <Circle cx="8" cy="16" r="1.5" fill={color}/>
        <Circle cx="16" cy="16" r="1.5" fill={color}/>
        <Circle cx="12" cy="12" r="1.5" fill={color}/>
      </Svg>
    ),
    goal: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="3" y="7" width="18" height="12" stroke={color} strokeWidth="2"/>
        <Path d="M3 7L12 3L21 7" stroke={color} strokeWidth="2"/>
        <Line x1="12" y1="3" x2="12" y2="7" stroke={color} strokeWidth="2"/>
      </Svg>
    ),
    player: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Circle cx="12" cy="5" r="2" stroke={color} strokeWidth="2"/>
        <Path d="M8 15L10 9H14L16 15" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <Path d="M10 9V21M14 9V21" stroke={color} strokeWidth="2" strokeLinecap="round"/>
        <Path d="M7 11H17" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </Svg>
    ),
    star: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 2L15 9L22 10L17 15L18 22L12 19L6 22L7 15L2 10L9 9L12 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
    ),
    lock: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Rect x="5" y="11" width="14" height="10" rx="2" stroke={color} strokeWidth="2"/>
        <Path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke={color} strokeWidth="2"/>
        <Circle cx="12" cy="16" r="1" fill={color}/>
      </Svg>
    ),
    crown: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M5 21L7 13L2 8L7 9L12 3L17 9L22 8L17 13L19 21H5Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
    ),
    plus: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M12 5V19M5 12H19" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
    ),
    check: (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <Path d="M20 6L9 17L4 12" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </Svg>
    ),
  };

  return icons[name] || icons.home;
};