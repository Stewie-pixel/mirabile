import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRoadmap } from '@/contexts/RoadmapContext';
import { useProgress } from '@/contexts/ProgressContext';
import { supabase } from '@/lib/supabase';
import { MirabileMascot } from '@/components/ui/MirabileMascot';
import {
  Loader2,
  TrendingUp,
  Target,
  Flame,
  ArrowRight,
  Play,
  LayoutList,
  Award,
  RefreshCw,
} from 'lucide-react';
import type { Roadmap } from '@/types';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Google, Meta, Apple, Microsoft, Amazon, Netflix, Nvidia, Oracle, Tesla, Adobe, Salesforce } from '@/assets/images/cards';
import { getBrandColors } from '../constants/companyBranding.ts';
import { assetUrl } from '@/lib/assetUrl';

const COMPANY_CONFIG: Record<string, { color: string, logoUrl: string, coverUrl: string }> = {
  'Google':     { color: getBrandColors('Google').primary,     logoUrl: assetUrl('icons/google.png'),     coverUrl: Google },
  'Meta':       { color: getBrandColors('Meta').primary,       logoUrl: assetUrl('icons/meta.png'),       coverUrl: Meta },
  'Apple':      { color: getBrandColors('Apple').primary,      logoUrl: assetUrl('icons/apple.png'),      coverUrl: Apple },
  'Microsoft':  { color: getBrandColors('Microsoft').primary,  logoUrl: assetUrl('icons/microsoft.png'),  coverUrl: Microsoft },
  'Amazon':     { color: getBrandColors('Amazon').primary,     logoUrl: assetUrl('icons/amazon.png'),     coverUrl: Amazon },
  'Netflix':    { color: getBrandColors('Netflix').primary,    logoUrl: assetUrl('icons/netflix.png'),    coverUrl: Netflix },
  'Nvidia':     { color: getBrandColors('Nvidia').primary,     logoUrl: assetUrl('icons/nvidia.png'),     coverUrl: Nvidia },
  'Oracle':     { color: getBrandColors('Oracle').primary,     logoUrl: assetUrl('icons/oracle.png'),     coverUrl: Oracle },
  'Tesla':      { color: getBrandColors('Tesla').primary,      logoUrl: assetUrl('icons/tesla.png'),      coverUrl: Tesla },
  'Adobe':      { color: getBrandColors('Adobe').primary,      logoUrl: assetUrl('icons/adobe.png'),      coverUrl: Adobe },
  'Salesforce': { color: getBrandColors('Salesforce').primary, logoUrl: assetUrl('icons/salesforce.png'), coverUrl: Salesforce },
};

const getCompanyConfig = (name: string) => {
  const key = Object.keys(COMPANY_CONFIG).find(k => name.toLowerCase().includes(k.toLowerCase()));
  if (key) return COMPANY_CONFIG[key];
  return { color: '#0AFFE4', logoUrl: assetUrl('icons/adobe.png'), coverUrl: Google };
};

const daily = 24 * 60 * 60 * 1000;
const news_cache = 'dashboard_news_cache';

type NewsCache = {
  stories: HackerNewsStory[];
  fetchedAt: number;
}

type UnsplashPhoto = {
  urls: {
    small: string;
  };
};

type HackerNewsStory = {
  id: number;
  title: string;
  url: string;
  score: number;
  by: string;
  image: string;
};

