# Rocket Footy - Tests

## 1. Tests des Composants

```typescript
// __tests__/components/PlayerCard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PlayerCard } from '@/components/cards/PlayerCard';
import { createMockPlayerCard, createMockUserPlayer } from '@/utils/test-helpers';

describe('PlayerCard', () => {
  const mockCard = createMockPlayerCard({
    name: 'Test Player',
    position: 'milieu',
    rarity: 'Rare',
  });

  const mockUserCard = createMockUserPlayer({
    level: 2,
    xp: 150,
  });

  it('renders correctly', () => {
    const { getByText } = render(
      <PlayerCard card={mockCard} />
    );

    expect(getByText('Test Player')).toBeTruthy();
  });

  it('displays level and XP when userCard is provided', () => {
    const { getByText } = render(
      <PlayerCard
        card={mockCard}
        userCard={mockUserCard}
        showLevel={true}
        showXP={true}
      />
    );

    expect(getByText('Lv.2')).toBeTruthy();
    expect(getByText('150/250')).toBeTruthy();
  });

  it('handles click events', () => {
    const onClick = jest.fn();
    const { getByTestId } = render(
      <PlayerCard
        card={mockCard}
        onClick={onClick}
        testID="player-card"
      />
    );

    fireEvent.press(getByTestId('player-card'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('shows expelled overlay when expelled', () => {
    const { getByText } = render(
      <PlayerCard
        card={mockCard}
        isExpelled={true}
      />
    );

    expect(getByText('EXCLU')).toBeTruthy();
  });

  it('applies correct rarity color', () => {
    const { getByTestId } = render(
      <PlayerCard
        card={mockCard}
        testID="player-card"
      />
    );

    const cardContainer = getByTestId('player-card');
    expect(cardContainer.props.style).toMatchObject({
      borderColor: '#64B5F6', // Couleur pour Rare
    });
  });

  it('calculates stats with upgrades correctly', () => {
    const upgradedUserCard = createMockUserPlayer({
      stat_upgrades: { shot: 1, pass: 2 },
    });

    const { getByText } = render(
      <PlayerCard
        card={mockCard}
        userCard={upgradedUserCard}
      />
    );

    // Vérifier que les stats sont bien affichées avec les upgrades
    expect(getByText('3')).toBeTruthy(); // shot: 2 + 1
    expect(getByText('5')).toBeTruthy(); // pass: 3 + 2
  });
});
```

```typescript
// __tests__/components/GameBoard.test.tsx
import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { GameBoard } from '@/components/game/GameBoard';
import { BoardState, BoardPosition } from '@/types';

describe('GameBoard', () => {
  const mockBoardState: BoardState = {
    'Z1-1': {
      player: 'A',
      cardId: 'card-1',
    },
    'Z2-2': {
      player: 'B',
      cardId: 'card-2',
    },
  };

  it('renders all zones correctly', () => {
    const { getByTestId } = render(
      <GameBoard
        board={mockBoardState}
        ballPosition="Z2-2"
      />
    );

    expect(getByTestId('zone-G1')).toBeTruthy();
    expect(getByTestId('zone-Z1')).toBeTruthy();
    expect(getByTestId('zone-Z2')).toBeTruthy();
    expect(getByTestId('zone-Z3')).toBeTruthy();
    expect(getByTestId('zone-G2')).toBeTruthy();
  });

  it('displays ball at correct position', () => {
    const { getByTestId } = render(
      <GameBoard
        board={mockBoardState}
        ballPosition="Z2-2"
      />
    );

    const ballIndicator = getByTestId('ball-indicator');
    expect(ballIndicator.parent.props.testID).toBe('cell-Z2-2');
  });

  it('handles cell clicks when interactive', () => {
    const onCellClick = jest.fn();
    const { getByTestId } = render(
      <GameBoard
        board={mockBoardState}
        ballPosition="Z2-2"
        onCellClick={onCellClick}
        isInteractive={true}
      />
    );

    fireEvent.press(getByTestId('cell-Z1-1'));
    expect(onCellClick).toHaveBeenCalledWith('Z1-1');
  });

  it('does not handle clicks when not interactive', () => {
    const onCellClick = jest.fn();
    const { getByTestId } = render(
      <GameBoard
        board={mockBoardState}
        ballPosition="Z2-2"
        onCellClick={onCellClick}
        isInteractive={false}
      />
    );

    fireEvent.press(getByTestId('cell-Z1-1'));
    expect(onCellClick).not.toHaveBeenCalled();
  });

  it('highlights specified cells', () => {
    const { getByTestId } = render(
      <GameBoard
        board={mockBoardState}
        ballPosition="Z2-2"
        highlightedCells={['Z1-2', 'Z1-3']}
      />
    );

    const highlightedCell = getByTestId('cell-Z1-2');
    expect(highlightedCell.props.style).toContainEqual(
      expect.objectContaining({
        borderColor: '#ffff00',
      })
    );
  });
});
```

