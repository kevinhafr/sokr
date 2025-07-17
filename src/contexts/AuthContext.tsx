// contexts/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User, Profile } from '@/types/models';
import { AuthService } from '@/services/auth';
import { supabase } from '@/services/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  userId: string | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: Error | null;
}

type AuthAction =
  | { type: 'SET_USER'; payload: { userId: string; profile: Profile } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_PROFILE'; payload: Partial<Profile> };

const initialState: AuthState = {
  userId: null,
  profile: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_USER':
      return {
        ...state,
        userId: action.payload.userId,
        profile: action.payload.profile,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'LOGOUT':
      return {
        ...initialState,
        isLoading: false,
      };
    case 'UPDATE_PROFILE':
      return {
        ...state,
        profile: state.profile
          ? { ...state.profile, ...action.payload }
          : null,
      };
    default:
      return state;
  }
};

interface AuthContextValue extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkBanStatus: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialiser l'auth au démarrage
  useEffect(() => {
    checkAuthState();

    // Écouter les changements d'auth
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext - Auth state change:', event, session?.user?.id);
        
        if (event === 'SIGNED_IN' && session?.user) {
          console.log('AuthContext - User signed in');
          await loadUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthContext - User signed out');
          dispatch({ type: 'LOGOUT' });
        } else if (event === 'USER_UPDATED' && session?.user) {
          console.log('AuthContext - User updated');
          await loadUserProfile(session.user.id);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const checkAuthState = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });

      // Vérifier la session
      const { data: { session } } = await supabase.auth.getSession();
      console.log('AuthContext - Session check:', session);
      
      if (session?.user) {
        console.log('AuthContext - User found:', session.user.id);
        await loadUserProfile(session.user.id);
      } else {
        console.log('AuthContext - No session found');
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    } catch (error) {
      console.error('AuthContext - Error checking auth:', error);
      dispatch({ type: 'SET_ERROR', payload: error as Error });
    }
  };

  const loadUserProfile = async (userId: string) => {
    try {
      console.log('AuthContext - Loading profile for user:', userId);
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      console.log('AuthContext - Profile query result:', { profile, error });

      if (error) {
        console.error('AuthContext - Error loading profile:', error);
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          console.log('AuthContext - Creating new profile for user:', userId);
          const { data: userData } = await supabase.auth.getUser();
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              username: `user_${userId.substring(0, 8)}`,
              email: userData.user?.email || '',
              role: 'user',
              mmr: 1000,
              total_games: 0,
              wins: 0,
              losses: 0,
              draws: 0,
            })
            .select()
            .single();
          
          if (createError) {
            console.error('AuthContext - Error creating profile:', createError);
            // Check if it's a foreign key constraint error
            if (createError.code === '23503') {
              console.error('AuthContext - User does not exist in auth.users. Token may be invalid.');
              // Sign out the user to force re-authentication
              await supabase.auth.signOut();
              dispatch({ type: 'SIGN_OUT' });
              return;
            }
            // Don't throw error for RLS policy violations
            // User is still authenticated even if profile creation fails
            if (createError.code === '42501') {
              console.warn('AuthContext - Profile creation blocked by RLS policy, but user is authenticated');
              // Still set the user as authenticated even without profile
              dispatch({ type: 'SET_USER', payload: { userId, profile: null as any } });
              return;
            }
            throw createError;
          }
          
          console.log('AuthContext - New profile created:', newProfile);
          dispatch({ type: 'SET_USER', payload: { userId, profile: newProfile } });
          
          // Trigger will assign cards automatically
          return;
        }
        throw error;
      }

      console.log('AuthContext - Profile loaded successfully:', profile);
      dispatch({ type: 'SET_USER', payload: { userId, profile } });
      
      // Vérifier et assigner les cartes de départ au premier login
      if (!profile.starter_cards_received) {
        console.log('AuthContext - Assigning starter cards for first login');
        try {
          const { error: cardsError } = await supabase.rpc('check_and_assign_starter_cards');
          if (cardsError) {
            console.error('Error assigning starter cards:', cardsError);
          } else {
            console.log('Starter cards assigned successfully');
          }
        } catch (err) {
          console.error('Failed to assign starter cards:', err);
        }
      }
    } catch (error) {
      console.error('AuthContext - Error in loadUserProfile:', error);
      dispatch({ type: 'SET_ERROR', payload: error as Error });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const data = await AuthService.signIn(email, password);
      
      if (data.user) {
        await loadUserProfile(data.user.id);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      throw error;
    }
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const data = await AuthService.signUp(email, password, username);
      
      if (data.user) {
        await loadUserProfile(data.user.id);
      }
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      throw error;
    }
  };

  const signOut = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      await AuthService.signOut();
      dispatch({ type: 'LOGOUT' });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!state.profile) {
      throw new Error('No profile to update');
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.profile.id)
        .select()
        .single();

      if (error) throw error;

      dispatch({ type: 'UPDATE_PROFILE', payload: updates });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await AuthService.resetPassword(email);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error as Error });
      throw error;
    }
  };

  const checkBanStatus = async (): Promise<boolean> => {
    if (!state.profile) return false;

    if (state.profile.ban_until) {
      const banDate = new Date(state.profile.ban_until);
      const now = new Date();
      return banDate > now;
    }

    return false;
  };

  const value: AuthContextValue = {
    ...state,
    signIn,
    signUp,
    signOut,
    updateProfile,
    resetPassword,
    checkBanStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}