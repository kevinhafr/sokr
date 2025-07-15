// components/game/Scoreboard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Profile } from '@/types';

interface ScoreboardProps {
  playerAScore: number;
  playerBScore: number;
  playerAName: string;
  playerBName: string;
  isPlayerATurn: boolean;
  currentTurn?: number;
  maxTurns?: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  playerAScore,
  playerBScore,
  playerAName,
  playerBName,
  isPlayerATurn,
  currentTurn = 1,
  maxTurns = 10
}) => {

  return (
    <View style={styles.container}>
      {/* Joueur A */}
      <View style={[styles.playerSection, isPlayerATurn && styles.activePlayer]}>
        <Text style={styles.playerName}>{playerAName}</Text>
        <Text style={styles.score}>{playerAScore}</Text>
      </View>

      {/* Centre - Tour actuel */}
      <View style={styles.centerSection}>
        <Text style={styles.turnLabel}>Tour</Text>
        <Text style={styles.turnNumber}>{currentTurn}/{maxTurns}</Text>
        {currentTurn === 5 && <Text style={styles.halfTime}>Mi-temps</Text>}
      </View>

      {/* Joueur B */}
      <View style={[styles.playerSection, !isPlayerATurn && styles.activePlayer]}>
        <Text style={styles.playerName}>{playerBName}</Text>
        <Text style={styles.score}>{playerBScore}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1e1e1e',
    padding: 15,
    borderRadius: 10,
    marginVertical: 10,
  },
  playerSection: {
    flex: 1,
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  activePlayer: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  playerName: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  score: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  mmr: {
    color: '#aaaaaa',
    fontSize: 12,
    marginTop: 5,
  },
  centerSection: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  turnLabel: {
    color: '#aaaaaa',
    fontSize: 14,
  },
  turnNumber: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  halfTime: {
    color: '#FFC107',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 5,
  },
});