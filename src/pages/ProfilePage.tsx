import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Camera,
  Lock,
  Loader2,
  User,
  Activity,
  Trophy,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { fetchUserEvents } from '@/lib/userEvents';
import { RecentActivityFeed } from '@/components/activity/RecentActivityFeed';
import type { ActivityEvent } from '@/types/activity';
import type { UserAchievement, UserProfile } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ACHIEVEMENT_DEFINITIONS } from '@/services/achievementService';

type TabId = 'profile' | 'activity' | 'achievements' | 'settings';

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

export default function ProfilePage() {
  const { user, profile: authProfile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeTab = (searchParams.get('tab') as TabId) || 'profile';

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [fullName, setFullName] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [twitterUrl, setTwitterUrl] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');

  const [statusBusy, setStatusBusy] = useState(false);

  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [earnedAchievements, setEarnedAchievements] = useState<UserAchievement[]>([]);
  const [achievementsLoading, setAchievementsLoading] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    setLoadingProfile(true);
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

      setFullName(merged.full_name ?? '');
      setGithubUrl(merged.github_url ?? '');
      setTwitterUrl(merged.twitter_url ?? '');
      setWebsiteUrl(merged.website_url ?? '');
      setAvatarUrl(merged.avatar_url ?? '');
      setBio(merged.bio ?? '');
      setStatusBusy(merged.status_busy ?? false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load profile');
    } finally {
      setLoadingProfile(false);
    }
  }, [user, authProfile]);

  useEffect(() => {
    if (user) void loadProfile();
  }, [user, loadProfile]);

  useEffect(() => {
    if (activeTab !== 'activity') return;
    setEventsLoading(true);
    fetchUserEvents()
      .then(setEvents)
      .catch(() => setEvents([]))
      .finally(() => setEventsLoading(false));
  }, [activeTab]);

  useEffect(() => {
    if (activeTab !== 'achievements' || !user) return;
    const fetchAchievements = async () => {
      setAchievementsLoading(true);
      try {
        const { data, error } = await supabase
          .from('user_achievements')
          .select('*')
          .eq('user_id', user.id);
        if (error) throw error;
        setEarnedAchievements(data ?? []);
      } catch (err) {
        console.error(err);
        setEarnedAchievements([]);
      } finally {
        setAchievementsLoading(false);
      }
    };
    void fetchAchievements();
  }, [activeTab, user]);

  const handleSaveProfile = async () => {
    if (!user) return;
    setSavingProfile(true);
    try {
      const payload = {
        id: user.id,
        email: user.email,
        full_name: fullName.trim() || null,
        github_url: githubUrl.trim() || null,
        twitter_url: twitterUrl.trim() || null,
        website_url: websiteUrl.trim() || null,
        bio: bio.trim() || null,
        avatar_url: avatarUrl || null,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('user_profiles').upsert(payload, { onConflict: 'id' });
      if (error) throw error;

      await supabase.from('profiles').upsert(
        {
          id: user.id,
          email: user.email,
          full_name: payload.full_name,
          avatar_url: payload.avatar_url,
        },
        { onConflict: 'id' },
      );

      await refreshProfile();
      toast.success('Profile saved');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    if (!user) return;
    setUploadingAvatar(true);
    try {
      const ext = file.name.split('.').pop() ?? 'jpg';
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = urlData.publicUrl;
      setAvatarUrl(url);

      await supabase.from('user_profiles').upsert(
        { id: user.id, email: user.email, avatar_url: url },
        { onConflict: 'id' },
      );
      await supabase.from('profiles').upsert(
        { id: user.id, email: user.email, avatar_url: url },
        { onConflict: 'id' },
      );
      await refreshProfile();
      toast.success('Avatar updated');
    } catch (err) {
      console.error(err);
      toast.error('Failed to upload avatar');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleting(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData.session?.access_token;
      if (!token) throw new Error('Not authenticated');

      const { error } = await supabase.functions.invoke('delete-account', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (error) throw error;

      await signOut();
      navigate('/');
      toast.success('Account deleted');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete account');
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  if (!user) return null;

  const tabs: { id: TabId; label: string; icon: React.ElementType }[] = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4 text-white">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Left Sidebar Navigation */}
        <div className="w-full md:w-60 flex-shrink-0">
          <div className="mb-4 px-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/40">
              Account
            </span>
          </div>
          <nav className="flex flex-col gap-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSearchParams({ tab: tab.id })}
                  className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all duration-150 relative group border text-left"
                  style={{
                    background: isActive ? 'rgba(0,240,255,0.10)' : 'transparent',
                    borderColor: isActive ? 'rgba(0,240,255,0.12)' : 'transparent',
                    color: isActive ? '#00F0FF' : 'rgb(232, 255, 254)',
                  }}
                >
                  <Icon
                    size={18}
                    style={{
                      flexShrink: 0,
                      color: isActive ? '#00F0FF' : 'rgba(232,255,254,0.55)',
                    }}
                  />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Main Content */}
        <div className="flex-1 min-w-0">
          {activeTab === 'profile' && (
            <Card className="border border-white/10 bg-slate-900/50 backdrop-blur-md text-white shadow-xl rounded-2xl">
              <CardHeader className="border-b border-white/10 p-6">
                <CardTitle className="text-2xl font-bold text-white">Profile</CardTitle>
                <CardDescription className="text-white/60">
                  Manage your personal information
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {loadingProfile ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                  </div>
                ) : (
                  <>
                    {/* Avatar Circle & Username Stack */}
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="relative h-20 w-20 rounded-full border-2 border-cyan-500/40 overflow-hidden bg-cyan-900 group"
                        >
                          {avatarUrl ? (
                            <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-cyan-100 text-xl font-medium">
                              {(fullName || user.email || '?').slice(0, 2).toUpperCase()}
                            </span>
                          )}
                          <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                            {uploadingAvatar ? (
                              <Loader2 className="h-5 w-5 animate-spin text-white" />
                            ) : (
                              <Camera className="h-5 w-5 text-white" />
                            )}
                          </span>
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) void handleAvatarUpload(file);
                          }}
                        />
                        {/* Camera icon badge overlay */}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute -bottom-1 -right-1 h-7 w-7 bg-[#00F0FF] hover:opacity-90 text-slate-900 rounded-full flex items-center justify-center shadow-lg border border-slate-900 transition-all cursor-pointer z-10"
                        >
                          <Camera className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-lg font-bold text-white truncate">
                          {fullName || user.email?.split('@')[0] || 'User'}
                        </span>
                        <span className="text-sm text-cyan-400 font-semibold mt-0.5">
                          {statusBusy ? 'Unavailable' : 'Available'}
                        </span>
                      </div>
                    </div>

                    {/* Form Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-white/60 text-xs">Display name</Label>
                        <Input
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          placeholder="Your name"
                          className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/40"
                        />
                      </div>
                      <div>
                        <Label className="text-white/60 text-xs">Email</Label>
                        <Input
                          value={user.email ?? ''}
                          readOnly
                          disabled
                          className="mt-1 bg-white/5 border-white/10 text-white/50 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <Label className="text-white/60 text-xs">Joined</Label>
                        <Input
                          value={user.created_at ? format(new Date(user.created_at), 'MMM d, yyyy') : 'Recently'}
                          readOnly
                          disabled
                          className="mt-1 bg-white/5 border-white/10 text-white/50 cursor-not-allowed"
                        />
                      </div>
                      <div>
                        <Label className="text-white/60 text-xs">GitHub URL</Label>
                        <Input
                          value={githubUrl}
                          onChange={e => setGithubUrl(e.target.value)}
                          placeholder="https://github.com/username"
                          className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/40"
                        />
                      </div>
                      <div>
                        <Label className="text-white/60 text-xs">Twitter/X URL</Label>
                        <Input
                          value={twitterUrl}
                          onChange={e => setTwitterUrl(e.target.value)}
                          placeholder="https://x.com/username"
                          className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/40"
                        />
                      </div>
                      <div>
                        <Label className="text-white/60 text-xs">Website URL</Label>
                        <Input
                          value={websiteUrl}
                          onChange={e => setWebsiteUrl(e.target.value)}
                          placeholder="https://yoursite.com"
                          className="mt-1 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-cyan-500/40"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-white/60 text-xs">Bio</Label>
                        <textarea
                          value={bio}
                          onChange={e => setBio(e.target.value)}
                          placeholder="Tell us about yourself..."
                          className="mt-1 w-full min-h-[100px] rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-cyan-500/40"
                        />
                      </div>
                    </div>

                    <Button
                      className="w-full md:w-auto px-6 bg-cyan-600 hover:bg-cyan-500 text-white font-medium"
                      onClick={() => void handleSaveProfile()}
                      disabled={savingProfile}
                    >
                      {savingProfile ? (
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      ) : null}
                      Save Changes
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'activity' && (
            <Card className="border border-white/10 bg-slate-900/50 backdrop-blur-md text-white shadow-xl rounded-2xl">
              <CardHeader className="border-b border-white/10 p-6">
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <Activity className="h-6 w-6 text-cyan-400" />
                  Activity
                </CardTitle>
                <CardDescription className="text-white/60">
                  Your recent learning activities and events
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <RecentActivityFeed events={events} loading={eventsLoading} compact />
              </CardContent>
            </Card>
          )}

          {activeTab === 'achievements' && (
            <Card className="border border-white/10 bg-slate-900/50 backdrop-blur-md text-white shadow-xl rounded-2xl">
              <CardHeader className="border-b border-white/10 p-6">
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-cyan-400" />
                  Achievements
                </CardTitle>
                <CardDescription className="text-white/60">
                  Your learning milestones and badges
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {achievementsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {(() => {
                      const earnedMap = new Map(earnedAchievements.map(a => [a.achievement_key, a]));
                      return ACHIEVEMENT_DEFINITIONS.map(def => {
                        const earned = earnedMap.get(def.key);
                        return (
                          <div
                            key={def.key}
                            className={`relative rounded-xl border border-white/10 p-4 text-center ${
                              earned ? 'bg-white/5 border-cyan-500/20' : 'bg-white/5 opacity-40 grayscale'
                            }`}
                          >
                            {!earned && (
                              <Lock className="absolute top-2 right-2 h-3.5 w-3.5 text-white/40" />
                            )}
                            <span className="text-3xl">{def.emoji}</span>
                            <p className="mt-2 text-sm font-semibold text-white">{def.name}</p>
                            <p className="mt-1 text-[10px] text-white/50">{def.hint}</p>
                            {earned ? (
                              <p className="mt-2 text-[10px] text-cyan-400/80">
                                {format(new Date(earned.earned_at), 'MMM d, yyyy')}
                              </p>
                            ) : null}
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeTab === 'settings' && (
            <Card className="border border-white/10 bg-slate-900/50 backdrop-blur-md text-white shadow-xl rounded-2xl">
              <CardHeader className="border-b border-white/10 p-6">
                <CardTitle className="text-2xl font-bold text-white flex items-center gap-2">
                  <Settings className="h-6 w-6 text-red-500" />
                  Settings
                </CardTitle>
                <CardDescription className="text-white/60">
                  Manage your account settings and preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="rounded-xl border border-red-500/20 bg-red-950/10 p-4">
                  <h4 className="text-sm font-semibold text-red-400">Danger Zone</h4>
                  <p className="mt-1 text-xs text-white/60">
                    Permanently delete your account and all of your data. This action cannot be undone.
                  </p>
                  <Button
                    variant="destructive"
                    className="mt-4 bg-red-600 hover:bg-red-500 text-white font-medium"
                    onClick={() => setDeleteDialogOpen(true)}
                  >
                    Delete Account
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Delete Account AlertDialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-cyan-500/20 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This will permanently delete your account and all your data. This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/10 bg-white/5 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-500 text-white"
              onClick={e => {
                e.preventDefault();
                void handleDeleteAccount();
              }}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Confirm'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}