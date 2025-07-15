import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/types';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { supabase } from '../services/supabase';

type MatchmakingScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Matchmaking'>;
type MatchmakingScreenRouteProp = RouteProp<RootStackParamList, 'Matchmaking'>;

export default function MatchmakingScreen() {
  const navigation = useNavigation<MatchmakingScreenNavigationProp>();
  const route = useRoute<MatchmakingScreenRouteProp>();
  const styles = useThemedStyles(createStyles);
  
  const [searchTime, setSearchTime] = useState(0);
  const [gameId, setGameId] = useState<string | null>(null);
  const [status, setStatus] = useState<'searching' | 'found' | 'starting'>('searching');

  useEffect(() => {
    // Timer pour le temps de recherche
    const timer = setInterval(() => {
      setSearchTime(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!route.params?.gameId) return;
    
    const gameId = route.params.gameId;
    setGameId(gameId);

    // S'abonner aux changements de la partie
    const subscription = supabase
      .channel(`game:${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        async (payload) => {
          const game = payload.new;
          
          // Un adversaire a rejoint
          if (game.player_b && game.status === 'coinToss') {
            setStatus('found');
            
            // Attendre un peu pour montrer l'animation
            setTimeout(() => {
              setStatus('starting');
              // Lancer le coin toss
              handleCoinToss(gameId);
            }, 1500);
          }
        }
      )
      .subscribe();

    // Après 30 secondes, proposer de jouer contre l'IA
    const aiTimeout = setTimeout(() => {
      if (status === 'searching') {
        Alert.alert(
          'Aucun adversaire trouvé',
          'Voulez-vous jouer contre l\'IA ?',
          [
            {
              text: 'Continuer à attendre',
              style: 'cancel'
            },
            {
              text: 'Jouer contre l\'IA',
              onPress: () => playAgainstAI(gameId)
            }
          ]
        );
      }
    }, 30000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(aiTimeout);
    };
  }, [route.params?.gameId, status]);

  const handleCoinToss = async (gameId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('coin-toss', {
        body: { gameId }
      });

      if (error) throw error;

      // Naviguer vers l'écran de jeu
      navigation.replace('Game', { gameId });
    } catch (error) {
      console.error('Coin toss error:', error);
      Alert.alert('Erreur', 'Impossible de lancer la pièce');
    }
  };

  const playAgainstAI = async (gameId: string) => {
    try {
      // Ajouter l'IA comme adversaire
      const { error } = await supabase
        .from('games')
        .update({
          player_b: 'ai_' + Date.now().toString(),
          status: 'coinToss'
        })
        .eq('id', gameId);

      if (error) throw error;
    } catch (error) {
      console.error('Error adding AI:', error);
      Alert.alert('Erreur', 'Impossible d\'ajouter l\'IA');
    }
  };

  const cancelSearch = async () => {
    try {
      if (gameId) {
        // Supprimer la partie
        await supabase
          .from('games')
          .delete()
          .eq('id', gameId);
      }
      
      navigation.goBack();
    } catch (error) {
      console.error('Error canceling:', error);
      navigation.goBack();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Card variant="default" style={styles.card}>
        <View style={styles.content}>
          {status === 'searching' && (
            <>
              <ActivityIndicator size="large" color={styles.spinner.color} />
              <Text style={styles.title}>Recherche d'un adversaire...</Text>
              <Text style={styles.timer}>{formatTime(searchTime)}</Text>
              <Text style={styles.info}>
                Nous recherchons un joueur de votre niveau
              </Text>
            </>
          )}

          {status === 'found' && (
            <>
              <Text style={styles.title}>Adversaire trouvé ! 🎉</Text>
              <Text style={styles.info}>
                Préparation du match...
              </Text>
            </>
          )}

          {status === 'starting' && (
            <>
              <Text style={styles.title}>Lancer de pièce...</Text>
              <Text style={styles.coinEmoji}>🪙</Text>
              <Text style={styles.info}>
                Qui commencera à placer ses cartes ?
              </Text>
            </>
          )}
        </View>

        {status === 'searching' && (
          <Button
            title="Annuler"
            variant="ghost"
            onPress={cancelSearch}
            style={styles.cancelButton}
          />
        )}
      </Card>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof import('../hooks/useThemedStyles').useTheme>) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.theme.spacing.lg,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: theme.theme.spacing.xl,
  },
  content: {
    alignItems: 'center',
    marginBottom: theme.theme.spacing.xl,
  },
  spinner: {
    color: theme.colors.primary,
  },
  title: {
    fontSize: theme.theme.typography.fontSize.xl,
    fontWeight: theme.theme.typography.fontWeight.bold,
    color: theme.colors.foreground,
    fontFamily: theme.theme.typography.fontFamily.sans,
    marginTop: theme.theme.spacing.lg,
    marginBottom: theme.theme.spacing.sm,
    textAlign: 'center',
  },
  timer: {
    fontSize: theme.theme.typography.fontSize['2xl'],
    fontWeight: theme.theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    fontFamily: theme.theme.typography.fontFamily.mono,
    marginBottom: theme.theme.spacing.lg,
  },
  info: {
    fontSize: theme.theme.typography.fontSize.base,
    color: theme.colors.mutedForeground,
    fontFamily: theme.theme.typography.fontFamily.sans,
    textAlign: 'center',
  },
  coinEmoji: {
    fontSize: 64,
    marginVertical: theme.theme.spacing.lg,
  },
  cancelButton: {
    width: '100%',
  },
});