## 2. Tests des Hooks

```typescript
// __tests__/hooks/useAuth.test.tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { useAuth } from '@/hooks/useAuth';
import { AuthService } from '@/services/auth';
import { wrapper } from '@/utils/test-wrapper';

jest.mock('@/services/auth');

describe('useAuth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });

  it('handles successful login', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    const mockProfile = { id: 'user-1', username: 'testuser', mmr: 1000 };

    (AuthService.signIn as jest.Mock).mockResolvedValue({
      user: mockUser,
      profile: mockProfile,
    });

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login('test@example.com', 'password');
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.profile).toEqual(mockProfile);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('handles login failure', async () => {
    const mockError = new Error('Invalid credentials');
    (AuthService.signIn as jest.Mock).mockRejectedValue(mockError);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      try {
        await result.current.login('test@example.com', 'wrong-password');
      } catch (error) {
        expect(error).toEqual(mockError);
      }
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toEqual(mockError);
  });

  it('handles logout', async () => {
    (AuthService.signOut as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), { wrapper });

    // D'abord se connecter
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    result.current.user = mockUser;
    result.current.isAuthenticated = true;

    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(AuthService.signOut).toHaveBeenCalled();
  });

  it('checks ban status correctly', async () => {
    const bannedProfile = {
      id: 'user-1',
      username: 'testuser',
      ban_until: new Date(Date.now() + 3600000).toISOString(), // Banni pour 1h
    };

    const { result } = renderHook(() => useAuth(), { wrapper });
    
    act(() => {
      result.current.profile = bannedProfile;
    });

    const isBanned = await result.current.checkBanStatus();
    expect(isBanned).toBe(true);
  });
});
```