export default function DashboardPage() {
  const { fetchUserRoadmaps, userRoadmaps } = useRoadmap();
  const { fetchProgress, fetchAllProgress, progress, progressMap } = useProgress();
  const [_, setActiveRoadmap] = useState<Roadmap | null>(userRoadmaps[0] ?? null);
  const [news, setNews] = useState<HackerNewsStory[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);
  const [loading, setLoading] = useState(userRoadmaps.length === 0);
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchUserRoadmaps();
      setLoading(false);
    };
    load();
  }, [fetchUserRoadmaps]);

  useEffect(() => {
    if (userRoadmaps.length > 0) {
      setActiveRoadmap(userRoadmaps[0]);
      fetchProgress(userRoadmaps[0].id);
      const allIds = userRoadmaps.map(r => r.id);
      fetchAllProgress(allIds);
    }
  }, [userRoadmaps]);

  useEffect(() => {
    const fetchEvents = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data, error } = await supabase
        .from('user_events')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
        
      if (!error && data) {
        setEvents(data);
      }
    };
    fetchEvents();
  }, [userRoadmaps]);

  const fetchNews = useCallback(async (forceRefresh = false) => {
    setNewsLoading(true);
    try {
      const cached = localStorage.getItem(news_cache);
      if (cached && !forceRefresh) {
        const parsed: NewsCache = JSON.parse(cached);
        if (Date.now() - parsed.fetchedAt < daily) {
          setNews(parsed.stories);
          setNewsLoading(false);
          return;
        }
      }

      const idsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
      const ids: number[] = await idsRes.json();
      const topIds = ids.slice(0, 4);

      const unsplashKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
      let photos: UnsplashPhoto[] = [];
      try {
        const imgRes = await fetch(`https://api.unsplash.com/photos/random?count=4&query=technology&client_id=${unsplashKey}&_=${Date.now()}`);
        if (imgRes.ok) {
          photos = await imgRes.json() as UnsplashPhoto[];
        }
      } catch (e) {
        console.error('Failed to fetch Unsplash photos', e);
      }

      const stories = await Promise.all(
        topIds.map(async (id: number, index: number) => {
          const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
          const story = await res.json() as HackerNewsStory;
          return {
            ...story,
            image: photos[index]?.urls?.small || 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80'
          };
        })
      );

      setNews(stories);
      const cacheData: NewsCache = { stories, fetchedAt: Date.now() };
      localStorage.setItem(news_cache, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Failed to fetch news:', error);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
    const interval = setInterval(() => fetchNews(), daily);
    return () => clearInterval(interval);
  }, [fetchNews]);


  if (loading) return null;

  if (!loading && userRoadmaps.length === 0) {
    return (
      <div className="container mx-auto max-w-4xl py-8 px-4">
        <div className="glass-strong rounded-2xl p-8">
          <div className="flex flex-col items-center justify-center space-y-4 py-8">
            <MirabileMascot size={160} className="mb-2" />
            <h2 className="text-2xl font-semibold" style={{ color: '#ffffff' }}>No Roadmaps Yet</h2>
            <p className="text-center max-w-md" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Start your career journey by generating your first personalized roadmap.
            </p>
            <Button asChild variant="gradient">
              <Link to="/generator">
                Generate Your First Roadmap
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const calculateUserStreak = (eventsList: any[]) => {
    const signInEvents = eventsList.filter(e => e.event_type === 'sign_in');
    if (signInEvents.length === 0) return 0;
  
    const toUTCDateStr = (date: Date) =>
      `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
  
    const uniqueDates = new Set(
      signInEvents.map(e => toUTCDateStr(new Date(e.created_at)))
    );
  
    const now = new Date();
    const todayStr = toUTCDateStr(now);
  
    const yesterday = new Date(now);
    yesterday.setUTCDate(now.getUTCDate() - 1);
    const yesterdayStr = toUTCDateStr(yesterday);
  
    let currentCheckStr = todayStr;
    if (!uniqueDates.has(todayStr)) {
      if (uniqueDates.has(yesterdayStr)) {
        currentCheckStr = yesterdayStr;
      } else {
        return 0;
      }
    }
  
    let streak = 0;
    const loopDate = new Date(currentCheckStr);
    while (uniqueDates.has(toUTCDateStr(loopDate))) {
      streak++;
      loopDate.setUTCDate(loopDate.getUTCDate() - 1);
    }
  
    return streak;
  };

  const activeRoadmapsCount = userRoadmaps.length;
  const currentStreak = calculateUserStreak(events);
  const currentMilestones = progress?.milestones?.filter(m => m.achieved).length || 0;

  const activeRoadmapsData = [
    { value: Math.max(0, activeRoadmapsCount - 2) },
    { value: Math.max(0, activeRoadmapsCount - 1) },
    { value: activeRoadmapsCount },
    { value: activeRoadmapsCount },
  ];
  const roadmapsUp = activeRoadmapsData[activeRoadmapsData.length - 1].value >= activeRoadmapsData[activeRoadmapsData.length - 2].value;

  const streakData = [
    { value: Math.max(0, currentStreak - 3) },
    { value: Math.max(0, currentStreak - 2) },
    { value: Math.max(0, currentStreak - 1) },
    { value: currentStreak },
  ];
  const streakUp = streakData[streakData.length - 1].value >= streakData[streakData.length - 2].value;

  const milestonesData = [
    { value: Math.max(0, currentMilestones - 2) },
    { value: Math.max(0, currentMilestones - 1) },
    { value: currentMilestones },
    { value: currentMilestones },
  ];
  const milestonesUp = milestonesData[milestonesData.length - 1].value >= milestonesData[milestonesData.length - 2].value;

  const today = new Date();
  const getDayLabel = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(today.getDate() - daysAgo);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}`;
  };

  const userGrowthData = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toLocaleDateString('en-CA');
    const activityCount = events.filter(e => {
      return new Date(e.created_at).toLocaleDateString('en-CA') === dateStr;
    }).length;

    return {
      name: getDayLabel(6 - i),
      days: activityCount
    };
  });

  return (
    <div className="container mx-auto max-w-6xl py-8 px-4">

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2" style={{ color: '#ffffff' }}>Dashboard</h1>
          <p style={{ color: 'rgba(255,255,255,0.5)' }}>Track your progress and stay on top of your career goals</p>
        </div>

        <div className="glass-strong rounded-2xl p-4 w-full md:w-80 border border-white/5">
          <h3 className="text-sm font-bold flex items-center gap-2 mb-3" style={{ color: '#ffffff' }}>
            <TrendingUp className="h-4 w-4" style={{ color: '#0AFFE4' }} />
            Next Steps
          </h3>
          <div className="space-y-3">
            {[
              { title: 'Complete your first roadmap step' },
              { title: 'Review learning resources' },
              { title: 'Set a daily learning goal' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-white/70 hover:text-white transition-colors cursor-pointer group">
                <div className="w-4 h-4 rounded border border-white/20 group-hover:border-[#0AFFE4] flex items-center justify-center bg-black/20" />
                <span>{item.title}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>Stats</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="glass-strong rounded-2xl p-5 relative overflow-hidden flex flex-col min-h-[140px] border border-white/5">
            <Target className="absolute top-5 right-5 h-5 w-5 z-20" style={{ color: roadmapsUp ? '#10b981' : '#ef4444' }} />
            <div className="relative z-10 flex-1 flex flex-col items-start text-left">
              <span className="text-sm font-medium block mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Active Roadmaps</span>
              <div className="text-3xl font-bold text-white leading-none mb-1">{activeRoadmapsCount}</div>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Career paths in progress</p>
            </div>
            <div className="mt-auto pt-4 h-10 w-[55%] self-end pointer-events-none relative z-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={activeRoadmapsData}>
                  <Line type="monotone" dataKey="value" stroke={roadmapsUp ? '#10b981' : '#ef4444'} strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-5 relative overflow-hidden flex flex-col min-h-[140px] border border-white/5">
            <Flame className="absolute top-5 right-5 h-5 w-5 z-20" style={{ color: streakUp ? '#10b981' : '#ef4444' }} />
            <div className="relative z-10 flex-1 flex flex-col items-start text-left">
              <span className="text-sm font-medium block mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Current Streak</span>
              <div className="text-3xl font-bold text-white leading-none mb-1">{currentStreak} <span className="text-lg">days</span></div>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Consecutive sign-in days</p>
            </div>
            <div className="mt-auto pt-4 h-10 w-[55%] self-end pointer-events-none relative z-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={streakData}>
                  <Line type="monotone" dataKey="value" stroke={streakUp ? '#10b981' : '#ef4444'} strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-5 relative overflow-hidden flex flex-col min-h-[140px] border border-white/5">
            <Award className="absolute top-5 right-5 h-5 w-5 z-20" style={{ color: milestonesUp ? '#10b981' : '#ef4444' }} />
            <div className="relative z-10 flex-1 flex flex-col items-start text-left">
              <span className="text-sm font-medium block mb-2" style={{ color: 'rgba(255,255,255,0.7)' }}>Milestones</span>
              <div className="text-3xl font-bold text-white leading-none mb-1">{currentMilestones}</div>
              <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Achievements unlocked</p>
            </div>
            <div className="mt-auto pt-4 h-10 w-[55%] self-end pointer-events-none relative z-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={milestonesData}>
                  <Line type="monotone" dataKey="value" stroke={milestonesUp ? '#10b981' : '#ef4444'} strokeWidth={3} dot={false} isAnimationActive={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>Roadmap</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {userRoadmaps.map(roadmap => {
            const config = getCompanyConfig(roadmap.target_company);
            const roadmapProgress = progressMap[roadmap.id]?.progress_percentage ?? 0;
            return (
              <div key={roadmap.id} className="glass-strong rounded-2xl flex flex-col overflow-hidden border border-white/5 relative group cursor-pointer hover:bg-white/5 transition-colors">
                <div className="p-4 flex-none">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl glass flex items-center justify-center shrink-0 overflow-hidden bg-white/10 p-1.5">
                      <img src={config.logoUrl} alt={roadmap.target_company} className="w-full h-full object-contain" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold leading-tight" style={{ color: '#ffffff' }}>{roadmap.career_goal}</h4>
                      <span className="text-xs font-medium" style={{ color: config.color }}>{roadmap.target_company}</span>
                    </div>
                  </div>
                </div>

                <div className="w-full h-40 overflow-hidden relative flex-none">
                  <img src={config.coverUrl} alt="cover" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#ffffff]/120 to-transparent" />
                </div>

                <div className="p-4 pt-3 flex-1 flex flex-col justify-end">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="glass text-xs px-2.5 py-0.5 border-white/10" style={{ color: '#ffffff' }}>
                      {roadmap.timeline}
                    </Badge>
                    <Badge variant="outline" className="glass text-xs px-2.5 py-0.5 border-white/10" style={{ color: '#ffffff' }}>
                      0 steps
                    </Badge>
                    <div className="flex-1" />
                    <Link to={`/roadmap/${roadmap.id}`} className="w-8 h-8 rounded-full flex items-center justify-center hover:opacity-80 transition-opacity z-10" style={{ backgroundColor: `${config.color}33` }}>
                      <Play className="w-4 h-4" style={{ color: config.color, fill: config.color }} />
                    </Link>
                    <Link to="/progress" className="w-8 h-8 rounded-full glass border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors z-10">
                      <LayoutList className="w-4 h-4 text-white" />
                    </Link>
                  </div>

                  <div className="relative z-0">
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${roadmapProgress}%`,
                          backgroundColor: config.color
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4" style={{ color: '#ffffff' }}>Data</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 min-h-72">

          <div className="glass-strong rounded-2xl p-5 border border-white/5 h-full flex flex-col">
            <h4 className="text-sm font-semibold mb-4" style={{ color: '#ffffff' }}>Daily Progress</h4>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={userGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDays" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0AFFE4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="rgba(255, 255, 255, 1)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis orientation="right" allowDecimals={false} stroke="rgba(255, 255, 255, 1)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    itemStyle={{ color: '#0AFFE4', fontSize: '12px' }}
                    labelStyle={{ color: '#ffffff', fontSize: '12px' }}
                    cursor={{ stroke: 'rgba(255,255,255,0.1)' }}
                  />
                  <Area type="monotone" dataKey="days" stroke="#0AFFE4" strokeWidth={3} fillOpacity={1} fill="url(#colorDays)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-strong rounded-2xl p-5 border border-white/5 flex flex-col h-full">
            <h4 className="text-sm font-semibold mb-4" style={{ color: '#ffffff' }}>Trending Tech News</h4>
            <button type='button'
              onClick={() => fetchNews(true)}
              disabled={newsLoading}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors disabled:opacity-40"
            >
              <RefreshCw className="w-3.5 h-3.5 text-white/50" />
            </button>
            <div className="flex-1 overflow-hidden min-h-0">
              {newsLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-[#0AFFE4]" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 h-full pr-1">
                  {news.map((item) => (
                    <a key={item.id} href={item.url} target="_blank" rel="noreferrer" className="flex flex-col rounded-xl glass hover:bg-white/5 transition-colors border border-white/5 overflow-hidden">
                      <div className="h-24 w-full overflow-hidden bg-black/40 shrink-0">
                        <img src={item.image} alt="news cover" className="w-full h-full object-cover transition-transform hover:scale-105" />
                      </div>
                      <div className="p-3 flex-1 flex flex-col justify-between">
                        <h5 className="text-xs font-medium text-white mb-2 line-clamp-2 leading-snug">{item.title}</h5>
                        <div className="flex items-center justify-between text-[10px] text-white/40">
                          <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3 text-[#a855f7]" /> {item.score}</span>
                          <span className="truncate max-w-[60px]">by {item.by}</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}