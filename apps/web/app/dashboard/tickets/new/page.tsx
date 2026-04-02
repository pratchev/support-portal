'use client';

import { useRouter } from 'next/navigation';
import { TicketForm, TicketFormData } from '@/components/tickets/ticket-form';
import { useApi } from '@/hooks/use-api';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewTicketPage() {
  const router = useRouter();
  const { post, isAuthenticated } = useApi();

  const handleSubmit = async (data: TicketFormData) => {
    if (!isAuthenticated) return;
    await post('/api/tickets', data);
    router.push('/dashboard/tickets');
  };

  return (
    <div className="container max-w-3xl py-8">
      <Link
        href="/dashboard/tickets"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Tickets
      </Link>
      <TicketForm onSubmit={handleSubmit} />
    </div>
  );
}
