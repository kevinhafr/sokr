import React from 'react';
import { GameProvider } from '../contexts/GameContext';
import { GameChannelProvider } from '../contexts/GameChannelContext';
import GameScreen from './GameScreen';
import { useRoute } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';

type GameScreenRouteProp = RouteProp<RootStackParamList, 'Game'>;

export default function GameScreenWrapper(props: any) {
  const route = useRoute<GameScreenRouteProp>();
  const gameId = route.params.gameId;
  
  return (
    <GameChannelProvider gameId={gameId}>
      <GameProvider gameId={gameId}>
        <GameScreen {...props} />
      </GameProvider>
    </GameChannelProvider>
  );
}