```typescript
// __tests__/hooks/useGame.test.tsx
import { renderHook, act } from '@testing-library/react-hooks';
import { useGame } from '@/hooks/useGame';
import { ApiService } from '@/services/api';
import { createMockGame } from '@/utils/test-helpers';
import { wrapper } from '@/utils/test-wrapper';

jest.mock('@/services/api');

describe('useGame', () => {
  const mockGameId = 'game-123';
  const mockGame = createMockGame({
    id: mockGameId,
    status: 'active',
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('loads game on mount', async () => {
    (ApiService.getGame as jest.Mock).mockResolvedValue(mockGame);
    (ApiService.getGameMoves as jest.Mock).mockResolvedValue([]);

    const { result, waitForNextUpdate } = renderHook(
      () => useGame(mockGameId),
      { wrapper }
    );

    expect(result.current.isLoading).toBe(true);

    await waitForNextUpdate();

    expect(result.current.game).toEqual(mockGame);
    expect(result.current.isLoading).toBe(false);
    expect(ApiService.getGame).toHaveBeenCalledWith(mockGameId);
  });

  it('determines if it is my turn correctly', async () => {
    const mockUserId = 'user-1';
    const gameWithMyTurn = createMockGame({
      current_player: mockUserId,
    });

    (ApiService.getGame as jest.Mock).mockResolvedValue(gameWithMyTurn);

    const { result, waitForNextUpdate } = renderHook(
      () => useGame(mockGameId),
      { 
        wrapper: ({ children }) => (
          <MockAuthProvider userId={mockUserId}>
            {children}
          </MockAuthProvider>
        )
      }
    );

    await waitForNextUpdate();

    expect(result.current.isMyTurn).toBe(true);
  });

  it('makes a move successfully', async () => {
    const mockMove = {
      action: 'pass',
      actorPosition: 'Z2-2',
      targetPosition: 'Z2-3',
    };

    const mockResult = {
      move: { id: 'move-1', ...mockMove },
      gameState: { turn: 2 },
    };

    (ApiService.makeMove as jest.Mock).mockResolvedValue(mockResult);

    const { result } = renderHook(() => useGame(mockGameId), { wrapper });

    await act(async () => {
      await result.current.makeMove(mockMove);
    });

    expect(ApiService.makeMove).toHaveBeenCalledWith({
      gameId: mockGameId,
      ...mockMove,
    });
  });

  it('handles forfeit', async () => {
    (ApiService.forfeitGame as jest.Mock).mockResolvedValue({});

    const { result } = renderHook(() => useGame(mockGameId), { wrapper });

    await act(async () => {
      await result.current.forfeit();
    });

    expect(ApiService.forfeitGame).toHaveBeenCalledWith(mockGameId);
  });

  it('updates time remaining', async () => {
    jest.useFakeTimers();

    const { result } = renderHook(() => useGame(mockGameId), { wrapper });

    expect(result.current.timeRemaining).toBe(45);

    // Avancer le temps de 10 secondes
    act(() => {
      jest.advanceTimersByTime(10000);
    });

    expect(result.current.timeRemaining).toBe(35);

    jest.useRealTimers();
  });
});
```

## 3. Tests des Services

```typescript
// __tests__/services/auth.test.ts
import { AuthService } from '@/services/auth';
import { supabase } from '@/services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('@/services/supabase');
jest.mock('@react-native-async-storage/async-storage');

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('signUp', () => {
    it('creates user and profile successfully', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue({ error: null }),
      });

      (supabase.functions.invoke as jest.Mock).mockResolvedValue({
        data: { success: true },
        error: null,
      });

      const result = await AuthService.signUp(
        'test@example.com',
        'password123',
        'testuser'
      );

      expect(result.user).toEqual(mockUser);
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('rolls back user creation if profile creation fails', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      
      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        insert: jest.fn().mockResolvedValue({ 
          error: new Error('Profile creation failed') 
        }),
      });

      (supabase.auth.admin.deleteUser as jest.Mock).mockResolvedValue({});

      await expect(
        AuthService.signUp('test@example.com', 'password123', 'testuser')
      ).rejects.toThrow('Profile creation failed');

      expect(supabase.auth.admin.deleteUser).toHaveBeenCalledWith(mockUser.id);
    });
  });

  describe('signIn', () => {
    it('signs in user and checks ban status', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const mockProfile = { 
        id: 'user-1', 
        ban_until: null 
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: mockProfile,
              error: null,
            }),
          }),
        }),
      });

      const result = await AuthService.signIn('test@example.com', 'password');

      expect(result.user).toEqual(mockUser);
      expect(supabase.from).toHaveBeenCalledWith('profiles');
    });

    it('prevents banned users from signing in', async () => {
      const mockUser = { id: 'user-1', email: 'test@example.com' };
      const bannedProfile = { 
        id: 'user-1', 
        ban_until: new Date(Date.now() + 3600000).toISOString() 
      };

      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      (supabase.from as jest.Mock).mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: bannedProfile,
              error: null,
            }),
          }),
        }),
      });

      (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });

      await expect(
        AuthService.signIn('test@example.com', 'password')
      ).rejects.toThrow(/Account banned until/);

      expect(supabase.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('signOut', () => {
    it('signs out and clears local storage', async () => {
      (supabase.auth.signOut as jest.Mock).mockResolvedValue({ error: null });
      (AsyncStorage.multiRemove as jest.Mock).mockResolvedValue(undefined);

      await AuthService.signOut();

      expect(supabase.auth.signOut).toHaveBeenCalled();
      expect(AsyncStorage.multiRemove).toHaveBeenCalledWith([
        'supabase.auth.token',
        'currentGame',
        'currentDeck',
      ]);
    });
  });
});
```

