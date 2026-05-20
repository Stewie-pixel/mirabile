import { useState } from 'react';
import { Award, Calendar, Check, Flame, LogIn, Plus } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ActivityEvent, EventType } from '@/types/activity';

interface RecentActivityFeedProps {
  events: ActivityEvent[];
  loading: boolean;
  compact?: boolean;
}

export function RecentActivityFeed({ events, loading, compact = false }: RecentActivityFeedProps) {
  const [displayCount, setDisplayCount] = useState(5);

  const formatTimeAgo = (dateStr: string) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  const getEventColor = (type: EventType) => {
    switch (type) {
      case 'sign_in': return '#ec4899'; // Pink/Magenta
      case 'roadmap_created':
      case 'roadmap_completed': return '#f97316'; // Orange
      case 'milestone_achieved': return '#a855f7'; // Purple
      default: return '#0AFFE4'; // Themed Cyan
    }
  };

  const getEventIcon = (type: EventType) => {
    switch (type) {
      case 'sign_in': return <LogIn className="w-4 h-4" />;
      case 'roadmap_created': return <Plus className="w-4 h-4" />;
      case 'roadmap_completed': return <Award className="w-4 h-4" />;
      case 'step_completed': return <Check className="w-4 h-4" />;
      case 'milestone_achieved': return <Flame className="w-4 h-4" />;
      default: return <Calendar className="w-4 h-4" />;
    }
  };

  const resolveTitle = (e: ActivityEvent) => {
    if (e.title && e.title !== e.type) return e.title;
    switch (e.type) {
      case 'sign_in': return 'Signed in';
      case 'roadmap_created': return 'Created a new roadmap';
      case 'roadmap_completed': return 'Completed a roadmap';
      case 'step_completed': return 'Completed a step';
      case 'milestone_achieved': return 'Achieved a milestone';
      default: return 'Activity';
    }
  };

  const visibleEvents = events.slice(0, displayCount);

  if (loading) {
    return (
      <div className="space-y-4">
        {!compact && <h2 className="text-2xl font-bold text-white mb-8">Recent Activity</h2>}
        <p className="text-center py-12 text-white/50 text-sm">Loading activity…</p>
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="space-y-4">
        {!compact && <h2 className="text-2xl font-bold text-white mb-8">Recent Activity</h2>}
        <Card className="border border-[#0AFFE4]/20 bg-[#0AFFE4]/5 rounded-2xl p-8 text-center backdrop-blur-md">
          <Calendar className="w-12 h-12 text-[#0AFFE4]/40 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-1">No activity yet</h3>
          <p className="text-white/50 text-sm">Start a roadmap or complete steps to track your progress!</p>
        </Card>
      </div>
    );
  }

  if (compact) {
    // Simple list view for the profile tab
    return (
      <div className="space-y-4">
        <div className="space-y-3">
          {visibleEvents.map(event => {
            const color = getEventColor(event.type);
            return (
              <div key={event.id} className="flex items-start gap-3">
                <div 
                  className="flex items-center justify-center w-8 h-8 rounded-full border bg-slate-950/60 shrink-0" 
                  style={{ borderColor: `${color}50`, color, boxShadow: `0 0 8px ${color}30` }}
                >
                  {getEventIcon(event.type)}
                </div>
                <Card 
                  className="flex-1 border bg-slate-900/40 rounded-xl p-3.5 backdrop-blur-sm" 
                  style={{ borderColor: `${color}20` }}
                >
                  <div className="flex justify-between gap-2 items-start">
                    <div>
                      <h5 className="font-semibold text-white/90 text-sm leading-tight">{resolveTitle(event)}</h5>
                      {event.description ? <p className="text-xs text-white/50 mt-1 font-medium">{event.description}</p> : null}
                    </div>
                    <span className="text-[10px] text-white/40 shrink-0 font-medium mt-0.5">{formatTimeAgo(event.timestamp)}</span>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
        {displayCount < events.length && (
          <Button 
            variant="ghost" 
            className="w-full text-xs text-[#0AFFE4] hover:text-[#0AFFE4]/80 hover:bg-[#0AFFE4]/5 rounded-xl py-2" 
            onClick={() => setDisplayCount(prev => prev + 5)}
          >
            Show more
          </Button>
        )}
      </div>
    );
  }

  // Stunning alternating center-line timeline view for ProgressTrackingPage
  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-bold text-white mb-8 tracking-tight">Recent Activity</h2>
      
      <div className="relative">
        {/* Vertical Center Line */}
        <div className="absolute left-[18px] md:left-1/2 top-2 bottom-2 w-[2px] bg-slate-800/80 -translate-x-1/2" />

        <div className="space-y-8 md:space-y-12">
          {visibleEvents.map((event, index) => {
            const color = getEventColor(event.type);
            const isEven = index % 2 === 0;

            return (
              <div 
                key={event.id} 
                className={`relative flex items-center pl-12 md:pl-0 md:justify-between w-full ${
                  isEven ? 'md:flex-row-reverse' : 'md:flex-row'
                }`}
              >
                {/* Timeline Circle Node */}
                <div 
                  className="absolute left-[18px] md:left-1/2 -translate-x-1/2 w-9 h-9 rounded-full border bg-slate-950 flex items-center justify-center z-10 transition-transform duration-200 hover:scale-110"
                  style={{ 
                    borderColor: `${color}80`, 
                    color, 
                    boxShadow: `0 0 12px ${color}30` 
                  }}
                >
                  {getEventIcon(event.type)}
                </div>

                {/* Card container */}
                <Card 
                  className="w-full md:w-[calc(50%-1.75rem)] border bg-slate-900/40 backdrop-blur-md rounded-2xl p-5 hover:border-[#0AFFE4]/35 hover:shadow-[0_4px_24px_rgba(10,255,228,0.08)] transition-all duration-300"
                  style={{ borderColor: `${color}22` }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col min-w-0">
                      <h4 className="font-semibold text-white text-[15px] leading-snug tracking-wide">
                        {resolveTitle(event)}
                      </h4>
                      {event.description && (
                        <span className="text-white/50 text-xs mt-1.5 font-medium leading-relaxed">
                          {event.description}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-white/40 font-medium shrink-0 mt-0.5 whitespace-nowrap">
                      {formatTimeAgo(event.timestamp)}
                    </span>
                  </div>
                </Card>

                {/* Spacer for desktop layout (the opposite side of the card) */}
                <div className="hidden md:block md:w-[calc(50%-1.75rem)]" />
              </div>
            );
          })}
        </div>
      </div>

      {displayCount < events.length && (
        <div className="flex justify-center pt-6">
          <Button 
            className="px-8 py-5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#0AFFE4] to-[#0EA5E9] hover:opacity-90 shadow-lg shadow-[#0AFFE4]/15 hover:shadow-[#0AFFE4]/25 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0" 
            onClick={() => setDisplayCount(prev => prev + 5)}
          >
            Load more
          </Button>
        </div>
      )}
    </div>
  );
}
