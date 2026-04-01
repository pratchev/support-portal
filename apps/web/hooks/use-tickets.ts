'use client';

import { useState, useEffect, useCallback } from 'react';
import { useApi } from './use-api';

interface Ticket {
  id: string;
  ticketNumber: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  category: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  customer?: { id: string; name: string; email: string; avatar: string | null };
  assignments?: Array<{
    agent: { id: string; name: string; avatar: string | null };
  }>;
  _count?: { responses: number };
}

interface PaginatedResponse {
  data: Ticket[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface TicketFilters {
  status?: string;
  priority?: string;
  category?: string;
  search?: string;
}

export function useTickets(initialFilters?: TicketFilters) {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [pagination, setPagination] = useState<
    PaginatedResponse['pagination'] | null
  >(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<TicketFilters>(initialFilters || {});
  const { get, post, patch, del, isAuthenticated } = useApi();

  const fetchTickets = useCallback(
    async (page = 1) => {
      if (!isAuthenticated) return;
      try {
        setIsLoading(true);
        const params: Record<string, string> = { page: String(page) };
        if (filters.status) params.status = filters.status;
        if (filters.priority) params.priority = filters.priority;
        if (filters.category) params.category = filters.category;
        if (filters.search) params.search = filters.search;

        const result = await get<PaginatedResponse>('/api/tickets', params);
        setTickets(result.data);
        setPagination(result.pagination);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch tickets'
        );
      } finally {
        setIsLoading(false);
      }
    },
    [get, isAuthenticated, filters]
  );

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const createTicket = async (data: {
    subject: string;
    description: string;
    priority?: string;
    category?: string;
  }) => {
    const newTicket = await post<Ticket>('/api/tickets', data);
    setTickets((prev) => [newTicket, ...prev]);
    return newTicket;
  };

  const updateTicket = async (id: string, data: Partial<Ticket>) => {
    const updated = await patch<Ticket>(`/api/tickets/${id}`, data);
    setTickets((prev) => prev.map((t) => (t.id === id ? updated : t)));
    return updated;
  };

  const deleteTicket = async (id: string) => {
    await del(`/api/tickets/${id}`);
    setTickets((prev) => prev.filter((t) => t.id !== id));
  };

  return {
    tickets,
    pagination,
    isLoading,
    error,
    filters,
    setFilters,
    fetchTickets,
    createTicket,
    updateTicket,
    deleteTicket,
  };
}