## 4. Tests des Utils

```typescript
// __tests__/utils/validation.test.ts
import {
  validateEmail,
  validateUsername,
  validatePassword,
  validateDeckComposition,
} from '@/utils/validation';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('validates correct email formats', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('123@456.com')).toBe(true);
    });

    it('rejects invalid email formats', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('test@.com')).toBe(false);
    });
  });

  describe('validateUsername', () => {
    it('validates correct usernames', () => {
      expect(validateUsername('user123')).toBe(true);
      expect(validateUsername('test_user')).toBe(true);
      expect(validateUsername('JohnDoe')).toBe(true);
    });

    it('rejects invalid usernames', () => {
      expect(validateUsername('ab')).toBe(false); // Too short
      expect(validateUsername('a'.repeat(21))).toBe(false); // Too long
      expect(validateUsername('user@name')).toBe(false); // Invalid char
      expect(validateUsername('user name')).toBe(false); // Space
    });
  });

  describe('validatePassword', () => {
    it('validates strong passwords', () => {
      const result = validatePassword('StrongP@ss123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects weak passwords', () => {
      const result = validatePassword('weak');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Le mot de passe doit contenir au moins 8 caractères');
    });

    it('checks for required character types', () => {
      const result = validatePassword('onlylowercase');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Le mot de passe doit contenir au moins une majuscule');
      expect(result.errors).toContain('Le mot de passe doit contenir au moins un chiffre');
    });
  });

  describe('validateDeckComposition', () => {
    it('validates correct deck', () => {
      const deck = Array(8).fill(null).map((_, i) => `card-${i}`);
      const result = validateDeckComposition(deck);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('detects incorrect deck size', () => {
      const deck = Array(7).fill(null).map((_, i) => `card-${i}`);
      const result = validateDeckComposition(deck);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Le deck doit contenir exactement 8 cartes');
    });

    it('detects duplicate cards', () => {
      const deck = ['card-1', 'card-1', ...Array(6).fill(null).map((_, i) => `card-${i + 2}`)];
      const result = validateDeckComposition(deck);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Le deck contient des cartes en double');
    });
  });
});
```

```typescript
// __tests__/utils/formatting.test.ts
import {
  formatNumber,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  formatDuration,
} from '@/utils/formatting';

describe('Formatting Utils', () => {
  // Mock de la date actuelle pour des tests consistants
  const mockDate = new Date('2024-01-15T10:00:00.000Z');
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(mockDate);
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  describe('formatNumber', () => {
    it('formats numbers with French locale', () => {
      expect(formatNumber(1000)).toBe('1 000');
      expect(formatNumber(1234567.89)).toBe('1 234 567,89');
      expect(formatNumber(0)).toBe('0');
    });
  });

  describe('formatCurrency', () => {
    it('formats currency correctly', () => {
      expect(formatCurrency(9.99)).toBe('9,99 €');
      expect(formatCurrency(1000)).toBe('1 000,00 €');
      expect(formatCurrency(0.5)).toBe('0,50 €');
    });

    it('formats different currencies', () => {
      expect(formatCurrency(10, 'USD')).toBe('10,00 $US');
      expect(formatCurrency(100, 'GBP')).toBe('100,00 £GB');
    });
  });

  describe('formatDate', () => {
    it('formats dates correctly', () => {
      expect(formatDate('2024-01-15')).toBe('15 janvier 2024');
      expect(formatDate(new Date('2024-12-25'))).toBe('25 décembre 2024');
    });
  });

  describe('formatRelativeTime', () => {
    it('formats relative time correctly', () => {
      const now = mockDate;
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);
      const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

      expect(formatRelativeTime(now)).toBe('À l\'instant');
      expect(formatRelativeTime(fiveMinutesAgo)).toBe('Il y a 5 minutes');
      expect(formatRelativeTime(twoHoursAgo)).toBe('Il y a 2 heures');
      expect(formatRelativeTime(threeDaysAgo)).toBe('Il y a 3 jours');
    });
  });

  describe('formatDuration', () => {
    it('formats duration correctly', () => {
      expect(formatDuration(45)).toBe('0:45');
      expect(formatDuration(90)).toBe('1:30');
      expect(formatDuration(3661)).toBe('61:01');
      expect(formatDuration(0)).toBe('0:00');
    });
  });
});
```

