import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut, Github } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const T = {
  border: 'rgba(10,255,228,0.12)',
  surface: 'rgba(10,255,228,0.04)',
  textMid: 'rgb(232, 255, 254)',
  teal: '#0AFFE4',
  gradBtn: 'linear-gradient(135deg, #0AFFE4 0%, #0EA5E9 100%)',
} as const;

function useCursorGlow() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0, active: false });

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
  };

  const onMouseLeave = () => setPos(prev => ({ ...prev, active: false }));

  const Glow = () => (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 transition-opacity duration-200"
      style={{
        opacity: pos.active ? 1 : 0,
        background: `radial-gradient(140px circle at ${pos.x}px ${pos.y}px, rgba(10,255,228,0.25), transparent 60%)`,
      }}
    />
  );

  return { onMouseMove, onMouseLeave, Glow };
}

function LogoLink() {
  const { Glow } = useCursorGlow();
  return (
    <Link
      to="/"
      className="relative overflow-hidden flex items-center gap-2.5"
    >
      <Glow />
      <img src="/images/logo.png" className="h-8" alt="logo" />
      <span
        style={{ background: T.gradBtn, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
        className="text-xl font-bold"
      >
        Mirabile
      </span>
    </Link>
  );
}

function NavLink({ path, label, active }: { path: string; label: string; active: boolean }) {
  const { onMouseMove, onMouseLeave, Glow } = useCursorGlow();
  return (
    <Link
      to={path}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative overflow-hidden px-4 py-1.5 rounded-lg text-sm font-medium"
      style={{
        color: active ? T.teal : T.textMid,
        background: active ? 'rgba(10,255,228,0.06)' : 'transparent',
        border: active ? `1px solid ${T.border}` : '1px solid transparent',
      }}
    >
      <Glow />
      {label}
    </Link>
  );
}

function MobileNavLink({ path, label, active }: { path: string; label: string; active: boolean }) {
  const { onMouseMove, onMouseLeave, Glow } = useCursorGlow();
  return (
    <Link
      to={path}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative overflow-hidden px-4 py-2.5 rounded-lg text-sm"
      style={{ color: active ? T.teal : T.textMid }}
    >
      <Glow />
      {label}
    </Link>
  );
}

function GithubButton({ onClick }: { onClick: () => void }) {
  const { onMouseMove, onMouseLeave, Glow } = useCursorGlow();
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative overflow-hidden w-9 h-9 rounded-lg flex items-center justify-center"
      style={{ border: `1px solid ${T.border}`, background: 'rgba(10,255,228,0.04)', color: T.textMid }}
    >
      <Glow />
      <Github className="h-5 w-5" />
    </button>
  );
}

function SignOutButton({ onClick }: { onClick: () => void }) {
  const { onMouseMove, onMouseLeave, Glow } = useCursorGlow();
  return (
    <button
      type="button"
      onClick={onClick}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="hidden md:flex relative overflow-hidden items-center gap-2 px-4 py-2 rounded-lg text-sm"
      style={{ border: `1px solid ${T.border}`, background: T.surface, color: T.textMid }}
    >
      <Glow />
      <LogOut className="h-4 w-4" />
      Sign Out
    </button>
  );
}

function SignInLink() {
  const { onMouseMove, onMouseLeave, Glow } = useCursorGlow();
  return (
    <Link
      to="/login"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative overflow-hidden px-4 py-2 rounded-lg text-sm"
      style={{ border: `1px solid ${T.border}`, background: T.surface, color: T.textMid }}
    >
      <Glow />
      Sign In
    </Link>
  );
}

function SignUpLink() {
  const { onMouseMove, onMouseLeave, Glow } = useCursorGlow();
  return (
    <Link
      to="/register"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative overflow-hidden px-4 py-2 rounded-lg text-sm font-bold"
      style={{ background: T.gradBtn, color: '#040810' }}
    >
      <Glow />
      Sign Up
    </Link>
  );
}

export function Navbar() {
  const { user, signInWithGithub } = useAuth();
  const location = useLocation();

  const isAuthPage = ['/login', '/register'].some(p => location.pathname.startsWith(p));

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleGithub = async () => {
    if (user) {
      globalThis.open('https://github.com/Stewie-pixel/mirabile.git', '_blank', 'noopener,noreferrer');
    } else {
      const { error } = await signInWithGithub();
      if (error) console.error(error.message);
    }
  };

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/generator', label: 'Generate Roadmap' },
    { path: '/progress', label: 'Progress' },
    { path: '/profile', label: 'Profile' },
  ];

  return (
    <nav
      style={{
        background: isAuthPage ? 'transparent' : 'black',
        borderBottom: isAuthPage ? 'none' : `1px solid ${T.border}`,
        backdropFilter: isAuthPage ? 'none' : 'blur(16px)',
        position: isAuthPage ? 'absolute' : 'sticky',
        top: 0,
        zIndex: 50,
        width: '100%',
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* LEFT — Logo */}
          <LogoLink />

          {/* CENTER — Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {user && navItems.map(item => (
              <NavLink
                key={item.path}
                path={item.path}
                label={item.label}
                active={location.pathname === item.path}
              />
            ))}
          </div>

          {/* RIGHT — Actions (ml-auto pushes to far right on mobile when center is empty) */}
          <div className="flex items-center gap-3 ml-auto md:ml-0">

            <GithubButton onClick={handleGithub} />

            {user ? (
              <>
                <SignOutButton onClick={handleSignOut} />

                {/* Mobile menu */}
                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      type="button"
                      className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center"
                      style={{ border: `1px solid ${T.border}`, background: T.surface, color: T.textMid }}
                    >
                      <Menu />
                    </button>
                  </SheetTrigger>

                  <SheetContent
                    side="right"
                    style={{ background: '#0A0F15', borderLeft: `1px solid ${T.border}` }}
                  >
                    <div className="flex flex-col gap-2 mt-8">
                      {navItems.map(item => (
                        <MobileNavLink
                          key={item.path}
                          path={item.path}
                          label={item.label}
                          active={location.pathname === item.path}
                        />
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <SignInLink />
                <SignUpLink />
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}