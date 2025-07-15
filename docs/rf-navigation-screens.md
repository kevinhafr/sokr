# Rocket Footy - Système de Routage & Écrans

## 1. Navigation Stack Principal

```typescript
// navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import des écrans
import { SplashScreen } from '@/screens/SplashScreen';
import { OnboardingScreen } from '@/screens/auth/OnboardingScreen';
import { LoginScreen } from '@/screens/auth/LoginScreen';
import { RegisterScreen } from '@/screens/auth/RegisterScreen';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { GameScreen } from '@/screens/game/GameScreen';
import { DeckBuilderScreen } from '@/screens/deck/DeckBuilderScreen';
import { CollectionScreen } from '@/screens/collection/CollectionScreen';
import { ShopScreen } from '@/screens/shop/ShopScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { LeaderboardScreen } from '@/screens/leaderboard/LeaderboardScreen';

// Types pour la navigation
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined;
  Main: undefined;
  Game: { gameId: string };
  DeckBuilder: { deckId?: string };
  CardDetail: { cardId: string };
  Settings: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Collection: undefined;
  Shop: undefined;
  Profile: undefined;
  Leaderboard: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const MainTab = createBottomTabNavigator<MainTabParamList>();

// Stack d'authentification
function AuthNavigator() {
  const { theme } = useTheme();

  return (
    <AuthStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <AuthStack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <AuthStack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{ title: 'Créer un compte' }}
      />
      <AuthStack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{ title: 'Mot de passe oublié' }}
      />
    </AuthStack.Navigator>
  );
}

// Tab Navigator principal
function MainNavigator() {
  const { theme } = useTheme();

  return (
    <MainTab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Collection':
              iconName = 'collections';
              break;
            case 'Shop':
              iconName = 'shopping-cart';
              break;
            case 'Leaderboard':
              iconName = 'leaderboard';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
        },
        headerStyle: {
          backgroundColor: theme.colors.background,
        },
        headerTintColor: theme.colors.text,
      })}
    >
      <MainTab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Accueil' }}
      />
      <MainTab.Screen 
        name="Collection" 
        component={CollectionScreen}
        options={{ title: 'Collection' }}
      />
      <MainTab.Screen 
        name="Shop" 
        component={ShopScreen}
        options={{ title: 'Boutique' }}
      />
      <MainTab.Screen 
        name="Leaderboard" 
        component={LeaderboardScreen}
        options={{ title: 'Classement' }}
      />
      <MainTab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profil' }}
      />
    </MainTab.Navigator>
  );
}

// Navigation principale
export function AppNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const { theme } = useTheme();

  if (isLoading) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer
      theme={{
        dark: theme.isDark,
        colors: {
          primary: theme.colors.primary,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
          border: theme.colors.border,
          notification: theme.colors.primary,
        },
      }}
    >
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {!isAuthenticated ? (
          <>
            <RootStack.Screen name="Onboarding" component={OnboardingScreen} />
            <RootStack.Screen name="Auth" component={AuthNavigator} />
          </>
        ) : (
          <>
            <RootStack.Screen name="Main" component={MainNavigator} />
            <RootStack.Screen 
              name="Game" 
              component={GameScreen}
              options={{
                headerShown: true,
                headerTitle: 'Partie en cours',
                headerBackTitle: 'Retour',
              }}
            />
            <RootStack.Screen 
              name="DeckBuilder" 
              component={DeckBuilderScreen}
              options={{
                headerShown: true,
                headerTitle: 'Créer un deck',
              }}
            />
            <RootStack.Screen 
              name="Settings" 
              component={SettingsScreen}
              options={{
                headerShown: true,
                headerTitle: 'Paramètres',
              }}
            />
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}
```

## 2. Écran d'accueil

