import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketStatusBadge } from '@/components/tickets/ticket-status-badge';
import { formatRelativeTime } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecentTicketsProps {
  tickets: Array<{
    id: string | number;
    title: string;
    status: string;
    updatedAt: string;
  }>;
}

export function RecentTickets({ tickets }: RecentTicketsProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold">
          Recent Tickets
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          className="text-primary hover:text-primary/80 hover:bg-primary/5"
          asChild
        >
          <Link href="/dashboard/tickets">
            View All <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/dashboard/tickets/${ticket.id}`}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-accent/50 transition-colors duration-150"
            >
              <div className="flex-1 min-w-0 mr-3">
                <p className="font-medium text-sm truncate">{ticket.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {formatRelativeTime(ticket.updatedAt)}
                </p>
              </div>
              <TicketStatusBadge status={ticket.status} />
            </Link>
          ))}
          {tickets.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">
              No recent tickets
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
