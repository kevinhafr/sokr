import React from 'react';
import { Text as RNText, TextProps as RNTextProps } from 'react-native';
import { GameTheme } from '@/styles';

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
  | 'statSmall'
  | 'buttonLarge'
  | 'buttonMedium';

interface TypographyProps extends RNTextProps {
  variant?: TypographyVariant;
  color?: string;
  shadow?: 'glow' | 'depth' | 'subtle';
  children: React.ReactNode;
}

export function Typography({
  variant = 'body',
  color = GameTheme.colors.text, // Default to theme text color
  shadow,
  style,
  children,
  ...props
}: TypographyProps) {
  const getVariantStyle = () => {
    switch (variant) {
      // Display variants - Bold and impactful
      case 'displayHero':
        return {
          fontFamily: GameTheme.fonts.display,
          fontSize: 64,
          lineHeight: 70,
          fontWeight: GameTheme.fontWeights.black,
        };
      case 'displayLarge':
        return {
          fontFamily: GameTheme.fonts.display,
          fontSize: 48,
          lineHeight: 52,
          fontWeight: GameTheme.fontWeights.black,
        };
      case 'displayMedium':
        return {
          fontFamily: GameTheme.fonts.display,
          fontSize: 36,
          lineHeight: 40,
          fontWeight: GameTheme.fontWeights.bold,
        };
      case 'displaySmall':
        return {
          fontFamily: GameTheme.fonts.display,
          fontSize: 28,
          lineHeight: 32,
          fontWeight: GameTheme.fontWeights.bold,
        };
      
      // Header variants - Clear hierarchy
      case 'h1':
        return {
          fontFamily: GameTheme.fonts.heading,
          fontSize: 24,
          lineHeight: 28,
          fontWeight: GameTheme.fontWeights.bold,
        };
      case 'h2':
        return {
          fontFamily: GameTheme.fonts.heading,
          fontSize: 20,
          lineHeight: 24,
          fontWeight: GameTheme.fontWeights.bold,
        };
      case 'h3':
        return {
          fontFamily: GameTheme.fonts.heading,
          fontSize: 18,
          lineHeight: 22,
          fontWeight: GameTheme.fontWeights.semibold,
        };
      case 'h4':
        return {
          fontFamily: GameTheme.fonts.heading,
          fontSize: 16,
          lineHeight: 20,
          fontWeight: GameTheme.fontWeights.semibold,
        };
      
      // Body variants - Readable and comfortable
      case 'bodyLarge':
        return {
          fontFamily: GameTheme.fonts.body,
          fontSize: 18,
          lineHeight: 26,
          fontWeight: GameTheme.fontWeights.regular,
        };
      case 'body':
        return {
          fontFamily: GameTheme.fonts.body,
          fontSize: 16,
          lineHeight: 24,
          fontWeight: GameTheme.fontWeights.regular,
        };
      case 'bodySmall':
        return {
          fontFamily: GameTheme.fonts.body,
          fontSize: 14,
          lineHeight: 20,
          fontWeight: GameTheme.fontWeights.regular,
        };
      
      // UI variants - Functional and clear
      case 'caption':
        return {
          fontFamily: GameTheme.fonts.body,
          fontSize: 12,
          lineHeight: 16,
          fontWeight: GameTheme.fontWeights.regular,
        };
      case 'label':
        return {
          fontFamily: GameTheme.fonts.body,
          fontSize: 14,
          lineHeight: 18,
          fontWeight: GameTheme.fontWeights.medium,
          textTransform: 'uppercase' as const,
          letterSpacing: 0.5,
        };
      
      // Gaming variants - Impactful numbers
      case 'score':
        return {
          fontFamily: GameTheme.fonts.display,
          fontSize: 56,
          lineHeight: 60,
          fontWeight: GameTheme.fontWeights.black,
        };
      case 'timer':
        return {
          fontFamily: GameTheme.fonts.mono,
          fontSize: 32,
          lineHeight: 36,
          fontWeight: GameTheme.fontWeights.bold,
        };
      case 'currency':
        return {
          fontFamily: GameTheme.fonts.heading,
          fontSize: 20,
          lineHeight: 24,
          fontWeight: GameTheme.fontWeights.bold,
        };
      
      // Stat variants - Data presentation
      case 'statLarge':
        return {
          fontFamily: GameTheme.fonts.heading,
          fontSize: 28,
          lineHeight: 32,
          fontWeight: GameTheme.fontWeights.bold,
        };
      case 'statMedium':
        return {
          fontFamily: GameTheme.fonts.heading,
          fontSize: 20,
          lineHeight: 24,
          fontWeight: GameTheme.fontWeights.semibold,
        };
      case 'statSmall':
        return {
          fontFamily: GameTheme.fonts.heading,
          fontSize: 16,
          lineHeight: 20,
          fontWeight: GameTheme.fontWeights.semibold,
        };
      
      // Button variants
      case 'buttonLarge':
        return {
          fontFamily: GameTheme.fonts.heading,
          fontSize: 20,
          lineHeight: 24,
          fontWeight: GameTheme.fontWeights.bold,
          textTransform: 'uppercase' as const,
          letterSpacing: 1,
        };
      case 'buttonMedium':
        return {
          fontFamily: GameTheme.fonts.heading,
          fontSize: 18,
          lineHeight: 22,
          fontWeight: GameTheme.fontWeights.bold,
          textTransform: 'uppercase' as const,
          letterSpacing: 0.75,
        };
      
      default:
        return {
          fontFamily: GameTheme.fonts.body,
          fontSize: 16,
          lineHeight: 24,
          fontWeight: GameTheme.fontWeights.regular,
        };
    }
  };

  const variantStyle = getVariantStyle();
  
  const getShadowStyle = () => {
    if (!shadow) return {};
    
    switch (shadow) {
      case 'glow':
        return {
          textShadowColor: 'rgba(0, 255, 135, 0.5)',
          textShadowOffset: { width: 0, height: 0 },
          textShadowRadius: 10,
        };
      case 'depth':
        return {
          textShadowColor: 'rgba(0, 0, 0, 0.75)',
          textShadowOffset: { width: 0, height: 2 },
          textShadowRadius: 4,
        };
      case 'subtle':
        return {
          textShadowColor: 'rgba(0, 0, 0, 0.3)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2,
        };
      default:
        return {};
    }
  };
  
  return (
    <RNText
      style={[
        variantStyle,
        { color },
        getShadowStyle(),
        style,
      ]}
      {...props}
    >
      {children}
    </RNText>
  );
}

// Convenience components - Clean and intuitive
export const DisplayText: React.FC<Omit<TypographyProps, 'variant'> & { variant?: 'hero' | 'large' | 'medium' | 'small' }> = (props) => {
  const variantSuffix = props.variant ? props.variant.charAt(0).toUpperCase() + props.variant.slice(1) : 'Small';
  return <Typography {...props} variant={`display${variantSuffix}` as TypographyVariant} />;
};

export const Heading: React.FC<Omit<TypographyProps, 'variant'> & { level?: 1 | 2 | 3 | 4 }> = ({ level = 1, shadow, ...props }) => (
  <Typography {...props} shadow={shadow} variant={`h${level}` as TypographyVariant} />
);

export const BodyText: React.FC<Omit<TypographyProps, 'variant'> & { size?: 'large' | 'regular' | 'small' }> = ({ size = 'regular', ...props }) => {
  const variant = size === 'regular' ? 'body' : size === 'large' ? 'bodyLarge' : 'bodySmall';
  return <Typography {...props} variant={variant} />;
};