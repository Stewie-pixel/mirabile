import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import {
  MessageSquare,
  Plus,
  MoreHorizontal,
  Trash2,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { chatService } from '@/services/chatService';
import type { ChatSession } from '@/types/chat';

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

function ChatSessionCard({ session, collapsed, onDelete }: { session: ChatSession; collapsed: boolean; onDelete: (id: string) => void }) {
  const params = useParams();
  const isActive = params.sessionId === session.id;

  return (
    <div className="relative group">
      <Link
        to={`/chat/${session.id}`}
        className="flex items-start gap-2 px-3 py-2 rounded-lg transition-colors group relative"
        style={{
          background: isActive ? T.surfaceActive : 'transparent',
          border: `1px solid ${isActive ? T.border : 'transparent'}`,
        }}
        title={collapsed ? session.title : undefined}
      >
        {!collapsed && (
          <div
            className="flex-shrink-0 w-[18px] h-[18px] rounded-sm overflow-hidden mt-0.5 flex items-center justify-center"
            style={{ background: isActive ? T.gradBtn : 'rgba(255,255,255,0.08)' }}
          >
            <MessageSquare size={11} style={{ color: isActive ? '#000' : T.textDim }} />
          </div>
        )}
        {!collapsed && (
          <div className="min-w-0 flex-1 pr-6">
            <p className="text-xs font-medium truncate" style={{ color: isActive ? T.teal : T.text }}>
              {session.title}
            </p>
            <p className="text-xs truncate mt-0.5" style={{ color: T.textDim }}>
              {relativeTime(session.updated_at)}
            </p>
          </div>
        )}
      </Link>

      {!collapsed && (
        <button type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onDelete(session.id);
          }}
          className="absolute right-2 top-1/2 -translate-y-2/3 p-2 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/10"
          style={{ color: '#ff3f3fff' }}
          title="Delete chat"
        >
          <Trash2 size={14} />
        </button>
      )}
    </div>
  );
}

export function ChatHistorySidebar() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [historyMenuOpen, setHistoryMenuOpen] = useState(false);
  const historyMenuRef = useRef<HTMLDivElement>(null);

  const fetchSessions = async () => {
    if (!user) return;
    try {
      const data = await chatService.getSessions(user.id);
      setSessions(data);
    } catch (error) {
      console.error('Error fetching chat sessions', error);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [user, location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (historyMenuRef.current && !historyMenuRef.current.contains(e.target as Node)) {
        setHistoryMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleDeleteSession = async (sessionId: string) => {
    if (!user) return;
    try {
      await chatService.deleteSession(sessionId);
      setSessions(s => s.filter(x => x.id !== sessionId));
      if (params.sessionId === sessionId) {
        navigate('/chat');
      }
    } catch (error) {
      console.error('Failed to delete session', error);
    }
  };

  const handleClearHistory = async () => {
    if (!user) return;
    setHistoryMenuOpen(false);
    try {
      await chatService.deleteAllSessions(user.id);
      setSessions([]);
      if (params.sessionId) {
        navigate('/chat');
      }
    } catch (error) {
      console.error('Failed to clear sessions', error);
    }
  };

  if (!user) return null;

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

      {/* ── top actions ── */}
      <div className="flex flex-col gap-2 p-3">
        {!mobile && (
          <div className={`flex items-center mb-2 ${collapsed ? 'justify-center' : 'justify-between'}`}>
            {!collapsed && (
              <button type="button"
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-1.5 text-xs hover:underline"
                style={{ color: T.textDim }}
              >
                <ArrowLeft size={14} />
                <span>Back to App</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setCollapsed(c => !c)}
              className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-white/10"
              style={{ color: T.textDim }}
            >
              <Menu size={15} />
            </button>
          </div>
        )}

        <button type="button"
          onClick={() => navigate('/chat')}
          className="flex items-center justify-center py-2.5 rounded-xl text-sm font-medium transition-opacity hover:opacity-90 w-full"
          style={{ background: T.gradBtn, color: '#040810' }}
        >
          {collapsed ? <Plus size={16} /> : <span>New Chat</span>}
        </button>
      </div>

      {/* ── chat history ── */}
      <div className="mt-2 flex-1 flex flex-col min-h-0">
        <div className={`flex items-center px-3 mb-1 ${collapsed && !mobile ? 'justify-center' : 'justify-between'}`}>
          {(!collapsed || mobile) && (
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: T.textDim }}>
              Chat History
            </span>
          )}
          <div className="relative" ref={historyMenuRef}>
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
                  style={{ color: '#ff3939ff' }}
                >
                  <Trash2 size={12} />
                  Clear history
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto flex flex-col gap-0.5 px-1 pb-2"
          style={{ scrollbarWidth: 'thin', scrollbarColor: `${T.border} transparent` }}>
          {sessions.map(s => (
            <ChatSessionCard
              key={s.id}
              session={s}
              collapsed={!mobile && collapsed}
              onDelete={handleDeleteSession}
            />
          ))}
          {sessions.length === 0 && (!collapsed || mobile) && (
            <div className="text-center px-4 py-6 text-xs" style={{ color: T.textDim }}>
              No previous chats
            </div>
          )}
        </div>
      </div>

      {/* ── spacer ── */}
      <div className="flex-1" />

      {/* ── user profile row ── */}
      <div
        className="p-2 mx-2 mb-2 rounded-xl flex items-center gap-2"
        style={{ background: T.surface, border: `1px solid ${T.border}` }}
      >
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
      <aside className="hidden md:flex flex-col flex-shrink-0 h-screen sticky top-0 overflow-hidden"
        style={{ width: collapsed ? '64px' : '220px', transition: 'width 0.2s ease' }}>
        <SidebarContent />
      </aside>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="md:hidden fixed top-[18px] left-4 z-40 w-9 h-9 rounded-lg flex items-center justify-center"
        style={{ background: T.bg, border: `1px solid ${T.border}`, color: T.text }}
        aria-label="Open menu"
      >
        <Menu size={18} />
      </button>

      {mobileOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="md:hidden fixed inset-y-0 left-0 z-50 flex flex-col shadow-2xl">
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
