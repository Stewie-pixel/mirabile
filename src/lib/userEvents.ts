import { supabase } from '@/lib/supabase';
import type { ActivityEvent, EventType } from '@/types/activity';

function parseEventData(raw: unknown): Record<string, unknown> {
  if (!raw) return {};
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return {};
    }
  }
  return raw as Record<string, unknown>;
}

export async function fetchUserEvents(): Promise<ActivityEvent[]> {
  const { data, error } = await supabase
    .from('user_events')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  if (!data) return [];

  return data.map(d => {
    const eventData = parseEventData(d.event_data);
    return {
      id: d.id,
      type: (d.event_type ?? d.type) as EventType,
      title: (eventData.title as string) ?? d.title ?? d.event_type ?? 'Activity',
      description: (eventData.description as string) ?? d.description ?? '',
      timestamp: d.created_at ?? d.timestamp,
    };
  });
}
