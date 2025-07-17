import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { GameTheme } from '../styles';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { Typography, Heading, BodyText } from '../components/ui/Typography';
import { AnimatedCard, Badge } from '../components/ui';
import { supabase } from '../services/supabase';
import { PlayerCard } from '../components/PlayerCard';
import { useScreenTransition, useStaggerAnimation } from '../navigation/transitions/TransitionHooks';
import { TransitionWrapper } from '../navigation/transitions/CustomTransitions';
import { Animated } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type DecksScreenNavigationProp = StackNavigationProp<MainTabParamList, 'Decks'>;

interface SavedDeck {
  id: string;
  name: string;
  cards: string[];
  total_cp: number;
  is_valid: boolean;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

interface DeckWithCards extends SavedDeck {
  cardDetails: any[];
}

const getPositionColor = (position: string) => {
  switch (position) {
    case 'gardien': return GameTheme.colors.goalkeeper;
    case 'defenseur': return GameTheme.colors.defender;
    case 'milieu': return GameTheme.colors.midfielder;
    case 'attaquant': return GameTheme.colors.attacker;
    default: return GameTheme.colors.textMuted;
  }
};

export default function DecksScreen() {
  const navigation = useNavigation<DecksScreenNavigationProp>();
  const { profile } = useAuth();
  const styles = useThemedStyles(createStyles);
  
  const [decks, setDecks] = useState<DeckWithCards[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDeckIndex, setCurrentDeckIndex] = useState(0);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Animation de transition
  const { animatedStyle } = useScreenTransition('fade', {
    duration: 300,
  });

  useEffect(() => {
    loadDecks();
  }, []);

  useEffect(() => {
    // Recharger les decks quand on revient sur cet écran
    const unsubscribe = navigation.addListener('focus', () => {
      loadDecks();
    });

    return unsubscribe;
  }, [navigation]);

  const loadDecks = async () => {
    try {
      setLoading(true);
      
      // Charger les decks de l'utilisateur
      const { data: deckData, error: deckError } = await supabase
        .from('saved_decks')
        .select('*')
        .eq('user_id', profile?.id)
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false });

      if (deckError) throw deckError;

      // Pour chaque deck, charger les détails des cartes
      const decksWithCards = await Promise.all(
        (deckData || []).map(async (deck) => {
          // Récupérer les détails des cartes avec niveau et XP
          const { data: userCards, error: cardsError } = await supabase
            .from('user_players')
            .select(`
              *,
              player:players(*)
            `)
            .eq('user_id', profile?.id)
            .in('player_id', deck.cards);

          if (cardsError) {
            console.error('Error loading cards for deck:', cardsError);
            return { ...deck, cardDetails: [] };
          }

          // Mapper les données et trier par position
          const cardDetails = (userCards || []).map(uc => ({
            ...uc.player,
            level: uc.level || 1,
            xp: uc.xp || 0,
            total_xp: uc.total_xp || 0
          }));

          const sortedCards = cardDetails.sort((a, b) => {
            const positionOrder = { 'gardien': 0, 'defenseur': 1, 'milieu': 2, 'attaquant': 3 };
            return positionOrder[a.position] - positionOrder[b.position];
          });

          return { ...deck, cardDetails: sortedCards };
        })
      );

      setDecks(decksWithCards);
      
    } catch (error) {
      console.error('Error loading decks:', error);
      Alert.alert('Erreur', 'Impossible de charger les decks');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDeck = () => {
    navigation.navigate('DeckBuilder' as any, { mode: 'create' });
  };

  const handleEditDeck = (deckId: string) => {
    navigation.navigate('DeckBuilder' as any, { mode: 'edit', deckId });
  };

  const handleDeleteDeck = async (deckId: string) => {
    Alert.alert(
      'Supprimer le deck',
      'Êtes-vous sûr de vouloir supprimer ce deck ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('saved_decks')
                .delete()
                .eq('id', deckId);

              if (error) throw error;
              
              await loadDecks();
              Alert.alert('Succès', 'Deck supprimé');
            } catch (error) {
              console.error('Error deleting deck:', error);
              Alert.alert('Erreur', 'Impossible de supprimer le deck');
            }
          },
        },
      ]
    );
  };

  const handleToggleFavorite = async (deckId: string, currentFavorite: boolean) => {
    try {
      const { error } = await supabase
        .from('saved_decks')
        .update({ is_favorite: !currentFavorite })
        .eq('id', deckId);

      if (error) throw error;
      
      await loadDecks();
    } catch (error) {
      console.error('Error toggling favorite:', error);
      Alert.alert('Erreur', 'Impossible de modifier le favori');
    }
  };


  const renderDeckCard = ({ item, index }: { item: DeckWithCards; index: number }) => {
    return (
      <TouchableOpacity
        onPress={() => handleEditDeck(item.id)}
        style={styles.deckCard}
      >
        <Card variant="elevated" style={styles.deckCardContent}>
            <View style={styles.deckCardHeader}>
              <View style={styles.deckInfo}>
                <Typography variant="h3" numberOfLines={1}>{item.name}</Typography>
                <Typography variant="caption" color={GameTheme.colors.textMuted}>
                  {item.cards.length} cartes • {item.total_cp} CP
                </Typography>
              </View>
            </View>
            
            {/* Players list */}
            <View style={styles.playersList}>
              {/* Header */}
              <View style={[styles.playerRow, styles.headerRow]}>
                <View style={[styles.positionIndicator, { backgroundColor: 'transparent' }]} />
                <Typography variant="caption" style={[styles.playerName, styles.headerText]}>
                  Joueur
                </Typography>
                <View style={styles.playerStats}>
                  <Typography variant="caption" style={[styles.statText, styles.headerText]}>
                    T/D/P/B
                  </Typography>
                  <Typography variant="caption" style={[styles.levelText, styles.headerText]}>
                    NIV
                  </Typography>
                  <Typography variant="caption" style={[styles.xpText, styles.headerText]}>
                    XP
                  </Typography>
                </View>
              </View>
              {item.cardDetails.slice(0, 8).map((player, index) => (
                <View key={player.id} style={styles.playerRow}>
                  <View style={[styles.positionIndicator, { backgroundColor: getPositionColor(player.position) }]} />
                  <Typography variant="caption" style={styles.playerName} numberOfLines={1}>
                    {player.name}
                  </Typography>
                  <View style={styles.playerStats}>
                    <Typography variant="caption" style={styles.statText}>
                      {player.shot}/{player.dribble}/{player.pass}/{player.block}
                    </Typography>
                    <Typography variant="caption" style={styles.levelText}>
                      {player.level}
                    </Typography>
                    <Typography variant="caption" style={styles.xpText}>
                      {player.xp}
                    </Typography>
                  </View>
                </View>
              ))}
            </View>
            
            {/* Actions buttons */}
            <View style={styles.cardActions}>
              <Button
                title="Modifier"
                variant="default"
                size="sm"
                onPress={() => handleEditDeck(item.id)}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
      </TouchableOpacity>
    );
  };


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={GameTheme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, animatedStyle]}>
        {/* Header fixe */}
        <View style={styles.header}>
          <Heading level={1}>Mes Decks</Heading>
          <Button
            title="Nouveau"
            variant="default"
            size="sm"
            onPress={handleCreateDeck}
            icon={<Icon name="plus" size={16} color="#FFFFFF" />}
          />
        </View>

        {/* Liste des decks ou état vide */}
        {decks.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="cards" size={64} color={GameTheme.colors.textMuted} />
            <Typography variant="h2" color={GameTheme.colors.textMuted} style={styles.emptyTitle}>
              Aucun deck créé
            </Typography>
            <BodyText color={GameTheme.colors.textSecondary} style={styles.emptyText}>
              Créez votre premier deck pour commencer à jouer
            </BodyText>
            <Button
              title="Créer mon premier deck"
              variant="default"
              size="lg"
              onPress={handleCreateDeck}
              style={styles.createFirstButton}
            />
          </View>
        ) : (
          <ScrollView 
            ref={scrollViewRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.decksScrollView}
            contentContainerStyle={styles.decksScrollContent}
            onScroll={(event) => {
              const offsetX = event.nativeEvent.contentOffset.x;
              const index = Math.round(offsetX / screenWidth);
              setCurrentDeckIndex(index);
            }}
            scrollEventThrottle={16}
          >
            {decks.map((deck, index) => (
              <View key={deck.id} style={styles.deckWrapper}>
                {renderDeckCard({ item: deck, index })}
              </View>
            ))}
          </ScrollView>
        )}

        {/* Indicateur de pagination */}
        {decks.length > 1 && (
          <View style={styles.paginationContainer}>
            {decks.map((_, index) => (
              <View 
                key={index}
                style={[
                  styles.paginationDot,
                  index === currentDeckIndex && styles.paginationDotActive
                ]}
              />
            ))}
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof import('../contexts/ThemeContext').useTheme>) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: theme.theme.spacing.xxxl * 2,
    paddingHorizontal: theme.theme.spacing.lg,
    paddingBottom: theme.theme.spacing.md,
  },
  decksScrollView: {
    flex: 1,
  },
  decksScrollContent: {
  },
  deckWrapper: {
    width: screenWidth,
    paddingHorizontal: theme.theme.spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deckCard: {
    width: '100%',
    maxWidth: 320,
  },
  deckCardContent: {
    padding: theme.theme.spacing.lg,
  },
  deckCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.theme.spacing.lg,
  },
  deckInfo: {
    flex: 1,
    marginRight: theme.theme.spacing.md,
  },
  playersList: {
    gap: 2,
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    gap: theme.theme.spacing.xs,
  },
  positionIndicator: {
    width: 4,
    height: 16,
    borderRadius: 2,
  },
  playerName: {
    flex: 1,
    fontSize: 11,
    color: theme.colors.text,
  },
  playerStats: {
    flexDirection: 'row',
    gap: theme.theme.spacing.xs,
  },
  statText: {
    fontSize: 10,
    color: theme.colors.textMuted,
    fontFamily: theme.theme.fonts.mono,
    minWidth: 45,
  },
  levelText: {
    fontSize: 10,
    color: theme.colors.primary,
    fontWeight: 'bold',
    minWidth: 20,
    textAlign: 'center',
  },
  xpText: {
    fontSize: 10,
    color: theme.colors.accent,
    minWidth: 25,
    textAlign: 'right',
  },
  headerText: {
    fontWeight: 'bold',
    color: theme.colors.textSecondary,
    textTransform: 'uppercase',
    fontSize: 9,
  },
  headerRow: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: 2,
    paddingBottom: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: theme.theme.spacing.sm,
    marginTop: theme.theme.spacing.md,
  },
  paginationContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.theme.spacing.lg,
    gap: theme.theme.spacing.xs,
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.textMuted,
    opacity: 0.3,
  },
  paginationDotActive: {
    opacity: 1,
    backgroundColor: theme.colors.primary,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.theme.spacing.xxl,
  },
  emptyTitle: {
    marginTop: theme.theme.spacing.lg,
    marginBottom: theme.theme.spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    marginBottom: theme.theme.spacing.xl,
  },
  createFirstButton: {
    minWidth: 200,
  },
});