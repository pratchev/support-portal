'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { TicketDetail } from '@/components/tickets/ticket-detail';
import { RichTextEditor } from '@/components/editor/rich-text-editor';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

export default function AgentTicketPage() {
  const params = useParams();
  const ticketId = params.id as string;
  const [ticket, setTicket] = useState<any>(null);
  const [response, setResponse] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const data = await apiClient.get(`/tickets/${ticketId}`);
        setTicket(data);
      } catch (err) {
        console.error('Failed to load ticket:', err);
      }
    };

    if (ticketId) {
      fetchTicket();
    }
  }, [ticketId]);

  const handleSubmitResponse = async () => {
    if (!response.trim()) return;

    setIsSubmitting(true);
    try {
      await apiClient.post(`/tickets/${ticketId}/responses`, {
        message: response,
      });
      setResponse('');
      // Refresh ticket
      const data = await apiClient.get(`/tickets/${ticketId}`);
      setTicket(data);
    } catch (err) {
      console.error('Failed to submit response:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!ticket) {
    return (
      <div className="container py-12">
        <p className="text-center text-muted-foreground">Loading ticket...</p>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="space-y-6">
        <TicketDetail ticket={ticket} />

        <Card>
          <CardHeader>
            <CardTitle>Add Response</CardTitle>
          </CardHeader>
          <CardContent>
            <RichTextEditor
              content={response}
              onChange={setResponse}
              placeholder="Type your response here..."
            />
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmitResponse} disabled={isSubmitting || !response.trim()}>
              {isSubmitting ? 'Sending...' : 'Send Response'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
