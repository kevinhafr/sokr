import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { useMatchmaking } from '../hooks/useMatchmaking';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { 
  Typography, 
  DisplayText, 
  Heading, 
  BodyText,
  Button,
  Card,
  GlassCard,
  AnimatedCard,
  Badge,
  AnimatedNumber,
  Icon,
  GradientButton,
  NotificationToast
} from '../components/ui';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../services/supabase';
import { useScreenTransition, useStaggerAnimation } from '../navigation/transitions/TransitionHooks';
import { TransitionWrapper } from '../navigation/transitions/CustomTransitions';
import { GameTheme } from '../styles';

const { width: screenWidth } = Dimensions.get('window');

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { profile } = useAuth();
  const { cancelSearch, isSearching } = useMatchmaking();
  const styles = useThemedStyles(createStyles);
  
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'achievement' | 'info'>('info');
  
  // Animation de transition d'écran
  const { animatedStyle } = useScreenTransition('fade', {
    duration: 600,
  });
  
  // Animation décalée pour les éléments
  const { getItemStyle } = useStaggerAnimation(6, {
    staggerDelay: 100,
    itemDuration: 400,
    initialDelay: 200,
  });
  
  // Animation de particules de fond
  const particleAnims = useRef(
    Array(5).fill(0).map(() => ({
      x: new Animated.Value(Math.random() * screenWidth),
      y: new Animated.Value(-50),
      opacity: new Animated.Value(0),
    }))
  ).current;
  
  useEffect(() => {
    // Animation des particules
    particleAnims.forEach((particle, index) => {
      const animateParticle = () => {
        particle.x.setValue(Math.random() * screenWidth);
        particle.y.setValue(-50);
        particle.opacity.setValue(0);
        
        Animated.parallel([
          Animated.timing(particle.y, {
            toValue: 1000,
            duration: 8000 + index * 1000,
            useNativeDriver: true,
          }),
          Animated.sequence([
            Animated.timing(particle.opacity, {
              toValue: 0.6,
              duration: 2000,
              useNativeDriver: true,
            }),
            Animated.timing(particle.opacity, {
              toValue: 0,
              duration: 2000,
              delay: 4000,
              useNativeDriver: true,
            }),
          ]),
        ]).start(() => animateParticle());
      };
      
      setTimeout(() => animateParticle(), index * 1500);
    });
  }, []);

  const handleQuickPlay = () => {
    navigation.navigate('DeckSelection', { mode: 'quick' });
  };
  
  const handleRankedPlay = () => {
    navigation.navigate('DeckSelection', { mode: 'ranked' });
  };

  const handleCancelSearch = () => {
    cancelSearch();
  };
  
  const showAchievement = () => {
    setNotificationType('achievement');
    setShowNotification(true);
  };

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={GameTheme.gradients.backgroundPremium.colors}
        start={GameTheme.gradients.backgroundPremium.start}
        end={GameTheme.gradients.backgroundPremium.end}
        style={styles.backgroundGradient}
      />
      
      {/* Particules animées */}
      {particleAnims.map((particle, index) => (
        <Animated.View
          key={index}
          style={[
            styles.particle,
            {
              transform: [
                { translateX: particle.x },
                { translateY: particle.y },
              ],
              opacity: particle.opacity,
            },
          ]}
        />
      ))}
      
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Animated.View style={animatedStyle}>
          {/* Header avec effet glass */}
          <TransitionWrapper type="fade" delay={0}>
            <GlassCard style={styles.header} intensity={40} glow>
              <Typography variant="h2" color={GameTheme.colors.textSecondary}>
                Bienvenue,
              </Typography>
              <Typography variant="displayMedium" shadow="depth">
                {profile?.username || 'Champion'}
              </Typography>
              
              {/* Stats en ligne */}
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Icon name="trophy" size={20} color={GameTheme.colors.secondary} />
                  <AnimatedNumber 
                    value={profile?.level || 1} 
                    variant="stat" 
                    prefix="Niv. "
                  />
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Icon name="star" size={20} color={GameTheme.colors.primary} />
                  <AnimatedNumber 
                    value={profile?.rating || 1000} 
                    variant="stat" 
                    suffix=" MMR"
                  />
                </View>
              </View>
            </GlassCard>
          </TransitionWrapper>

          {/* Section des modes de jeu */}
          <View style={styles.section}>
            <TransitionWrapper type="slide" delay={100}>
              <Heading level={1} shadow="subtle">
                CHOISIR UN MODE
              </Heading>
            </TransitionWrapper>
            
            <View style={styles.gameModes}>
              {/* Mode rapide */}
              <Animated.View style={[styles.gameModeWrapper, getItemStyle(0)]}>
                <AnimatedCard variant="tilt" autoAnimate={false}>
                  <LinearGradient
                    colors={['#1E2444', '#2A3152']}
                    style={styles.gameModeCard}
                  >
                    <View style={styles.gameModeHeader}>
                      <View style={styles.gameModeIcon}>
                        <Icon name="lightning" size={48} color={GameTheme.colors.primary} />
                      </View>
                      <Badge variant="default" size="sm">CASUAL</Badge>
                    </View>
                    
                    <Typography variant="h2" style={styles.gameModeTitle}>
                      PARTIE RAPIDE
                    </Typography>
                    <BodyText color={GameTheme.colors.textSecondary} style={styles.gameModeDescription}>
                      Match amical • Sans enjeu • 5 min
                    </BodyText>
                    
                    <GradientButton
                      title="JOUER MAINTENANT"
                      variant="primary"
                      size="lg"
                      onPress={handleQuickPlay}
                      disabled={isSearching}
                      glow
                      style={styles.playButton}
                    />
                  </LinearGradient>
                </AnimatedCard>
              </Animated.View>
              
              {/* Mode classé */}
              <Animated.View style={[styles.gameModeWrapper, getItemStyle(1)]}>
                <AnimatedCard variant="tilt" autoAnimate={false}>
                  <LinearGradient
                    colors={GameTheme.gradients.cardPremium.colors}
                    style={[styles.gameModeCard, styles.rankedCard]}
                  >
                    <View style={styles.gameModeHeader}>
                      <View style={styles.gameModeIcon}>
                        <Icon name="trophy" size={48} color={GameTheme.colors.secondary} />
                      </View>
                      <Badge variant="premium" size="sm" glow>RANKED</Badge>
                    </View>
                    
                    <Typography variant="h2" style={styles.gameModeTitle}>
                      PARTIE CLASSÉE
                    </Typography>
                    <BodyText color={GameTheme.colors.textSecondary} style={styles.gameModeDescription}>
                      Compétitif • +/- MMR • 8 min
                    </BodyText>
                    
                    <GradientButton
                      title="DÉFIER"
                      variant="premium"
                      size="lg"
                      onPress={handleRankedPlay}
                      disabled={isSearching}
                      glow
                      style={styles.playButton}
                    />
                  </LinearGradient>
                </AnimatedCard>
              </Animated.View>
            </View>
          </View>

          {/* Recherche en cours */}
          {isSearching && (
            <TransitionWrapper type="scale">
              <GlassCard style={styles.searchingCard} glow intensity={60}>
                <ActivityIndicator size="large" color={GameTheme.colors.primary} />
                <Typography variant="h3" shadow="glow" style={styles.searchingText}>
                  RECHERCHE D'UN ADVERSAIRE...
                </Typography>
                <AnimatedNumber 
                  value={30} 
                  variant="timer" 
                  suffix="s"
                  duration={30000}
                />
                <Button
                  title="ANNULER"
                  variant="secondary"
                  onPress={handleCancelSearch}
                  style={styles.cancelButton}
                />
              </GlassCard>
            </TransitionWrapper>
          )}

          {/* Section événements */}
          <View style={styles.section}>
            <TransitionWrapper type="slide" delay={200}>
              <Heading level={2}>ÉVÉNEMENTS</Heading>
            </TransitionWrapper>
            
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.eventsScroll}>
              {/* Tournoi du jour */}
              <Animated.View style={getItemStyle(2)}>
                <Card variant="premium" glow style={styles.eventCard}>
                  <LinearGradient
                    colors={GameTheme.gradients.cardLegendary.colors}
                    style={styles.eventGradient}
                  >
                    <Badge variant="premium" size="sm" style={styles.eventBadge}>
                      TOURNOI
                    </Badge>
                    <Icon name="crown" size={40} color="#0A0E27" />
                    <Typography variant="h3" color="#0A0E27" shadow="subtle">
                      COUPE DU SOIR
                    </Typography>
                    <Typography variant="currency" color="#0A0E27">
                      5000 COINS
                    </Typography>
                    <BodyText size="small" color="#0A0E27">
                      Commence dans 2h
                    </BodyText>
                  </LinearGradient>
                </Card>
              </Animated.View>
              
              {/* Défi quotidien */}
              <Animated.View style={getItemStyle(3)}>
                <Card variant="elevated" style={styles.eventCard}>
                  <Badge variant="success" size="sm" style={styles.eventBadge}>
                    DAILY
                  </Badge>
                  <Icon name="target" size={40} color={GameTheme.colors.success} />
                  <Typography variant="h3">
                    DÉFI DU JOUR
                  </Typography>
                  <BodyText color={GameTheme.colors.textSecondary}>
                    Gagne 3 matchs
                  </BodyText>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: '33%' }]} />
                  </View>
                  <Typography variant="caption" color={GameTheme.colors.textMuted}>
                    1/3 complété
                  </Typography>
                </Card>
              </Animated.View>
            </ScrollView>
          </View>

          {/* Actions rapides */}
          <View style={styles.section}>
            <TransitionWrapper type="slide" delay={300}>
              <Heading level={2}>ACCÈS RAPIDE</Heading>
            </TransitionWrapper>
            
            <View style={styles.quickActions}>
              <Animated.View style={[styles.actionWrapper, getItemStyle(4)]}>
                <AnimatedCard variant="pulse" autoAnimate>
                  <Card variant="elevated" style={styles.actionCard}>
                    <Icon name="cards" size={32} color={GameTheme.colors.primary} />
                    <Typography variant="label">MES DECKS</Typography>
                  </Card>
                </AnimatedCard>
              </Animated.View>
              
              <Animated.View style={[styles.actionWrapper, getItemStyle(5)]}>
                <AnimatedCard variant="pulse" autoAnimate>
                  <Card variant="elevated" style={styles.actionCard}>
                    <Icon name="shopping-bag" size={32} color={GameTheme.colors.secondary} />
                    <Typography variant="label">BOUTIQUE</Typography>
                    <Badge variant="danger" size="sm" style={styles.actionBadge}>
                      NEW
                    </Badge>
                  </Card>
                </AnimatedCard>
              </Animated.View>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
      
      {/* Notification toast */}
      <NotificationToast
        visible={showNotification}
        type={notificationType}
        title={notificationType === 'achievement' ? 'Succès débloqué!' : 'Information'}
        message={notificationType === 'achievement' ? 'Premier match gagné' : 'Nouveau contenu disponible'}
        position="top"
        onDismiss={() => setShowNotification(false)}
      />
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof import('../hooks/useThemedStyles').useTheme>) => ({
  container: {
    flex: 1,
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  particle: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: GameTheme.colors.primary,
    borderRadius: 2,
    shadowColor: GameTheme.colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingBottom: GameTheme.spacing.xxl,
  },
  header: {
    margin: GameTheme.spacing.lg,
    padding: GameTheme.spacing.xl,
    alignItems: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: GameTheme.spacing.lg,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: GameTheme.spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: GameTheme.colors.border,
    marginHorizontal: GameTheme.spacing.md,
  },
  section: {
    marginTop: GameTheme.spacing.xl,
    paddingHorizontal: GameTheme.spacing.lg,
  },
  gameModes: {
    marginTop: GameTheme.spacing.lg,
    gap: GameTheme.spacing.md,
  },
  gameModeWrapper: {
    marginBottom: GameTheme.spacing.sm,
  },
  gameModeCard: {
    padding: GameTheme.spacing.xl,
    borderRadius: GameTheme.borderRadius.xl,
  },
  rankedCard: {
    borderWidth: 2,
    borderColor: GameTheme.colors.secondary,
  },
  gameModeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: GameTheme.spacing.md,
  },
  gameModeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gameModeTitle: {
    marginBottom: GameTheme.spacing.xs,
  },
  gameModeDescription: {
    marginBottom: GameTheme.spacing.lg,
  },
  playButton: {
    marginTop: GameTheme.spacing.md,
  },
  searchingCard: {
    margin: GameTheme.spacing.lg,
    padding: GameTheme.spacing.xl,
    alignItems: 'center',
  },
  searchingText: {
    marginVertical: GameTheme.spacing.md,
  },
  cancelButton: {
    marginTop: GameTheme.spacing.lg,
  },
  eventsScroll: {
    marginTop: GameTheme.spacing.md,
    marginHorizontal: -GameTheme.spacing.lg,
    paddingHorizontal: GameTheme.spacing.lg,
  },
  eventCard: {
    width: 200,
    marginRight: GameTheme.spacing.md,
    overflow: 'hidden',
  },
  eventGradient: {
    padding: GameTheme.spacing.lg,
    alignItems: 'center',
  },
  eventBadge: {
    position: 'absolute',
    top: GameTheme.spacing.sm,
    right: GameTheme.spacing.sm,
  },
  progressBar: {
    height: 4,
    backgroundColor: GameTheme.colors.surface,
    borderRadius: 2,
    marginTop: GameTheme.spacing.sm,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: GameTheme.colors.primary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: GameTheme.spacing.md,
    marginTop: GameTheme.spacing.md,
  },
  actionWrapper: {
    flex: 1,
  },
  actionCard: {
    padding: GameTheme.spacing.lg,
    alignItems: 'center',
    gap: GameTheme.spacing.sm,
  },
  actionBadge: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
});