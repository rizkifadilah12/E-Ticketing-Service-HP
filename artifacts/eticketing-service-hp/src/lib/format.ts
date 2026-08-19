export const statusLabels: Record<string, string> = {
  new: 'New intake',
  diagnosing: 'Diagnosing',
  awaiting_parts: 'Awaiting parts',
  repairing: 'Repairing',
  ready: 'Ready for pickup',
  completed: 'Completed',
  delayed: 'Delayed',
};

export function formatStatus(status?: string | null) {
  if (!status) return 'Unknown';
  return statusLabels[status] ?? status.replaceAll('_', ' ');
}

export function statusClass(status?: string | null) {
  return `status-chip status-${status ?? 'new'}`;
}

export function money(value?: number | null) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value ?? 0);
}

export function dateLabel(value?: string | null, withTime = false) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    ...(withTime ? { hour: 'numeric', minute: '2-digit' } : {}),
  }).format(date);
}

export function initials(name?: string | null) {
  return (name ?? 'NA')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}