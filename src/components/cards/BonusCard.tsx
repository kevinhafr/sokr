// components/cards/BonusCard.tsx
import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BonusCard as BonusCardType } from '@/types';

interface BonusCardProps {
  card: BonusCardType;
  onClick?: () => void;
  isPlayable?: boolean;
  isUsed?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const BonusCard: React.FC<BonusCardProps> = ({
  card,
  onClick,
  isPlayable = true,
  isUsed = false,
  size = 'medium'
}) => {
  const sizeStyles = {
    small: { width: 70, height: 100 },
    medium: { width: 100, height: 140 },
    large: { width: 130, height: 180 }
  };

  const getTypeColor = (type: string) => {
    return type === 'Play' ? '#4CAF50' : '#FF9800';
  };

  return (
    <Pressable 
      onPress={onClick} 
      disabled={!isPlayable || isUsed || !onClick}
    >
      <View style={[
        styles.container,
        sizeStyles[size],
        { borderColor: getTypeColor(card.type) },
        !isPlayable && styles.unplayable,
        isUsed && styles.used
      ]}>
        {/* Type de carte */}
        <View style={[styles.typeHeader, { backgroundColor: getTypeColor(card.type) }]}>
          <Text style={styles.typeText}>{card.type}</Text>
        </View>

        {/* Emoji */}
        <Text style={styles.emoji}>{card.emoji}</Text>

        {/* Nom */}
        <Text style={styles.name}>{card.name}</Text>

        {/* Effet */}
        <Text style={styles.effect} numberOfLines={3}>
          {card.effect}
        </Text>

        {/* Durée pour les cartes Condition */}
        {card.type === 'Condition' && (
          <View style={styles.duration}>
            <Text style={styles.durationText}>{card.duration} tour(s)</Text>
          </View>
        )}

        {/* Indicateur utilisé */}
        {isUsed && (
          <View style={styles.usedOverlay}>
            <Text style={styles.usedText}>UTILISÉ</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2e2e2e',
    borderRadius: 8,
    borderWidth: 2,
    padding: 8,
    margin: 5,
    position: 'relative',
    alignItems: 'center',
  },
  unplayable: {
    opacity: 0.5,
  },
  used: {
    opacity: 0.3,
  },
  typeHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  typeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  emoji: {
    fontSize: 32,
    marginTop: 20,
    marginBottom: 5,
  },
  name: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  effect: {
    color: '#cccccc',
    fontSize: 11,
    textAlign: 'center',
    paddingHorizontal: 5,
  },
  duration: {
    position: 'absolute',
    bottom: 5,
    backgroundColor: '#FF5722',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  durationText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  usedOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -25 }, { translateY: -10 }],
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  usedText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 12,
  },
});