## 5. Tests d'Intégration

```typescript
// __tests__/integration/game-flow.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { GameScreen } from '@/screens/game/GameScreen';
import { ApiService } from '@/services/api';
import { supabase } from '@/services/supabase';
import { AppProvider } from '@/contexts/AppProvider';

jest.mock('@/services/api');
jest.mock('@/services/supabase');

describe('Game Flow Integration', () => {
  const mockGameId = 'game-123';
  const mockUserId = 'user-1';
  const mockOpponentId = 'user-2';

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock de l'authentification
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: mockUserId } },
      error: null,
    });
  });

  it('completes a full game turn', async () => {
    // Setup du jeu
    const mockGame = {
      id: mockGameId,
      status: 'active',
      current_player: mockUserId,
      player_a: mockUserId,
      player_b: mockOpponentId,
      current_turn: 1,
      score_a: 0,
      score_b: 0,
    };

    (ApiService.getGame as jest.Mock).mockResolvedValue(mockGame);
    (ApiService.getGameMoves as jest.Mock).mockResolvedValue([]);
    (ApiService.makeMove as jest.Mock).mockResolvedValue({
      move: { id: 'move-1', success: true },
      gameState: { ...mockGame, current_turn: 2 },
    });

    const { getByTestId, getByText } = render(
      <AppProvider>
        <NavigationContainer>
          <GameScreen route={{ params: { gameId: mockGameId } }} />
        </NavigationContainer>
      </AppProvider>
    );

    // Attendre que le jeu se charge
    await waitFor(() => {
      expect(getByText('C\'est votre tour')).toBeTruthy();
    });

    // Sélectionner une action
    fireEvent.press(getByTestId('action-pass'));
    
    // Sélectionner une cible
    fireEvent.press(getByTestId('cell-Z2-3'));
    
    // Confirmer l'action
    fireEvent.press(getByTestId('confirm-action'));

    // Vérifier que l'action a été envoyée
    await waitFor(() => {
      expect(ApiService.makeMove).toHaveBeenCalledWith({
        gameId: mockGameId,
        action: 'pass',
        actorPosition: expect.any(String),
        targetPosition: 'Z2-3',
      });
    });
  });

  it('handles opponent turn correctly', async () => {
    const mockGame = {
      id: mockGameId,
      status: 'active',
      current_player: mockOpponentId, // Tour de l'adversaire
      player_a: mockUserId,
      player_b: mockOpponentId,
    };

    (ApiService.getGame as jest.Mock).mockResolvedValue(mockGame);

    const { getByText, queryByTestId } = render(
      <AppProvider>
        <NavigationContainer>
          <GameScreen route={{ params: { gameId: mockGameId } }} />
        </NavigationContainer>
      </AppProvider>
    );

    await waitFor(() => {
      expect(getByText('Tour de l\'adversaire')).toBeTruthy();
    });

    // Les actions ne doivent pas être disponibles
    expect(queryByTestId('action-pass')).toBeNull();
  });

  it('handles game end', async () => {
    const mockGame = {
      id: mockGameId,
      status: 'completed',
      winner: mockUserId,
      score_a: 2,
      score_b: 1,
      player_a: mockUserId,
      player_b: mockOpponentId,
    };

    (ApiService.getGame as jest.Mock).mockResolvedValue(mockGame);

    const { getByText } = render(
      <AppProvider>
        <NavigationContainer>
          <GameScreen route={{ params: { gameId: mockGameId } }} />
        </NavigationContainer>
      </AppProvider>
    );

    await waitFor(() => {
      expect(getByText('Victoire !')).toBeTruthy();
      expect(getByText('Score final: 2 - 1')).toBeTruthy();
    });
  });
});
```

