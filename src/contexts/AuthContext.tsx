import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '@/db/supabase';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/types/index';
import { toast } from 'sonner';
import { track } from '@/lib/trackEvent';

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('Failed to fetch user profile:', error);
    return null;
  }
  return data;
}

async function ensureProfile(user: User): Promise<Profile | null> {
  const existing = await getProfile(user.id);
  if (existing) return existing;

  const { data, error } = await supabase
    .from('profiles')
    .upsert(
      {
        id: user.id,
        email: user.email,
        full_name: user.user_metadata?.full_name ?? user.user_metadata?.name ?? null,
        avatar_url: user.user_metadata?.avatar_url ?? user.user_metadata?.picture ?? null,
      },
      { onConflict: 'id' }
    )
    .select()
    .maybeSingle();

  if (error) {
    console.error('Failed to create user profile:', error);
    return null;
  }
  return data;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signInWithUsername: (username: string, password: string) => Promise<{ error: Error | null }>;
  signUpWithUsername: (username: string, password: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
  signInWithGithub: () => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const profileData = await getProfile(user.id);
    setProfile(profileData);
  };

  useEffect(() => {
    supabase
      .auth
      .getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          getProfile(session.user.id).then(setProfile);
        }
      })
      .catch(error => {
        toast.error(`Failed to fetch session: ${error.message}`);
      })
      .finally(() => {
        setLoading(false);
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);

      if (session?.user) {
        const isOAuthSignIn =
          event === 'SIGNED_IN' &&
          session.user.app_metadata?.provider !== 'email';

        if (isOAuthSignIn) {
          ensureProfile(session.user).then(setProfile);
        } else {
          getProfile(session.user.id).then(setProfile);
        }
        if (event === 'SIGNED_IN') {
          track.signIn();
        }
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWithUsername = async (username: string, password: string) => {
    try {
      const email = `${username}@miaoda.com`;
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signUpWithUsername = async (username: string, password: string) => {
    try {
      const email = `${username}@miaoda.com`;
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `https://stewie-pixel.github.io/mirabile/dashboard`,
        },
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signInWithGithub = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `https://stewie-pixel.github.io/mirabile/dashboard`,
        },
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithUsername,
        signUpWithUsername,
        signInWithGoogle,
        signInWithGithub,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}