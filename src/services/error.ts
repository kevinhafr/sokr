// services/error.ts
import * as Sentry from '@sentry/react-native';

export class ErrorService {
  static initialize() {
    if (process.env.NODE_ENV === 'production') {
      Sentry.init({
        dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
        environment: process.env.NODE_ENV,
        tracesSampleRate: 0.1,
      });
    }
  }

  static captureException(error: Error, context?: any) {
    console.error('Error captured:', error, context);
    
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureException(error, {
        extra: context,
      });
    }
  }

  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
    console.log(`[${level.toUpperCase()}]`, message);
    
    if (process.env.NODE_ENV === 'production') {
      Sentry.captureMessage(message, level);
    }
  }

  static setUser(user: { id: string; email?: string; username?: string }) {
    if (process.env.NODE_ENV === 'production') {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.username,
      });
    }
  }

  static clearUser() {
    if (process.env.NODE_ENV === 'production') {
      Sentry.setUser(null);
    }
  }

  static handleApiError(error: any): string {
    if (error.response) {
      // Erreur de réponse du serveur
      const status = error.response.status;
      const message = error.response.data?.message;

      switch (status) {
        case 400:
          return message || 'Requête invalide';
        case 401:
          return 'Non autorisé';
        case 403:
          return 'Accès refusé';
        case 404:
          return 'Ressource introuvable';
        case 429:
          return 'Trop de requêtes, veuillez réessayer plus tard';
        case 500:
          return 'Erreur serveur';
        default:
          return message || 'Une erreur est survenue';
      }
    } else if (error.request) {
      // Pas de réponse reçue
      return 'Erreur de connexion';
    } else {
      // Erreur de configuration
      return error.message || 'Une erreur est survenue';
    }
  }
}