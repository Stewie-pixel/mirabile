import { Link, useLocation } from 'react-router';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const T = {
  bg:           '#080C10',
  gradBtn:      'linear-gradient(135deg, #0AFFE4 0%, #0EA5E9 100%)',
  border:       'rgba(10,255,228,0.12)',
  borderHover:  'rgba(10,255,228,0.32)',
  surface:      'rgba(10,255,228,0.04)',
  textHigh:     '#E8FFFE',
  textMid:      'rgb(232, 255, 254)',
  teal:         '#0AFFE4',
  cyan:         '#0EA5E9',
} as const;

export function Navbar() {
  const { user }   = useAuth();
  const location   = useLocation();
  const isAuthPage = ['/login', '/register'].some(p => location.pathname.startsWith(p));

  const handleSignOut = async () => { await supabase.auth.signOut(); };

  const navItems = [
    { path: '/',           label: 'Home'            },
    { path: '/dashboard',  label: 'Dashboard'       },
    { path: '/generator',  label: 'Generate Roadmap'},
    { path: '/progress',   label: 'Progress'        },
    { path: '/profile',    label: 'Profile'         },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav
      style={{
        background:    isAuthPage ? 'transparent' : 'rgb(0, 0, 0)',
        borderBottom:  isAuthPage ? 'none' : `1px solid ${T.border}`,
        backdropFilter: isAuthPage ? 'none' : 'blur(16px)',
        position:      isAuthPage ? 'absolute' : 'sticky',
        top: 0, left: 0, right: 0,
        zIndex: 50,
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 select-none">
            <img
              src="/images/logo.png"
              alt="Mirabile Logo"
              className="h-8 w-auto object-contain"
            />
            <span
              className="text-xl font-bold"
              style={{
                background: T.gradBtn,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.01em',
              }}
            >
              Mirabile
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {user && navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  color:      isActive(item.path) ? T.teal : T.textMid,
                  background: isActive(item.path) ? 'rgba(10,255,228,0.06)' : 'transparent',
                  border:     isActive(item.path) ? `1px solid ${T.border}` : '1px solid transparent',
                }}
                onMouseEnter={(e) => {
                  if (!isActive(item.path)) {
                    (e.currentTarget as HTMLAnchorElement).style.color = T.textHigh;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive(item.path)) {
                    (e.currentTarget as HTMLAnchorElement).style.color = T.textMid;
                  }
                }}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Desktop sign-out */}
                <button
                  onClick={handleSignOut}
                  className="hidden md:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    color:   T.textMid,
                    border:  `1px solid ${T.border}`,
                    background: T.surface,
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.color = T.teal;
                    el.style.borderColor = T.borderHover;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.color = T.textMid;
                    el.style.borderColor = T.border;
                  }}
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>

                {/* Mobile hamburger */}
                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      className="inline-flex md:hidden items-center justify-center w-9 h-9 rounded-lg transition-all duration-200"
                      style={{ border: `1px solid ${T.border}`, background: T.surface, color: T.textMid }}
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side="right"
                    style={{ background: '#0A0F15', borderLeft: `1px solid ${T.border}` }}
                  >
                    <div className="flex flex-col gap-2 mt-8">
                      {navItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
                          style={{
                            color:      isActive(item.path) ? T.teal : T.textMid,
                            background: isActive(item.path) ? 'rgba(10,255,228,0.06)' : 'transparent',
                          }}
                        >
                          {item.label}
                        </Link>
                      ))}
                      <button
                        onClick={handleSignOut}
                        className="mt-4 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium"
                        style={{ color: T.textMid, border: `1px solid ${T.border}`, background: T.surface }}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </SheetContent>
                </Sheet>
              </>
            ) : (
              <div className="flex items-center gap-2">
                {/* Sign In — ghost */}
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                  style={{
                    color:      T.textMid,
                    border:     `1px solid ${T.border}`,
                    background: T.surface,
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = T.textHigh;
                    el.style.borderColor = T.borderHover;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLAnchorElement;
                    el.style.color = T.textMid;
                    el.style.borderColor = T.border;
                  }}
                >
                  Sign In
                </Link>

                {/* Sign Up — gradient */}
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 hover:scale-[1.03] active:scale-[0.97]"
                  style={{
                    background: T.gradBtn,
                    color: '#040810',
                    boxShadow: '0 0 20px rgba(10,255,228,0.2)',
                  }}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}