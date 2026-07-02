import * as React from 'react';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { api, setToken } from './api';

WebBrowser.maybeCompleteAuthSession();

/**
 * Real Google Sign-In for Expo. Gets a Google id_token via expo-auth-session,
 * exchanges it at the Roame API (`/api/auth/google`), stores the bearer token.
 * No mock — requires EXPO_PUBLIC_GOOGLE_CLIENT_ID.
 */
export function useGoogleSignIn(onSuccess: () => void) {
  const clientId = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
  const [, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (response?.type !== 'success') return;
    const idToken = response.params.id_token;
    if (!idToken) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { token } = await api<{ token: string }>('/api/auth/google', {
          method: 'POST',
          body: JSON.stringify({ credential: idToken }),
        });
        await setToken(token);
        onSuccess();
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Sign in failed');
      } finally {
        setLoading(false);
      }
    })();
  }, [response, onSuccess]);

  return {
    configured: !!clientId,
    loading,
    error,
    signIn: () => promptAsync(),
  };
}
