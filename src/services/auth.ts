// services/auth.ts
import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class AuthService {
  static async signUp(email: string, password: string, username: string) {
    // Créer l'utilisateur
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError) throw authError;

    if (authData.user) {
      // Créer le profil
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username,
          email,
        });

      if (profileError) {
        // Rollback: supprimer l'utilisateur si la création du profil échoue
        await supabase.auth.admin.deleteUser(authData.user.id);
        throw profileError;
      }

      // Attribuer le deck de départ
      const { error: deckError } = await supabase.functions.invoke('assign-starter-deck', {
        body: { userId: authData.user.id }
      });

      if (deckError) console.error('Error assigning starter deck:', deckError);
    }

    return authData;
  }

  static async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    // Vérifier si l'utilisateur est banni
    if (data.user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('ban_until')
        .eq('id', data.user.id)
        .single();

      if (profile?.ban_until && new Date(profile.ban_until) > new Date()) {
        await supabase.auth.signOut();
        throw new Error(`Account banned until ${new Date(profile.ban_until).toLocaleString()}`);
      }
    }

    return data;
  }

  static async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    
    // Nettoyer le cache local
    await AsyncStorage.multiRemove([
      'supabase.auth.token',
      'currentGame',
      'currentDeck',
    ]);
  }

  static async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'rocketfooty://reset-password',
    });

    if (error) throw error;
  }

  static async updatePassword(newPassword: string) {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
  }

  static async deleteAccount() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    // Supprimer toutes les données de l'utilisateur
    const { error } = await supabase.functions.invoke('delete-account', {
      body: { userId: user.id }
    });

    if (error) throw error;

    // Se déconnecter
    await this.signOut();
  }
}