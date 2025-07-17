import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { GameTheme } from '../styles';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { Typography, Heading } from '../components/ui/Typography';
import { supabase } from '../services/supabase';
import { PlayerCard } from '../components/PlayerCard';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

type DeckBuilderScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DeckBuilder'>;
type DeckBuilderScreenRouteProp = RouteProp<RootStackParamList, 'DeckBuilder'>;

const getPositionColor = (position: string) => {
  switch (position) {
    case 'gardien': return GameTheme.colors.goalkeeper;
    case 'defenseur': return GameTheme.colors.defender;
    case 'milieu': return GameTheme.colors.midfielder;
    case 'attaquant': return GameTheme.colors.attacker;
    default: return GameTheme.colors.textMuted;
  }
};

export default function DeckBuilderScreen() {
  const navigation = useNavigation<DeckBuilderScreenNavigationProp>();
  const route = useRoute<DeckBuilderScreenRouteProp>();
  const { profile } = useAuth();
  const styles = useThemedStyles(createStyles);
  
  const [deckName, setDeckName] = useState('');
  const [deckCards, setDeckCards] = useState<any[]>([]);
  const [availableCards, setAvailableCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger toutes les cartes du joueur avec niveau et XP
      const { data: userCards, error: cardsError } = await supabase
        .from('user_players')
        .select(`
          *,
          player:players(*)
        `)
        .eq('user_id', profile?.id);

      if (cardsError) throw cardsError;

      // Mapper les données pour inclure niveau et XP
      const cardsWithLevel = userCards?.map(uc => ({
        ...uc.player,
        user_player_id: uc.id,
        level: uc.level || 1,
        xp: uc.xp || 0,
        total_xp: uc.total_xp || 0
      })) || [];

      // Si on édite un deck existant, le charger
      if (route.params?.mode === 'edit' && route.params?.deckId) {
        const { data: deckData, error: deckError } = await supabase
          .from('saved_decks')
          .select('*')
          .eq('id', route.params.deckId)
          .single();

        if (deckError) throw deckError;

        setDeckName(deckData.name);
        
        // Filtrer les cartes du deck et les cartes disponibles
        const deckCardIds = deckData.cards as string[];
        const deckCardsData = cardsWithLevel.filter(card => 
          deckCardIds.includes(card.id)
        );
        
        const availableCardsData = cardsWithLevel.filter(card => 
          !deckCardIds.includes(card.id)
        );
        
        setDeckCards(deckCardsData);
        setAvailableCards(availableCardsData);
      } else {
        // Nouveau deck - toutes les cartes sont disponibles
        setAvailableCards(cardsWithLevel);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const handleAddCard = (card: any) => {
    if (deckCards.length >= 8) {
      Alert.alert('Limite atteinte', 'Le deck est complet (8 cartes maximum)');
      return;
    }

    // Vérifier qu'il n'y a qu'un seul gardien
    if (card.position === 'gardien' && deckCards.some(c => c.position === 'gardien')) {
      Alert.alert('Limite atteinte', 'Un seul gardien par deck');
      return;
    }

    setDeckCards([...deckCards, card]);
    setAvailableCards(availableCards.filter(c => c.id !== card.id));
  };

  const handleRemoveCard = (card: any) => {
    setDeckCards(deckCards.filter(c => c.id !== card.id));
    setAvailableCards([...availableCards, card].sort((a, b) => {
      const positionOrder = { 'gardien': 0, 'defenseur': 1, 'milieu': 2, 'attaquant': 3 };
      return positionOrder[a.position] - positionOrder[b.position];
    }));
  };

  const handleSave = async () => {
    if (!deckName.trim()) {
      Alert.alert('Erreur', 'Veuillez donner un nom au deck');
      return;
    }
    
    if (deckCards.length !== 8) {
      Alert.alert('Erreur', 'Un deck doit contenir exactement 8 joueurs');
      return;
    }
    
    // Vérifier qu'il y a exactement 1 gardien
    const gardienCount = deckCards.filter(c => c.position === 'gardien').length;
    if (gardienCount !== 1) {
      Alert.alert('Erreur', 'Il faut exactement 1 gardien');
      return;
    }
    
    setSaving(true);
    
    try {
      const deckData = {
        name: deckName,
        cards: deckCards.map(c => c.id),
        total_cp: deckCards.reduce((sum, card) => sum + card.cp_cost, 0),
        user_id: profile?.id,
        is_valid: true,
      };
      
      if (route.params?.mode === 'edit' && route.params?.deckId) {
        // Mise à jour du deck existant
        const { error } = await supabase
          .from('saved_decks')
          .update(deckData)
          .eq('id', route.params.deckId);
          
        if (error) throw error;
        Alert.alert('Succès', 'Deck modifié avec succès');
      } else {
        // Création d'un nouveau deck
        const { error } = await supabase
          .from('saved_decks')
          .insert([deckData]);
          
        if (error) throw error;
        Alert.alert('Succès', 'Deck créé avec succès');
      }
      
      navigation.goBack();
    } catch (error: any) {
      console.error('Error saving deck:', error);
      Alert.alert('Erreur', error.message || 'Impossible de sauvegarder le deck');
    } finally {
      setSaving(false);
    }
  };

  const renderAvailableCard = ({ item }: { item: any }) => {
    const isFiltered = selectedPosition && item.position !== selectedPosition;
    
    return (
      <TouchableOpacity
        onPress={() => handleAddCard(item)}
        style={[styles.cardWrapper, isFiltered && styles.cardFiltered]}
        disabled={isFiltered}
      >
        <PlayerCard
          player={item}
          size="sm"
          showStats={true}
          showLevel={true}
          level={item.level}
          xp={item.xp}
        />
      </TouchableOpacity>
    );
  };

  const renderDeckCard = (card: any, index: number) => {
    return (
      <TouchableOpacity
        key={card.id}
        onPress={() => handleRemoveCard(card)}
        style={styles.deckCardItem}
      >
        <View style={[styles.positionIndicator, { backgroundColor: getPositionColor(card.position) }]} />
        <Text style={styles.deckCardName} numberOfLines={1}>{card.name}</Text>
        <View style={styles.deckCardStats}>
          <Text style={styles.deckCardStat}>{card.shot}/{card.dribble}/{card.pass}/{card.block}</Text>
          <Text style={styles.deckCardLevel}>Niv.{card.level}</Text>
        </View>
        <Icon name="close" size={16} color={GameTheme.colors.textMuted} />
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

  const totalCP = deckCards.reduce((sum, card) => sum + card.cp_cost, 0);
  const positions = ['gardien', 'defenseur', 'milieu', 'attaquant'];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={GameTheme.colors.text} />
        </TouchableOpacity>
        <TextInput
          style={styles.deckNameInput}
          placeholder="Nom du deck"
          placeholderTextColor={GameTheme.colors.textMuted}
          value={deckName}
          onChangeText={setDeckName}
        />
        <Button
          title="Sauver"
          variant="default"
          size="sm"
          onPress={handleSave}
          loading={saving}
          disabled={saving || deckCards.length !== 8}
        />
      </View>

      {/* Main content */}
      <View style={styles.content}>
        {/* Deck zone */}
        <View style={styles.deckZone}>
          <View style={styles.deckHeader}>
            <Typography variant="h3">Composition ({deckCards.length}/8)</Typography>
            <Typography variant="body" color={GameTheme.colors.primary}>{totalCP} CP</Typography>
          </View>
          
          <ScrollView style={styles.deckScrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.deckList}>
              {deckCards.length === 0 ? (
                <View style={styles.emptyDeck}>
                  <Typography variant="body" color={GameTheme.colors.textMuted}>
                    Touchez les cartes ci-dessous pour les ajouter
                  </Typography>
                </View>
              ) : (
                deckCards.map((card, index) => renderDeckCard(card, index))
              )}
              {/* Empty slots */}
              {[...Array(Math.max(0, 8 - deckCards.length))].map((_, index) => (
                <View key={`empty-${index}`} style={styles.emptySlot}>
                  <Typography variant="caption" color={GameTheme.colors.textMuted}>
                    Slot {deckCards.length + index + 1}
                  </Typography>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Position filter */}
        <View style={styles.positionFilter}>
          <TouchableOpacity
            style={[styles.filterButton, !selectedPosition && styles.filterButtonActive]}
            onPress={() => setSelectedPosition(null)}
          >
            <Typography variant="caption" color={!selectedPosition ? GameTheme.colors.textOnPrimary : GameTheme.colors.text}>
              Tous
            </Typography>
          </TouchableOpacity>
          {positions.map(position => (
            <TouchableOpacity
              key={position}
              style={[
                styles.filterButton,
                selectedPosition === position && styles.filterButtonActive,
                { borderColor: getPositionColor(position) }
              ]}
              onPress={() => setSelectedPosition(position)}
            >
              <Typography 
                variant="caption" 
                color={selectedPosition === position ? GameTheme.colors.textOnPrimary : GameTheme.colors.text}
              >
                {position.slice(0, 3).toUpperCase()}
              </Typography>
            </TouchableOpacity>
          ))}
        </View>

        {/* Available cards */}
        <View style={styles.availableZone}>
          <Typography variant="h4" style={styles.availableTitle}>
            Cartes disponibles ({availableCards.filter(c => !selectedPosition || c.position === selectedPosition).length})
          </Typography>
          <FlatList
            data={availableCards}
            renderItem={renderAvailableCard}
            keyExtractor={item => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.cardsList}
          />
        </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.theme.spacing.xl,
    paddingHorizontal: theme.theme.spacing.lg,
    paddingBottom: theme.theme.spacing.md,
    gap: theme.theme.spacing.md,
  },
  backButton: {
    padding: theme.theme.spacing.sm,
  },
  deckNameInput: {
    flex: 1,
    height: 40,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.theme.borderRadius.md,
    paddingHorizontal: theme.theme.spacing.md,
    fontSize: theme.theme.typography.fontSize.base,
    color: theme.colors.text,
    fontFamily: theme.theme.fonts.body,
  },
  content: {
    flex: 1,
    gap: theme.theme.spacing.md,
  },
  deckZone: {
    backgroundColor: theme.colors.card,
    marginHorizontal: theme.theme.spacing.lg,
    borderRadius: theme.theme.borderRadius.lg,
    padding: theme.theme.spacing.md,
    height: 320,
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.theme.spacing.sm,
  },
  deckScrollView: {
    flex: 1,
  },
  deckList: {
    gap: 4,
  },
  deckCardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.theme.borderRadius.sm,
    padding: theme.theme.spacing.sm,
    gap: theme.theme.spacing.xs,
  },
  positionIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
  },
  deckCardName: {
    flex: 1,
    fontSize: theme.theme.typography.fontSize.sm,
    color: theme.colors.text,
    fontFamily: theme.theme.fonts.body,
  },
  deckCardStats: {
    flexDirection: 'row',
    gap: theme.theme.spacing.sm,
  },
  deckCardStat: {
    fontSize: theme.theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    fontFamily: theme.theme.fonts.mono,
  },
  deckCardLevel: {
    fontSize: theme.theme.typography.fontSize.xs,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  emptyDeck: {
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySlot: {
    height: 32,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
  },
  extraSlot: {
    backgroundColor: theme.colors.surface + '50',
    borderColor: theme.colors.warning,
  },
  positionFilter: {
    flexDirection: 'row',
    paddingHorizontal: theme.theme.spacing.lg,
    gap: theme.theme.spacing.xs,
  },
  filterButton: {
    paddingHorizontal: theme.theme.spacing.md,
    paddingVertical: theme.theme.spacing.xs,
    borderRadius: theme.theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  availableZone: {
    flex: 1,
    paddingLeft: theme.theme.spacing.lg,
  },
  availableTitle: {
    marginBottom: theme.theme.spacing.sm,
    color: theme.colors.text,
  },
  cardsList: {
    paddingRight: theme.theme.spacing.lg,
    gap: theme.theme.spacing.sm,
  },
  cardWrapper: {
    marginRight: theme.theme.spacing.sm,
  },
  cardFiltered: {
    opacity: 0.3,
  },
});