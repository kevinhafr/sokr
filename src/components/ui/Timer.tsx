// components/ui/Timer.tsx
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface TimerProps {
  duration: number; // en secondes
  onTimeout: () => void;
  isPaused?: boolean;
  showWarning?: boolean;
  warningThreshold?: number; // en secondes
}

export const Timer: React.FC<TimerProps> = ({
  duration,
  onTimeout,
  isPaused = false,
  showWarning = true,
  warningThreshold = 10
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const animatedValue = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef<NodeJS.Timer | null>(null);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, onTimeout]);

  useEffect(() => {
    if (showWarning && timeLeft <= warningThreshold && timeLeft > 0) {
      // Animation de pulsation pour le warning
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValue, {
            toValue: 1.2,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(animatedValue, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      animatedValue.setValue(1);
    }
  }, [timeLeft, showWarning, warningThreshold]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerColor = () => {
    if (timeLeft <= warningThreshold) return '#F44336';
    if (timeLeft <= duration / 3) return '#FF9800';
    return '#4CAF50';
  };

  const progress = timeLeft / duration;

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.timerCircle,
          { 
            borderColor: getTimerColor(),
            transform: [{ scale: animatedValue }]
          }
        ]}
      >
        <Text style={[styles.timeText, { color: getTimerColor() }]}>
          {formatTime(timeLeft)}
        </Text>
      </Animated.View>
      
      {/* Barre de progression circulaire */}
      <View style={styles.progressContainer}>
        <View 
          style={[
            styles.progressBar,
            { 
              width: `${progress * 100}%`,
              backgroundColor: getTimerColor()
            }
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  timeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  progressContainer: {
    width: 100,
    height: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 3,
    marginTop: 10,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
});