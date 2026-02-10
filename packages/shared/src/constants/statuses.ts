export const TICKET_STATUSES = {
  OPEN: 'OPEN',
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED',
} as const;

export const TICKET_STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
};

export const TICKET_STATUS_COLORS: Record<string, string> = {
  OPEN: 'blue',
  PENDING: 'yellow',
  IN_PROGRESS: 'purple',
  RESOLVED: 'green',
  CLOSED: 'gray',
};