```typescript
// screens/home/HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  RefreshControl 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ApiService } from '@/services/api';
import { QuickPlayButton } from '@/components/home/QuickPlayButton';
import { DraftPlayButton } from '@/components/home/DraftPlayButton';
import { StatsCard } from '@/components/home/StatsCard';
import { RecentMatches } from '@/components/home/RecentMatches';
import { DailyRewards } from '@/components/home/DailyRewards';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { profile } = useAuth();
  const { theme } = useTheme();
  const [isLoading, setIsLoading] = useState(false);
  const [recentGames, setRecentGames] = useState([]);

  useEffect(() => {
    loadRecentData();
  }, []);

  const loadRecentData = async () => {
    try {
      setIsLoading(true);
      // Charger les données récentes
      // const games = await ApiService.getRecentGames();
      // setRecentGames(games);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickPlay = async () => {
    try {
      // Lancer le matchmaking rapide
      navigation.navigate('Game', { gameId: 'quick-match' });
    } catch (error) {
      console.error('Error starting quick game:', error);
    }
  };

  const handleDraftPlay = () => {
    navigation.navigate('DeckBuilder');
  };

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={loadRecentData} />
      }
    >
      {/* Header avec statistiques */}
      <View style={styles.header}>
        <Text style={[styles.welcomeText, { color: theme.colors.text }]}>
          Bienvenue, {profile?.username}!
        </Text>
        <View style={styles.statsRow}>
          <StatsCard 
            title="MMR" 
            value={profile?.mmr || 1000} 
            icon="trending-up"
          />
          <StatsCard 
            title="Victoires" 
            value={profile?.wins || 0} 
            icon="emoji-events"
          />
          <StatsCard 
            title="Parties" 
            value={profile?.total_games || 0} 
            icon="sports-soccer"
          />
        </View>
      </View>

      {/* Boutons de jeu principaux */}
      <View style={styles.playButtons}>
        <QuickPlayButton onPress={handleQuickPlay} />
        <DraftPlayButton onPress={handleDraftPlay} />
      </View>

      {/* Récompenses quotidiennes */}
      <DailyRewards />

      {/* Matchs récents */}
      <RecentMatches games={recentGames} />

      {/* Actions rapides */}
      <View style={styles.quickActions}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Shop')}
        >
          <Text style={styles.actionButtonText}>Boutique</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
          onPress={() => navigation.navigate('Collection')}
        >
          <Text style={styles.actionButtonText}>Collection</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  playButtons: {
    padding: 20,
    gap: 15,
  },
  quickActions: {
    flexDirection: 'row',
    padding: 20,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

## 3. Écran de jeu

```typescript
// screens/game/GameScreen.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { GameProvider } from '@/contexts/GameContext';
import { GameBoard } from '@/components/game/GameBoard';
import { ActionButtons } from '@/components/game/ActionButtons';
import { Scoreboard } from '@/components/game/Scoreboard';
import { Timer } from '@/components/ui/Timer';
import { BonusCard } from '@/components/cards/BonusCard';
import { useGame } from '@/contexts/GameContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSound } from '@/contexts/SoundContext';

export function GameScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const { gameId } = route.params as { gameId: string };
  const { playSound } = useSound();

  return (
    <GameProvider gameId={gameId}>
      <GameContent />
    </GameProvider>
  );
}

