import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import {
  BookOpen,
  Sparkles,
  MessageSquare,
  MoreHorizontal,
  Trash2,
  Menu,
  X,
  Building2,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRoadmap } from '@/contexts/RoadmapContext';
import type { Roadmap } from '@/types';

/* ── design tokens matching existing Navbar ── */
const T = {
  border: 'rgba(10,255,228,0.12)',
  surface: 'rgba(10,255,228,0.04)',
  surfaceActive: 'rgba(10,255,228,0.10)',
  teal: '#0AFFE4',
  text: 'rgb(232, 255, 254)',
  textDim: 'rgba(232,255,254,0.55)',
  bg: '#080D12',
  gradBtn: 'linear-gradient(135deg, #0AFFE4 0%, #0EA5E9 100%)',
} as const;

/* ── nav items ── */
const NAV_ITEMS = [
  { path: '/instructions', label: 'Model Instructions', icon: BookOpen },
  { path: '/generator',    label: 'Create with AI',    icon: Sparkles },
  { path: '/chat',         label: 'Chat with AI',      icon: MessageSquare },
];

/* ── relative timestamp helper ── */
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

/* ── avatar initials ── */
function initials(name: string | null, email: string | null): string {
  const src = name || email || '?';
  const parts = src.split(/[\s@]+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/* ── company logo ── */
const LOGOS: Record<string, string> = {
  google: 'https://www.google.com/favicon.ico',
  microsoft: 'https://www.microsoft.com/favicon.ico',
  meta: 'https://www.meta.com/favicon.ico',
  amazon: 'https://www.amazon.com/favicon.ico',
  apple: 'https://www.apple.com/favicon.ico',
  netflix: 'https://www.netflix.com/favicon.ico',
  tesla: 'https://www.tesla.com/favicon.ico',
  nvidia: 'https://www.nvidia.com/favicon.ico',
  salesforce: 'https://www.salesforce.com/favicon.ico',
  adobe: 'https://www.adobe.com/favicon.ico',
};

function companyLogo(companyName: string): string | null {
  return LOGOS[companyName.toLowerCase().replace(/\s+/g, '')] ?? null;
}

function NavItem({ path, label, icon: Icon, collapsed }: {
  path: string; label: string; icon: React.ElementType; collapsed: boolean;
}) {
  const location = useLocation();
  const active = location.pathname === path || location.pathname.startsWith(path + '/');
  return (
    <Link
      to={path}
      title={collapsed ? label : undefined}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group relative"
      style={{
        background: active ? T.surfaceActive : 'transparent',
        border: `1px solid ${active ? T.border : 'transparent'}`,
        color: active ? T.teal : T.text,
      }}
    >
      <Icon size={18} style={{ flexShrink: 0, color: active ? T.teal : T.textDim }} />
      {!collapsed && (
        <span className="text-sm font-medium truncate" style={{ color: active ? T.teal : T.text }}>
          {label}
        </span>
      )}
      {/* tooltip when collapsed */}
      {collapsed && (
        <span
          className="absolute left-full ml-3 px-2 py-1 rounded-md text-xs whitespace-nowrap
            opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50"
          style={{ background: '#1A2233', color: T.text, border: `1px solid ${T.border}` }}
        >
          {label}
        </span>
      )}
    </Link>
  );
}

function HistoryCard({ roadmap, collapsed }: { roadmap: Roadmap; collapsed: boolean }) {
  const logo = companyLogo(roadmap.target_company);
  return (
    <Link
      to={`/roadmap/${roadmap.id}`}
      className="flex items-start gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
      title={collapsed ? `${roadmap.career_goal} · ${roadmap.target_company}` : undefined}
    >
      {/* logo / fallback */}
      <div
        className="flex-shrink-0 w-[18px] h-[18px] rounded-sm overflow-hidden mt-0.5 flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.08)' }}
      >
        {logo
          ? <img src={logo} alt={roadmap.target_company} className="w-full h-full object-cover" />
          : <Building2 size={11} style={{ color: T.textDim }} />}
      </div>
      {!collapsed && (
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium truncate" style={{ color: T.text }}>
            {roadmap.career_goal} · {roadmap.target_company}
          </p>
          <p className="text-xs truncate mt-0.5" style={{ color: T.textDim }}>
            {relativeTime(roadmap.created_at)} · {roadmap.timeline}
          </p>
        </div>
      )}
    </Link>
  );
}

export function Sidebar() {
  const { user, profile } = useAuth();
  const { fetchUserRoadmaps } = useRoadmap();
  const navigate = useNavigate();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [history, setHistory] = useState<Roadmap[]>([]);
  const [historyMenuOpen, setHistoryMenuOpen] = useState(false);
  const historyMenuRef = useRef<HTMLDivElement>(null);

  /* fetch history on mount */
  useEffect(() => {
    if (!user) return;
    fetchUserRoadmaps().then(data => setHistory(data.slice(0, 20)));
  }, [user, fetchUserRoadmaps]);

  /* close mobile drawer on route change */
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  /* close history menu on outside click */
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (historyMenuRef.current && !historyMenuRef.current.contains(e.target as Node)) {
        setHistoryMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleClearHistory = async () => {
    await fetch('/api/roadmaps/clear-history', { method: 'POST' });
    if (!user) return;
    setHistoryMenuOpen(false);
    setHistory([]);
  };

  /* don't render sidebar on public routes */
  const isPublic = ['/', '/login', '/register'].some(p =>
    location.pathname === p || location.pathname.startsWith(p + '/')
  );
  if (!user || isPublic) return null;

  /* ── shared sidebar content ── */
  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div
      className="flex flex-col h-full"
      style={{
        background: T.bg,
        borderRight: mobile ? 'none' : `1px solid ${T.border}`,
        width: mobile ? '260px' : collapsed ? '64px' : '220px',
        transition: 'width 0.2s ease',
      }}
    >
      {/* ── collapse toggle (desktop only) ── */}
      {!mobile && (
        <div className="flex items-center justify-end px-3 pt-3 pb-1">
          <button
            type="button"
            onClick={() => setCollapsed(c => !c)}
            className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: T.textDim }}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <Menu size={15} />
          </button>
        </div>
      )}

      {/* ── nav items ── */}
      <nav className="flex flex-col gap-1 px-2 pt-2">
        {NAV_ITEMS.map(item => (
          <NavItem key={item.path} {...item} collapsed={!mobile && collapsed} />
        ))}
      </nav>

      {/* ── roadmap history ── */}
      {history.length > 0 && (
        <div className="mt-4 flex-1 flex flex-col min-h-0">
          {/* section header */}
          <div className="flex items-center justify-between px-3 mb-1">
            {(!collapsed || mobile) && (
              <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: T.textDim }}>
                Roadmap History
              </span>
            )}
            <div className="relative ml-auto" ref={historyMenuRef}>
              <button
                type="button"
                onClick={() => setHistoryMenuOpen(o => !o)}
                className="w-6 h-6 rounded flex items-center justify-center hover:bg-white/10 transition-colors"
                style={{ color: T.textDim }}
                aria-label="History options"
              >
                <MoreHorizontal size={14} />
              </button>
              {historyMenuOpen && (
                <div
                  className="absolute right-0 top-full mt-1 w-36 rounded-xl overflow-hidden z-50 shadow-xl"
                  style={{ background: '#1A2233', border: `1px solid ${T.border}` }}
                >
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    className="flex items-center gap-2 w-full px-3 py-2.5 text-xs hover:bg-white/10 transition-colors"
                    style={{ color: '#F87171' }}
                  >
                    <Trash2 size={12} />
                    Clear history
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* scrollable list */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-0.5 px-1 pb-2"
            style={{ scrollbarWidth: 'thin', scrollbarColor: `${T.border} transparent` }}>
            {history.map(r => (
              <HistoryCard key={r.id} roadmap={r} collapsed={!mobile && collapsed} />
            ))}
          </div>
        </div>
      )}

      {/* ── spacer ── */}
      <div className="flex-1" />

      {/* ── user profile row ── */}
      <div
        className="p-2 mx-2 mb-2 rounded-xl flex items-center gap-2"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
        {/* avatar */}
        <div
          className="w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold"
          style={{ background: T.gradBtn, color: '#040810' }}
        >
          {profile?.avatar_url
            ? <img src={profile.avatar_url} alt="avatar" className="w-8 h-8 rounded-lg object-cover" />
            : initials(profile?.full_name ?? null, user?.email ?? null)}
        </div>
        {(!collapsed || mobile) && (
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold truncate" style={{ color: T.text }}>
              {profile?.full_name || user?.email?.split('@')[0] || 'User'}
            </p>
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="text-xs hover:underline"
              style={{ color: T.teal }}
            >
              View profile →
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ── desktop sidebar ── */}
      <aside className="hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0 overflow-hidden"
        style={{ width: collapsed ? '64px' : '220px', transition: 'width 0.2s ease' }}>
        <SidebarContent />
      </aside>

      {/* ── mobile hamburger button ── */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-[18px] left-4 z-40 w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text }}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {/* ── mobile overlay drawer ── */}
      {mobileOpen && (
        <>
          {/* backdrop */}
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          {/* drawer */}
          <div className="md:hidden fixed inset-y-0 left-0 z-50 flex flex-col shadow-2xl">
            {/* close button */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-3 right-3 w-8 h-8 rounded-lg flex items-center justify-center z-10"
              style={{ background: T.surface, color: T.text, border: `1px solid ${T.border}` }}
              aria-label="Close menu"
            >
              <X size={16} />
            </button>
            <SidebarContent mobile />
          </div>
        </>
      )}
    </>
  );
}
