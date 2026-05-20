export type EventType =
  | 'sign_in'
  | 'roadmap_created'
  | 'roadmap_completed'
  | 'step_completed'
  | 'milestone_achieved';

export interface ActivityEvent {
  id: string;
  type: EventType;
  title: string;
  description: string;
  timestamp: string;
}
