// components/game/PlacementGrid.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { PlayerCard } from '../cards/PlayerCard';
import { BoardPosition, PlayerCard as PlayerCardType } from '@/types';

interface PlacementGridProps {
  availableCards: PlayerCardType[];
  onPlaceCard: (cardId: string, position: BoardPosition) => void;
  placedCards: Map<BoardPosition, string>;
  currentTeam: 'A' | 'B';
  isFirstPlacement?: boolean;
}

export const PlacementGrid: React.FC<PlacementGridProps> = ({
  availableCards,
  onPlaceCard,
  placedCards,
  currentTeam,
  isFirstPlacement = false
}) => {
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [targetPosition, setTargetPosition] = useState<BoardPosition | null>(null);

  const handleCardSelect = (cardId: string) => {
    setSelectedCard(cardId);
  };

  const handlePositionSelect = (position: BoardPosition) => {
    if (selectedCard && !placedCards.has(position)) {
      // Vérifier les contraintes
      if (isFirstPlacement) {
        // La première carte doit être un milieu
        const card = availableCards.find(c => c.id === selectedCard);
        if (card?.position !== 'milieu') {
          // Afficher une erreur
          return;
        }
      }

      onPlaceCard(selectedCard, position);
      setSelectedCard(null);
    }
  };

  const getPositionsForTeam = (team: 'A' | 'B'): BoardPosition[] => {
    if (team === 'A') {
      return ['G1', 'Z1-1', 'Z1-2', 'Z1-3', 'Z2-1', 'Z2-2', 'Z2-3'];
    } else {
      return ['G2', 'Z3-1', 'Z3-2', 'Z3-3', 'Z2-1', 'Z2-2', 'Z2-3'];
    }
  };

  const availablePositions = getPositionsForTeam(currentTeam);

  return (
    <View style={styles.container}>
      {/* Zone des cartes disponibles */}
      <ScrollView horizontal style={styles.cardsList}>
        {availableCards.map((card) => (
          <PlayerCard
            key={card.id}
            card={card}
            onClick={() => handleCardSelect(card.id)}
            isSelected={selectedCard === card.id}
            size="small"
          />
        ))}
      </ScrollView>

      {/* Grille de placement */}
      <View style={styles.grid}>
        {availablePositions.map((position) => (
          <Pressable
            key={position}
            style={[
              styles.gridCell,
              placedCards.has(position) && styles.occupiedCell,
              targetPosition === position && styles.targetCell,
            ]}
            onPress={() => handlePositionSelect(position)}
          >
            {placedCards.has(position) && (
              <PlayerCard
                cardId={placedCards.get(position)}
                size="small"
              />
            )}
            {!placedCards.has(position) && (
              <Text style={styles.positionLabel}>{position}</Text>
            )}
          </Pressable>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  cardsList: {
    maxHeight: 120,
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  grid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    justifyContent: 'center',
  },
  gridCell: {
    width: '30%',
    height: 100,
    margin: '1.66%',
    borderWidth: 2,
    borderColor: '#666666',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  occupiedCell: {
    borderColor: '#4CAF50',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
  },
  targetCell: {
    borderColor: '#FFC107',
    backgroundColor: 'rgba(255, 193, 7, 0.2)',
  },
  positionLabel: {
    color: '#aaaaaa',
    fontSize: 16,
    fontWeight: 'bold',
  },
});