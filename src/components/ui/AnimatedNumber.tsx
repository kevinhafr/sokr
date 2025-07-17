import React, { useEffect, useRef } from 'react';
import { Animated, ViewProps } from 'react-native';
import { GameTheme } from '@/styles';
import { Typography } from './Typography';

interface AnimatedNumberProps extends ViewProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  variant?: 'score' | 'timer' | 'currency' | 'stat';
  color?: string;
  glow?: boolean;
}

export function AnimatedNumber({
  value,
  duration = 1000,
  prefix = '',
  suffix = '',
  variant = 'stat',
  color,
  glow = false,
  style,
  ...props
}: AnimatedNumberProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const previousValue = useRef(0);
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: value,
      duration,
      useNativeDriver: false,
    }).start();
    
    previousValue.current = value;
  }, [value]);
  
  const getTypographyVariant = () => {
    switch (variant) {
      case 'score': return 'score';
      case 'timer': return 'timer';
      case 'currency': return 'currency';
      default: return 'statMedium';
    }
  };
  
  const getDefaultColor = () => {
    switch (variant) {
      case 'currency': return GameTheme.colors.secondary;
      case 'score': return GameTheme.colors.primary;
      default: return color || GameTheme.colors.text;
    }
  };
  
  return (
    <Animated.View style={[style]} {...props}>
      <AnimatedValue
        animatedValue={animatedValue}
        prefix={prefix}
        suffix={suffix}
        variant={getTypographyVariant()}
        color={getDefaultColor()}
        shadow={glow ? 'glow' : undefined}
      />
    </Animated.View>
  );
}

// Component interne pour afficher la valeur animée
function AnimatedValue({ 
  animatedValue, 
  prefix, 
  suffix, 
  variant, 
  color,
  shadow
}: any) {
  const [displayValue, setDisplayValue] = React.useState('0');
  
  useEffect(() => {
    const listener = animatedValue.addListener(({ value }: { value: number }) => {
      setDisplayValue(Math.round(value).toLocaleString());
    });
    
    return () => {
      animatedValue.removeListener(listener);
    };
  }, [animatedValue]);
  
  return (
    <Typography 
      variant={variant} 
      color={color}
      shadow={shadow}
    >
      {prefix}{displayValue}{suffix}
    </Typography>
  );
}