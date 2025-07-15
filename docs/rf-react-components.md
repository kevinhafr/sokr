# Rocket Footy - Composants React

## 1. Composant GameBoard

```typescript
// components/game/GameBoard.tsx
import React, { useMemo } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { BoardState, BoardPosition } from '@/types';
import { PlayerCard } from './PlayerCard';
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
  board,
  ballPosition,
  onCellClick,
  highlightedCells = [],
  isInteractive = true,
  currentTeam
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
    const cellData = board[position];
    
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
```

## 2. Composant PlayerCard

```typescript
// components/cards/PlayerCard.tsx
import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import { PlayerCard as PlayerCardType, UserPlayer } from '@/types';
import { usePlayerData } from '@/hooks/usePlayerData';

interface PlayerCardProps {
  card?: PlayerCardType;
  cardId?: string;
  userCard?: UserPlayer;
  playerId?: string;
  onClick?: () => void;
  isSelected?: boolean;
  isExpelled?: boolean;
  showXP?: boolean;
  showLevel?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  card,
  cardId,
  userCard,
  playerId,
  onClick,
  isSelected = false,
  isExpelled = false,
  showXP = false,
  showLevel = true,
  size = 'medium'
}) => {
  // Si on n'a que l'ID, récupérer les données
  const { playerCard, userPlayerCard } = usePlayerData(cardId, playerId);
  
  const cardData = card || playerCard;
  const userData = userCard || userPlayerCard;
  
  if (!cardData) return null;

  const sizeStyles = {
    small: { width: 60, height: 80 },
    medium: { width: 90, height: 120 },
    large: { width: 120, height: 160 }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return '#B0BEC5';
      case 'Limited': return '#81C784';
      case 'Rare': return '#64B5F6';
      case 'SuperRare': return '#BA68C8';
      case 'Unique': return '#FFD54F';
      default: return '#FFFFFF';
    }
  };

  const getStatWithUpgrade = (baseStat: number, statName: string) => {
    const upgrade = userData?.stat_upgrades?.[statName] || 0;
    return baseStat + upgrade;
  };

  return (
    <Pressable onPress={onClick} disabled={!onClick}>
      <View style={[
        styles.container,
        sizeStyles[size],
        isSelected && styles.selected,
        isExpelled && styles.expelled,
        { borderColor: getRarityColor(cardData.rarity) }
      ]}>
        {/* Header avec niveau et XP */}
        {showLevel && userData && (
          <View style={styles.header}>
            <Text style={styles.level}>Lv.{userData.level}</Text>
            {showXP && (
              <Text style={styles.xp}>{userData.xp}/{getRequiredXP(userData.level)}</Text>
            )}
          </View>
        )}

        {/* Image du joueur */}
        <Image 
          source={{ uri: cardData.image_url }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* Nom et nationalité */}
        <Text style={styles.name} numberOfLines={1}>
          {cardData.name}
        </Text>
        <Text style={styles.nationality}>{cardData.nationality}</Text>

        {/* Position */}
        <View style={[styles.position, { backgroundColor: getPositionColor(cardData.position) }]}>
          <Text style={styles.positionText}>
            {getPositionAbbreviation(cardData.position)}
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.stats}>
          <StatItem label="TIR" value={getStatWithUpgrade(cardData.shot, 'shot')} />
          <StatItem label="DRI" value={getStatWithUpgrade(cardData.dribble, 'dribble')} />
          <StatItem label="PAS" value={getStatWithUpgrade(cardData.pass, 'pass')} />
          <StatItem label="BLO" value={getStatWithUpgrade(cardData.block, 'block')} />
        </View>

        {/* Coût CP */}
        <View style={styles.cpCost}>
          <Text style={styles.cpText}>{cardData.cp_cost} CP</Text>
        </View>

        {/* Indicateur de carte expulsée */}
        {isExpelled && (
          <View style={styles.expelledOverlay}>
            <Text style={styles.expelledText}>EXCLU</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
};

const StatItem: React.FC<{ label: string; value: number }> = ({ label, value }) => (
  <View style={styles.statItem}>
    <Text style={styles.statLabel}>{label}</Text>
    <Text style={styles.statValue}>{value}</Text>
  </View>
);

const getPositionColor = (position: string) => {
  switch (position) {
    case 'gardien': return '#FFC107';
    case 'defenseur': return '#2196F3';
    case 'milieu': return '#4CAF50';
    case 'attaquant': return '#F44336';
    default: return '#9E9E9E';
  }
};

const getPositionAbbreviation = (position: string) => {
  switch (position) {
    case 'gardien': return 'GK';
    case 'defenseur': return 'DEF';
    case 'milieu': return 'MID';
    case 'attaquant': return 'ATT';
    default: return '?';
  }
};

const getRequiredXP = (level: number) => {
  const xpLevels = [0, 100, 250, 500, 1000];
  return xpLevels[level] || 1000;
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1e1e1e',
    borderRadius: 8,
    borderWidth: 2,
    padding: 5,
    margin: 5,
    position: 'relative',
  },
  selected: {
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  expelled: {
    opacity: 0.5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  level: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  xp: {
    color: '#aaaaaa',
    fontSize: 10,
  },
  image: {
    width: '100%',
    height: '40%',
    borderRadius: 4,
    marginBottom: 5,
  },
  name: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  nationality: {
    color: '#aaaaaa',
    fontSize: 10,
    textAlign: 'center',
  },
  position: {
    position: 'absolute',
    top: 5,
    right: 5,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  positionText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 5,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    color: '#aaaaaa',
    fontSize: 9,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  cpCost: {
    position: 'absolute',
    bottom: 5,
    left: 5,
    backgroundColor: '#333333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  cpText: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: 'bold',
  },
  expelledOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -30 }, { translateY: -10 }],
    backgroundColor: 'rgba(255, 0, 0, 0.8)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  expelledText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
```

