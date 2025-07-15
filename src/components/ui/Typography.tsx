import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';

type TypographyVariant = 
  | 'displayHero'
  | 'displayLarge'
  | 'displayMedium'
  | 'displaySmall'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'bodyLarge'
  | 'body'
  | 'bodySmall'
  | 'caption'
  | 'label'
  | 'score'
  | 'timer'
  | 'currency'
  | 'statLarge'
  | 'statMedium'
  | 'statSmall';

interface TypographyProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: string;
  shadow?: 'glow' | 'depth' | 'subtle' | 'none';
  children: React.ReactNode;
}

export function Typography({
  variant = 'body',
  color,
  shadow = 'none',
  style,
  children,
  ...props
}: TypographyProps) {
  const getVariantStyle = () => {
    switch (variant) {
      // Display variants
      case 'displayHero':
        return {
          fontFamily: 'BebasNeue',
          fontSize: 72,
          lineHeight: 72 * 1.1,
          letterSpacing: 2,
          textTransform: 'uppercase' as const,
        };
      case 'displayLarge':
        return {
          fontFamily: 'BebasNeue',
          fontSize: 56,
          lineHeight: 56 * 1.1,
          letterSpacing: 1.5,
          textTransform: 'uppercase' as const,
        };
      case 'displayMedium':
        return {
          fontFamily: 'BebasNeue',
          fontSize: 48,
          lineHeight: 48 * 1.15,
          letterSpacing: 1,
          textTransform: 'uppercase' as const,
        };
      case 'displaySmall':
        return {
          fontFamily: 'BebasNeue',
          fontSize: 36,
          lineHeight: 36 * 1.2,
          letterSpacing: 0.5,
          textTransform: 'uppercase' as const,
        };
      
      // Header variants
      case 'h1':
        return {
          fontFamily: 'BebasNeue',
          fontSize: 32,
          lineHeight: 32 * 1.2,
          letterSpacing: 0.5,
          textTransform: 'uppercase' as const,
        };
      case 'h2':
        return {
          fontFamily: 'BebasNeue',
          fontSize: 28,
          lineHeight: 28 * 1.2,
          letterSpacing: 0.5,
          textTransform: 'uppercase' as const,
        };
      case 'h3':
        return {
          fontFamily: 'BebasNeue',
          fontSize: 24,
          lineHeight: 24 * 1.2,
          letterSpacing: 0.5,
          textTransform: 'uppercase' as const,
        };
      case 'h4':
        return {
          fontFamily: 'BebasNeue',
          fontSize: 20,
          lineHeight: 20 * 1.2,
          letterSpacing: 0.5,
          textTransform: 'uppercase' as const,
        };
      
      // Body variants
      case 'bodyLarge':
        return {
          fontFamily: 'Geist',
          fontSize: 18,
          lineHeight: 18 * 1.5,
          letterSpacing: 0,
        };
      case 'body':
        return {
          fontFamily: 'Geist',
          fontSize: 16,
          lineHeight: 16 * 1.5,
          letterSpacing: 0,
        };
      case 'bodySmall':
        return {
          fontFamily: 'Geist',
          fontSize: 14,
          lineHeight: 14 * 1.5,
          letterSpacing: 0,
        };
      
      // UI variants
      case 'caption':
        return {
          fontFamily: 'Geist',
          fontSize: 12,
          lineHeight: 12 * 1.4,
          letterSpacing: 0.5,
        };
      case 'label':
        return {
          fontFamily: 'Geist',
          fontSize: 14,
          lineHeight: 14 * 1.3,
          letterSpacing: 0.5,
          textTransform: 'uppercase' as const,
        };
      
      // Gaming variants
      case 'score':
        return {
          fontFamily: 'BebasNeue',
          fontSize: 64,
          lineHeight: 64 * 1.1,
          letterSpacing: 1.5,
          textTransform: 'uppercase' as const,
        };
      case 'timer':
        return {
          fontFamily: 'BebasNeue',
          fontSize: 40,
          lineHeight: 40 * 1.1,
          letterSpacing: 1,
          textTransform: 'uppercase' as const,
        };
      case 'currency':
        return {
          fontFamily: 'BebasNeue',
          fontSize: 24,
          lineHeight: 24 * 1.1,
          letterSpacing: 0.5,
          textTransform: 'uppercase' as const,
        };
      
      // Stat variants
      case 'statLarge':
        return {
          fontFamily: 'BebasNeue',
          fontSize: 36,
          lineHeight: 36 * 1.1,
          letterSpacing: 1,
          textTransform: 'uppercase' as const,
        };
      case 'statMedium':
        return {
          fontFamily: 'BebasNeue',
          fontSize: 24,
          lineHeight: 24 * 1.1,
          letterSpacing: 0.5,
          textTransform: 'uppercase' as const,
        };
      case 'statSmall':
        return {
          fontFamily: 'BebasNeue',
          fontSize: 18,
          lineHeight: 18 * 1.1,
          letterSpacing: 0.5,
          textTransform: 'uppercase' as const,
        };
      
      default:
        return {
          fontFamily: 'Geist',
          fontSize: 16,
          lineHeight: 16 * 1.5,
          letterSpacing: 0,
        };
    }
  };

  const getShadowStyle = () => {
    if (shadow === 'none') return {};
    
    switch (shadow) {
      case 'glow':
        return {
          textShadowColor: 'rgba(0, 255, 135, 0.8)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 8,
        };
      case 'depth':
        return {
          textShadowColor: 'rgba(0, 0, 0, 0.8)',
          textShadowOffset: { width: 0, height: 4 },
          textShadowRadius: 8,
        };
      case 'subtle':
        return {
          textShadowColor: 'rgba(0, 0, 0, 0.5)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4,
        };
      default:
        return {};
    }
  };

  const variantStyle = getVariantStyle();
  const shadowStyle = getShadowStyle();
  
  return (
    <RNText
      style={[
        variantStyle,
        shadowStyle,
        color && { color },
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

// Convenience components
export const DisplayText: React.FC<Omit<TypographyProps, 'variant'> & { variant?: 'hero' | 'large' | 'medium' | 'small' }> = (props) => {
  const variantSuffix = props.variant ? props.variant.charAt(0).toUpperCase() + props.variant.slice(1) : 'Small';
  return <Typography {...props} variant={`display${variantSuffix}` as TypographyVariant} />;
};

export const Heading: React.FC<Omit<TypographyProps, 'variant'> & { level?: 1 | 2 | 3 | 4 }> = ({ level = 1, ...props }) => (
  <Typography {...props} variant={`h${level}` as TypographyVariant} />
);

export const BodyText: React.FC<Omit<TypographyProps, 'variant'> & { size?: 'large' | 'regular' | 'small' }> = ({ size = 'regular', ...props }) => {
  const variant = size === 'regular' ? 'body' : size === 'large' ? 'bodyLarge' : 'bodySmall';
  return <Typography {...props} variant={variant} />;
};