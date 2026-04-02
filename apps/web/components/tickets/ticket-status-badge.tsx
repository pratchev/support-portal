import { cn } from '@/lib/utils';
import { STATUS_COLORS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';

interface TicketStatusBadgeProps {
  status: string;
  className?: string;
}

const STATUS_DOTS: Record<string, string> = {
  NEW: 'bg-blue-500',
  OPEN: 'bg-red-500',
  IN_PROGRESS: 'bg-yellow-500',
  WAITING_FOR_CUSTOMER: 'bg-purple-500',
  WAITING_FOR_INTERNAL: 'bg-amber-700',
  RESOLVED: 'bg-green-500',
  CLOSED: 'bg-gray-400',
};

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  IN_PROGRESS: 'In Progress',
  WAITING_FOR_CUSTOMER: 'Waiting on Customer',
  WAITING_FOR_INTERNAL: 'Waiting on Team',
  RESOLVED: 'Resolved',
  CLOSED: 'Closed',
  NEW: 'New',
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
  closed: 'Closed',
};

export function TicketStatusBadge({
  status,
  className,
}: TicketStatusBadgeProps) {
  const key = status?.toUpperCase() || 'OPEN';
  const dotColor = STATUS_DOTS[key] || STATUS_DOTS.OPEN;
  const colors =
    STATUS_COLORS[status] || STATUS_COLORS[key] || STATUS_COLORS.OPEN;
  const label = STATUS_LABELS[status] || STATUS_LABELS[key] || status;

  return (
    <Badge
      className={cn('gap-1.5 border font-medium', colors, className)}
      variant="outline"
    >
      <span className={cn('inline-block h-1.5 w-1.5 rounded-full', dotColor)} />
      {label}
    </Badge>
  );
}