## 6. Tests de Performance

```typescript
// __tests__/performance/rendering.test.tsx
import React from 'react';
import { measurePerformance } from 'react-native-testing-library';
import { GameBoard } from '@/components/game/GameBoard';
import { Collection } from '@/screens/collection/CollectionScreen';
import { createMockPlayerCard } from '@/utils/test-helpers';

describe('Performance Tests', () => {
  describe('GameBoard rendering', () => {
    it('renders within performance budget', async () => {
      const largeBoardState = {};
      // Remplir le plateau avec des cartes
      for (let i = 1; i <= 3; i++) {
        for (let j = 1; j <= 3; j++) {
          largeBoardState[`Z${i}-${j}`] = {
            player: 'A',
            cardId: `card-${i}-${j}`,
          };
        }
      }

      const result = await measurePerformance(
        <GameBoard
          board={largeBoardState}
          ballPosition="Z2-2"
        />
      );

      expect(result.duration).toBeLessThan(16); // 60 FPS
    });
  });

  describe('Collection rendering', () => {
    it('handles large collections efficiently', async () => {
      // Créer une grande collection
      const largeCollection = Array(100)
        .fill(null)
        .map((_, i) => createMockPlayerCard({ id: `card-${i}` }));

      const result = await measurePerformance(
        <Collection cards={largeCollection} />
      );

      expect(result.duration).toBeLessThan(100); // 100ms budget
    });
  });

  describe('Memory usage', () => {
    it('does not leak memory on repeated renders', async () => {
      const initialMemory = performance.memory.usedJSHeapSize;

      // Simuler plusieurs rendus
      for (let i = 0; i < 100; i++) {
        const { unmount } = render(<GameBoard board={{}} ballPosition="Z2-2" />);
        unmount();
      }

      // Forcer le garbage collection
      global.gc && global.gc();

      const finalMemory = performance.memory.usedJSHeapSize;
      const memoryIncrease = finalMemory - initialMemory;

      // Vérifier qu'il n'y a pas de fuite significative
      expect(memoryIncrease).toBeLessThan(1024 * 1024); // 1MB
    });
  });
});
```

## 7. Tests E2E avec Detox

```typescript
// e2e/auth.e2e.ts
describe('Authentication Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  it('should register a new user', async () => {
    await element(by.id('register-button')).tap();
    
    await element(by.id('email-input')).typeText('newuser@example.com');
    await element(by.id('username-input')).typeText('newuser123');
    await element(by.id('password-input')).typeText('SecurePass123!');
    
    await element(by.id('submit-register')).tap();
    
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should login existing user', async () => {
    await element(by.id('login-button')).tap();
    
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    
    await element(by.id('submit-login')).tap();
    
    await waitFor(element(by.id('home-screen')))
      .toBeVisible()
      .withTimeout(5000);
  });

  it('should handle login errors', async () => {
    await element(by.id('login-button')).tap();
    
    await element(by.id('email-input')).typeText('wrong@example.com');
    await element(by.id('password-input')).typeText('wrongpass');
    
    await element(by.id('submit-login')).tap();
    
    await waitFor(element(by.text('Identifiants invalides')))
      .toBeVisible()
      .withTimeout(3000);
  });
});
```

