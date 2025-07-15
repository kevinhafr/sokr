import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  PanResponder,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { GameTheme, ComponentStyles } from '../styles';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Icon } from '../components/ui/Icon';
import { Typography, Heading } from '../components/ui/Typography';
import { supabase } from '../services/supabase';
import { PlayerCard } from '../components/PlayerCard';

const { width: screenWidth } = Dimensions.get('window');
const cardWidth = (screenWidth - 60) / 4;

type DeckBuilderScreenNavigationProp = StackNavigationProp<RootStackParamList, 'DeckBuilder'>;
type DeckBuilderScreenRouteProp = RouteProp<RootStackParamList, 'DeckBuilder'>;

interface DraggableCard {
  id: string;
  player: any;
  position: { x: number; y: number };
}

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
  const [draggedCard, setDraggedCard] = useState<string | null>(null);
  const [formation, setFormation] = useState<'2-3-2' | '3-2-2' | '2-2-3'>('2-3-2');
  
  const panResponders = useRef<Map<string, any>>(new Map());
  const animatedValues = useRef<Map<string, Animated.ValueXY>>(new Map());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger toutes les cartes du joueur
      const { data: userCards, error: cardsError } = await supabase
        .from('user_players')
        .select(`
          *,
          player:players(*)
        `)
        .eq('user_id', profile?.id);

      if (cardsError) throw cardsError;

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
        const deckCardsData = userCards?.filter(uc => 
          deckCardIds.includes(uc.player_id)
        ).map(uc => uc.player) || [];
        
        const availableCardsData = userCards?.filter(uc => 
          !deckCardIds.includes(uc.player_id)
        ).map(uc => uc.player) || [];
        
        setDeckCards(deckCardsData);
        setAvailableCards(availableCardsData);
        
        // Déterminer la formation basée sur les cartes
        const defCount = deckCardsData.filter(c => c.position === 'defenseur').length;
        const midCount = deckCardsData.filter(c => c.position === 'milieu').length;
        const attCount = deckCardsData.filter(c => c.position === 'attaquant').length;
        
        if (defCount === 3) setFormation('3-2-2');
        else if (attCount === 3) setFormation('2-2-3');
        else setFormation('2-3-2');
      } else {
        // Nouveau deck - toutes les cartes sont disponibles
        setAvailableCards(userCards?.map(uc => uc.player) || []);
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Erreur', 'Impossible de charger les données');
    } finally {
      setLoading(false);
    }
  };

  const createPanResponder = (cardId: string) => {
    if (!panResponders.current.has(cardId)) {
      const pan = new Animated.ValueXY();
      animatedValues.current.set(cardId, pan);
      
      const responder = PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        
        onPanResponderGrant: () => {
          setDraggedCard(cardId);
          pan.setOffset({
            x: pan.x._value,
            y: pan.y._value,
          });
        },
        
        onPanResponderMove: Animated.event(
          [null, { dx: pan.x, dy: pan.y }],
          { useNativeDriver: false }
        ),
        
        onPanResponderRelease: (evt, gestureState) => {
          pan.flattenOffset();
          
          // Déterminer si la carte est dans la zone du deck ou des cartes disponibles
          const dropY = gestureState.moveY;
          const isDroppingInDeck = dropY < 400; // Zone du deck
          
          handleCardDrop(cardId, isDroppingInDeck);
          setDraggedCard(null);
          
          // Réinitialiser la position
          Animated.spring(pan, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
        },
      });
      
      panResponders.current.set(cardId, responder);
    }
    
    return panResponders.current.get(cardId);
  };

  const handleCardDrop = (cardId: string, isDroppingInDeck: boolean) => {
    const card = [...deckCards, ...availableCards].find(c => c.id === cardId);
    if (!card) return;
    
    const isInDeck = deckCards.some(c => c.id === cardId);
    
    if (isDroppingInDeck && !isInDeck) {
      // Ajouter au deck
      if (deckCards.length >= 8) {
        Alert.alert('Deck complet', 'Un deck ne peut contenir que 8 joueurs');
        return;
      }
      
      // Vérifier les contraintes de position
      if (!validateCardAddition(card)) {
        return;
      }
      
      setDeckCards([...deckCards, card]);
      setAvailableCards(availableCards.filter(c => c.id !== cardId));
      
    } else if (!isDroppingInDeck && isInDeck) {
      // Retirer du deck
      setDeckCards(deckCards.filter(c => c.id !== cardId));
      setAvailableCards([...availableCards, card]);
    }
  };

  const validateCardAddition = (card: any): boolean => {
    const positionCounts = {
      gardien: deckCards.filter(c => c.position === 'gardien').length,
      defenseur: deckCards.filter(c => c.position === 'defenseur').length,
      milieu: deckCards.filter(c => c.position === 'milieu').length,
      attaquant: deckCards.filter(c => c.position === 'attaquant').length,
    };
    
    // Un seul gardien
    if (card.position === 'gardien' && positionCounts.gardien >= 1) {
      Alert.alert('Limite atteinte', 'Un seul gardien par deck');
      return false;
    }
    
    // Limites selon la formation
    const limits = {
      '2-3-2': { defenseur: 2, milieu: 3, attaquant: 2 },
      '3-2-2': { defenseur: 3, milieu: 2, attaquant: 2 },
      '2-2-3': { defenseur: 2, milieu: 2, attaquant: 3 },
    };
    
    const limit = limits[formation];
    if (card.position !== 'gardien' && positionCounts[card.position] >= limit[card.position]) {
      Alert.alert('Limite atteinte', `Maximum ${limit[card.position]} ${card.position}s pour cette formation`);
      return false;
    }
    
    return true;
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
    
    // Vérifier la composition
    const positionCounts = {
      gardien: deckCards.filter(c => c.position === 'gardien').length,
      defenseur: deckCards.filter(c => c.position === 'defenseur').length,
      milieu: deckCards.filter(c => c.position === 'milieu').length,
      attaquant: deckCards.filter(c => c.position === 'attaquant').length,
    };
    
    if (positionCounts.gardien !== 1) {
      Alert.alert('Erreur', 'Il faut exactement 1 gardien');
      return;
    }
    
    setSaving(true);
    
    try {
      const deckData = {
        user_id: profile?.id,
        name: deckName.trim(),
        cards: deckCards.map(c => c.id),
        is_valid: true,
      };
      
      if (route.params?.mode === 'edit' && route.params?.deckId) {
        // Mettre à jour le deck existant
        const { error } = await supabase
          .from('saved_decks')
          .update(deckData)
          .eq('id', route.params.deckId);
          
        if (error) throw error;
        Alert.alert('Succès', 'Deck modifié avec succès');
      } else {
        // Créer un nouveau deck
        const { error } = await supabase
          .from('saved_decks')
          .insert(deckData);
          
        if (error) throw error;
        Alert.alert('Succès', 'Deck créé avec succès');
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Error saving deck:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder le deck');
    } finally {
      setSaving(false);
    }
  };

  const renderCard = (card: any, isInDeck: boolean) => {
    const panResponder = createPanResponder(card.id);
    const pan = animatedValues.current.get(card.id) || new Animated.ValueXY();
    
    return (
      <Animated.View
        key={card.id}
        style={[
          styles.cardWrapper,
          {
            transform: [
              { translateX: pan.x },
              { translateY: pan.y },
            ],
            zIndex: draggedCard === card.id ? 1000 : 1,
            opacity: draggedCard === card.id ? 0.8 : 1,
          },
        ]}
        {...panResponder.panHandlers}
      >
        <PlayerCard
          player={card}
          size="small"
          showStats
        />
      </Animated.View>
    );
  };

  const renderDeckZone = () => {
    const positions = ['gardien', 'defenseur', 'milieu', 'attaquant'];
    
    return (
      <Card variant="elevated" style={styles.deckZone}>
        <View style={styles.deckHeader}>
          <Heading level={2}>Composition du deck</Heading>
          <View style={styles.formationSelector}>
            {(['2-3-2', '3-2-2', '2-2-3'] as const).map((f) => (
              <TouchableOpacity
                key={f}
                onPress={() => setFormation(f)}
                style={[
                  styles.formationButton,
                  formation === f && styles.formationButtonActive,
                ]}
              >
                <Text style={[
                  styles.formationText,
                  formation === f && styles.formationTextActive,
                ]}>
                  {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.deckGrid}>
          {positions.map((position) => (
            <View key={position} style={styles.positionRow}>
              <Typography variant="label" style={styles.positionLabel}>
                {position.charAt(0).toUpperCase() + position.slice(1)}
              </Typography>
              <View style={styles.positionCards}>
                {deckCards
                  .filter(c => c.position === position)
                  .map(card => renderCard(card, true))
                }
              </View>
            </View>
          ))}
        </View>
        
        <Typography variant="body" color={styles.deckCount.color}>
          {deckCards.length}/8 joueurs
        </Typography>
      </Card>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Button
          title="Annuler"
          variant="ghost"
          onPress={() => navigation.goBack()}
        />
        <TextInput
          style={styles.nameInput}
          value={deckName}
          onChangeText={setDeckName}
          placeholder="Nom du deck"
          placeholderTextColor={styles.placeholderColor.color}
        />
        <Button
          title="Sauvegarder"
          variant="default"
          onPress={handleSave}
          disabled={saving || deckCards.length !== 8}
        />
      </View>
      
      {renderDeckZone()}
      
      <View style={styles.availableSection}>
        <Heading level={1}>Cartes disponibles</Heading>
        <View style={styles.availableGrid}>
          {availableCards.map(card => renderCard(card, false))}
        </View>
      </View>
    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof import('../hooks/useThemedStyles').useTheme>) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  nameInput: {
    flex: 1,
    marginHorizontal: theme.spacing.md,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.textMuted,
    color: theme.colors.text,
    ...GameTheme.typography.body.regular,
    textAlign: 'center',
  },
  placeholderColor: {
    color: theme.colors.textMuted,
  },
  deckZone: {
    margin: theme.spacing.lg,
    minHeight: 400,
  },
  deckHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  deckTitle: {
    ...GameTheme.typography.header.h2,
    color: theme.colors.text,
  },
  formationSelector: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  formationButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  formationButtonActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  formationText: {
    ...GameTheme.typography.ui.label,
    color: theme.colors.text,
  },
  formationTextActive: {
    color: '#0A0E27',
  },
  deckGrid: {
    gap: theme.spacing.md,
  },
  positionRow: {
    marginBottom: theme.spacing.md,
  },
  positionLabel: {
    ...GameTheme.typography.ui.label,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
    textTransform: 'uppercase',
  },
  positionCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  deckCount: {
    textAlign: 'center',
    ...GameTheme.typography.body.regular,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
  },
  availableSection: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    ...GameTheme.typography.header.h1,
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  availableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  cardWrapper: {
    width: cardWidth,
    marginBottom: theme.spacing.sm,
  },
});