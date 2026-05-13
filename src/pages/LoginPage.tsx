import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { loginSchema, type LoginInput } from '@/lib/validators';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function LoginPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [githubLoading, setGithubLoading] = useState(false);

  const { signInWithGoogle, signInWithGithub } = useAuth();

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginInput) => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      toast.success('Successfully signed in!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to sign in'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);

    try {
      const { error } = await signInWithGoogle();

      if (error) throw error;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to sign in with Google'
      );

      setGoogleLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setGithubLoading(true);

    try {
      const { error } = await signInWithGithub();

      if (error) throw error;
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to sign in with Github'
      );

      setGithubLoading(false);
    }
  };

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden p-4"
      style={{
        backgroundImage: 'url(/images/background.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />

      {/* Ambient Glow */}
      <div className="absolute top-[-200px] left-[-150px] h-[400px] w-[400px] rounded-full bg-cyan-500/20 blur-3xl" />
      <div className="absolute bottom-[-200px] right-[-150px] h-[400px] w-[400px] rounded-full bg-blue-500/20 blur-3xl" />

      {/* Login Card */}
      <Card
        className="
          relative z-10
          w-full max-w-[400px]
          rounded-3xl
          border border-white/15
          bg-white/10
          backdrop-blur-2xl
          shadow-[0_8px_32px_rgba(0,0,0,0.45)]
          overflow-hidden
        "
      >
        {/* Glass Shine */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 pointer-events-none" />

        <CardHeader className="relative z-10 space-y-1 pb-4">
          <div className="mb-3 flex justify-center">
            <img
              src="/images/logo.png"
              alt="Mirabile"
              className="h-12 drop-shadow-[0_0_15px_rgba(255,255,255,0.35)]"
            />
          </div>

          <CardTitle className="text-center text-2xl font-semibold text-white">
            Welcome Back
          </CardTitle>

        </CardHeader>

        <CardContent className="relative z-10 px-8 pb-8 pt-1">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-3"
            >
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm text-white/75">
                      Email
                    </FormLabel>

                    <FormControl>
                      <Input
                        type="email"
                        placeholder="you@example.com"
                        className="
                          h-10
                          rounded-none
                          border-0
                          border-b border-white/20
                          bg-transparent
                          px-0
                          text-white
                          shadow-none
                          placeholder:text-white/35
                          focus-visible:border-cyan-300
                          focus-visible:ring-0
                          focus-visible:shadow-none
                          transition-all duration-300
                        "
                        {...field}
                      />
                    </FormControl>

                    <FormMessage className="text-xs text-red-300" />
                  </FormItem>
                )}
              />

              {/* Password */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm text-white/75">
                      Password
                    </FormLabel>

                    <FormControl>
                      <Input
                        type="password"
                        placeholder="••••••••"
                        className="
                          h-10
                          rounded-none
                          border-0
                          border-b border-white/20
                          bg-transparent
                          px-0
                          text-white
                          shadow-none
                          placeholder:text-white/35
                          focus-visible:border-cyan-300
                          focus-visible:ring-0
                          focus-visible:shadow-none
                          transition-all duration-300
                        "
                        {...field}
                      />
                    </FormControl>

                    <FormMessage className="text-xs text-red-300" />
                  </FormItem>
                )}
              />

              {/* Sign In Button */}
              <Button
                type="submit"
                disabled={loading}
                className="
                  mt-4
                  h-11
                  w-full
                  rounded-xl
                  border border-white/15
                  bg-white/15
                  text-white
                  backdrop-blur-md
                  transition-all duration-300
                  hover:bg-white/25
                  hover:shadow-[0_0_25px_rgba(255,255,255,0.12)]
                "
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </Form>

          {/* Divider */}
          <div className="relative my-4 flex items-center">
            <div className="flex-1 border-t border-white/15" />
          
            <span
              className="
                px-3
                text-xs
                uppercase
                text-white
              "
            >
              Or
            </span>
          
            <div className="flex-1 border-t border-white/15" />
          </div>

          {/* Google Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="
              h-11
              w-full
              rounded-xl
              border border-white/15
              bg-white/10
              text-white
              backdrop-blur-md
              transition-all duration-300
              hover:bg-white/20
              hover:shadow-[0_0_20px_rgba(255,255,255,0.10)]
            "
          >
            {googleLoading ? (
              'Redirecting...'
            ) : (
              <>
                <svg
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>

                Sign in with Google
              </>
            )}
          </Button>

          {/* GitHub Button */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGithubSignIn}
            disabled={githubLoading}
            className="
              mt-3
              h-11
              w-full
              rounded-xl
              border border-white/15
              bg-white/10
              text-white
              backdrop-blur-md
              transition-all duration-300
              hover:bg-white/20
              hover:shadow-[0_0_20px_rgba(255,255,255,0.10)]
            "
          >
            {githubLoading ? (
              'Redirecting...'
            ) : (
              <>
                <svg
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.605-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"
                    fill="currentColor"
                  />
                </svg>

                Sign in with GitHub
              </>
            )}
          </Button>

          {/* Register Link */}
          <div className="mt-4 text-center text-sm text-white/70">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="
                font-medium
                text-white
                transition-all
                hover:text-cyan-300
                hover:underline
              "
            >
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}