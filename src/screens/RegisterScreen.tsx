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

type RegisterScreenNavigationProp = StackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const styles = useThemedStyles(createStyles);
  const [email, setEmail] = useState(__DEV__ ? 'kevin@ha.fr' : '');
  const [password, setPassword] = useState(__DEV__ ? '123456' : '');
  const [confirmPassword, setConfirmPassword] = useState(__DEV__ ? '123456' : '');
  const [username, setUsername] = useState(__DEV__ ? 'kevin' : '');
  const [isLoading, setIsLoading] = useState(false);

  console.log('RegisterScreen render - Form state:', {
    email,
    username,
    passwordLength: password.length,
    confirmPasswordLength: confirmPassword.length,
    isLoading,
    isButtonDisabled: !email || !password || !username || !confirmPassword
  });

  const handleRegister = async () => {
    console.log('=== REGISTER START ===');
    console.log('Email:', email);
    console.log('Username:', username);
    console.log('Password length:', password.length);
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!emailRegex.test(email)) {
      console.log('Invalid email format');
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return;
    }

    if (!username || username.length < 3) {
      console.log('Username too short');
      Alert.alert('Erreur', 'Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return;
    }

    if (!password || password.length < 6) {
      console.log('Password too short');
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (password !== confirmPassword) {
      console.log('Passwords do not match');
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return;
    }

    console.log('Validation passed, attempting signup...');
    setIsLoading(true);
    
    try {
      console.log('Calling supabase.auth.signUp...');
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      console.log('SignUp response:', { data, error });

      if (error) {
        console.error('SignUp error:', error);
        throw error;
      }

      console.log('SignUp successful:', data.user?.id);
      Alert.alert('Succès', 'Votre compte a été créé avec succès ! Vérifiez votre email pour confirmer votre compte.');
      navigation.navigate('Login');
    } catch (error: any) {
      console.error('Register error:', error);
      Alert.alert('Erreur d\'inscription', error.message || 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
      console.log('=== REGISTER END ===');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Image 
          source={require('@/assets/logos/white_logo_transparent_background.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.subtitle}>
          Créez votre compte
        </Text>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.emailInput}
              placeholder="Nom d'utilisateur"
              placeholderTextColor={styles.placeholderColor.color}
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoComplete="username"
              editable={!isLoading}
            />
          </View>

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

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.emailInput}
              placeholder="Confirmer le mot de passe"
              placeholderTextColor={styles.placeholderColor.color}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
              editable={!isLoading}
            />
          </View>

          <Button
            title="S'inscrire"
            variant="primary"
            size="md"
            onPress={() => {
              console.log('Register button clicked');
              handleRegister();
            }}
            loading={isLoading}
            disabled={!email || !password || !username || !confirmPassword}
            style={styles.button}
          />

          <Button
            title="Déjà un compte ? Connectez-vous"
            variant="secondary"
            size="md"
            onPress={() => navigation.navigate('Login')}
            disabled={isLoading}
            style={[styles.button, styles.loginButton]}
          />
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
    justifyContent: 'center' as const,
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
    color: theme.colors.textMuted,
    fontFamily: theme.theme.fonts.body,
    textAlign: 'center' as const,
    marginBottom: theme.theme.spacing.xxl,
  },
  form: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center' as const,
  },
  inputContainer: {
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.theme.borderRadius.lg,
    paddingHorizontal: theme.theme.spacing.md,
    marginBottom: theme.theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  emailInput: {
    flex: 1,
    paddingVertical: theme.theme.spacing.md,
    color: theme.colors.text,
    fontSize: theme.theme.typography.fontSize.base,
    fontFamily: theme.theme.fonts.body,
  },
  button: {
    marginTop: theme.theme.spacing.sm,
    ...theme.theme.shadows.sm,
  },
  loginButton: {
    marginTop: theme.theme.spacing.md,
  },
  placeholderColor: {
    color: theme.colors.textMuted,
  },
});