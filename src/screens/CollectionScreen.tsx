import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Card } from '../components/ui/Card';
import { PlayerCard } from '../components/cards/PlayerCard';
import { supabase } from '../services/supabase';

interface UserCard {
  id: string;
  player_id: string;
  level: number;
  xp: number;
  obtained_at: string;
  player: {
    id: string;
    name: string;
    nationality: string;
    position: string;
    rarity: string;
    shot: number;
    dribble: number;
    pass: number;
    block: number;
    cp_cost: number;
    special_ability?: string;
    image_url?: string;
  };
}

export default function CollectionScreen() {
  const { userId } = useAuth();
  const styles = useThemedStyles(createStyles);
  const [cards, setCards] = useState<UserCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadUserCards = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('user_players')
        .select(`
          *,
          player:players(*)
        `)
        .eq('user_id', userId)
        .order('player(position)', { ascending: true });

      if (error) throw error;
      setCards(data || []);
    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadUserCards();
  }, [userId]);

  const onRefresh = () => {
    setRefreshing(true);
    loadUserCards();
  };

  const getCardsByPosition = (position: string) => {
    return cards.filter(card => card.player.position === position);
  };

  const positions = ['gardien', 'defenseur', 'milieu', 'attaquant'];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={styles.loadingColor.color} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={styles.loadingColor.color}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Ma Collection</Text>
        <Text style={styles.subtitle}>Vos {cards.length} cartes</Text>
      </View>

      <Card variant="elevated" style={styles.statsCard}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{cards.length}</Text>
          <Text style={styles.statLabel}>Cartes</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{getCardsByPosition('gardien').length}</Text>
          <Text style={styles.statLabel}>Gardiens</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{getCardsByPosition('defenseur').length}</Text>
          <Text style={styles.statLabel}>Défenseurs</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{getCardsByPosition('milieu').length}</Text>
          <Text style={styles.statLabel}>Milieux</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{getCardsByPosition('attaquant').length}</Text>
          <Text style={styles.statLabel}>Attaquants</Text>
        </View>
      </Card>

      {positions.map(position => {
        const positionCards = getCardsByPosition(position);
        if (positionCards.length === 0) return null;

        return (
          <View key={position} style={styles.section}>
            <Text style={styles.sectionTitle}>
              {position.charAt(0).toUpperCase() + position.slice(1)}s ({positionCards.length})
            </Text>
            <View style={styles.cardsGrid}>
              {positionCards.map((card) => (
                <View key={card.id} style={styles.cardWrapper}>
                  <PlayerCard
                    card={{
                      id: card.player.id,
                      name: card.player.name,
                      nationality: card.player.nationality,
                      position: card.player.position as any,
                      rarity: card.player.rarity as any,
                      shot: card.player.shot,
                      dribble: card.player.dribble,
                      pass: card.player.pass,
                      block: card.player.block,
                      cp_cost: card.player.cp_cost,
                      special_ability: card.player.special_ability,
                      image_url: card.player.image_url,
                    }}
                    userCard={{
                      id: card.id,
                      player_id: card.player_id,
                      user_id: userId!,
                      level: card.level,
                      xp: card.xp,
                    }}
                    size="small"
                    showLevel={true}
                    showXP={true}
                  />
                  <View style={styles.cardInfo}>
                    <Text style={styles.cardLevel}>Niveau {card.level}</Text>
                    <Text style={styles.cardXP}>{card.xp} XP</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof import('../hooks/useThemedStyles').useTheme>) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: theme.theme.spacing['2xl'],
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.background,
  },
  loadingColor: {
    color: theme.colors.primary,
  },
  header: {
    padding: theme.theme.spacing.lg,
    paddingTop: theme.theme.spacing.md,
  },
  title: {
    fontSize: theme.theme.typography.fontSize['3xl'],
    fontFamily: theme.theme.typography.fontFamily.sansBold,
    color: theme.colors.foreground,
  },
  subtitle: {
    fontSize: theme.theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
    fontFamily: theme.theme.typography.fontFamily.sans,
    marginTop: theme.theme.spacing.xs,
  },
  statsCard: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    marginHorizontal: theme.theme.spacing.lg,
    paddingVertical: theme.theme.spacing.lg,
  },
  statItem: {
    alignItems: 'center' as const,
  },
  statValue: {
    fontSize: theme.theme.typography.fontSize['2xl'],
    fontFamily: theme.theme.typography.fontFamily.sansBold,
    color: theme.colors.primary,
  },
  statLabel: {
    fontSize: theme.theme.typography.fontSize.xs,
    color: theme.colors.mutedForeground,
    fontFamily: theme.theme.typography.fontFamily.sans,
    marginTop: theme.theme.spacing.xs,
  },
  section: {
    paddingHorizontal: theme.theme.spacing.lg,
    marginTop: theme.theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.theme.typography.fontSize.xl,
    fontFamily: theme.theme.typography.fontFamily.sansSemiBold,
    color: theme.colors.foreground,
    marginBottom: theme.theme.spacing.md,
  },
  cardsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
    gap: theme.theme.spacing.sm,
  },
  cardWrapper: {
    width: '47%',
    marginBottom: theme.theme.spacing.md,
    alignItems: 'center',
  },
  cardInfo: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    paddingHorizontal: theme.theme.spacing.xs,
    paddingTop: theme.theme.spacing.xs,
  },
  cardLevel: {
    fontSize: theme.theme.typography.fontSize.xs,
    color: theme.colors.primary,
    fontFamily: theme.theme.typography.fontFamily.sansMedium,
  },
  cardXP: {
    fontSize: theme.theme.typography.fontSize.xs,
    color: theme.colors.mutedForeground,
    fontFamily: theme.theme.typography.fontFamily.sans,
  },
});