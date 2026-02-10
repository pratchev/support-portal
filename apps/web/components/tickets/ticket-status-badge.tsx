import { cn } from '@/lib/utils';
import { STATUS_COLORS } from '@/lib/constants';
import { Badge } from '@/components/ui/badge';

interface TicketStatusBadgeProps {
  status: string;
  className?: string;
}

export function TicketStatusBadge({ status, className }: TicketStatusBadgeProps) {
  const statusLabels: Record<string, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    resolved: 'Resolved',
    closed: 'Closed',
  };

  return (
    <Badge className={cn(STATUS_COLORS[status as keyof typeof STATUS_COLORS], className)} variant="outline">
      {statusLabels[status] || status}
    </Badge>
  );
}
