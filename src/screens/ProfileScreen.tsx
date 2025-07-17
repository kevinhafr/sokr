import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { useNavigation } from '@react-navigation/native';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Icon } from '../components/ui/Icon';
import { Typography, Heading, AnimatedNumber, Badge, GlassCard } from '../components/ui';
import { useScreenTransition, useStaggerAnimation } from '../navigation/transitions/TransitionHooks';
import { TransitionWrapper } from '../navigation/transitions/CustomTransitions';
import { GameTheme } from '../styles';
import { Animated } from 'react-native';

export default function ProfileScreen() {
  const { profile, signOut } = useAuth();
  const navigation = useNavigation();
  const styles = useThemedStyles(createStyles);
  
  // Animation de transition menu
  const { animatedStyle } = useScreenTransition('scale', {
    duration: 300,
  });
  
  // Animation décalée pour les stats
  const { getItemStyle } = useStaggerAnimation(6, {
    staggerDelay: 60,
    itemDuration: 250,
  });

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
            await signOut();
          },
        },
      ]
    );
  };

  const stats = [
    { label: 'Parties jouées', value: (profile?.wins || 0) + (profile?.losses || 0) },
    { label: 'Victoires', value: profile?.wins || 0 },
    { label: 'Défaites', value: profile?.losses || 0 },
    { label: 'Win Rate', value: `${profile?.wins && profile?.losses ? Math.round((profile.wins / (profile.wins + profile.losses)) * 100) : 0}%` },
    { label: 'MMR', value: profile?.mmr || 1000 },
    { label: 'Meilleur MMR', value: profile?.mmr || 1000 },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Animated.View style={animatedStyle}>
        <TransitionWrapper type="fade">
          <GlassCard style={styles.header} intensity={30}>
            <View style={styles.avatar}>
              <Typography variant="displaySmall" color="#FFFFFF">
                {profile?.username?.charAt(0).toUpperCase() || '?'}
              </Typography>
            </View>
            <Heading level={1} shadow="depth">
              {profile?.username || 'Joueur'}
            </Heading>
            <Typography variant="body" color={GameTheme.colors.textSecondary}>
              Membre depuis janvier 2024
            </Typography>
            <Badge variant="premium" size="lg" glow>
              NIVEAU {profile?.level || 1}
            </Badge>
          </GlassCard>
        </TransitionWrapper>

        <View style={styles.section}>
          <TransitionWrapper type="slide" delay={100}>
            <Heading level={2}>Statistiques</Heading>
          </TransitionWrapper>
          <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
            <Card key={index} variant="default" style={styles.statCard}>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statLabel}>{stat.label}</Text>
            </Card>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Succès</Text>
        <View style={styles.achievements}>
          <Card variant="outlined" style={styles.achievementCard}>
            <View style={styles.achievementIcon}>
              <Icon name="trophy" size={32} color={styles.achievementIconColor.color} />
            </View>
            <Text style={styles.achievementName}>Premier but</Text>
          </Card>
          <Card variant="outlined" style={styles.achievementCard}>
            <View style={styles.achievementIcon}>
              <Icon name="lightning" size={32} color={styles.achievementIconColor.color} />
            </View>
            <Text style={styles.achievementName}>10 victoires</Text>
          </Card>
          <Card variant="outlined" style={styles.achievementCard}>
            <View style={styles.achievementIcon}>
              <Icon name="target" size={32} color={styles.achievementIconColor.color} />
            </View>
            <Text style={styles.achievementName}>Tir parfait</Text>
          </Card>
        </View>
      </View>

      <View style={styles.section}>
        <Card variant="default" style={styles.settingCard}>
          <Button
            title="Paramètres"
            variant="ghost"
            onPress={() => {}}
            style={styles.settingButton}
          />
        </Card>
        
        <Card variant="default" style={styles.settingCard}>
          <Button
            title="Aide & Support"
            variant="ghost"
            onPress={() => {}}
            style={styles.settingButton}
          />
        </Card>

        <Button
          title="Se déconnecter"
          variant="destructive"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </View>
      </Animated.View>
    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof import('../hooks/useThemedStyles').useTheme>) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: theme.theme.spacing.xxl,
  },
  header: {
    alignItems: 'center' as const,
    padding: theme.theme.spacing.xl,
    paddingTop: theme.theme.spacing.lg,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: theme.theme.spacing.md,
    ...theme.theme.shadows.md,
  },
  avatarText: {
    fontSize: 48,
    fontFamily: theme.theme.fonts.heading,
    color: '#0A0E27',
  },
  username: {
    fontSize: theme.theme.typography.fontSize.xxl,
    fontFamily: theme.theme.fonts.heading,
    color: theme.colors.text,
    marginBottom: theme.theme.spacing.xs,
  },
  joinDate: {
    fontSize: theme.theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    fontFamily: theme.theme.fonts.body,
  },
  section: {
    paddingHorizontal: theme.theme.spacing.lg,
    marginTop: theme.theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.theme.typography.fontSize.xl,
    fontFamily: theme.theme.fonts.body,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.theme.spacing.lg,
  },
  statsGrid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    justifyContent: 'space-between' as const,
    gap: theme.theme.spacing.sm,
  },
  statCard: {
    width: '48%',
    marginBottom: theme.theme.spacing.sm,
    alignItems: 'center' as const,
  },
  statValue: {
    fontSize: theme.theme.typography.fontSize.xxl,
    fontFamily: theme.theme.fonts.body,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    fontFamily: theme.theme.fonts.body,
  },
  achievements: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    gap: theme.theme.spacing.sm,
  },
  achievementCard: {
    flex: 1,
    alignItems: 'center' as const,
  },
  achievementIcon: {
    marginBottom: theme.theme.spacing.sm,
  },
  achievementIconColor: {
    color: theme.colors.primary,
  },
  achievementName: {
    fontSize: theme.theme.typography.fontSize.sm,
    color: theme.colors.text,
    textAlign: 'center' as const,
    fontFamily: theme.theme.fonts.body,
    fontWeight: '500',
  },
  settingCard: {
    marginBottom: theme.theme.spacing.sm,
    padding: 0,
  },
  settingButton: {
    justifyContent: 'flex-start' as const,
  },
  logoutButton: {
    marginTop: theme.theme.spacing.lg,
  },
});