function GameContent() {
  const { 
    currentGame, 
    gameState, 
    isMyTurn, 
    timeRemaining,
    makeMove,
    placeCard,
    forfeit,
    playBonusCard
  } = useGame();
  const { profile } = useAuth();
  const { playSound } = useSound();
  const navigation = useNavigation();

  const [selectedAction, setSelectedAction] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);

  useEffect(() => {
    if (currentGame?.status === 'completed') {
      handleGameEnd();
    }
  }, [currentGame?.status]);

  const handleAction = async (action: string) => {
    if (!isMyTurn) return;

    try {
      setSelectedAction(action);
      playSound('buttonClick');
      
      // Logique pour sélectionner une carte cible si nécessaire
      // ...
      
      await makeMove({
        action,
        actorPosition: selectedCard,
        // ... autres paramètres
      });
      
      // Réinitialiser la sélection
      setSelectedAction(null);
      setSelectedCard(null);
      
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleTimeout = () => {
    playSound('timerWarning');
    // Le serveur gérera le timeout
  };

  const handleForfeit = () => {
    Alert.alert(
      'Abandonner',
      'Êtes-vous sûr de vouloir abandonner cette partie ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Abandonner', 
          style: 'destructive',
          onPress: async () => {
            try {
              await forfeit();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Erreur', error.message);
            }
          }
        }
      ]
    );
  };

  const handleGameEnd = () => {
    const isWinner = currentGame?.winner === profile?.id;
    
    playSound(isWinner ? 'victory' : 'defeat');
    
    Alert.alert(
      isWinner ? 'Victoire !' : 'Défaite',
      `Score final: ${currentGame?.score_a} - ${currentGame?.score_b}`,
      [
        { 
          text: 'OK', 
          onPress: () => navigation.goBack()
        }
      ]
    );
  };

  if (!currentGame || !gameState) {
    return <LoadingScreen />;
  }

  // Déterminer l'équipe du joueur
  const isTeamA = currentGame.player_a === profile?.id;
  const myTeam = isTeamA ? 'A' : 'B';
  const opponentTeam = isTeamA ? 'B' : 'A';

  return (
    <View style={styles.container}>
      {/* Tableau des scores */}
      <Scoreboard
        scoreA={currentGame.score_a}
        scoreB={currentGame.score_b}
        playerA={currentGame.player_a_profile}
        playerB={currentGame.player_b_profile}
        currentTurn={currentGame.current_turn}
        currentPlayer={currentGame.current_player}
      />

      {/* Timer */}
      {isMyTurn && (
        <View style={styles.timer}>
          <Timer
            duration={timeRemaining}
            onTimeout={handleTimeout}
            showWarning={true}
            warningThreshold={10}
          />
        </View>
      )}

      {/* Plateau de jeu */}
      <View style={styles.board}>
        <GameBoard
          board={gameState.boardState}
          ballPosition={gameState.ballPosition}
          onCellClick={(position) => {
            if (selectedAction) {
              // Logique de sélection de cible
            }
          }}
          highlightedCells={[]}
          isInteractive={isMyTurn}
          currentTeam={myTeam}
        />
      </View>

      {/* Carte bonus */}
      {gameState.bonusCard && (
        <View style={styles.bonusCard}>
          <BonusCard
            card={gameState.bonusCard}
            onClick={() => playBonusCard(gameState.bonusCard.id)}
            isPlayable={isMyTurn}
            isUsed={gameState.bonusCardUsed}
          />
        </View>
      )}

      {/* Boutons d'action */}
      {isMyTurn && (
        <View style={styles.actions}>
          <ActionButtons
            onAction={handleAction}
            disabledActions={[]}
            currentAction={selectedAction}
          />
        </View>
      )}

      {/* Bouton abandonner */}
      <TouchableOpacity style={styles.forfeitButton} onPress={handleForfeit}>
        <Icon name="flag" size={24} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a472a',
  },
  timer: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 10,
  },
  board: {
    flex: 1,
    padding: 10,
  },
  bonusCard: {
    position: 'absolute',
    bottom: 150,
    right: 20,
  },
  actions: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
  },
  forfeitButton: {
    position: 'absolute',
    top: 100,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
```

## 4. Écran de création de deck

```typescript
// screens/deck/DeckBuilderScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  TextInput,
  Alert 
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useDeck } from '@/contexts/DeckContext';
import { useTheme } from '@/contexts/ThemeContext';
import { PlayerCard } from '@/components/cards/PlayerCard';
import { DeckStats } from '@/components/deck/DeckStats';
import { PositionFilter } from '@/components/deck/PositionFilter';
import { RarityFilter } from '@/components/deck/RarityFilter';

