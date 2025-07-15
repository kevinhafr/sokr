import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Alert,
} from 'react-native';
import { useShop } from '../hooks/useShop';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';

export default function ShopScreen() {
  const { packTypes, purchasePack, isLoading } = useShop();
  const styles = useThemedStyles(createStyles);

  const handlePurchase = async (packTypeId: string, price: number) => {
    Alert.alert(
      'Confirmer l\'achat',
      `Voulez-vous acheter ce pack pour ${price} jetons ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Acheter',
          onPress: async () => {
            try {
              await purchasePack(packTypeId, 'dummy-token');
              Alert.alert('Succès', 'Pack acheté avec succès !');
            } catch (error: any) {
              Alert.alert('Erreur', error.message);
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Boutique</Text>
        <Card variant="elevated" style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Jetons</Text>
          <Text style={styles.balanceValue}>1,250</Text>
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Packs disponibles</Text>
        
        {/* Packs temporaires */}
        <Card variant="elevated" style={styles.packCard}>
          <View style={[styles.packImage, styles.packImageStarter]}>
            <Text style={styles.packEmoji}>📦</Text>
          </View>
          <Text style={styles.packName}>Pack Starter</Text>
          <Text style={styles.packDescription}>5 cartes • 1 rare garantie</Text>
          <Button
            title="500 jetons"
            variant="primary"
            onPress={() => handlePurchase('starter', 500)}
            style={styles.packButton}
          />
        </Card>

        <Card variant="elevated" style={styles.packCard}>
          <View style={[styles.packImage, styles.packImagePremium]}>
            <Text style={styles.packEmoji}>🎁</Text>
          </View>
          <Text style={styles.packName}>Pack Premium</Text>
          <Text style={styles.packDescription}>10 cartes • 2 rares garanties</Text>
          <Button
            title="1000 jetons"
            variant="primary"
            onPress={() => handlePurchase('premium', 1000)}
            style={styles.packButton}
          />
        </Card>

        <Card variant="elevated" style={styles.packCard}>
          <View style={[styles.packImage, styles.packImageLegend]}>
            <Text style={styles.packEmoji}>👑</Text>
          </View>
          <Text style={styles.packName}>Pack Légende</Text>
          <Text style={styles.packDescription}>15 cartes • 1 super rare garantie</Text>
          <Button
            title="2500 jetons"
            variant="primary"
            onPress={() => handlePurchase('legend', 2500)}
            style={styles.packButton}
          />
        </Card>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Offres spéciales</Text>
        <Card variant="default" style={styles.offerCard}>
          <Text style={styles.offerTitle}>Pack du jour</Text>
          <Text style={styles.offerDescription}>-20% sur le Pack Premium</Text>
          <Text style={styles.offerTimer}>Expire dans 12h</Text>
        </Card>
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
    paddingBottom: theme.theme.spacing.xxl,
  },
  header: {
    flexDirection: 'row' as const,
    justifyContent: 'space-between' as const,
    alignItems: 'center' as const,
    padding: theme.theme.spacing.lg,
    paddingTop: theme.theme.spacing.md,
  },
  title: {
    fontSize: theme.theme.typography.fontSize.xxxl,
    fontFamily: theme.theme.fonts.bebas,
    fontWeight: '700',
    color: theme.colors.text,
  },
  balanceCard: {
    paddingHorizontal: theme.theme.spacing.lg,
    paddingVertical: theme.theme.spacing.sm,
  },
  balanceLabel: {
    fontSize: theme.theme.typography.fontSize.xs,
    color: theme.colors.textMuted,
    fontFamily: theme.theme.fonts.geist,
  },
  balanceValue: {
    fontSize: theme.theme.typography.fontSize.xl,
    fontFamily: theme.theme.fonts.geist,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  section: {
    paddingHorizontal: theme.theme.spacing.lg,
    marginTop: theme.theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.theme.typography.fontSize.xl,
    fontFamily: theme.theme.fonts.geist,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.theme.spacing.lg,
  },
  packCard: {
    marginBottom: theme.theme.spacing.md,
    alignItems: 'center' as const,
  },
  packImage: {
    width: 100,
    height: 100,
    borderRadius: theme.theme.radius.lg,
    justifyContent: 'center' as const,
    alignItems: 'center' as const,
    marginBottom: theme.theme.spacing.md,
  },
  packImageStarter: {
    backgroundColor: theme.colors.primary,
  },
  packImagePremium: {
    backgroundColor: '#2196F3',
  },
  packImageLegend: {
    backgroundColor: '#FFD700',
  },
  packEmoji: {
    fontSize: 48,
  },
  packName: {
    fontSize: theme.theme.typography.fontSize.xl,
    fontFamily: theme.theme.fonts.geist,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.theme.spacing.xs,
  },
  packDescription: {
    fontSize: theme.theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    fontFamily: theme.theme.fonts.geist,
    marginBottom: theme.theme.spacing.md,
  },
  packButton: {
    minWidth: 120,
  },
  offerCard: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
  },
  offerTitle: {
    fontSize: theme.theme.typography.fontSize.lg,
    fontFamily: theme.theme.fonts.geist,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.theme.spacing.xs,
  },
  offerDescription: {
    fontSize: theme.theme.typography.fontSize.base,
    color: theme.colors.text,
    fontFamily: theme.theme.fonts.geist,
    marginBottom: theme.theme.spacing.sm,
  },
  offerTimer: {
    fontSize: theme.theme.typography.fontSize.sm,
    color: theme.colors.textMuted,
    fontFamily: theme.theme.fonts.geist,
  },
});