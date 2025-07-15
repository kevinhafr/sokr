import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  withSpring,
  withRepeat,
  withSequence 
} from 'react-native-reanimated';

export const BallIndicator: React.FC = () => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withRepeat(
            withSequence(
              withSpring(1.2),
              withSpring(1)
            ),
            -1,
            true
          )
        }
      ]
    };
  });

  return (
    <Animated.View style={[styles.ball, animatedStyle]}>
      <View style={styles.ballInner} />
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  ball: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      },
      default: {
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
      }
    }),
  },
  ballInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#000000',
  },
});