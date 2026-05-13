import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

import {
  Card,
  CardContent,
  CardDescription,
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

import { registerSchema, type RegisterInput } from '@/lib/validators';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const form = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (values: RegisterInput) => {
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });

      if (error) throw error;

      toast.success(
        'Account created! Please check your email to verify your account.'
      );

      navigate('/login');
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : 'Failed to create account'
      );
    } finally {
      setLoading(false);
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

      {/* Register Card */}
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
            Create Account
          </CardTitle>

          <CardDescription className="text-center text-white/70">
            Sign up to start your career journey
          </CardDescription>
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

              {/* Confirm Password */}
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem className="space-y-1">
                    <FormLabel className="text-sm text-white/75">
                      Confirm Password
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

              {/* Sign Up Button */}
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
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
          </Form>

          {/* Login Link */}
          <div className="mt-4 text-center text-sm text-white/70">
            Already have an account?{' '}
            <Link
              to="/login"
              className="
                font-medium
                text-white
                transition-all
                hover:text-cyan-300
                hover:underline
              "
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}