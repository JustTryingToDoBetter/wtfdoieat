import { useCallback, useEffect, useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/auth/supabaseClient';

interface AuthUser {
  id: string;
  email?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const hydrateFromCookie = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/me', { credentials: 'include' });
      if (!res.ok) {
        setUser(null);
        return;
      }
      const data = await res.json();
      setUser(data?.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrateFromCookie();
  }, [hydrateFromCookie]);

  const signIn = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Auth is not configured. Add Supabase keys to .env.local.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      throw new Error(error?.message || 'Unable to sign in');
    }

    const sessionRes = await fetch('/api/auth/session', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        accessToken: data.session.access_token,
        refreshToken: data.session.refresh_token,
      }),
    });

    if (!sessionRes.ok) {
      throw new Error('Unable to establish secure session');
    }

    setUser(data.user as AuthUser);
    return data.user;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    if (!isSupabaseConfigured || !supabase) {
      throw new Error('Auth is not configured. Add Supabase keys to .env.local.');
    }

    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      throw new Error(error.message);
    }

    if (data.session) {
      await fetch('/api/auth/session', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accessToken: data.session.access_token,
          refreshToken: data.session.refresh_token,
        }),
      });
      setUser(data.user as AuthUser);
    }

    return data.user;
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) {
      setUser(null);
      return;
    }

    await supabase.auth.signOut();
    await fetch('/api/auth/session', {
      method: 'DELETE',
      credentials: 'include',
    });
    setUser(null);
  }, []);

  return { user, loading, signIn, signUp, signOut, refreshUser: hydrateFromCookie };
}
