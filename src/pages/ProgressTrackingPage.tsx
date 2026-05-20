import { useState, useMemo, useEffect, useRef } from 'react';
import { format, subDays, eachDayOfInterval } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { GripVertical, Calendar, CheckCircle2, Flame, Plus } from 'lucide-react';
import { RecentActivityFeed } from '@/components/activity/RecentActivityFeed';
import { fetchUserEvents } from '@/lib/userEvents';
import type { ActivityEvent } from '@/types/activity';
import { useRoadmap } from '@/contexts/RoadmapContext';
import { useProgress } from '@/contexts/ProgressContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import type { Milestone, Roadmap, UserProgress } from '@/types';
import { getBrandColors } from '@/constants/companyBranding';

export default function ProgressTrackingPage() {
  const { userRoadmaps } = useRoadmap();
  const { progressMap, fetchAllProgress } = useProgress();
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);

  useEffect(() => {
    if (userRoadmaps.length > 0) {
      fetchAllProgress(userRoadmaps.map(r => r.id));
    }
  }, [userRoadmaps, fetchAllProgress]);

  useEffect(() => {
    fetchUserEvents()
      .then(setEvents)
      .catch(err => {
        console.error('Failed to fetch user events:', err);
        setEvents([]);
      })
      .finally(() => setEventsLoading(false));
  }, []);

  return (
    <div className="container mx-auto max-w-5xl py-12 px-4 space-y-10">
      <div className="mb-2">
        <h1 className="text-4xl font-bold text-white mb-2">Progress & Activity</h1>
        <p className="text-white/60">Monitor your learning journey and celebrate your achievements.</p>
      </div>

      <ContributionGraph events={events} />
      <PinnedRoadmaps roadmaps={userRoadmaps} progressMap={progressMap} />
      <RecentActivityFeed events={events} loading={eventsLoading} />
    </div>
  );
}

