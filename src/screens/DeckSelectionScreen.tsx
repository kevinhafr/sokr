import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { useMatchmaking } from '../hooks/useMatchmaking';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { supabase } from '../services/supabase';

type DeckSelectionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DeckSelection'>;
type DeckSelectionScreenRouteProp = RouteProp<RootStackParamList, 'DeckSelection'>;

interface SavedDeck {
  id: string;
  name: string;
  cards: string[];
  total_cp: number;
  is_valid: boolean;
  is_favorite: boolean;
}

export default function DeckSelectionScreen() {
  const navigation = useNavigation<DeckSelectionScreenNavigationProp>();
  const route = useRoute<DeckSelectionScreenRouteProp>();
  const { profile } = useAuth();
  const { findMatch } = useMatchmaking();
  const styles = useThemedStyles(createStyles);
  
  const [decks, setDecks] = useState<SavedDeck[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [launching, setLaunching] = useState(false);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('saved_decks')
        .select('*')
        .eq('user_id', profile?.id)
        .eq('is_valid', true)
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;

      setDecks(data || []);
      
      // Sélectionner automatiquement le premier deck favori ou le premier deck
      if (data && data.length > 0) {
        const favoriteDeck = data.find(d => d.is_favorite);
        setSelectedDeck(favoriteDeck?.id || data[0].id);
      }
      
    } catch (error) {
      console.error('Error loading decks:', error);
      Alert.alert('Erreur', 'Impossible de charger les decks');
    } finally {
      setLoading(false);
    }
  };

  const handleLaunchGame = async () => {
    if (!selectedDeck) {
      Alert.alert('Erreur', 'Veuillez sélectionner un deck');
      return;
    }

    setLaunching(true);
    
    try {
      await findMatch(route.params.mode === 'quick' ? 'quick' : 'draft', selectedDeck);
    } catch (error: any) {
      console.error('Error launching game:', error);
      Alert.alert('Erreur', error.message || 'Impossible de lancer la partie');
      setLaunching(false);
    }
  };

  const renderDeck = (deck: SavedDeck) => {
    const isSelected = selectedDeck === deck.id;
    
    return (
      <TouchableOpacity
        key={deck.id}
        onPress={() => setSelectedDeck(deck.id)}
        style={styles.deckItem}
      >
        <Card 
          variant={isSelected ? 'default' : 'outlined'} 
          style={[styles.deckCard, isSelected && styles.selectedDeckCard]}
        >
          <View style={styles.deckHeader}>
            <View style={styles.deckInfo}>
              <Text style={styles.deckName}>{deck.name}</Text>
              <Text style={styles.deckStats}>
                {deck.cards.length} cartes • {deck.total_cp} CP
              </Text>
            </View>
            <View style={styles.deckIcons}>
              {deck.is_favorite && (
                <Icon name="star" size={20} color="#FFD700" />
              )}
              {isSelected && (
                <Icon name="check" size={20} color={styles.primaryColor.color} />
              )}
            </View>
          </View>
        </Card>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={styles.primaryColor.color} />
      </View>
    );
  }

  if (decks.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Icon name="cards" size={64} color={styles.mutedColor.color} />
        <Text style={styles.emptyTitle}>Aucun deck disponible</Text>
        <Text style={styles.emptyText}>
          Vous devez créer un deck avant de pouvoir jouer
        </Text>
        <Button
          title="Créer un deck"
          variant="default"
          size="large"
          onPress={() => navigation.navigate('DeckBuilder', { mode: 'create' })}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>Choisissez votre deck</Text>
          <Text style={styles.subtitle}>
            {route.params.mode === 'quick' ? 'Partie rapide' : 'Partie classée'}
          </Text>
        </View>

        <View style={styles.decksList}>
          {decks.map(renderDeck)}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title="Annuler"
          variant="ghost"
          size="large"
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
        />
        <Button
          title="Lancer la partie"
          variant="default"
          size="large"
          onPress={handleLaunchGame}
          disabled={!selectedDeck || launching}
          style={styles.launchButton}
        />
      </View>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof import('../hooks/useThemedStyles').useTheme>) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.theme.spacing.xxl,
    backgroundColor: theme.colors.background,
  },
  emptyTitle: {
    fontSize: theme.theme.typography.fontSize.xl,
    fontFamily: theme.theme.fonts.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginTop: theme.theme.spacing.lg,
    marginBottom: theme.theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.theme.typography.fontSize.base,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.theme.spacing.xl,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: theme.theme.spacing.lg,
    alignItems: 'center',
  },
  title: {
    fontSize: theme.theme.typography.fontSize.xxl,
    fontFamily: theme.theme.fonts.heading,
    color: theme.colors.text,
    marginBottom: theme.theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.theme.typography.fontSize.base,
    color: theme.colors.textMuted,
  },
  decksList: {
    padding: theme.theme.spacing.lg,
    gap: theme.theme.spacing.md,
  },
  deckItem: {
    marginBottom: theme.theme.spacing.md,
  },
  deckCard: {
    padding: theme.theme.spacing.lg,
  },
  selectedDeckCard: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deckInfo: {
    flex: 1,
  },
  deckName: {
    fontSize: theme.theme.typography.fontSize.lg,
    fontFamily: theme.theme.fonts.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.theme.spacing.xs,
  },
  deckStats: {
    fontSize: theme.theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
  },
  deckIcons: {
    flexDirection: 'row',
    gap: theme.theme.spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    padding: theme.theme.spacing.lg,
    gap: theme.theme.spacing.md,
    backgroundColor: theme.colors.background,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  cancelButton: {
    flex: 1,
  },
  launchButton: {
    flex: 2,
  },
  primaryColor: {
    color: theme.colors.primary,
  },
  mutedColor: {
    color: theme.colors.textMuted,
  },
});