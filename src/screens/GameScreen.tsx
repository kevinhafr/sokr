import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Alert,
  SafeAreaView,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useGame } from '../hooks/useGame';
import { useAuth } from '../contexts/AuthContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { usePlayerCards } from '../hooks/usePlayerCards';
import { GameBoard } from '../components/game/GameBoard';
import { Scoreboard } from '../components/game/Scoreboard';
import { Timer } from '../components/ui/Timer';
import { ActionButtons } from '../components/game/ActionButtons';
import { DiceRoller } from '../components/game/DiceRoller';
import { PlacementGrid } from '../components/game/PlacementGrid';
import { ActionType, BoardPosition } from '../types/components';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { supabase } from '../services/supabase';

type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;
type GameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Game'>;

export default function GameScreen() {
  const route = useRoute<GameScreenRouteProp>();
  const navigation = useNavigation<GameScreenNavigationProp>();
  const { gameId } = route.params;
  const { userId } = useAuth();
  const { game, moves, isLoading, error, isPlayerTurn: isPlayerTurn, timeRemaining, makeMove, placeCard, forfeit } = useGame(gameId);
  const styles = useThemedStyles(createStyles);
  
  const [selectedAction, setSelectedAction] = useState<ActionType | null>(null);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [placedCards, setPlacedCards] = useState<Map<BoardPosition, string>>(new Map());

  // Charger les cartes du joueur
  const playerDeckId = game && userId === game.player_a ? game.deck_a : game?.deck_b;
  const { cards: playerCards, isLoading: cardsLoading } = usePlayerCards(gameId, playerDeckId);

  // Convertir board_state en Map au chargement
  useEffect(() => {
    if (game?.board_state) {
      const boardMap = new Map<BoardPosition, string>();
      Object.entries(game.board_state).forEach(([position, cellData]) => {
        if (cellData && cellData.cardId) {
          boardMap.set(position as BoardPosition, cellData.cardId);
        }
      });
      setPlacedCards(boardMap);
    }
  }, [game?.board_state]);

  const handleCellClick = (position: BoardPosition) => {
    if (!isPlayerTurn || !selectedAction) return;
    
    // Envoyer l'action au serveur
    makeMove({
      action_type: selectedAction,
      from_position: game?.ball_position || 'Z2-2',
      to_position: position,
      dice_result: diceResult || 1,
    });
    
    // Réinitialiser la sélection
    setSelectedAction(null);
    setDiceResult(null);
  };

  const handleActionSelect = (action: ActionType) => {
    if (!isPlayerTurn) {
      Alert.alert('Pas votre tour', "Attendez votre tour pour jouer");
      return;
    }
    setSelectedAction(action);
  };

  const handleDiceRoll = (result: number) => {
    setDiceResult(result);
  };

  const handleQuit = () => {
    Alert.alert(
      'Quitter la partie',
      'Êtes-vous sûr de vouloir quitter la partie ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Quitter', 
          style: 'destructive',
          onPress: () => navigation.goBack()
        },
      ]
    );
  };

  const handleFinishPlacement = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('finish-placement', {
        body: { gameId }
      });

      if (error) throw error;

      if (!data.ready) {
        Alert.alert('En attente', 'En attente que votre adversaire termine son placement...');
      }
    } catch (error) {
      console.error('Error finishing placement:', error);
      Alert.alert('Erreur', 'Impossible de terminer le placement');
    }
  };

  if (isLoading || cardsLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Chargement de la partie...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erreur: {error.message}</Text>
        <Button
          title="Retour"
          variant="secondary"
          onPress={() => navigation.goBack()}
        />
      </View>
    );
  }

  const currentPhase = game?.status === 'placement' ? 'placement' : 'active';

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Timer duration={180} onExpire={() => console.log('Temps écoulé')} />
        </View>
        
        <View style={styles.headerCenter}>
          <Text style={styles.turnIndicator}>
            {isPlayerTurn ? 'Votre tour' : 'Tour adverse'}
          </Text>
        </View>
        
        <View style={styles.headerRight}>
          <Button
            title="Quitter"
            variant="ghost"
            size="sm"
            onPress={handleQuit}
          />
        </View>
      </View>

      <View style={styles.scoreboardContainer}>
        <Scoreboard
          playerAScore={game?.score_a || 0}
          playerBScore={game?.score_b || 0}
          playerAName={'Joueur A'}
          playerBName={'Joueur B'}
          isPlayerATurn={game?.current_player === game?.player_a}
        />
      </View>

      <View style={styles.gameArea}>
        {currentPhase === 'placement' ? (
          <Card variant="elevated" style={styles.placementCard}>
            <Text style={styles.phaseTitle}>Phase de placement</Text>
            <PlacementGrid
              availableCards={playerCards}
              onPlaceCard={(cardId, position) => {
                placeCard(position, cardId);
                setPlacedCards(prev => new Map(prev).set(position, cardId));
              }}
              placedCards={placedCards}
              currentTeam={userId === game?.player_a ? 'A' : 'B'}
              isFirstPlacement={placedCards.size === 0}
            />
            {placedCards.size >= 7 && (
              <Button
                title="Terminer le placement"
                variant="primary"
                onPress={handleFinishPlacement}
                style={styles.finishButton}
              />
            )}
          </Card>
        ) : (
          <>
            <GameBoard
              board={game?.board_state || {}}
              ballPosition={game?.ball_position || 'Z2-2'}
              onCellClick={handleCellClick}
              highlightedCells={selectedAction ? [] : []}
              isInteractive={isPlayerTurn}
              currentTeam={userId === game?.player_a ? 'A' : 'B'}
            />
            
            {selectedAction && (
              <Card variant="default" style={styles.diceCard}>
                <Text style={styles.diceInstruction}>
                  Lancez les dés pour effectuer votre action
                </Text>
                <DiceRoller onRoll={handleDiceRoll} />
              </Card>
            )}
          </>
        )}
      </View>

      {currentPhase === 'active' && (
        <View style={styles.actionButtonsContainer}>
          <ActionButtons
            onActionSelect={handleActionSelect}
            selectedAction={selectedAction}
            disabled={!isPlayerTurn}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme: ReturnType<typeof import('../hooks/useThemedStyles').useTheme>) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    fontSize: theme.theme.typography.fontSize.lg,
    color: theme.colors.textMuted,
    fontFamily: theme.theme.fonts.body,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background,
    padding: theme.theme.spacing.lg,
  },
  errorText: {
    fontSize: theme.theme.typography.fontSize.lg,
    color: theme.colors.danger,
    fontFamily: theme.theme.fonts.body,
    marginBottom: theme.theme.spacing.lg,
    textAlign: 'center' as const,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    paddingHorizontal: theme.theme.spacing.md,
    paddingVertical: theme.theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  headerCenter: {
    flex: 2,
    alignItems: 'center' as const,
  },
  headerRight: {
    flex: 1,
    alignItems: 'flex-end' as const,
  },
  turnIndicator: {
    fontSize: theme.theme.typography.fontSize.lg,
    fontFamily: theme.theme.fonts.body,
    fontWeight: '600',
    color: theme.colors.text,
  },
  scoreboardContainer: {
    paddingHorizontal: theme.theme.spacing.md,
    paddingVertical: theme.theme.spacing.sm,
  },
  gameArea: {
    flex: 1,
    padding: theme.theme.spacing.md,
  },
  placementCard: {
    flex: 1,
    padding: theme.theme.spacing.lg,
  },
  phaseTitle: {
    fontSize: theme.theme.typography.fontSize.xl,
    fontFamily: theme.theme.fonts.heading,
    color: theme.colors.text,
    textAlign: 'center' as const,
    marginBottom: theme.theme.spacing.lg,
  },
  diceCard: {
    marginTop: theme.theme.spacing.lg,
    padding: theme.theme.spacing.lg,
    alignItems: 'center' as const,
  },
  diceInstruction: {
    fontSize: theme.theme.typography.fontSize.base,
    color: theme.colors.textMuted,
    fontFamily: theme.theme.fonts.body,
    marginBottom: theme.theme.spacing.md,
  },
  actionButtonsContainer: {
    paddingHorizontal: theme.theme.spacing.md,
    paddingBottom: theme.theme.spacing.md,
  },
  finishButton: {
    marginTop: theme.theme.spacing.lg,
  },
});