export function DeckBuilderScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { deckId } = route.params as { deckId?: string };
  
  const {
    userCards,
    currentDeck,
    isValid,
    composition,
    addCard,
    removeCard,
    saveDeck,
    loadDeck,
    validateDeck
  } = useDeck();
  
  const { theme } = useTheme();
  
  const [deckName, setDeckName] = useState('');
  const [filters, setFilters] = useState({
    position: null,
    rarity: null,
    search: ''
  });

  useEffect(() => {
    if (deckId) {
      loadDeck(deckId);
    }
  }, [deckId]);

  const handleSave = async () => {
    if (!isValid) {
      Alert.alert('Deck invalide', 'Votre deck ne respecte pas les contraintes.');
      return;
    }

    if (!deckName.trim()) {
      Alert.alert('Nom requis', 'Veuillez donner un nom à votre deck.');
      return;
    }

    try {
      await saveDeck(deckName);
      Alert.alert('Succès', 'Deck sauvegardé avec succès !');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleCardPress = (cardId: string) => {
    if (currentDeck.includes(cardId)) {
      removeCard(cardId);
    } else {
      addCard(cardId);
    }
  };

  // Filtrer les cartes
  const filteredCards = userCards.filter(userCard => {
    const card = userCard.card;
    
    if (filters.position && card.position !== filters.position) return false;
    if (filters.rarity && card.rarity !== filters.rarity) return false;
    if (filters.search && !card.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header avec nom du deck */}
      <View style={styles.header}>
        <TextInput
          style={[styles.deckNameInput, { 
            color: theme.colors.text,
            borderColor: theme.colors.border 
          }]}
          placeholder="Nom du deck"
          placeholderTextColor={theme.colors.textSecondary}
          value={deckName}
          onChangeText={setDeckName}
        />
        
        <TouchableOpacity
          style={[
            styles.saveButton,
            { backgroundColor: isValid ? theme.colors.primary : theme.colors.textSecondary }
          ]}
          onPress={handleSave}
          disabled={!isValid}
        >
          <Text style={styles.saveButtonText}>Sauvegarder</Text>
        </TouchableOpacity>
      </View>

      {/* Statistiques du deck */}
      <DeckStats composition={composition} isValid={isValid} />

      {/* Deck actuel */}
      <View style={styles.currentDeck}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Deck actuel ({currentDeck.length}/8)
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {currentDeck.map(cardId => {
            const userCard = userCards.find(uc => uc.player_id === cardId);
            return userCard ? (
              <PlayerCard
                key={cardId}
                card={userCard.card}
                userCard={userCard}
                onClick={() => removeCard(cardId)}
                isSelected={true}
                size="small"
              />
            ) : null;
          })}
        </ScrollView>
      </View>

      {/* Filtres */}
      <View style={styles.filters}>
        <PositionFilter
          selected={filters.position}
          onSelect={(position) => setFilters(prev => ({ ...prev, position }))}
        />
        <RarityFilter
          selected={filters.rarity}
          onSelect={(rarity) => setFilters(prev => ({ ...prev, rarity }))}
        />
        <TextInput
          style={[styles.searchInput, { 
            color: theme.colors.text,
            borderColor: theme.colors.border 
          }]}
          placeholder="Rechercher..."
          placeholderTextColor={theme.colors.textSecondary}
          value={filters.search}
          onChangeText={(search) => setFilters(prev => ({ ...prev, search }))}
        />
      </View>

      {/* Collection */}
      <ScrollView style={styles.collection}>
        <View style={styles.cardGrid}>
          {filteredCards.map(userCard => (
            <PlayerCard
              key={userCard.id}
              card={userCard.card}
              userCard={userCard}
              onClick={() => handleCardPress(userCard.player_id)}
              isSelected={currentDeck.includes(userCard.player_id)}
              showXP={true}
              showLevel={true}
              size="medium"
            />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    gap: 10,
  },
  deckNameInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  saveButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  currentDeck: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  filters: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderRadius: 18,
    paddingHorizontal: 15,
    fontSize: 14,
  },
  collection: {
    flex: 1,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
});
```

## 5. Écran de collection

```typescript
// screens/collection/CollectionScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { CardService } from '@/services/cards';
import { PlayerCard } from '@/components/cards/PlayerCard';
import { CollectionStats } from '@/components/collection/CollectionStats';
import { FilterBar } from '@/components/collection/FilterBar';
import { SortOptions } from '@/components/collection/SortOptions';

export function CollectionScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { theme } = useTheme();
  
  const [cards, setCards] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    position: null,
    rarity: null,
    owned: true
  });
  const [sortBy, setSortBy] = useState('rarity');

  useEffect(() => {
    loadCollection();
  }, []);

  const loadCollection = async () => {
    try {
      setIsLoading(true);
      const userCards = await CardService.getUserCards(user.id);
      setCards(userCards);
    } catch (error) {
      console.error('Error loading collection:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCardPress = (cardId: string) => {
    navigation.navigate('CardDetail', { cardId });
  };

  // Filtrer et trier les cartes
  const displayedCards = cards
    .filter(userCard => {
      const card = userCard.card;
      if (filters.position && card.position !== filters.position) return false;
      if (filters.rarity && card.rarity !== filters.rarity) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rarity':
          return b.card.rarity.localeCompare(a.card.rarity);
        case 'level':
          return b.level - a.level;
        case 'name':
          return a.card.name.localeCompare(b.card.name);
        default:
          return 0;
      }
    });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Statistiques de collection */}
      <CollectionStats cards={cards} />

      {/* Barre de filtres */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
      />

      {/* Options de tri */}
      <SortOptions
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Grille de cartes */}
      <ScrollView style={styles.scrollView}>
        <View style={styles.cardGrid}>
          {displayedCards.map(userCard => (
            <PlayerCard
              key={userCard.id}
              card={userCard.card}
              userCard={userCard}
              onClick={() => handleCardPress(userCard.card.id)}
              showXP={true}
              showLevel={true}
              size="medium"
            />
          ))}
        </View>
      </ScrollView>

      {/* Bouton créer deck */}
      <TouchableOpacity
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        onPress={() => navigation.navigate('DeckBuilder')}
      >
        <Icon name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});
