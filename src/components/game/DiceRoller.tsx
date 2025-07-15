// components/game/DiceRoller.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable, Platform } from 'react-native';

interface DiceRollerProps {
  onRoll: (result: number) => void;
  autoRoll?: boolean;
  showResult?: boolean;
  canReroll?: boolean;
  onReroll?: () => void;
}

export const DiceRoller: React.FC<DiceRollerProps> = ({
  onRoll,
  autoRoll = false,
  showResult = true,
  canReroll = false,
  onReroll
}) => {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const animatedValue = new Animated.Value(0);

  const rollDice = () => {
    setIsRolling(true);
    setResult(null);

    // Animation de rotation
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      const diceResult = Math.floor(Math.random() * 6) + 1;
      setResult(diceResult);
      setIsRolling(false);
      onRoll(diceResult);
    });
  };

  useEffect(() => {
    if (autoRoll) {
      rollDice();
    }
  }, [autoRoll]);

  const rotation = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '720deg'],
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.dice,
          { transform: [{ rotate: rotation }] },
          result === 1 && styles.criticalFail,
          result === 6 && styles.criticalSuccess,
        ]}
      >
        {!isRolling && result && (
          <Text style={styles.diceValue}>{result}</Text>
        )}
        {isRolling && (
          <Text style={styles.diceValue}>?</Text>
        )}
      </Animated.View>

      {!autoRoll && !isRolling && !result && (
        <Pressable style={styles.rollButton} onPress={rollDice}>
          <Text style={styles.rollButtonText}>Lancer le dé</Text>
        </Pressable>
      )}

      {canReroll && result && !isRolling && (
        <Pressable style={styles.rerollButton} onPress={onReroll}>
          <Text style={styles.rerollButtonText}>Relancer</Text>
        </Pressable>
      )}

      {showResult && result && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>
            {result === 1 && 'Échec critique !'}
            {result === 6 && 'Réussite critique !'}
            {result > 1 && result < 6 && `Résultat : ${result}`}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
  },
  dice: {
    width: 80,
    height: 80,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#333333',
    ...Platform.select({
      web: {
        boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.25)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
      }
    }),
  },
  criticalFail: {
    backgroundColor: '#F44336',
    borderColor: '#B71C1C',
  },
  criticalSuccess: {
    backgroundColor: '#4CAF50',
    borderColor: '#1B5E20',
  },
  diceValue: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#333333',
  },
  rollButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#2196F3',
    borderRadius: 5,
  },
  rollButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  rerollButton: {
    marginTop: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#FF9800',
    borderRadius: 5,
  },
  rerollButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultContainer: {
    marginTop: 20,
  },
  resultText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
});