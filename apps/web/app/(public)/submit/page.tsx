'use client';

import { useRouter } from 'next/navigation';
import { TicketForm, TicketFormData } from '@/components/tickets/ticket-form';
import { useApi } from '@/hooks/use-api';

export default function SubmitTicketPage() {
  const router = useRouter();
  const { post, isAuthenticated } = useApi();

  const handleSubmit = async (data: TicketFormData) => {
    if (!isAuthenticated) return;
    const response = await post<{ trackingToken: string }>(
      '/api/tickets',
      data
    );
    router.push(`/track/${response.trackingToken}`);
  };

  return (
    <div className="container max-w-3xl py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Submit a Support Ticket</h1>
        <p className="text-muted-foreground">
          Fill out the form below and we&apos;ll get back to you as soon as
          possible.
        </p>
      </div>
      <TicketForm onSubmit={handleSubmit} />
    </div>
  );
}
