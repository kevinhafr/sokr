// components/game/GameBoard.tsx
import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { BoardState, BoardPosition } from '@/types';
import { PlayerCard } from '../cards/PlayerCard';
import { BallIndicator } from './BallIndicator';

interface GameBoardProps {
  board: BoardState;
  ballPosition: BoardPosition;
  onCellClick?: (position: BoardPosition) => void;
  highlightedCells?: BoardPosition[];
  isInteractive?: boolean;
  currentTeam?: 'A' | 'B';
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board = {},
  ballPosition = 'Z2-2',
  onCellClick,
  highlightedCells = [],
  isInteractive = true,
  currentTeam = 'A'
}) => {
  const zones = useMemo(() => {
    return {
      G1: ['G1'],
      Z1: ['Z1-1', 'Z1-2', 'Z1-3'],
      Z2: ['Z2-1', 'Z2-2', 'Z2-3'],
      Z3: ['Z3-1', 'Z3-2', 'Z3-3'],
      G2: ['G2']
    };
  }, []);

  const renderCell = (position: BoardPosition) => {
    const isHighlighted = highlightedCells.includes(position);
    const hasBall = ballPosition === position;
    const cellData = board?.[position];
    
    return (
      <Pressable
        key={position}
        style={[
          styles.cell,
          isHighlighted && styles.highlightedCell,
          cellData && styles.occupiedCell
        ]}
        onPress={() => isInteractive && onCellClick?.(position)}
        disabled={!isInteractive}
      >
        {cellData && (
          <PlayerCard
            cardId={cellData.cardId}
            playerId={cellData.player}
            isExpelled={cellData.isExpelled}
            size="small"
          />
        )}
        {hasBall && <BallIndicator />}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      {/* Zone Gardien 1 */}
      <View style={[styles.zone, styles.goalZone]}>
        {zones.G1.map(renderCell)}
      </View>

      {/* Zone 1 (Défense/Attaque selon l'équipe) */}
      <View style={[styles.zone, styles.fieldZone]}>
        {zones.Z1.map(renderCell)}
      </View>

      {/* Zone 2 (Milieu) */}
      <View style={[styles.zone, styles.fieldZone, styles.middleZone]}>
        {zones.Z2.map(renderCell)}
      </View>

      {/* Zone 3 (Attaque/Défense selon l'équipe) */}
      <View style={[styles.zone, styles.fieldZone]}>
        {zones.Z3.map(renderCell)}
      </View>

      {/* Zone Gardien 2 */}
      <View style={[styles.zone, styles.goalZone]}>
        {zones.G2.map(renderCell)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a472a',
    padding: 10,
  },
  zone: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
  },
  goalZone: {
    backgroundColor: '#2d5a3d',
    borderRadius: 10,
    marginVertical: 5,
  },
  fieldZone: {
    backgroundColor: '#245736',
  },
  middleZone: {
    borderTopWidth: 2,
    borderBottomWidth: 2,
    borderColor: '#ffffff',
  },
  cell: {
    width: 80,
    height: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    margin: 5,
  },
  highlightedCell: {
    backgroundColor: 'rgba(255, 255, 0, 0.3)',
    borderColor: '#ffff00',
    borderWidth: 2,
  },
  occupiedCell: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});