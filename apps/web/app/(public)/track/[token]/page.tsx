'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { TicketDetail } from '@/components/tickets/ticket-detail';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TrackTicketPage() {
  const params = useParams();
  const token = params.token as string;
  const [ticket, setTicket] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.get(`/tickets/track/${token}`);
        setTicket(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load ticket');
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      fetchTicket();
    }
  }, [token]);

  if (isLoading) {
    return (
      <div className="container py-12">
        <Card>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">Loading ticket...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="container py-12">
        <Card>
          <CardHeader>
            <CardTitle>Ticket Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {error || 'The ticket you are looking for could not be found.'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Track Your Ticket</h1>
        <p className="text-muted-foreground">
          View the status and details of your support ticket.
        </p>
      </div>
      <TicketDetail ticket={ticket} />
    </div>
  );
}
