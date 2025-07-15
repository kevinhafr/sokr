// components/cards/PlayerCard.tsx
import React from 'react';
import { View, Text, Image, Pressable, Platform, StyleSheet } from 'react-native';
import { PlayerCard as PlayerCardType, UserPlayer } from '@/types';
import { usePlayerData } from '@/hooks/usePlayerData';
import { useThemedStyles } from '@/hooks/useThemedStyles';

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
    small: { width: 140, height: 190 },
    medium: { width: 180, height: 240 },
    large: { width: 220, height: 300 }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return '#6B7280'; // Gris métallique
      case 'Limited': return '#10B981'; // Vert émeraude
      case 'Rare': return '#3B82F6'; // Bleu électrique
      case 'SuperRare': return '#8B5CF6'; // Violet premium
      case 'Unique': return '#F59E0B'; // Or brillant
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
        {/* Background gradient effect */}
        <View style={[styles.backgroundGradient, { backgroundColor: getRarityColor(cardData.rarity) }]} />
        {/* Overall Rating comme FIFA FUT */}
        <View style={[styles.overall, { backgroundColor: getRarityColor(cardData.rarity) }]}>
          <Text style={styles.overallText}>
            {Math.round((cardData.shot + cardData.dribble + cardData.pass + cardData.block) / 4)}
          </Text>
        </View>

        {/* Header avec niveau et XP */}
        {showLevel && userData && (
          <View style={styles.header}>
            <Text style={styles.level}>Niv {userData.level}</Text>
            {showXP && (
              <Text style={styles.xp}>{userData.xp} XP</Text>
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

        {/* Position comme FIFA FUT */}
        <View style={styles.positionBadge}>
          <Text style={[styles.positionText, { color: getPositionColor(cardData.position) }]}>
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

const StatItem: React.FC<{ label: string; value: number }> = ({ label, value }) => {
  const getStatColor = (val: number) => {
    if (val >= 90) return '#F59E0B'; // Or
    if (val >= 80) return '#10B981'; // Vert
    if (val >= 70) return '#3B82F6'; // Bleu
    if (val >= 60) return '#F59E0B'; // Jaune
    return '#EF4444'; // Rouge
  };
  
  return (
    <View style={styles.statItem}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: getStatColor(value) }]}>{value}</Text>
    </View>
  );
};

const getPositionColor = (position: string) => {
  switch (position) {
    case 'gardien': return '#FFA726'; // Orange vif
    case 'defenseur': return '#29B6F6'; // Bleu ciel
    case 'milieu': return '#66BB6A'; // Vert nature
    case 'attaquant': return '#EF5350'; // Rouge passion
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
    backgroundColor: '#0a0a0a',
    borderRadius: 16,
    borderWidth: 2,
    padding: 12,
    margin: 5,
    position: 'relative',
    overflow: 'hidden',
    ...Platform.select({
      web: {
        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.4)',
      },
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
        elevation: 8,
      }
    }),
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '30%',
    opacity: 0.15,
  },
  selected: {
    borderWidth: 3,
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
  expelled: {
    opacity: 0.5,
  },
  overall: {
    position: 'absolute',
    top: 15,
    left: 15,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  overallText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  header: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    alignItems: 'flex-end',
  },
  level: {
    color: '#FFD700',
    fontSize: 11,
    fontWeight: 'bold',
  },
  xp: {
    color: '#FFD700',
    fontSize: 9,
  },
  image: {
    width: '100%',
    height: '50%',
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: '#2a2a2a',
  },
  name: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 5,
  },
  nationality: {
    color: '#cccccc',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
  },
  positionBadge: {
    position: 'absolute',
    top: 70,
    left: 15,
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  positionText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
    paddingHorizontal: 2,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    color: '#999999',
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 2,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cpCost: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  cpText: {
    color: '#FFD700',
    fontSize: 10,
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