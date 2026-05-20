import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { useNavigate } from 'react-router';
import {
  LogOut,
  User,
  Activity,
  Trophy,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import {
  dateToExpiryOption,
  expiryOptionToDate,
  type StatusExpiryOption,
} from '@/lib/statusExpiry';
import type { UserProfile } from '@/types';
import { Switch } from '@/components/ui/switch';

const EMOJI_OPTIONS = [
  '😀', '😃', '😄', '😁', '😆', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰',
  '😘', '😗', '😙', '😚', '😋', '😛', '😝', '😜', '🤪', '🤨', '🧐', '🤓', '😎', '🥸', '🤩', '🥳',
  '😏', '😒', '😞', '😔', '😟', '😕', '🙁', '☹️', '😣', '😖', '😫', '😩', '🥺', '😢', '😭', '😤',
  '😠', '😡', '🤬', '🤯', '😳', '🥵', '🥶', '😱', '😨', '😰', '😥', '😓', '🤗', '🤔', '🫣', '🤭',
  '🫢', '🤫', '🤥', '😶', '🫵', '👍', '👎', '👊', '✊', '🤛', '🤜', '🤞', '✌️', '🤟', '🤘', '👌',
  '🚀', '💼', '🎯', '☕', '🔥', '✨', '📚', '💡', '🏆', '🎉', '🌙', '💻', '🎨', '🧠', '🛠️', '⚙️'
];

interface ProfilePanelProps {
  open: boolean;
  onClose: () => void;
  anchorRef: RefObject<HTMLElement | null>;
}

function emptyProfile(userId: string, email: string | null): UserProfile {
  return {
    id: userId,
    full_name: null,
    email,
    avatar_url: null,
    github_url: null,
    twitter_url: null,
    website_url: null,
    bio: null,
    status_text: null,
    status_emoji: null,
    status_busy: false,
    status_expires_at: null,
  };
}

type TabId = 'profile' | 'activity' | 'achievements' | 'settings';

export function ProfilePanel({ open, onClose, anchorRef }: ProfilePanelProps) {
  const { user, profile: authProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({ top: 64, right: 16 });
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [statusText, setStatusText] = useState('');
  const [statusEmoji, setStatusEmoji] = useState('😀');
  const [statusBusy, setStatusBusy] = useState(false);
  const [statusExpiry, setStatusExpiry] = useState<StatusExpiryOption>('Never');

  const [fullName, setFullName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');

  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiTriggerRef = useRef<HTMLButtonElement>(null);

  const updatePosition = useCallback(() => {
    if (!anchorRef.current) return;
    const rect = anchorRef.current.getBoundingClientRect();
    setPosition({
      top: rect.bottom + 8,
      right: Math.max(8, globalThis.innerWidth - rect.right),
    });
  }, [anchorRef]);

  useEffect(() => {
    if (!open) return;
    updatePosition();
    globalThis.addEventListener('resize', updatePosition);
    globalThis.addEventListener('scroll', updatePosition, true);
    return () => {
      globalThis.removeEventListener('resize', updatePosition);
      globalThis.removeEventListener('scroll', updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    function handleMouseDown(e: MouseEvent) {
      const target = e.target as Node;
      if (
        panelRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      ) {
        return;
      }
      onClose();
    }
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [open, onClose, anchorRef]);

  useEffect(() => {
    if (!showEmojiPicker) return;
    function handleEmojiOutsideClick(e: MouseEvent) {
      const target = e.target as Node;
      if (
        !emojiPickerRef.current?.contains(target) &&
        !emojiTriggerRef.current?.contains(target)
      ) {
        setShowEmojiPicker(false);
      }
    }
    document.addEventListener('mousedown', handleEmojiOutsideClick);
    return () => document.removeEventListener('mousedown', handleEmojiOutsideClick);
  }, [showEmojiPicker]);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (error) throw error;

      const merged: UserProfile = data
        ? { ...data, email: data.email ?? user.email ?? null }
        : {
            ...emptyProfile(user.id, user.email ?? null),
            full_name: authProfile?.full_name ?? null,
            avatar_url: authProfile?.avatar_url ?? null,
          };

      setStatusText(merged.status_text ?? '');
      setStatusEmoji(merged.status_emoji ?? '😀');
      setStatusBusy(merged.status_busy ?? false);
      setStatusExpiry(dateToExpiryOption(merged.status_expires_at));
      setFullName(merged.full_name ?? '');
      setAvatarUrl(merged.avatar_url ?? '');
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profile');
    }
  }, [user, authProfile]);

  useEffect(() => {
    if (open && user) void loadProfile();
  }, [open, user, loadProfile]);

  const saveStatus = async (
    overrides: Partial<{
      status_text: string;
      status_emoji: string;
      status_busy: boolean;
      status_expires_at: string | null;
    }> = {},
  ) => {
    if (!user) return;
    const payload = {
      id: user.id,
      email: user.email,
      status_text: overrides.status_text ?? statusText,
      status_emoji: overrides.status_emoji ?? statusEmoji,
      status_busy: overrides.status_busy !== undefined ? overrides.status_busy : statusBusy,
      status_expires_at:
        overrides.status_expires_at !== undefined
          ? overrides.status_expires_at
          : expiryOptionToDate(statusExpiry),
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('user_profiles').upsert(payload, { onConflict: 'id' });
    if (error) {
      console.error(error);
      toast.error('Failed to save status');
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
    navigate('/');
  };

  if (!open || !user) return null;

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Profile"
      style={{ top: position.top, right: position.right }}
      className="fixed z-[70] w-[300px] rounded-2xl border border-cyan-500/20 bg-slate-900/95 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150 ease-out text-white"
    >
      {/* 1. User header (top section) */}
      <div className="p-4 pb-3 flex flex-col gap-3">
        <div className="flex items-center gap-3 relative">
          <div className="h-11 w-11 rounded-full border border-cyan-500/40 overflow-hidden bg-cyan-900 flex items-center justify-center flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <span className="text-cyan-100 text-sm font-medium">
                {(fullName || user.email || '?').slice(0, 2).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex flex-col min-w-0 pr-8">
            <span className="text-sm font-semibold text-white truncate">
              {fullName || user.email?.split('@')[0] || 'User'}
            </span>
            <span className="text-xs text-white/50 truncate">
              {user.email}
            </span>
          </div>

          {/* Status Emoji (pinned top-right) */}
          <div className="absolute top-0 right-0">
            <button
              ref={emojiTriggerRef}
              type="button"
              className="h-8 w-8 rounded-lg border border-white/10 bg-white/5 text-lg flex items-center justify-center hover:bg-white/10 transition-colors"
              onClick={() => setShowEmojiPicker(p => !p)}
              aria-label="Pick emoji"
            >
              {statusEmoji}
            </button>
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                className="absolute top-full right-0 mt-1.5 z-[80] grid grid-cols-6 gap-1 p-2 rounded-xl border border-cyan-500/20 bg-slate-900 shadow-xl max-h-48 overflow-y-auto w-[240px] backdrop-blur-md"
              >
                {EMOJI_OPTIONS.map(e => (
                  <button
                    key={e}
                    type="button"
                    className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-lg transition-colors"
                    onClick={() => {
                      setStatusEmoji(e);
                      setShowEmojiPicker(false);
                      void saveStatus({ status_emoji: e });
                    }}
                  >
                    {e}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 2. Availability row */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-medium text-white/70">
            {statusBusy ? 'not available' : 'available'}
          </span>
          <Switch
            checked={statusBusy}
            onCheckedChange={v => {
              setStatusBusy(v);
              void saveStatus({ status_busy: v });
            }}
            className="data-[state=checked]:bg-cyan-600"
          />
        </div>
      </div>

      {/* 3. Divider */}
      <div className="border-t border-white/10" />

      {/* 4. Nav list (middle section) */}
      <div className="p-2 space-y-0.5">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                onClose();
                navigate(`/profile?tab=${tab.id}`);
              }}
              className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl transition-all duration-150 text-white/70 hover:text-white hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <Icon size={16} className="text-white/50" />
                <span className="text-sm font-medium">{tab.label}</span>
              </div>
              <ChevronRight size={14} className="text-white/30" />
            </button>
          );
        })}
      </div>

      {/* 5. Divider */}
      <div className="border-t border-white/10" />

      {/* 6. Sign out (bottom) */}
      <div className="p-2">
        <button
          key="sign-out"
          type="button"
          onClick={() => void handleSignOut()}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-150 text-red-400 hover:bg-red-500/10 text-left"
        >
          <LogOut size={16} />
          <span className="text-sm font-medium">Sign out</span>
        </button>
      </div>
    </div>
  );
}