```

## 6. Écran de boutique

```typescript
// screens/shop/ShopScreen.tsx
import React, { useState, useEffect } from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useShop } from '@/hooks/useShop';
import { useTheme } from '@/contexts/ThemeContext';
import { PackCard } from '@/components/shop/PackCard';
import { PurchaseHistory } from '@/components/shop/PurchaseHistory';
import { SpecialOffers } from '@/components/shop/SpecialOffers';
import { PackOpeningModal } from '@/components/shop/PackOpeningModal';

export function ShopScreen() {
  const { 
    packTypes, 
    purchases, 
    isLoading,
    purchasePack,
    openPack 
  } = useShop();
  const { theme } = useTheme();
  
  const [selectedPack, setSelectedPack] = useState(null);
  const [isOpeningPack, setIsOpeningPack] = useState(false);
  const [openedCards, setOpenedCards] = useState([]);
  const [selectedTab, setSelectedTab] = useState('packs'); // 'packs' | 'history'

  const handlePurchase = async (packType) => {
    try {
      Alert.alert(
        'Confirmer l\'achat',
        `Acheter ${packType.name} pour ${packType.price}€ ?`,
        [
          { text: 'Annuler', style: 'cancel' },
          { 
            text: 'Acheter', 
            onPress: async () => {
              // Intégration avec le système de paiement
              const paymentToken = await processPayment(packType);
              const purchase = await purchasePack(packType.id, paymentToken);
              Alert.alert('Succès', 'Pack acheté avec succès !');
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erreur', error.message);
    }
  };

  const handleOpenPack = async (purchase) => {
    try {
      setIsOpeningPack(true);
      const cards = await openPack(purchase.id);
      setOpenedCards(cards);
      setSelectedPack(purchase);
    } catch (error) {
      Alert.alert('Erreur', error.message);
      setIsOpeningPack(false);
    }
  };

  const processPayment = async (packType) => {
    // Intégration avec Stripe/IAP selon la plateforme
    // Retourner un token de paiement
    return 'payment_token_example';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'packs' && { backgroundColor: theme.colors.primary }
          ]}
          onPress={() => setSelectedTab('packs')}
        >
          <Text style={[
            styles.tabText,
            selectedTab === 'packs' && { color: '#FFFFFF' }
          ]}>Packs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            selectedTab === 'history' && { backgroundColor: theme.colors.primary }
          ]}
          onPress={() => setSelectedTab('history')}
        >
          <Text style={[
            styles.tabText,
            selectedTab === 'history' && { color: '#FFFFFF' }
          ]}>Historique</Text>
        </TouchableOpacity>
      </View>

      {selectedTab === 'packs' ? (
        <ScrollView style={styles.content}>
          {/* Offres spéciales */}
          <SpecialOffers />

          {/* Liste des packs */}
          <View style={styles.packGrid}>
            {packTypes.map(pack => (
              <PackCard
                key={pack.id}
                pack={pack}
                onPurchase={() => handlePurchase(pack)}
              />
            ))}
          </View>
        </ScrollView>
      ) : (
        <PurchaseHistory
          purchases={purchases}
          onOpenPack={handleOpenPack}
        />
      )}

      {/* Modal d'ouverture de pack */}
      {isOpeningPack && (
        <PackOpeningModal
          pack={selectedPack}
          cards={openedCards}
          onClose={() => {
            setIsOpeningPack(false);
            setOpenedCards([]);
            setSelectedPack(null);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 10,
    gap: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  tabText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
  },
  packGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 10,
  },
});
```

## 7. Écran de profil

```typescript
// screens/profile/ProfileScreen.tsx
import React from 'react';
import { 
  View, 
  ScrollView, 
  Text, 
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { ProfileStats } from '@/components/profile/ProfileStats';
import { AchievementsList } from '@/components/profile/AchievementsList';
import { MatchHistory } from '@/components/profile/MatchHistory';
import Icon from 'react-native-vector-icons/MaterialIcons';

export function ProfileScreen() {
  const navigation = useNavigation();
  const { profile, signOut } = useAuth();
  const { theme } = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnexion', 
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
            } catch (error) {
              Alert.alert('Erreur', error.message);
            }
          }
        }
      ]
    );
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header du profil */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Image
            source={{ uri: profile?.avatar_url || 'https://via.placeholder.com/100' }}
            style={styles.avatar}
          />
          <TouchableOpacity style={styles.editButton}>
            <Icon name="edit" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
        
        <Text style={[styles.username, { color: theme.colors.text }]}>
          {profile?.username}
        </Text>
        <Text style={[styles.mmr, { color: theme.colors.textSecondary }]}>
          MMR: {profile?.mmr}
        </Text>
      </View>

      {/* Statistiques */}
      <ProfileStats profile={profile} />

      {/* Actions rapides */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Icon name="settings" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Paramètres</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: theme.colors.secondary }]}
          onPress={() => navigation.navigate('Shop')}
        >
          <Icon name="shopping-cart" size={24} color="#FFFFFF" />
          <Text style={styles.actionButtonText}>Boutique</Text>
        </TouchableOpacity>
      </View>

      {/* Succès */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Succès
        </Text>
        <AchievementsList userId={profile?.id} />
      </View>

      {/* Historique des matchs */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>
          Matchs récents
        </Text>
        <MatchHistory userId={profile?.id} limit={5} />
      </View>

      {/* Bouton de déconnexion */}
      <TouchableOpacity
        style={[styles.logoutButton, { borderColor: theme.colors.error }]}
        onPress={handleLogout}
      >
        <Text style={[styles.logoutButtonText, { color: theme.colors.error }]}>
          Se déconnecter
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  mmr: {
    fontSize: 18,
  },
  quickActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 15,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 10,
    gap: 10,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  logoutButton: {
    margin: 20,
    padding: 15,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});
```

## 8. Écran de login

```typescript
// screens/auth/LoginScreen.tsx
import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Logo } from '@/components/ui/Logo';

