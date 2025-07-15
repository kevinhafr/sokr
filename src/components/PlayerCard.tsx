import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { GameTheme } from '../styles';
import { Card } from './ui/Card';
import { Typography } from './ui/Typography';

interface Player {
  id: string;
  name: string;
  position: string;
  club: string;
  rating: number;
  rarity: string;
  image_url?: string;
  stats?: {
    pace?: number;
    shooting?: number;
    passing?: number;
    dribbling?: number;
    defending?: number;
    physical?: number;
  };
}

interface PlayerCardProps {
  player: Player;
  size?: 'small' | 'medium' | 'large';
  onPress?: () => void;
  showStats?: boolean;
  selected?: boolean;
}

export const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  size = 'medium',
  onPress,
  showStats = false,
  selected = false,
}) => {
  const styles = useThemedStyles(createStyles);
  
  const sizeStyles = {
    small: styles.cardSmall,
    medium: styles.cardMedium,
    large: styles.cardLarge,
  };
  
  const getPositionColor = (position: string) => {
    switch (position.toLowerCase()) {
      case 'gardien':
        return GameTheme.colors.goalkeeper;
      case 'defenseur':
        return GameTheme.colors.defender;
      case 'milieu':
        return GameTheme.colors.midfielder;
      case 'attaquant':
        return GameTheme.colors.attacker;
      default:
        return GameTheme.colors.textMuted;
    }
  };
  
  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'common':
        return GameTheme.colors.rarityCommon;
      case 'rare':
        return GameTheme.colors.rarityRare;
      case 'epic':
        return GameTheme.colors.rarityEpic;
      case 'legendary':
        return GameTheme.colors.rarityLegendary;
      default:
        return GameTheme.colors.rarityCommon;
    }
  };
  
  const cardContent = (
    <Card 
      variant={selected ? 'elevated' : 'default'} 
      glow={player.rarity === 'legendary'}
      style={[
        styles.card,
        sizeStyles[size],
        selected && styles.selectedCard,
        { borderColor: getRarityColor(player.rarity) }
      ]}
    >
      <View style={[styles.header, { backgroundColor: getPositionColor(player.position) }]}>
        <Typography variant="caption" color="#FFFFFF" style={styles.position}>
          {player.position.slice(0, 3).toUpperCase()}
        </Typography>
        <Typography variant="score" color="#FFFFFF" style={styles.rating}>
          {player.rating}
        </Typography>
      </View>
      
      {player.image_url ? (
        <Image 
          source={{ uri: player.image_url }} 
          style={styles.playerImage}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.playerImagePlaceholder}>
          <Typography variant="h1" color={GameTheme.colors.textMuted}>
            {player.name.charAt(0).toUpperCase()}
          </Typography>
        </View>
      )}
      
      <View style={styles.info}>
        <Typography variant="label" numberOfLines={1} style={styles.playerName}>
          {player.name}
        </Typography>
        <Typography variant="caption" color={GameTheme.colors.textMuted} numberOfLines={1}>
          {player.club}
        </Typography>
      </View>
      
      {showStats && player.stats && size !== 'small' && (
        <View style={styles.stats}>
          <View style={styles.statRow}>
            <Typography variant="caption" color={GameTheme.colors.textMuted}>VIT</Typography>
            <Typography variant="statSmall">{player.stats.pace || '-'}</Typography>
          </View>
          <View style={styles.statRow}>
            <Typography variant="caption" color={GameTheme.colors.textMuted}>TIR</Typography>
            <Typography variant="statSmall">{player.stats.shooting || '-'}</Typography>
          </View>
          <View style={styles.statRow}>
            <Typography variant="caption" color={GameTheme.colors.textMuted}>PAS</Typography>
            <Typography variant="statSmall">{player.stats.passing || '-'}</Typography>
          </View>
        </View>
      )}
    </Card>
  );
  
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress}>
        {cardContent}
      </TouchableOpacity>
    );
  }
  
  return cardContent;
};

const createStyles = (theme: ReturnType<typeof import('../hooks/useThemedStyles').useTheme>) => StyleSheet.create({
  card: {
    overflow: 'hidden',
    borderWidth: 2,
  },
  selectedCard: {
    borderColor: theme.colors.primary,
    borderWidth: 3,
  },
  cardSmall: {
    width: 80,
    height: 100,
  },
  cardMedium: {
    width: 120,
    height: 160,
  },
  cardLarge: {
    width: 180,
    height: 240,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  position: {
    textTransform: 'uppercase',
  },
  rating: {
    // Styles appliqués via Typography
  },
  playerImage: {
    flex: 1,
    width: '100%',
    height: undefined,
  },
  playerImagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.textMuted,
  },
  playerInitial: {
    // Styles appliqués via Typography
  },
  info: {
    padding: GameTheme.spacing.xs,
    backgroundColor: 'transparent',
  },
  playerName: {
    marginBottom: 2,
  },
  playerClub: {
    // Styles appliqués via Typography
  },
  stats: {
    paddingHorizontal: GameTheme.spacing.xs,
    paddingBottom: GameTheme.spacing.xs,
    backgroundColor: 'transparent',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  statLabel: {
    // Styles appliqués via Typography
  },
  statValue: {
    // Styles appliqués via Typography
  },
});