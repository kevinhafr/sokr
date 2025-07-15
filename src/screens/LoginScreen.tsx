import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { AuthStackParamList } from '../navigation/types';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { Button } from '../components/ui/Button';
import { supabase } from '../services/supabase';
import { useTheme } from '../contexts/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

type LoginScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const styles = useThemedStyles(createStyles);
  const { isDark } = useTheme();
  const [email, setEmail] = useState(__DEV__ ? 'test@sokr.dev' : '');
  const [password, setPassword] = useState(__DEV__ ? 'test123456' : '');
  const [isLoading, setIsLoading] = useState(false);

  const clearSession = async () => {
    try {
      await supabase.auth.signOut();
      await AsyncStorage.clear();
      Alert.alert('Session effacée', 'Vous pouvez maintenant vous reconnecter');
    } catch (error) {
      console.error('Error clearing session:', error);
    }
  };

  const handleAuth = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    if (!password || password.length < 6) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting login with:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      console.log('Login successful:', data.user?.id);
      // Navigation will be handled by AuthContext
    } catch (error: any) {
      Alert.alert('Erreur', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Image 
          source={isDark 
            ? require('@/assets/logos/white_logo_transparent_background.png')
            : require('@/assets/logos/dark_logo_transparent_background.png')
          }
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>
          Connectez-vous pour jouer
        </Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.emailInput}
              placeholder="votre@email.com"
              placeholderTextColor={styles.placeholderColor.color}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              editable={!isLoading}
            />
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.emailInput}
              placeholder="Mot de passe"
              placeholderTextColor={styles.placeholderColor.color}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          <Button
            title="Se connecter"
            variant="primary"
            size="md"
            onPress={handleAuth}
            loading={isLoading}
            disabled={!email || !password}
            style={styles.button}
          />

          <Button
            title="Créer un compte"
            variant="secondary"
            size="md"
            onPress={() => navigation.navigate('Register')}
            disabled={isLoading}
            style={[styles.button, styles.registerButton]}
          />

          {__DEV__ && (
            <Text style={styles.devInfo}>
              🧪 Compte test: test@sokr.dev / test123456
            </Text>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme: ReturnType<typeof import('../hooks/useThemedStyles').useTheme>) => ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: theme.theme.spacing.lg,
  },
  logo: {
    width: 280,
    height: 140,
    marginBottom: theme.theme.spacing.xl,
    alignSelf: 'center' as const,
  },
  subtitle: {
    fontSize: theme.theme.typography.fontSize.lg,
    color: theme.colors.mutedForeground,
    fontFamily: theme.theme.typography.fontFamily.sans,
    textAlign: 'center' as const,
    marginBottom: theme.theme.spacing['2xl'],
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center' as const,
  },
  inputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.input,
    borderRadius: theme.theme.radius.lg,
    paddingHorizontal: theme.theme.spacing.md,
    marginBottom: theme.theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emailInput: {
    flex: 1,
    paddingVertical: theme.theme.spacing.md,
    color: theme.colors.foreground,
    fontSize: theme.theme.typography.fontSize.base,
    fontFamily: theme.theme.typography.fontFamily.sans,
  },
  button: {
    marginTop: theme.theme.spacing.sm,
    ...theme.theme.shadows.sm,
  },
  registerButton: {
    marginTop: theme.theme.spacing.md,
  },
  devInfo: {
    fontSize: theme.theme.typography.fontSize.xs,
    color: theme.colors.mutedForeground,
    fontFamily: theme.theme.typography.fontFamily.sans,
    textAlign: 'center' as const,
    marginTop: theme.theme.spacing.xl,
  },
  placeholderColor: {
    color: theme.colors.mutedForeground,
  },
});