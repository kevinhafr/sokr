import { useEffect } from 'react';
import { Linking } from 'react-native';
import { supabase } from '@/services/supabase';

export function useAuthDeepLink() {
  useEffect(() => {
    // Handle the initial URL if the app was opened via deep link
    const handleInitialURL = async () => {
      const url = await Linking.getInitialURL();
      if (url) {
        handleDeepLink(url);
      }
    };

    // Handle deep links when the app is already open
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    handleInitialURL();

    return () => {
      subscription.remove();
    };
  }, []);

  const handleDeepLink = async (url: string) => {
    // Extract the access token and refresh token from the URL
    const parsedUrl = new URL(url);
    
    // Check if this is an auth callback
    if (parsedUrl.hash && parsedUrl.hash.includes('access_token')) {
      const params = new URLSearchParams(parsedUrl.hash.substring(1));
      const accessToken = params.get('access_token');
      const refreshToken = params.get('refresh_token');

      if (accessToken && refreshToken) {
        // Set the session in Supabase
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });

        if (error) {
          console.error('Error setting session:', error);
        } else {
          console.log('Successfully authenticated via magic link');
        }
      }
    }
  };
}