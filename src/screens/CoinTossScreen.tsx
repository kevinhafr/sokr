import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Animated,
  Pressable,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/types';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { Typography, Heading, AnimatedCard } from '../components/ui';
import { supabase } from '../services/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useScreenTransition } from '../navigation/transitions/TransitionHooks';
import { TransitionWrapper, TransitionOverlay } from '../navigation/transitions/CustomTransitions';
import { GameTheme } from '../styles';

type CoinTossScreenNavigationProp = StackNavigationProp<RootStackParamList, 'CoinToss'>;

export default function CoinTossScreen() {
  const route = useRoute();
  const navigation = useNavigation<CoinTossScreenNavigationProp>();
  const styles = useThemedStyles(createStyles);
  const { userId } = useAuth();
  
  const { gameId } = route.params as { gameId: string };
  
  const [playerReady, setPlayerReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [coinFlipping, setCoinFlipping] = useState(false);
  const [result, setResult] = useState<'heads' | 'tails' | null>(null);
  const [winner, setWinner] = useState<string | null>(null);
  const [showGlitch, setShowGlitch] = useState(false);
  
  const spinValue = new Animated.Value(0);
  
  // Animation glitch pour l'entrée
  const { animatedStyle } = useScreenTransition('custom', {
    duration: 800,
  });
  
  // Animation glitch effect
  const glitchAnim = React.useRef(new Animated.Value(0)).current;
  
  React.useEffect(() => {
    // Déclencheur effet glitch aléatoire
    const glitchInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        Animated.sequence([
          Animated.timing(glitchAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
          Animated.timing(glitchAnim, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, 2000);
    
    return () => clearInterval(glitchInterval);
  }, []);
  
  useEffect(() => {
    // Écouter les changements d'état du jeu
    const subscription = supabase
      .channel(`game:${gameId}`)
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'games',
        filter: `id=eq.${gameId}`
      }, (payload) => {
        const game = payload.new;
        // Vérifier si le coin toss est terminé
        if (game.status === 'placement' || game.status === 'placementTeamA' || game.status === 'placementTeamB') {
          // Naviguer vers le placement
          navigation.replace('GameScreen', { gameId });
        }
      })
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [gameId]);
  
  const handleReady = async () => {
    setPlayerReady(true);
    
    // Appeler la fonction coin-toss
    const { data, error } = await supabase.functions.invoke('coin-toss', {
      body: { gameId, ready: true }
    });
    
    if (error) {
      console.error('Coin toss error:', error);
      return;
    }
    
    if (data.status === 'waiting') {
      // En attente de l'autre joueur
      setOpponentReady(false);
    } else if (data.status === 'flipping') {
      // Les deux joueurs sont prêts, lancer l'animation
      setOpponentReady(true);
      startCoinFlip(data.winner, data.result);
    }
  };
  
  const startCoinFlip = (winnerId: string, coinResult: 'heads' | 'tails') => {
    setCoinFlipping(true);
    
    // Animation de rotation
    Animated.timing(spinValue, {
      toValue: 10, // 10 tours complets
      duration: 2000,
      useNativeDriver: true,
    }).start(() => {
      setResult(coinResult);
      setWinner(winnerId);
      setCoinFlipping(false);
      
      // Naviguer après 2 secondes
      setTimeout(() => {
        navigation.replace('GameScreen', { gameId });
      }, 2000);
    });
  };
  
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });
  
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tirage au sort</Text>
      
      <View style={styles.coinContainer}>
        <Animated.View
          style={[
            styles.coin,
            { transform: [{ rotateY: spin }] }
          ]}
        >
          <Icon 
            name="ball" 
            size={120} 
            color={styles.coinColor.color} 
          />
        </Animated.View>
      </View>
      
      {!playerReady && (
        <Card variant="elevated" style={styles.readyCard}>
          <Text style={styles.readyText}>
            Cliquez quand vous êtes prêt pour le tirage au sort
          </Text>
          <Button
            title="Je suis prêt"
            variant="primary"
            size="large"
            onPress={handleReady}
            style={styles.readyButton}
          />
        </Card>
      )}
      
      {playerReady && !opponentReady && !coinFlipping && (
        <Card variant="default" style={styles.waitingCard}>
          <Text style={styles.waitingText}>
            En attente de l'adversaire...
          </Text>
        </Card>
      )}
      
      {result && winner && (
        <Card variant="elevated" style={styles.resultCard}>
          <Text style={styles.resultText}>
            {result === 'heads' ? 'Face' : 'Pile'}
          </Text>
          <Text style={styles.winnerText}>
            {winner === userId ? 'Vous commencez !' : 'L\'adversaire commence'}
          </Text>
        </Card>
      )}
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof import('../hooks/useThemedStyles').useTheme>) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.theme.spacing.lg,
  },
  title: {
    fontSize: theme.theme.typography.fontSize.xxxl,
    fontFamily: theme.theme.fonts.bebas,
    color: theme.colors.text,
    marginBottom: theme.theme.spacing.xxl,
  },
  coinContainer: {
    width: 200,
    height: 200,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.theme.spacing.xxl,
  },
  coin: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coinColor: {
    color: theme.colors.primary,
  },
  readyCard: {
    padding: theme.theme.spacing.xl,
    alignItems: 'center',
    width: '100%',
  },
  readyText: {
    fontSize: theme.theme.typography.fontSize.lg,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.theme.spacing.lg,
  },
  readyButton: {
    width: '100%',
  },
  waitingCard: {
    padding: theme.theme.spacing.xl,
    alignItems: 'center',
  },
  waitingText: {
    fontSize: theme.theme.typography.fontSize.lg,
    color: theme.colors.textMuted,
  },
  resultCard: {
    padding: theme.theme.spacing.xl,
    alignItems: 'center',
  },
  resultText: {
    fontSize: theme.theme.typography.fontSize.xxl,
    fontFamily: theme.theme.fonts.bebas,
    color: theme.colors.text,
    marginBottom: theme.theme.spacing.md,
  },
  winnerText: {
    fontSize: theme.theme.typography.fontSize.lg,
    color: theme.colors.primary,
  },
});