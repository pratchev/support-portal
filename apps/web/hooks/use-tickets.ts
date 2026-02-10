'use client';

import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';

interface Ticket {
  id: number;
  title: string;
  description: string;
  status: string;
  priority: string;
  createdAt: string;
  updatedAt: string;
}

export function useTickets() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const data = await apiClient.get<Ticket[]>('/tickets');
      setTickets(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tickets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const createTicket = async (data: Partial<Ticket>) => {
    try {
      const newTicket = await apiClient.post<Ticket>('/tickets', data);
      setTickets((prev) => [newTicket, ...prev]);
      return newTicket;
    } catch (err) {
      throw err;
    }
  };

  const updateTicket = async (id: number, data: Partial<Ticket>) => {
    try {
      const updated = await apiClient.patch<Ticket>(`/tickets/${id}`, data);
      setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
      return updated;
    } catch (err) {
      throw err;
    }
  };

  const deleteTicket = async (id: number) => {
    try {
      await apiClient.delete(`/tickets/${id}`);
      setTickets((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      throw err;
    }
  };

  return {
    tickets,
    isLoading,
    error,
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
  };
}
