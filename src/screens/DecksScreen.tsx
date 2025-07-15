import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Dimensions,
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

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 48) / 4; // 4 cartes par ligne avec padding

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

export default function DecksScreen() {
  const navigation = useNavigation<DecksScreenNavigationProp>();
  const { profile } = useAuth();
  const styles = useThemedStyles(createStyles);
  
  const [decks, setDecks] = useState<DeckWithCards[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Animation de transition
  const { animatedStyle } = useScreenTransition('fade', {
    duration: 300,
  });
  
  // Animation pour les cartes du deck sélectionné
  const { getItemStyle: getCardStyle } = useStaggerAnimation(8, {
    staggerDelay: 50,
    itemDuration: 200,
  });

  useEffect(() => {
    loadDecks();
  }, []);

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
          const { data: cardDetails, error: cardsError } = await supabase
            .from('players')
            .select('*')
            .in('id', deck.cards);

          if (cardsError) {
            console.error('Error loading cards for deck:', cardsError);
            return { ...deck, cardDetails: [] };
          }

          // Trier les cartes par position
          const sortedCards = (cardDetails || []).sort((a, b) => {
            const positionOrder = { 'gardien': 0, 'defenseur': 1, 'milieu': 2, 'attaquant': 3 };
            return positionOrder[a.position] - positionOrder[b.position];
          });

          return { ...deck, cardDetails: sortedCards };
        })
      );

      setDecks(decksWithCards);
      
      // Sélectionner le premier deck favori par défaut
      const favoriteDeck = decksWithCards.find(d => d.is_favorite);
      if (favoriteDeck && !selectedDeck) {
        setSelectedDeck(favoriteDeck.id);
      }
      
    } catch (error) {
      console.error('Error loading decks:', error);
      Alert.alert('Erreur', 'Impossible de charger les decks');
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    const isSelected = selectedDeck === item.id;
    
    return (
      <TouchableOpacity
        onPress={() => setSelectedDeck(item.id)}
        style={[styles.deckCard, isSelected && styles.selectedDeckCard]}
      >
        <AnimatedCard variant="tilt" autoAnimate={false}>
          <Card variant={isSelected ? 'elevated' : 'default'} glow={isSelected} style={styles.deckCardContent}>
          <View style={styles.deckHeader}>
            <View style={styles.deckInfo}>
              <Typography variant="h3" color={GameTheme.colors.text}>{item.name}</Typography>
              <Typography variant="caption" color={GameTheme.colors.textMuted}>
                {item.cards.length} cartes • {item.total_cp} CP
              </Typography>
            </View>
            <TouchableOpacity
              onPress={() => handleToggleFavorite(item.id, item.is_favorite)}
              style={styles.favoriteButton}
            >
              <Icon 
                name={item.is_favorite ? 'star' : 'star'} 
                size={24} 
                color={item.is_favorite ? '#FFD700' : '#999'} 
              />
            </TouchableOpacity>
          </View>
          
          {/* Mini preview des cartes */}
          <View style={styles.miniCardsContainer}>
            {item.cardDetails.slice(0, 4).map((card, index) => (
              <View key={card.id} style={styles.miniCard}>
                <Typography variant="caption" style={styles.miniCardName}>{card.name.split(' ')[0]}</Typography>
                <Typography variant="caption" style={styles.miniCardPosition}>{card.position.slice(0, 3).toUpperCase()}</Typography>
              </View>
            ))}
            {item.cardDetails.length > 4 && (
              <View style={styles.miniCard}>
                <Typography variant="caption" style={styles.moreCards}>+{item.cardDetails.length - 4}</Typography>
              </View>
            )}
          </View>
          
          <View style={styles.deckActions}>
            <Button
              title="Modifier"
              variant="ghost"
              size="sm"
              onPress={() => handleEditDeck(item.id)}
              style={styles.actionButton}
            />
            {decks.length > 1 && (
              <Button
                title="Supprimer"
                variant="ghost"
                size="sm"
                onPress={() => handleDeleteDeck(item.id)}
                style={[styles.actionButton, styles.deleteButton]}
              />
            )}
          </View>
          </Card>
        </AnimatedCard>
      </TouchableOpacity>
    );
  };

  const renderSelectedDeckCards = () => {
    const deck = decks.find(d => d.id === selectedDeck);
    if (!deck) return null;

    return (
      <View style={styles.cardsGrid}>
        {deck.cardDetails.map((card, index) => (
          <Animated.View key={card.id} style={[styles.cardContainer, getCardStyle(index)]}>
            <PlayerCard
              player={card}
              size="sm"
              showStats={false}
            />
          </Animated.View>
        ))}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={styles.primaryColor.color} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Animated.View style={animatedStyle}>
        <TransitionWrapper type="fade">
          <View style={styles.header}>
            <Heading level={1} shadow="depth">Mes Decks</Heading>
        <Button
          title="Nouveau deck"
          variant="default"
          size="md"
          onPress={handleCreateDeck}
          icon={<Icon name="plus" size={20} color="#FFFFFF" />}
        />
          </View>
        </TransitionWrapper>

        {/* Liste des decks */}
        <TransitionWrapper type="slide" delay={100}>
          <FlatList
        data={decks}
        renderItem={renderDeckCard}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.decksList}
        onRefresh={loadDecks}
        refreshing={refreshing}
          />
        </TransitionWrapper>

        {/* Cartes du deck sélectionné */}
        {selectedDeck && (
        <View style={styles.selectedDeckSection}>
          <Heading level={2}>Composition du deck</Heading>
          {renderSelectedDeckCards()}
        </View>
      )}

        {/* Bouton flottant pour créer un deck */}
        {decks.length === 0 && (
        <View style={styles.emptyState}>
          <Icon name="cards" size={64} color={styles.mutedColor.color} />
          <Typography variant="h2" color={GameTheme.colors.textMuted}>Aucun deck créé</Typography>
          <BodyText color={GameTheme.colors.textSecondary}>
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
        )}
      </Animated.View>
    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof import('../contexts/ThemeContext').useTheme>) => ({
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
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: theme.theme.spacing.lg,
  },
  title: {
    fontSize: theme.theme.typography.fontSize.xxl,
    fontWeight: '700' as const,
    color: theme.colors.text,
  },
  decksList: {
    paddingHorizontal: theme.theme.spacing.lg,
    paddingBottom: theme.theme.spacing.lg,
  },
  deckCard: {
    marginRight: theme.theme.spacing.md,
    width: 280,
  },
  selectedDeckCard: {
    transform: [{ scale: 1.02 }],
  },
  deckCardContent: {
    padding: theme.theme.spacing.lg,
  },
  deckHeader: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'flex-start' as const,
    marginBottom: theme.theme.spacing.md,
  },
  deckInfo: {
    flex: 1,
  },
  deckName: {
    fontSize: theme.theme.typography.fontSize.lg,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.theme.spacing.xs,
  },
  deckStats: {
    fontSize: theme.theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  favoriteButton: {
    padding: theme.theme.spacing.xs,
  },
  miniCardsContainer: {
    flexDirection: 'row' as const,
    gap: theme.theme.spacing.xs,
    marginBottom: theme.theme.spacing.md,
  },
  miniCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.theme.borderRadius.sm,
    padding: theme.theme.spacing.xs,
    alignItems: 'center' as const,
    minWidth: 50,
  },
  miniCardName: {
    fontSize: 10,
    fontWeight: '500' as const,
    color: theme.colors.text,
  },
  miniCardPosition: {
    fontSize: 8,
    color: theme.colors.textMuted,
  },
  moreCards: {
    fontSize: theme.theme.typography.fontSize.sm,
    fontWeight: '500' as const,
    color: theme.colors.textMuted,
  },
  deckActions: {
    flexDirection: 'row' as const,
    gap: theme.theme.spacing.sm,
  },
  actionButton: {
    flex: 1,
  },
  deleteButton: {
    borderColor: theme.colors.danger,
  },
  selectedDeckSection: {
    padding: theme.theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.theme.typography.fontSize.xl,
    fontWeight: '600' as const,
    color: theme.colors.text,
    marginBottom: theme.theme.spacing.lg,
  },
  cardsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: theme.theme.spacing.md,
  },
  cardContainer: {
    width: cardWidth,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    padding: theme.theme.spacing.xxl,
  },
  emptyTitle: {
    marginTop: theme.theme.spacing.lg,
    marginBottom: theme.theme.spacing.sm,
  },
  emptyText: {
    textAlign: 'center' as const,
    marginBottom: theme.theme.spacing.xl,
  },
  createFirstButton: {
    minWidth: 200,
  },
  primaryColor: {
    color: theme.colors.primary,
  },
  mutedColor: {
    color: theme.colors.textMuted,
  },
});