export function LoginScreen() {
  const navigation = useNavigation();
  const { signIn } = useAuth();
  const { theme } = useTheme();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      setIsLoading(true);
      await signIn(email, password);
    } catch (error) {
      Alert.alert('Erreur de connexion', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Logo size={100} />
        
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Connexion
        </Text>

        <View style={styles.form}>
          <TextInput
            style={[styles.input, { 
              color: theme.colors.text,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border
            }]}
            placeholder="Email"
            placeholderTextColor={theme.colors.textSecondary}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <TextInput
            style={[styles.input, { 
              color: theme.colors.text,
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border
            }]}
            placeholder="Mot de passe"
            placeholderTextColor={theme.colors.textSecondary}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
          >
            <Text style={[styles.forgotPassword, { color: theme.colors.primary }]}>
              Mot de passe oublié ?
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, { backgroundColor: theme.colors.primary }]}
            onPress={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>Se connecter</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={[styles.footerText, { color: theme.colors.textSecondary }]}>
            Pas encore de compte ?
          </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.registerLink, { color: theme.colors.primary }]}>
              S'inscrire
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 40,
  },
  form: {
    width: '100%',
    maxWidth: 400,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 20,
    fontSize: 14,
  },
  loginButton: {
    height: 50,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
  },
  registerLink: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});
```