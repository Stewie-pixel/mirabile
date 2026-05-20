import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Menu, Github, ChevronDown, BookOpen, Sparkles, MessageSquare, Clock, Building2 } from 'lucide-react';
import { NotificationMailbox } from '@/components/notifications/NotificationMailbox';
import { ProfilePanel } from '@/components/profile/ProfilePanel';
import { useAuth } from '@/contexts/AuthContext';
import { useRoadmap } from '@/contexts/RoadmapContext';
import type { Profile, Roadmap } from '@/types';

const GITHUB_URL =
  import.meta.env.VITE_GITHUB_URL ?? 'https://github.com/Stewie-pixel/mirabile';

const SEARCH_ROUTES = [
  { keywords: ['dashboard', 'dash'], path: '/dashboard' },
  { keywords: ['roadmap', 'road', 'generator'], path: '/generator' },
  { keywords: ['progress', 'tracking'], path: '/progress' },
  { keywords: ['profile', 'account'], path: '/profile' },
] as const;

function matchSearchRoute(query: string): string | null {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  for (const route of SEARCH_ROUTES) {
    if (route.keywords.some(kw => q.includes(kw) || kw.includes(q))) {
      return route.path;
    }
  }
  return null;
}

function initials(name: string | null, email: string | null): string {
  const src = name || email || '?';
  const parts = src.split(/[\s@]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const T = {
  border: 'rgba(10,255,228,0.12)',
  surface: 'rgba(10,255,228,0.04)',
  textMid: 'rgb(232, 255, 254)',
  teal: '#0AFFE4',
  textDim: 'rgba(232,255,254,0.55)',
  gradBtn: 'linear-gradient(135deg, #0AFFE4 0%, #0EA5E9 100%)',
} as const;

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

function useCursorGlow() {
  const [pos, setPos] = useState({ x: 0, y: 0, active: false });

  const onMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPos({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
  };

  const onMouseLeave = () => setPos(prev => ({ ...prev, active: false }));

  const glow = (
    <div
      className="pointer-events-none absolute inset-0 transition-opacity"
      style={{
        opacity: pos.active ? 1 : 0,
        background: `radial-gradient(140px circle at ${pos.x}px ${pos.y}px, rgba(10, 255, 226, 0.8), transparent 60%)`,
      }}
    />
  );

  return { onMouseMove, onMouseLeave, glow };
}

function LogoLink() {
  const { glow } = useCursorGlow();
  return (
    <Link to="/" className="relative overflow-hidden flex items-center gap-2.5">
      {glow}
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
  const { onMouseMove, onMouseLeave, glow } = useCursorGlow();
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
      {glow}
      {label}
    </Link>
  );
}

function MobileNavLink({ path, label, active }: { path: string; label: string; active: boolean }) {
  const { onMouseMove, onMouseLeave, glow } = useCursorGlow();
  return (
    <Link
      to={path}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative overflow-hidden px-4 py-2.5 rounded-lg text-sm"
      style={{ color: active ? T.teal : T.textMid }}
    >
      {glow}
      {label}
    </Link>
  );
}

const PANEL_NAV = [
  { path: '/instructions', label: 'Model Instructions', icon: BookOpen },
  { path: '/generator',    label: 'Create with AI',    icon: Sparkles },
  { path: '/chat',         label: 'Chat with AI',      icon: MessageSquare },
];

function RoadmapNavItem({ active }: { active: boolean }) {
  const { onMouseMove, onMouseLeave: glowMouseLeave, glow } = useCursorGlow();
  const { fetchUserRoadmaps } = useRoadmap();
  const location = useLocation();
  const [panelOpen, setPanelOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [history, setHistory] = useState<Roadmap[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const [panelPos, setPanelPos] = useState({ x: 0, y: 0, active: false });
  const onPanelMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPanelPos({ x: e.clientX - rect.left, y: e.clientY - rect.top, active: true });
  };
  const onPanelMouseLeave = () => setPanelPos(prev => ({ ...prev, active: false }));

  useEffect(() => {
    fetchUserRoadmaps().then(data => setHistory(data.slice(0, 8)));
  }, [fetchUserRoadmaps]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setPinned(false);
        setPanelOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleEnter = () => {
    clearTimeout(hideTimeout.current);
    setPanelOpen(true);
  };

  const handleLeave = () => {
    if (!pinned) {
      hideTimeout.current = setTimeout(() => setPanelOpen(false), 250);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setPinned(p => {
      if (p) { setPanelOpen(false); return false; }
      setPanelOpen(true);
      return true;
    });
  };

  return (
    <div ref={containerRef} className="relative" onMouseEnter={handleEnter} onMouseLeave={handleLeave}>
      <button
        type="button"
        onClick={handleClick}
        onMouseMove={onMouseMove}
        onMouseLeave={glowMouseLeave}
        className="relative overflow-hidden px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1.5"
        style={{
          color: active || panelOpen ? T.teal : T.textMid,
          background: active || panelOpen ? 'rgba(10,255,228,0.06)' : 'transparent',
          border: `1px solid ${active || panelOpen ? T.border : 'transparent'}`,
        }}
      >
        {glow}
        Roadmap
        <ChevronDown
          size={13}
          className="transition-transform duration-200"
          style={{ transform: panelOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>

      {panelOpen && (
        <div
          className="absolute top-full left-0 mt-2 w-72 rounded-2xl overflow-hidden z-50 shadow-2xl"
          style={{
            background: 'rgba(8, 13, 20, 0.92)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: `1px solid ${T.border}`,
          }}
          onMouseMove={onPanelMouseMove}
          onMouseLeave={onPanelMouseLeave}
          onMouseEnter={() => clearTimeout(hideTimeout.current)}
        >
          <div
            className="pointer-events-none absolute inset-0 transition-opacity duration-200 rounded-2xl"
            style={{
              opacity: panelPos.active ? 1 : 0,
              background: `radial-gradient(180px circle at ${panelPos.x}px ${panelPos.y}px, rgba(255,255,255,0.06), transparent 70%)`,
            }}
          />

          <div className="p-2 space-y-0.5 relative z-10">
            {PANEL_NAV.map(item => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150"
                  style={{
                    background: isActive ? 'rgba(10,255,228,0.10)' : 'transparent',
                    color: isActive ? T.teal : T.textMid,
                  }}
                  onClick={() => { setPanelOpen(false); setPinned(false); }}
                >
                  <item.icon size={16} style={{ color: isActive ? T.teal : T.textDim }} />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {history.length > 0 && (
            <div className="relative z-10" style={{ borderTop: `1px solid ${T.border}` }}>
              <div className="px-3 pt-2.5 pb-1">
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.textDim }}>
                  Recent Roadmaps
                </span>
              </div>
              <div
                className="px-1.5 pb-2 max-h-52 overflow-y-auto space-y-0.5"
                style={{ scrollbarWidth: 'thin', scrollbarColor: `${T.border} transparent` }}
              >
                {history.map(r => (
                  <Link
                    key={r.id}
                    to={`/roadmap/${r.id}`}
                    className="flex items-start gap-2 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors"
                    onClick={() => { setPanelOpen(false); setPinned(false); }}
                  >
                    <Building2 size={12} className="mt-0.5 flex-shrink-0" style={{ color: T.textDim }} />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate" style={{ color: T.textMid }}>
                        {r.career_goal} · {r.target_company}
                      </p>
                      <p className="text-[10px] mt-0.5 flex items-center gap-1" style={{ color: T.textDim }}>
                        <Clock size={9} />
                        {relativeTime(r.created_at)} · {r.timeline}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GithubLink() {
  return (
    <a
      href={GITHUB_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="GitHub"
      className="flex items-center justify-center"
    >
      <Github className="w-5 h-5 text-white/70 hover:text-white transition-colors" />
    </a>
  );
}

function NavbarSearch() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [noResults, setNoResults] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const path = matchSearchRoute(query);
    if (path) {
      navigate(path);
      setQuery('');
      setNoResults(false);
    } else if (query.trim()) {
      setNoResults(true);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip open={noResults} onOpenChange={setNoResults}>
        <TooltipTrigger asChild>
          <input
            type="text"
            placeholder="Search..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setNoResults(false);
            }}
            onKeyDown={handleKeyDown}
            className="hidden md:block rounded-full bg-white/5 border border-white/10 focus:border-cyan-500/40 placeholder:text-white/40 text-white/90 text-sm px-4 py-1.5 w-40 focus:w-64 transition-all outline-none"
          />
        </TooltipTrigger>
        <TooltipContent>No results</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

function NavbarAvatar({ profile, onClick }: { profile: Profile | null; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex items-center justify-center rounded-full">
      <Avatar className="h-9 w-9 border border-cyan-500/40">
        <AvatarImage src={profile?.avatar_url ?? undefined} alt="" />
        <AvatarFallback className="bg-cyan-900 text-cyan-100 text-xs font-medium">
          {initials(profile?.full_name ?? null, profile?.email ?? null)}
        </AvatarFallback>
      </Avatar>
    </button>
  );
}

function SignInLink() {
  const { onMouseMove, onMouseLeave, glow } = useCursorGlow();
  return (
    <Link
      to="/login"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative overflow-hidden px-4 py-2 rounded-lg text-sm"
      style={{ border: `1px solid ${T.border}`, background: T.surface, color: T.textMid }}
    >
      {glow}
      Sign In
    </Link>
  );
}

function SignUpLink() {
  const { onMouseMove, onMouseLeave, glow } = useCursorGlow();
  return (
    <Link
      to="/register"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className="relative overflow-hidden px-4 py-2 rounded-lg text-sm font-bold"
      style={{ background: T.gradBtn, color: '#040810' }}
    >
      {glow}
      Sign Up
    </Link>
  );
}

export function Navbar() {
  const { user, profile } = useAuth();
  const location = useLocation();
  const avatarAnchorRef = useRef<HTMLDivElement>(null);
  const [profilePanelOpen, setProfilePanelOpen] = useState(false);

  const isAuthPage = ['/login', '/register'].some(p => location.pathname.startsWith(p));

  const navItemsBefore = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
  ];

  const navItemsAfter = [
    { path: '/progress', label: 'Progress' },
    { path: '/profile', label: 'Profile' },
  ];

  const isRoadmapActive = location.pathname === '/generator' ||
    location.pathname.startsWith('/generator/') ||
    location.pathname.startsWith('/roadmap/');

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

          <LogoLink />

          <div className="hidden md:flex items-center gap-1">
            {user && navItemsBefore.map(item => (
              <NavLink
                key={item.path}
                path={item.path}
                label={item.label}
                active={location.pathname === item.path}
              />
            ))}
            {user && <RoadmapNavItem active={isRoadmapActive} />}
            {user && navItemsAfter.map(item => (
              <NavLink
                key={item.path}
                path={item.path}
                label={item.label}
                active={location.pathname === item.path}
              />
            ))}
          </div>

          <div className="flex items-center gap-3 ml-auto md:ml-0">
            {user ? (
              <>
                <NavbarSearch />
                <NotificationMailbox />
                <GithubLink />
                <div ref={avatarAnchorRef}>
                  <NavbarAvatar
                    profile={profile}
                    onClick={() => setProfilePanelOpen(prev => !prev)}
                  />
                </div>
                <ProfilePanel
                  open={profilePanelOpen}
                  onClose={() => setProfilePanelOpen(false)}
                  anchorRef={avatarAnchorRef}
                />
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
                      {[...navItemsBefore, { path: '/generator', label: 'Roadmap' }, ...navItemsAfter].map(item => (
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
              <div className="flex items-center gap-3">
                <GithubLink />
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