```typescript
// e2e/game.e2e.ts
describe('Game Flow', () => {
  beforeAll(async () => {
    await device.launchApp();
    // Se connecter
    await element(by.id('login-button')).tap();
    await element(by.id('email-input')).typeText('test@example.com');
    await element(by.id('password-input')).typeText('password123');
    await element(by.id('submit-login')).tap();
  });

  it('should start a quick game', async () => {
    await element(by.id('quick-game-button')).tap();
    
    await waitFor(element(by.id('game-screen')))
      .toBeVisible()
      .withTimeout(10000);
    
    // Vérifier que le plateau est affiché
    await expect(element(by.id('game-board'))).toBeVisible();
  });

  it('should place cards during placement phase', async () => {
    // Sélectionner une carte
    await element(by.id('card-1')).tap();
    
    // Placer sur le plateau
    await element(by.id('cell-Z2-2')).tap();
    
    // Vérifier que la carte est placée
    await expect(element(by.id('placed-card-Z2-2'))).toBeVisible();
  });

  it('should make a move during game', async () => {
    // Attendre notre tour
    await waitFor(element(by.text('C\'est votre tour')))
      .toBeVisible()
      .withTimeout(45000);
    
    // Sélectionner une action
    await element(by.id('action-pass')).tap();
    
    // Sélectionner la cible
    await element(by.id('cell-Z2-3')).tap();
    
    // Confirmer
    await element(by.id('confirm-action')).tap();
    
    // Vérifier que c'est maintenant le tour de l'adversaire
    await waitFor(element(by.text('Tour de l\'adversaire')))
      .toBeVisible()
      .withTimeout(5000);
  });
});
```

## 8. Test Utils et Mocks

```typescript
// utils/test-wrapper.tsx
import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from '@/contexts/AppProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
    mutations: { retry: false },
  },
});

export const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    <AppProvider>
      <NavigationContainer>
        {children}
      </NavigationContainer>
    </AppProvider>
  </QueryClientProvider>
);

// Mock Auth Provider pour les tests
export const MockAuthProvider = ({ children, userId = 'test-user' }: any) => {
  const mockAuth = {
    user: { id: userId },
    profile: { id: userId, username: 'testuser' },
    isAuthenticated: true,
    isLoading: false,
    error: null,
  };

  return (
    <AuthContext.Provider value={mockAuth}>
      {children}
    </AuthContext.Provider>
  );
};
```

```typescript
// utils/test-utils.ts
import { render as rtlRender } from '@testing-library/react-native';
import { wrapper } from './test-wrapper';

// Custom render function qui inclut les providers
export const render = (ui: React.ReactElement, options?: any) =>
  rtlRender(ui, { wrapper, ...options });

// Mock de navigation
export const createMockNavigation = () => ({
  navigate: jest.fn(),
  goBack: jest.fn(),
  setParams: jest.fn(),
  dispatch: jest.fn(),
  replace: jest.fn(),
  push: jest.fn(),
  pop: jest.fn(),
  popToTop: jest.fn(),
  isFocused: jest.fn().mockReturnValue(true),
});

// Setup des tests avec des mocks globaux
export const setupTests = () => {
  // Mock des modules natifs
  jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
  
  // Mock de react-native-gesture-handler
  jest.mock('react-native-gesture-handler', () => {
    const View = require('react-native').View;
    return {
      Swipeable: View,
      DrawerLayout: View,
      State: {},
      ScrollView: View,
      FlatList: View,
      RectButton: View,
      BorderlessButton: View,
      BaseButton: View,
      PanGestureHandler: View,
      TouchableOpacity: View,
    };
  });
};
```

## 9. Configuration des Tests

```json
// jest.config.js (mise à jour)
module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: [
    '@testing-library/jest-native/extend-expect',
    '<rootDir>/jest.setup.js',
    '<rootDir>/src/utils/test-utils.ts',
  ],
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|@react-native-community|expo|@expo|@unimodules|@sentry|supabase)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(jpg|jpeg|png|gif|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,tsx}',
    '!src/**/*.stories.{ts,tsx}',
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```