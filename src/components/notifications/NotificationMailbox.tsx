import { useCallback, useEffect, useRef, useState } from 'react';
import { Award, Bell, Calendar, Mail, Megaphone } from 'lucide-react';
import { supabase } from '@/db/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { formatRelativeTime } from '@/lib/formatters';
import type { NotificationType, UserNotification } from '@/types';

const PAGE_SIZE = 20;

const TYPE_ICONS: Record<
  NotificationType,
  { Icon: typeof Award; color: string }
> = {
  award_received: { Icon: Award, color: '#a855f7' },
  announcement: { Icon: Megaphone, color: '#f97316' },
  newsletter: { Icon: Mail, color: '#06b6d4' },
};

function NotificationTypeIcon({ type }: { type: NotificationType }) {
  const { Icon, color } = TYPE_ICONS[type];
  return <Icon className="h-5 w-5 shrink-0" style={{ color }} />;
}

function hoverTooltipText(count: number): string {
  if (count > 0) {
    return `You have ${count} unread notification${count === 1 ? '' : 's'}`;
  }
  return 'No unread notifications';
}

export function NotificationMailbox() {
  const { user } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('user_notifications')
      .select('*')
      .eq('user_id', user.id)
      .eq('read', false)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to fetch unread notifications:', error);
      return;
    }
    setUnreadCount(data?.length ?? 0);
  }, [user]);

  const fetchPage = useCallback(
    async (pageOffset: number, append: boolean) => {
      if (!user) return;
      const { data, error } = await supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(pageOffset, pageOffset + PAGE_SIZE - 1);

      if (error) {
        console.error('Failed to fetch notifications:', error);
        return;
      }

      const rows = (data ?? []) as UserNotification[];
      setHasMore(rows.length === PAGE_SIZE);
      setOffset(pageOffset + rows.length);
      setNotifications(prev => (append ? [...prev, ...rows] : rows));
    },
    [user],
  );

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      return;
    }
    void fetchUnreadCount();
  }, [user, fetchUnreadCount]);

  useEffect(() => {
    if (!expanded || !user) return;
    setLoading(true);
    setOffset(0);
    setHasMore(true);
    void fetchPage(0, false).finally(() => setLoading(false));
  }, [expanded, user, fetchPage]);

  useEffect(() => {
    if (!expanded) return;
    function handleMouseDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [expanded]);

  const loadMore = async () => {
    if (!user || loadingMore || !hasMore) return;
    setLoadingMore(true);
    await fetchPage(offset, true);
    setLoadingMore(false);
  };

  const handleListScroll = () => {
    const el = listRef.current;
    if (!el || loadingMore || !hasMore) return;
    const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 48;
    if (nearBottom) void loadMore();
  };

  const markAsRead = async (id: string) => {
    if (!user) return;
    const target = notifications.find(n => n.id === id);
    if (!target || target.read) return;

    const { error } = await supabase
      .from('user_notifications')
      .update({ read: true })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) {
      console.error('Failed to mark notification as read:', error);
      return;
    }

    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    if (!user || unreadCount === 0) return;

    const { error } = await supabase
      .from('user_notifications')
      .update({ read: true })
      .eq('user_id', user.id)
      .eq('read', false);

    if (error) {
      console.error('Failed to mark all notifications as read:', error);
      return;
    }

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  if (!user) return null;

  const showHoverTooltip = hovering && !expanded;

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      <button
        type="button"
        aria-label="Notifications"
        aria-expanded={expanded}
        className="relative flex items-center justify-center"
        onClick={() => setExpanded(prev => !prev)}
      >
        <Bell className="w-5 h-5 text-white/70 hover:text-white transition-colors" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {showHoverTooltip && (
        <div
          className="absolute top-full right-0 mt-2 z-[70] whitespace-nowrap rounded-lg border border-cyan-500/20 bg-slate-900/95 px-3 py-2 text-xs text-white/80 shadow-lg backdrop-blur-md"
          role="tooltip"
        >
          {hoverTooltipText(unreadCount)}
        </div>
      )}

      {expanded && (
        <div
          className="absolute top-full right-0 mt-2 z-[70] w-[380px] max-h-[480px] flex flex-col rounded-2xl border border-cyan-500/20 bg-slate-900/95 shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-200 ease-out"
          role="dialog"
          aria-label="Notifications"
        >
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <h2 className="text-sm font-semibold text-white">Notifications</h2>
              <button
                type="button"
                onClick={() => void markAllRead()}
                disabled={unreadCount === 0}
                className="text-xs text-cyan-400 hover:text-cyan-300 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Mark all read
              </button>
            </div>

            <div
              ref={listRef}
              onScroll={handleListScroll}
              className="overflow-y-auto flex-1 max-h-[420px]"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(6,182,212,0.3) transparent' }}
            >
              {loading && notifications.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-white/50">Loading…</p>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-3 px-4 py-12 text-white/50">
                  <Calendar className="h-10 w-10 text-cyan-500/40" />
                  <p className="text-sm">You&apos;re all caught up!</p>
                </div>
              ) : (
                <ul className="divide-y divide-white/5">
                  {notifications.map(n => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => void markAsRead(n.id)}
                        className={`w-full flex gap-3 px-4 py-3 text-left transition-colors hover:bg-white/5 ${
                          !n.read ? 'border-l-2 border-cyan-400 bg-cyan-950/20' : 'border-l-2 border-transparent'
                        }`}
                      >
                        <NotificationTypeIcon type={n.type} />
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm leading-snug ${n.read ? 'text-white/80' : 'font-bold text-white'}`}>
                            {n.title}
                          </p>
                          <p className="mt-0.5 text-xs text-white/50 line-clamp-2">{n.description}</p>
                          <p className="mt-1 text-[10px] text-white/40">
                            {formatRelativeTime(n.created_at)}
                          </p>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              {loadingMore && (
                <p className="px-4 py-3 text-center text-xs text-white/40">Loading more…</p>
              )}
            </div>
        </div>
      )}
    </div>
  );
}
