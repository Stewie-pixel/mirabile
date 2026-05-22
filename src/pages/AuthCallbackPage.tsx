import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    // 1. Check if Supabase already created the session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && mounted) {
        navigate('/dashboard', { replace: true });
      }
    });

    // 2. Wait for the automatic PKCE exchange in the background
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      if (event === 'SIGNED_IN' && session) {
        navigate('/dashboard', { replace: true });
      } else if (event === 'SIGNED_OUT') {
        navigate('/login', { replace: true });
      }
    });

    // 3. Fallback: if no sign in happens after 3 seconds, redirect to login
    const timeoutId = setTimeout(() => {
      if (mounted) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          navigate(session ? '/dashboard' : '/login', { replace: true });
        });
      }
    }, 3000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-white/60 text-sm">Signing you in...</p>
    </div>
  );
}