function ContributionGraph({ events }: { events: ActivityEvent[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(13);
  const GAP = 3;
  const LABEL_WIDTH = 36;

  const { columns, monthLabels, totalTasks, activeDays, maxStreak } = useMemo(() => {
    const today = new Date();
    const start = subDays(today, 364);
    const days = eachDayOfInterval({ start, end: today });

    const countMap = new Map<string, number>();
    events.forEach(e => {
      const dStr = format(new Date(e.timestamp), 'yyyy-MM-dd');
      countMap.set(dStr, (countMap.get(dStr) || 0) + 1);
    });

    const contributions = days.map(date => ({
      date,
      count: countMap.get(format(date, 'yyyy-MM-dd')) || 0,
    }));

    const totalTasks = contributions.reduce((a, c) => a + c.count, 0);
    const activeDays = contributions.filter(c => c.count > 0).length;

    let maxStreak = 0, streak = 0;
    contributions.forEach(c => {
      if (c.count > 0) { streak++; maxStreak = Math.max(maxStreak, streak); }
      else { streak = 0; }
    });

    type Cell = { date: Date; count: number } | null;
    const startOffset = (contributions[0].date.getDay() + 6) % 7;
    const padded: Cell[] = [...Array(startOffset).fill(null), ...contributions];
    const columns: Cell[][] = [];
    for (let i = 0; i < padded.length; i += 7) columns.push(padded.slice(i, i + 7));

    const monthLabels: (string | null)[] = columns.map((col, ci) => {
      const first = col.find(c => c !== null);
      if (!first) return null;
      const prev = columns[ci - 1]?.find(c => c !== null);
      return (!prev || prev.date.getMonth() !== first.date.getMonth())
        ? format(first.date, 'MMM') : null;
    });

    return { columns, monthLabels, totalTasks, activeDays, maxStreak };
  }, [events]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const compute = () => {
      const available = el.clientWidth - LABEL_WIDTH;
      const size = Math.floor((available - (columns.length - 1) * GAP) / columns.length);
      setCellSize(Math.max(8, Math.min(size, 18)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    return () => ro.disconnect();
  }, [columns.length]);

  const getIntensityColor = (count: number) => {
    if (count === 0) return '#3d34343e';
    if (count <= 2) return '#166534';
    if (count <= 5) return '#16a34a';
    return '#00ff5eff';
  };

  return (
    <Card className="border border-cyan-500/20 bg-cyan-950/10 backdrop-blur-md rounded-2xl overflow-hidden hover:border-cyan-500/40 hover:shadow-[0_8px_32px_rgba(6,182,212,0.15)] transition-all duration-200">
      <CardContent className="p-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-cyan-400" />
            Activity Graph
          </h2>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/70">
            <div className="flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span className="text-white font-medium">{totalTasks}</span> activities
            </div>
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <div><span className="text-white font-medium">{activeDays}</span> active days</div>
            <div className="w-1 h-1 rounded-full bg-white/30" />
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-400" />
              Max streak: <span className="text-white font-medium">{maxStreak}</span>
            </div>
          </div>
        </div>

        {/* Graph — measured via ref, cells fill width exactly */}
        <div ref={containerRef} className="w-full">
          <div className="flex items-start w-full">

            {/* Day-of-week labels */}
            <div
              className="flex flex-col shrink-0 text-[10px] text-white text-bold"
              style={{ width: LABEL_WIDTH, gap: GAP }}
            >
              {['Mon', '', 'Wed', '', 'Fri', '', ''].map((label, i) => (
                <div key={i} className="flex items-center" style={{ height: cellSize }}>
                  {label}
                </div>
              ))}
            </div>

            {/* Week columns — flex-1 distributes width equally across all columns */}
            <div className="flex flex-col flex-1" style={{ gap: GAP }}>
              <div className="flex w-full" style={{ gap: GAP }}>
                {columns.map((col, ci) => (
                  <div key={ci} className="flex flex-col flex-1" style={{ gap: GAP }}>
                    {col.map((day, di) =>
                      day === null ? (
                        <div key={di} style={{ height: cellSize }} />
                      ) : (
                        <div
                          key={di}
                          title={`${format(day.date, 'MMM d, yyyy')}: ${day.count} activit${day.count === 1 ? 'y' : 'ies'}`}
                          className="w-full rounded-[2px] transition-all duration-150 hover:scale-110 cursor-pointer"
                          style={{
                            height: cellSize,
                            backgroundColor: getIntensityColor(day.count),
                            border: `1px solid ${day.count === 0 ? 'rgba(255,255,255,0.08)' : getIntensityColor(day.count)}`,
                            opacity: day.count === 0 ? 1 : undefined,
                          }}
                        />
                      )
                    )}
                  </div>
                ))}
              </div>

              {/* Month labels — each sits under its column via flex-1 */}
              <div className="flex w-full" style={{ gap: GAP }}>
                {monthLabels.map((label, ci) => (
                  <div key={ci} className="flex-1 relative overflow-visible" style={{ height: 16 }}>
                    {label && (
                      <span className="absolute left-0 top-0 text-xs font-bold text-white whitespace-nowrap">
                        {label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  );
}


function CompanyIcon({ company, color }: { company: string; color: string }) {
  const [error, setError] = useState(false);
  if (error) {
    return (
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg shrink-0"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {company[0]?.toUpperCase()}
      </div>
    );
  }
  return (
    <img
      src={`/icons/${company.toLowerCase().replace(/\s+/g, '')}.png`}
      alt={company}
      className="w-10 h-10 rounded-lg object-contain bg-white/5 p-1 shrink-0"
      onError={() => setError(true)}
    />
  );
}

function PinnedRoadmapCard({
  roadmap,
  progress,
  index,
  dragSourceIndex,
  dragOverIndex,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
}: {
  roadmap: Roadmap;
  progress: UserProgress | undefined;
  index: number;
  dragSourceIndex: number | null;
  dragOverIndex: number | null;
  onDragStart: (e: React.DragEvent, idx: number) => void;
  onDragOver: (e: React.DragEvent, idx: number) => void;
  onDrop: (e: React.DragEvent, idx: number) => void;
  onDragEnd: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const brand = getBrandColors(roadmap.target_company);
  const color = brand.primary;

  const milestones = progress?.milestones || [];
  const achievedMilestones = milestones.filter((m: Milestone) => m.achieved).length;
  const totalMilestones = milestones.length > 0 ? milestones.length : 4;
  const percentage = progress?.progress_percentage || 0;

  const isSource = dragSourceIndex === index;
  const isTarget = dragOverIndex === index && dragSourceIndex !== null && dragSourceIndex !== index;

  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, index)}
      onDragOver={e => onDragOver(e, index)}
      onDrop={e => onDrop(e, index)}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative border bg-cyan-900/10 backdrop-blur-md rounded-2xl p-4 flex flex-col justify-between h-[120px] transition-all duration-200"
      style={{
        borderColor: isTarget ? color : isHovered ? color : 'rgba(6,182,212,0.2)',
        boxShadow: isTarget
          ? `inset 0 0 0 2px ${color}, 0 8px 32px ${color}40`
          : isHovered
            ? `0 8px 32px ${color}30`
            : 'none',
        opacity: isSource ? 0.4 : 1,
        transform: isSource
          ? 'scale(0.95)'
          : isTarget
            ? 'scale(1.03)'
            : isHovered
              ? 'translateY(-2px)'
              : 'none',
        cursor: 'grab',
      }}
    >
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <CompanyIcon company={roadmap.target_company} color={color} />
          <div>
            <Link to={`/roadmap/${roadmap.id}`} className="font-medium text-white hover:underline line-clamp-1">
              {roadmap.career_goal}
            </Link>
            <p className="text-xs text-white/50 line-clamp-1 mt-0.5">{roadmap.timeline} • AI generated</p>
          </div>
        </div>
        <div className="text-white/20 hover:text-white/60 cursor-grab active:cursor-grabbing px-1 transition-colors">
          <GripVertical className="w-5 h-5" />
        </div>
      </div>

      <div className="flex items-end justify-between mt-auto">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] text bold font-medium px-2 py-0.5 rounded-full"
            style={{ backgroundColor: `${color}20`, color }}
          >
            {roadmap.target_company}
          </span>
          <span className="text-[12px] text-white text-bold">
            {achievedMilestones} / {totalMilestones} milestones
          </span>
        </div>

        <div className="w-1/3">
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${percentage}%`,
                background: `linear-gradient(90deg, ${color}99, ${color})`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function PinnedRoadmaps({ roadmaps, progressMap }: { roadmaps: Roadmap[]; progressMap: Record<string, UserProgress> }) {
  const [pinnedIds, setPinnedIds] = useState<string[]>([]);
  const [dragSourceIndex, setDragSourceIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (pinnedIds.length === 0 && roadmaps.length > 0) {
      setPinnedIds(roadmaps.slice(0, 6).map(r => r.id));
    }
  }, [roadmaps]);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(index));
    setDragSourceIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverIndex !== index) setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (isNaN(sourceIndex) || sourceIndex === targetIndex) {
      setDragSourceIndex(null);
      setDragOverIndex(null);
      return;
    }

    const next = [...pinnedIds];
    const temp = next[sourceIndex];
    next[sourceIndex] = next[targetIndex];
    next[targetIndex] = temp;
    setPinnedIds(next);
    setDragSourceIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragSourceIndex(null);
    setDragOverIndex(null);
  };

  const previewIds = useMemo(() => {
    if (dragSourceIndex === null || dragOverIndex === null || dragSourceIndex === dragOverIndex) {
      return pinnedIds;
    }
    const next = [...pinnedIds];
    const temp = next[dragSourceIndex];
    next[dragSourceIndex] = next[dragOverIndex];
    next[dragOverIndex] = temp;
    return next;
  }, [pinnedIds, dragSourceIndex, dragOverIndex]);

  const pinnedRoadmaps = previewIds
    .map(id => roadmaps.find(r => r.id === id))
    .filter(Boolean) as Roadmap[];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-xl font-semibold text-white">Pinned</h4>
        <CustomizePinsModal roadmaps={roadmaps} pinnedIds={pinnedIds} setPinnedIds={setPinnedIds} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 6 }).map((_, i) => {
          const roadmap = pinnedRoadmaps[i];
          if (!roadmap) {
            return (
              <div
                key={`empty-${i}`}
                className="border-2 border-dashed border-cyan-500/20 rounded-2xl h-[120px] flex items-center justify-center bg-cyan-950/5"
              >
                <span className="text-white/30 text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Pin a roadmap
                </span>
              </div>
            );
          }
          return (
            <PinnedRoadmapCard
              key={roadmap.id}
              roadmap={roadmap}
              progress={progressMap[roadmap.id]}
              index={i}
              dragSourceIndex={dragSourceIndex}
              dragOverIndex={dragOverIndex}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
            />
          );
        })}
      </div>
    </div>
  );
}

function CustomizePinsModal({
  roadmaps,
  pinnedIds,
  setPinnedIds,
}: {
  roadmaps: Roadmap[];
  pinnedIds: string[];
  setPinnedIds: (ids: string[]) => void;
}) {
  const [tempPinned, setTempPinned] = useState<string[]>(pinnedIds);
  const [open, setOpen] = useState(false);

  const togglePin = (id: string) => {
    if (tempPinned.includes(id)) {
      setTempPinned(tempPinned.filter(p => p !== id));
    } else if (tempPinned.length < 6) {
      setTempPinned([...tempPinned, id]);
    }
  };

  return (
    <Dialog open={open} onOpenChange={o => { setOpen(o); if (o) setTempPinned(pinnedIds); }}>
      <DialogTrigger asChild>
        <Button variant="link" className="text-cyan-400 hover:text-cyan-300 px-0">
          Customize your pins
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-slate-900 border-cyan-500/20 text-white max-w-md">
        <DialogHeader>
          <DialogTitle>Customize Pinned Roadmaps</DialogTitle>
          <DialogDescription className="text-white/60">
            Select up to 6 roadmaps to pin to your progress dashboard.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 mt-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
          {roadmaps.length === 0 ? (
            <p className="text-white/40 text-sm">No roadmaps available.</p>
          ) : (
            roadmaps.map(roadmap => {
              const isPinned = tempPinned.includes(roadmap.id);
              const disabled = !isPinned && tempPinned.length >= 6;
              return (
                <div
                  key={roadmap.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <Checkbox
                    id={`pin-${roadmap.id}`}
                    checked={isPinned}
                    disabled={disabled}
                    onCheckedChange={() => togglePin(roadmap.id)}
                    className="border-white/30 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500"
                  />
                  <label
                    htmlFor={`pin-${roadmap.id}`}
                    className={`text-sm font-medium leading-none flex-1 cursor-pointer ${disabled ? 'opacity-50' : ''}`}
                  >
                    {roadmap.career_goal} @ {roadmap.target_company}
                  </label>
                </div>
              );
            })
          )}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="ghost" onClick={() => setOpen(false)} className="hover:bg-white/10 hover:text-white">
            Cancel
          </Button>
          <Button onClick={() => { setPinnedIds(tempPinned); setOpen(false); }} className="bg-cyan-600 hover:bg-cyan-500 text-white">
            Save Pins
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

