'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { TicketDetail } from '@/components/tickets/ticket-detail';
import { useApi } from '@/hooks/use-api';

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
      <TicketDetail ticket={ticket} />
    </div>
  );
}
