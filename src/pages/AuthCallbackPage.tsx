import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const handleCallback = async () => {
      // 1. Check if Supabase already created the session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session && mounted) {
        navigate('/dashboard', { replace: true });
        return;
      }

      // 2. If not, wait for the automatic PKCE exchange in the background
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_IN' && session && mounted) {
          navigate('/dashboard', { replace: true });
        }
      });

      // 3. Fallback: if no sign in happens after 3 seconds, redirect to login
      setTimeout(() => {
        if (mounted) {
          supabase.auth.getSession().then(({ data: { session } }) => {
            if (!session) {
              navigate('/login', { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
          });
        }
      }, 3000);

      return () => {
        subscription.unsubscribe();
      };
    };

    handleCallback();

    return () => {
      mounted = false;
    };
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-white/60 text-sm">Completing sign in...</p>
      </div>
    </div>
  );
}