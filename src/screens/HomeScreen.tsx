import React from 'react';
import { View, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { StackNavigationProp } from '@react-navigation/stack';
import { MainTabParamList, RootStackParamList } from '../navigation/types';
import { useAuth } from '../contexts/AuthContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Typography, Button, Card } from '../components/ui';
import { GameTheme } from '../styles';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  StackNavigationProp<RootStackParamList>
>;

export default function HomeScreen() {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const { profile } = useAuth();
  const styles = useThemedStyles(createStyles);

  const handleQuickPlay = () => {
    navigation.navigate('DeckSelection', { mode: 'quick' });
  };
  
  const handleRankedPlay = () => {
    navigation.navigate('DeckSelection', { mode: 'ranked' });
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.content}
        scrollEnabled={false}
        showsVerticalScrollIndicator={false}
      >
        {/* Header avec nom */}
        <View style={styles.header}>
          <Typography variant="h1">
            Bonjour {profile?.username || 'Champion'}
          </Typography>
        </View>

        {/* Stats du joueur */}
        <Card style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Typography variant="caption" color={GameTheme.colors.textSecondary}>
                CLASSEMENT
              </Typography>
              <Typography variant="h2">
                #{profile?.rank || '---'}
              </Typography>
            </View>
            
            <View style={styles.statDivider} />
            
            <View style={styles.statItem}>
              <Typography variant="caption" color={GameTheme.colors.textSecondary}>
                ELO
              </Typography>
              <Typography variant="h2" color={GameTheme.colors.primary}>
                {profile?.mmr || 1000}
              </Typography>
            </View>
          </View>
        </Card>

        {/* Boutons d'action */}
        <View style={styles.buttonsContainer}>
          <Button
            title="PARTIE RAPIDE"
            variant="primary"
            size="lg"
            onPress={handleQuickPlay}
            style={styles.button}
          />
          
          <Button
            title="PARTIE CLASSÉE"
            variant="secondary"
            size="lg"
            onPress={handleRankedPlay}
            style={styles.button}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const createStyles = (theme: ReturnType<typeof import('../hooks/useThemedStyles').useTheme>) => ({
  container: {
    flex: 1,
    backgroundColor: GameTheme.colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingVertical: GameTheme.spacing.xl,
  },
  header: {
    paddingHorizontal: GameTheme.spacing.lg,
    paddingTop: GameTheme.spacing.xxxl * 2,
    paddingBottom: GameTheme.spacing.xl,
  },
  statsCard: {
    marginHorizontal: GameTheme.spacing.lg,
    marginBottom: GameTheme.spacing.xl,
    padding: GameTheme.spacing.xl,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: GameTheme.colors.border,
  },
  buttonsContainer: {
    paddingHorizontal: GameTheme.spacing.lg,
    gap: GameTheme.spacing.md,
  },
  button: {
    marginBottom: GameTheme.spacing.md,
  },
});