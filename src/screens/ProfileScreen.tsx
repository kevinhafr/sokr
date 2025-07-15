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

export default function ProfileScreen() {
  const { profile, logout } = useAuth();
  const navigation = useNavigation();
  const styles = useThemedStyles(createStyles);

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
            await logout();
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
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {profile?.username?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.username}>{profile?.username || 'Joueur'}</Text>
        <Text style={styles.joinDate}>Membre depuis janvier 2024</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Statistiques</Text>
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
            <Text style={styles.achievementEmoji}>🏆</Text>
            <Text style={styles.achievementName}>Premier but</Text>
          </Card>
          <Card variant="outlined" style={styles.achievementCard}>
            <Text style={styles.achievementEmoji}>⚡</Text>
            <Text style={styles.achievementName}>10 victoires</Text>
          </Card>
          <Card variant="outlined" style={styles.achievementCard}>
            <Text style={styles.achievementEmoji}>🎯</Text>
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
    </ScrollView>
  );
}

const createStyles = (theme: ReturnType<typeof import('../hooks/useThemedStyles').useTheme>) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingBottom: theme.theme.spacing['2xl'],
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
    fontFamily: theme.theme.typography.fontFamily.sansBold,
    color: theme.colors.primaryForeground,
  },
  username: {
    fontSize: theme.theme.typography.fontSize['2xl'],
    fontFamily: theme.theme.typography.fontFamily.sansBold,
    color: theme.colors.foreground,
    marginBottom: theme.theme.spacing.xs,
  },
  joinDate: {
    fontSize: theme.theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontFamily: theme.theme.typography.fontFamily.sans,
  },
  section: {
    paddingHorizontal: theme.theme.spacing.lg,
    marginTop: theme.theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.theme.typography.fontSize.xl,
    fontFamily: theme.theme.typography.fontFamily.sansSemiBold,
    color: theme.colors.foreground,
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
    fontSize: theme.theme.typography.fontSize['2xl'],
    fontFamily: theme.theme.typography.fontFamily.sansSemiBold,
    color: theme.colors.primary,
    marginBottom: theme.theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontFamily: theme.theme.typography.fontFamily.sans,
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
  achievementEmoji: {
    fontSize: 36,
    marginBottom: theme.theme.spacing.sm,
  },
  achievementName: {
    fontSize: theme.theme.typography.fontSize.sm,
    color: theme.colors.foreground,
    textAlign: 'center' as const,
    fontFamily: theme.theme.typography.fontFamily.sansMedium,
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