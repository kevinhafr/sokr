import { NavigatorScreenParams } from '@react-navigation/native';

export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Game: { gameId: string };
  Matchmaking: { gameId: string };
  CoinToss: { gameId: string };
  DeckBuilder: { mode: 'create' | 'edit'; deckId?: string };
  DeckSelection: { mode: 'quick' | 'ranked' };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  Decks: undefined;
  Shop: undefined;
  Profile: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}