## 3. Composant BonusCard

```typescript
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
```

## 4. Composant Timer

```typescript
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
```

## 5. Composant ActionButtons

```typescript
// components/game/ActionButtons.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ActionButton } from './ActionButton';
import { ActionType } from '@/types';

interface ActionButtonsProps {
  onAction: (action: ActionType) => void;
  disabledActions?: ActionType[];
  currentAction?: ActionType;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onAction,
  disabledActions = [],
  currentAction
}) => {
  const actions = [
    { type: 'pass' as ActionType, label: 'Passe', icon: '→' },
    { type: 'shot' as ActionType, label: 'Tir', icon: '⚽' },
    { type: 'dribble' as ActionType, label: 'Dribble', icon: '⚡' },
  ];

  return (
    <View style={styles.container}>
      {actions.map((action) => (
        <ActionButton
          key={action.type}
          action={action.type}
          label={action.label}
          icon={action.icon}
          onPress={() => onAction(action.type)}
          disabled={disabledActions.includes(action.type)}
          isSelected={currentAction === action.type}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 10,
  },
});
```

## 6. Composant Scoreboard

```typescript
// components/game/Scoreboard.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Profile } from '@/types';

interface ScoreboardProps {
  scoreA: number;
  scoreB: number;
  playerA: Profile;
  playerB: Profile;
  currentTurn: number;
  currentPlayer: string;
  maxTurns?: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  scoreA,
  scoreB,
  playerA,
  playerB,
  currentTurn,
  currentPlayer,
  maxTurns = 10
}) => {
  const isPlayerATurn = currentPlayer === playerA.id;

  return (
    <View style={styles.container}>
      {/* Joueur A */}
      <View style={[styles.playerSection, isPlayerATurn && styles.activePlayer]}>
        <Text style={styles.playerName}>{playerA.username}</Text>
        <Text style={styles.score}>{scoreA}</Text>
        <Text style={styles.mmr}>MMR: {playerA.mmr}</Text>
      </View>

      {/* Centre - Tour actuel */}
      <View style={styles.centerSection}>
        <Text style={styles.turnLabel}>Tour</Text>
        <Text style={styles.turnNumber}>{currentTurn}/{maxTurns}</Text>
        {currentTurn === 5 && <Text style={styles.halfTime}>Mi-temps</Text>}
      </View>

      {/* Joueur B */}
      <View style={[styles.playerSection, !isPlayerATurn && styles.activePlayer]}>
        <Text style={styles.playerName}>{playerB.username}</Text>
        <Text style={styles.score}>{scoreB}</Text>
        <Text style={styles.mmr}>MMR: {playerB.mmr}</Text>
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
```

## 7. Composant DiceRoller

```typescript
// components/game/DiceRoller.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Pressable } from 'react-native';

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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
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
```

## 8. Composant PlacementGrid

```typescript
// components/game/PlacementGrid.tsx
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { PlayerCard } from '../cards/PlayerCard';
import { BoardPosition, PlayerCard as PlayerCardType } from '@/types';
import { DragDropContext, Droppable, Draggable } from '@/lib/drag-drop';

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
```