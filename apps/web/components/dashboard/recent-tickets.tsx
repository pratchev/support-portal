import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketStatusBadge } from '@/components/tickets/ticket-status-badge';
import { formatRelativeTime } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface RecentTicketsProps {
  tickets: Array<{
    id: number;
    title: string;
    status: string;
    updatedAt: string;
  }>;
}

export function RecentTickets({ tickets }: RecentTicketsProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Tickets</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/tickets">
            View All <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/dashboard/tickets/${ticket.id}`}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-sm">{ticket.title}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Updated {formatRelativeTime(ticket.updatedAt)}
                </p>
              </div>
              <TicketStatusBadge status={ticket.status} />
            </Link>
          ))}
          {tickets.length === 0 && (
            <p className="text-center text-muted-foreground text-sm py-8">No recent tickets</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
