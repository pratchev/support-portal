import { cn } from '@/lib/utils';
import { PRIORITY_COLORS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';

interface TicketPriorityBadgeProps {
  priority: string;
  className?: string;
}

export function TicketPriorityBadge({ priority, className }: TicketPriorityBadgeProps) {
  const priorityLabels: Record<string, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
  };

  return (
    <Badge className={cn(PRIORITY_COLORS[priority as keyof typeof PRIORITY_COLORS], className)} variant="outline">
      {priorityLabels[priority] || priority}
    </Badge>
  );
}
