'use client';

import { useRouter } from 'next/navigation';
import { TicketForm } from '@/components/tickets/ticket-form';
import { apiClient } from '@/lib/api-client';

export default function SubmitTicketPage() {
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    try {
      const response = await apiClient.post<{ trackingToken: string }>('/tickets/public', data);
      router.push(`/track/${response.trackingToken}`);
    } catch (error) {
      console.error('Failed to submit ticket:', error);
      throw error;
    }
  };

  return (
    <div className="container max-w-3xl py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Submit a Support Ticket</h1>
        <p className="text-muted-foreground">
          Fill out the form below and we'll get back to you as soon as possible.
        </p>
      </div>
      <TicketForm onSubmit={handleSubmit} />
    </div>
  );
}
