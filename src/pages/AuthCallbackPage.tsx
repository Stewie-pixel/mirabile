import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/lib/supabase';

export default function AuthCallbackPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const hashParams = new URLSearchParams(globalThis.location.hash.substring(1));
      const searchParams = new URLSearchParams(globalThis.location.search);

      const accessToken = hashParams.get('access_token') || searchParams.get('access_token');
      const refreshToken = hashParams.get('refresh_token') || searchParams.get('refresh_token');
      const code = searchParams.get('code');

      console.log('access_token:', accessToken);
      console.log('refresh_token:', refreshToken);
      console.log('code:', code);

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          navigate('/dashboard', { replace: true });
          return;
        }
      }

      if (accessToken && refreshToken) {
        const { error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (!error) {
          navigate('/dashboard', { replace: true });
          return;
        }
      }

      navigate('/login', { replace: true });
    };

    handleCallback();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-white/60 text-sm">Signing you in...</p>
    </div>
  );
}