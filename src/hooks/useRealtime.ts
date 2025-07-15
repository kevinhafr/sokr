import { useEffect, useState, useCallback, useRef } from 'react';
import { GameChannelManager } from '@/lib/channels/GameChannelManager';
import { ReconnectionHandler } from '@/lib/sync/ReconnectionHandler';

export function useRealtime(gameId: string, userId: string) {
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [lastError, setLastError] = useState<Error | null>(null);
  
  const channelManager = useRef<GameChannelManager | null>(null);
  const reconnectionHandler = useRef<ReconnectionHandler | null>(null);

  useEffect(() => {
    if (!gameId || !userId) return;

    // Initialiser les gestionnaires
    channelManager.current = new GameChannelManager({
      gameId,
      userId,
      onStateUpdate: (state) => console.log('State update:', state),
      onGameEvent: (event) => console.log('Game event:', event),
      onPlayerStatus: (status) => console.log('Player status:', status),
      onError: (error) => {
        setLastError(error);
        setConnected(false);
      }
    });

    reconnectionHandler.current = new ReconnectionHandler(
      gameId,
      userId,
      () => {
        setReconnecting(false);
        setConnected(true);
      },
      (error) => {
        setReconnecting(false);
        setLastError(error);
      }
    );

    // Se connecter
    channelManager.current.connect();

    return () => {
      channelManager.current?.disconnect();
    };
  }, [gameId, userId]);

  const reconnect = useCallback(() => {
    setReconnecting(true);
    reconnectionHandler.current?.handleReconnection();
  }, []);

  return {
    connected,
    reconnecting,
    lastError,
    reconnect
  };
}