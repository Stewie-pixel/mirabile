import { addHours, addMinutes, endOfDay, endOfWeek } from 'date-fns';

export type StatusExpiryOption =
  | '30 min'
  | '1 hour'
  | '4 hours'
  | 'Today'
  | 'This week'
  | 'Never';

export const STATUS_EXPIRY_OPTIONS: StatusExpiryOption[] = [
  '30 min',
  '1 hour',
  '4 hours',
  'Today',
  'This week',
  'Never',
];

export function expiryOptionToDate(option: StatusExpiryOption): string | null {
  const now = new Date();
  switch (option) {
    case '30 min':
      return addMinutes(now, 30).toISOString();
    case '1 hour':
      return addHours(now, 1).toISOString();
    case '4 hours':
      return addHours(now, 4).toISOString();
    case 'Today':
      return endOfDay(now).toISOString();
    case 'This week':
      return endOfWeek(now, { weekStartsOn: 1 }).toISOString();
    case 'Never':
      return null;
    default:
      return null;
  }
}

export function dateToExpiryOption(expiresAt: string | null): StatusExpiryOption {
  if (!expiresAt) return 'Never';
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  const diffMin = diffMs / 60_000;
  if (diffMin <= 35) return '30 min';
  if (diffMin <= 70) return '1 hour';
  if (diffMin <= 250) return '4 hours';
  return 'Today';
}
