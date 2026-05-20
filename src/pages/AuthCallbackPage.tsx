import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    console.log('AuthCallbackPage mounted');
    console.log('URL:', globalThis.location.href);
    console.log('Hash:', globalThis.location.hash);
    console.log('Search:', globalThis.location.search);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth event:', event);
      console.log('Session:', session);
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe();
        navigate('/dashboard', { replace: true });
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('getSession result:', session);
      if (session) {
        subscription.unsubscribe();
        navigate('/dashboard', { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-white/60 text-sm">Signing you in...</p>
    </div>
  );
}