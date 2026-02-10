'use client';

import Link from 'next/link';
import { formatRelativeTime } from '@/lib/utils';
import { TicketStatusBadge } from './ticket-status-badge';
import { TicketPriorityBadge } from './ticket-priority-badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Ticket {
  id: number;
  title: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

interface TicketListProps {
  tickets: Ticket[];
}

export function TicketList({ tickets }: TicketListProps) {
  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>No tickets found</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ID</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Created</TableHead>
            <TableHead>Updated</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tickets.map((ticket) => (
            <TableRow key={ticket.id} className="ticket-list-item">
              <TableCell>
                <Link href={`/dashboard/tickets/${ticket.id}`} className="font-mono text-xs hover:underline">
                  #{ticket.id}
                </Link>
              </TableCell>
              <TableCell>
                <Link href={`/dashboard/tickets/${ticket.id}`} className="hover:underline">
                  {ticket.title}
                </Link>
              </TableCell>
              <TableCell>
                <TicketStatusBadge status={ticket.status} />
              </TableCell>
              <TableCell>
                <TicketPriorityBadge priority={ticket.priority} />
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatRelativeTime(ticket.createdAt)}
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {formatRelativeTime(ticket.updatedAt)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
