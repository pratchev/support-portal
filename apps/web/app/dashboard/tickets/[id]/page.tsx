'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { TicketDetail } from '@/components/tickets/ticket-detail';
import { useApi } from '@/hooks/use-api';
import { ArrowLeft } from 'lucide-react';

export default function DashboardTicketDetailPage() {
  const params = useParams();
  const ticketId = params.id as string;
  const { get, isAuthenticated } = useApi();
  const [ticket, setTicket] = useState<any>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchTicket = async () => {
      try {
        const data = await get(`/api/tickets/${ticketId}`);
        setTicket(data);
      } catch (err) {
        console.error('Failed to load ticket:', err);
      }
    };

    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId, get, isAuthenticated]);

  if (!ticket) {
    return (
      <div className="container py-12">
        <p className="text-center text-muted-foreground">Loading ticket...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <Link
        href="/dashboard/tickets"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tickets
      </Link>
      <TicketDetail ticket={ticket} onUpdate={setTicket} />
    </div>
  );
}
