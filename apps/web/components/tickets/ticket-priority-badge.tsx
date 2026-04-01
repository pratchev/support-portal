import { cn } from '@/lib/utils';
import { PRIORITY_COLORS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';

interface TicketPriorityBadgeProps {
  priority: string;
  className?: string;
}

const PRIORITY_ICONS: Record<string, string> = {
  LOW: 'bg-slate-400',
  MEDIUM: 'bg-blue-500',
  HIGH: 'bg-orange-500',
  URGENT: 'bg-red-500',
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
};

export function TicketPriorityBadge({
  priority,
  className,
}: TicketPriorityBadgeProps) {
  const key = priority?.toUpperCase() || 'MEDIUM';
  const dotColor = PRIORITY_ICONS[key] || PRIORITY_ICONS.MEDIUM;
  const colors =
    PRIORITY_COLORS[priority] || PRIORITY_COLORS[key] || PRIORITY_COLORS.MEDIUM;
  const label = PRIORITY_LABELS[priority] || PRIORITY_LABELS[key] || priority;

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
