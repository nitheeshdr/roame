import * as React from 'react';
import { clearToken, roame, setToken, type SessionUser } from './api';

interface SessionState {
  user: SessionUser | null;
  loading: boolean;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signInGoogle: (idToken: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const SessionContext = React.createContext<SessionState | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<SessionUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  const refresh = React.useCallback(async () => {
    try {
      const { user } = await roame.me();
      setUser(user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    refresh();
  }, [refresh]);

  const signInEmail = React.useCallback(async (email: string, password: string) => {
    const { token, user } = await roame.emailLogin(email, password);
    await setToken(token);
    setUser(user);
  }, []);

  const signUp = React.useCallback(async (email: string, password: string, displayName: string) => {
    const { token, user } = await roame.signup(email, password, displayName);
    await setToken(token);
    setUser(user);
  }, []);

  const signInGoogle = React.useCallback(async (idToken: string) => {
    const { token, user } = await roame.google(idToken);
    await setToken(token);
    setUser(user);
  }, []);

  const signOut = React.useCallback(async () => {
    await clearToken();
    setUser(null);
  }, []);

  const value = React.useMemo(
    () => ({ user, loading, signInEmail, signUp, signInGoogle, signOut, refresh }),
    [user, loading, signInEmail, signUp, signInGoogle, signOut, refresh],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionState {
  const ctx = React.useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
