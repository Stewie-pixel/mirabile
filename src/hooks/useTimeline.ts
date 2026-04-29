import { useState, useCallback } from 'react';
import { TIMELINE_OPTIONS } from '@/constants/timelines';
import type { TimelineOption } from '@/types';

export function useTimeline() {
  const [selectedTimeline, setSelectedTimeline] = useState<TimelineOption | null>(null);

  const selectTimeline = useCallback((timelineId: string) => {
    const timeline = TIMELINE_OPTIONS.find((t) => t.id === timelineId);
    setSelectedTimeline(timeline || null);
  }, []);

  const getTimelineLabel = useCallback((timelineId: string) => {
    const timeline = TIMELINE_OPTIONS.find((t) => t.id === timelineId);
    return timeline?.label || timelineId;
  }, []);

  return {
    selectedTimeline,
    selectTimeline,
    getTimelineLabel,
    allTimelines: TIMELINE_OPTIONS,
  };
}