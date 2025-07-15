import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { useMatchmaking } from '../hooks/useMatchmaking';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { useDefaultDeck } from '../hooks/useDefaultDeck';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { profile } = useAuth();
  const { findMatch, cancelSearch, isSearching } = useMatchmaking();
  const { deckId } = useDefaultDeck();
  const [selectedMode, setSelectedMode] = useState<'quick' | 'friendly'>('quick');
  const styles = useThemedStyles(createStyles);

  const handlePlayNow = async () => {
    if (!deckId) {
      Alert.alert('Aucun deck', 'Veuillez créer un deck avant de jouer');
      navigation.navigate('Deck');
      return;
    }

    try {
      await findMatch(selectedMode, deckId);
      // La navigation est gérée dans useMatchmaking
    } catch (error: any) {
      Alert.alert('Erreur', error.message || 'Impossible de trouver une partie');
    }
  };

  const handleCancelSearch = () => {
    cancelSearch();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Bienvenue,</Text>
        <Text style={styles.username}>{profile?.username || 'Joueur'}</Text>
        
        <Card variant="elevated" style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.level || 1}</Text>
              <Text style={styles.statLabel}>Niveau</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.wins || 0}</Text>
              <Text style={styles.statLabel}>Victoires</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{profile?.rating || 1000}</Text>
              <Text style={styles.statLabel}>Classement</Text>
            </View>
          </View>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Mode de jeu</Text>
        <View style={styles.modeContainer}>
          <Button
            title="Rapide"
            variant={selectedMode === 'quick' ? 'primary' : 'ghost'}
            onPress={() => setSelectedMode('quick')}
            style={styles.modeButton}
          />
          <Button
            title="Amical"
            variant={selectedMode === 'friendly' ? 'primary' : 'ghost'}
            onPress={() => setSelectedMode('friendly')}
            style={styles.modeButton}
          />
        </View>
      </View>

      <View style={styles.playSection}>
        {isSearching ? (
          <Card variant="default" style={styles.searchingCard}>
            <ActivityIndicator size="large" color={styles.primaryColor.color} />
            <Text style={styles.searchingText}>Recherche d'un adversaire...</Text>
            <Button
              title="Annuler"
              variant="secondary"
              onPress={handleCancelSearch}
              style={styles.cancelButton}
            />
          </Card>
        ) : (
          <Button
            title="Jouer maintenant"
            variant="primary"
            size="lg"
            onPress={handlePlayNow}
            style={styles.playButton}
          />
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Actions rapides</Text>
        <View style={styles.quickActions}>
          <Card variant="outlined" style={styles.actionCard}>
            <Text style={styles.actionIcon}>🏆</Text>
            <Text style={styles.actionText}>Tournois</Text>
          </Card>
          <Card variant="outlined" style={styles.actionCard}>
            <Text style={styles.actionIcon}>👥</Text>
            <Text style={styles.actionText}>Amis</Text>
          </Card>
          <Card variant="outlined" style={styles.actionCard}>
            <Text style={styles.actionIcon}>📊</Text>
            <Text style={styles.actionText}>Stats</Text>
          </Card>
        </View>
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
    padding: theme.theme.spacing.lg,
  },
  welcomeText: {
    fontSize: theme.theme.typography.fontSize.lg,
    color: theme.colors.mutedForeground,
    fontFamily: theme.theme.typography.fontFamily.sans,
  },
  username: {
    fontSize: theme.theme.typography.fontSize['3xl'],
    fontFamily: theme.theme.typography.fontFamily.sansBold,
    color: theme.colors.foreground,
    marginBottom: theme.theme.spacing.lg,
  },
  statsCard: {
    marginTop: theme.theme.spacing.md,
  },
  statsRow: {
    flexDirection: 'row' as const,
    justifyContent: 'space-around' as const,
    alignItems: 'center' as const,
  },
  statItem: {
    flex: 1,
    alignItems: 'center' as const,
  },
  statValue: {
    fontSize: theme.theme.typography.fontSize['2xl'],
    fontFamily: theme.theme.typography.fontFamily.sansSemiBold,
    color: theme.colors.foreground,
  },
  statLabel: {
    fontSize: theme.theme.typography.fontSize.sm,
    color: theme.colors.mutedForeground,
    fontFamily: theme.theme.typography.fontFamily.sans,
    marginTop: theme.theme.spacing.xs,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: theme.colors.border,
  },
  section: {
    paddingHorizontal: theme.theme.spacing.lg,
    marginTop: theme.theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.theme.typography.fontSize.xl,
    fontFamily: theme.theme.typography.fontFamily.sansSemiBold,
    color: theme.colors.foreground,
    marginBottom: theme.theme.spacing.md,
  },
  modeContainer: {
    flexDirection: 'row' as const,
    gap: theme.theme.spacing.sm,
  },
  modeButton: {
    flex: 1,
  },
  playSection: {
    paddingHorizontal: theme.theme.spacing.lg,
    marginTop: theme.theme.spacing['2xl'],
  },
  playButton: {
    ...theme.theme.shadows.lg,
  },
  searchingCard: {
    alignItems: 'center' as const,
    padding: theme.theme.spacing.xl,
  },
  searchingText: {
    fontSize: theme.theme.typography.fontSize.lg,
    color: theme.colors.foreground,
    fontFamily: theme.theme.typography.fontFamily.sans,
    marginVertical: theme.theme.spacing.lg,
  },
  cancelButton: {
    marginTop: theme.theme.spacing.md,
  },
  quickActions: {
    flexDirection: 'row' as const,
    gap: theme.theme.spacing.sm,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center' as const,
    padding: theme.theme.spacing.lg,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: theme.theme.spacing.sm,
  },
  actionText: {
    fontSize: theme.theme.typography.fontSize.sm,
    color: theme.colors.foreground,
    fontFamily: theme.theme.typography.fontFamily.sansMedium,
  },
  primaryColor: {
    color: theme.colors.primary,
  },
});