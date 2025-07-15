import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { GameChannelManager } from '@/lib/channels/GameChannelManager';
import { useAuth } from './AuthContext';

interface GameChannelState {
  connected: boolean;
  players: string[];
  error: Error | null;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
}

interface GameChannelContextValue extends GameChannelState {
  sendMove: (move: any) => Promise<void>;
  sendCardPlacement: (placement: any) => Promise<void>;
  requestSync: () => Promise<void>;
  setGameDispatch: (dispatch: React.Dispatch<any>) => void;
}

const GameChannelContext = createContext<GameChannelContextValue | undefined>(undefined);

export function GameChannelProvider({ 
  children, 
  gameId 
}: { 
  children: React.ReactNode;
  gameId: string;
}) {
  const [connected, setConnected] = useState(false);
  const [players, setPlayers] = useState<string[]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'reconnecting'>('disconnected');
  
  const { userId } = useAuth();
  const managerRef = useRef<GameChannelManager | null>(null);
  const gameDispatchRef = useRef<React.Dispatch<any> | null>(null);

  // Allow GameContext to register its dispatch
  const setGameDispatch = useCallback((dispatch: React.Dispatch<any>) => {
    gameDispatchRef.current = dispatch;
  }, []);

  useEffect(() => {
    if (!gameId || !userId) return;

    const manager = new GameChannelManager({
      gameId,
      userId,
      onStateUpdate: (state) => {
        if (gameDispatchRef.current) {
          gameDispatchRef.current({
            type: 'REALTIME_STATE_UPDATE',
            payload: state
          });
        }
      },
      onGameEvent: (event) => {
        if (gameDispatchRef.current) {
          gameDispatchRef.current({
            type: 'REALTIME_GAME_EVENT',
            payload: event
          });
        }
      },
      onPlayerStatus: (status) => {
        if (status.type === 'PRESENCE_SYNC') {
          setPlayers(status.players);
        }
        
        if (gameDispatchRef.current) {
          gameDispatchRef.current({
            type: 'REALTIME_PLAYER_STATUS',
            payload: status
          });
        }

        // Update connection status
        switch (status.type) {
          case 'CONNECTED':
            setConnected(true);
            setConnectionStatus('connected');
            break;
          case 'DISCONNECTED':
            setConnected(false);
            setConnectionStatus('disconnected');
            break;
          case 'RECONNECTING':
            setConnectionStatus('reconnecting');
            break;
        }
      },
      onError: (error) => {
        console.error('Channel error:', error);
        setError(error);
      }
    });

    managerRef.current = manager;
    manager.connect();

    return () => {
      manager.disconnect();
      managerRef.current = null;
    };
  }, [gameId, userId]);

  const sendMove = useCallback(async (move: any) => {
    if (!managerRef.current) {
      throw new Error('Channel not connected');
    }
    
    if (gameDispatchRef.current) {
      gameDispatchRef.current({ type: 'MOVE_START', payload: move });
    }
    
    try {
      await managerRef.current.sendGameAction({
        type: 'MOVE',
        payload: move
      });
      
      if (gameDispatchRef.current) {
        gameDispatchRef.current({ type: 'MOVE_SUCCESS', payload: move });
      }
    } catch (error) {
      if (gameDispatchRef.current) {
        gameDispatchRef.current({ type: 'MOVE_ERROR', payload: error });
      }
      throw error;
    }
  }, []);

  const sendCardPlacement = useCallback(async (placement: any) => {
    if (!managerRef.current) {
      throw new Error('Channel not connected');
    }
    
    if (gameDispatchRef.current) {
      gameDispatchRef.current({ type: 'PLACEMENT_START', payload: placement });
    }
    
    try {
      await managerRef.current.sendGameAction({
        type: 'CARD_PLACEMENT',
        payload: placement
      });
      
      if (gameDispatchRef.current) {
        gameDispatchRef.current({ type: 'PLACEMENT_SUCCESS', payload: placement });
      }
    } catch (error) {
      if (gameDispatchRef.current) {
        gameDispatchRef.current({ type: 'PLACEMENT_ERROR', payload: error });
      }
      throw error;
    }
  }, []);

  const requestSync = useCallback(async () => {
    if (!managerRef.current) {
      throw new Error('Channel not connected');
    }
    
    try {
      await managerRef.current.requestStateSync();
    } catch (error) {
      console.error('Sync request failed:', error);
      throw error;
    }
  }, []);

  const value: GameChannelContextValue = {
    connected,
    players,
    error,
    connectionStatus,
    sendMove,
    sendCardPlacement,
    requestSync,
    setGameDispatch,
  };

  return (
    <GameChannelContext.Provider value={value}>
      {children}
    </GameChannelContext.Provider>
  );
}

export function useGameChannel() {
  const context = useContext(GameChannelContext);
  if (context === undefined) {
    throw new Error('useGameChannel must be used within a GameChannelProvider');
  }
  return context;
}