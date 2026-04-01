'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { TicketChart } from '@/components/dashboard/ticket-chart';
import { RecentTickets } from '@/components/dashboard/recent-tickets';
import { Ticket, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useApi } from '@/hooks/use-api';

interface TicketItem {
  id: string;
  subject: string;
  status: string;
  updatedAt: string;
}

interface PaginatedTickets {
  data: TicketItem[];
  pagination: { total: number };
}

export default function DashboardPage() {
  const { get, isAuthenticated } = useApi();
  const [stats, setStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [recentTickets, setRecentTickets] = useState<
    Array<{ id: string; title: string; status: string; updatedAt: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function load() {
      try {
        const [allRes, openRes, progressRes, resolvedRes] = await Promise.all([
          get<PaginatedTickets>('/api/tickets', { limit: '1' }),
          get<PaginatedTickets>('/api/tickets', { status: 'OPEN', limit: '1' }),
          get<PaginatedTickets>('/api/tickets', {
            status: 'IN_PROGRESS',
            limit: '1',
          }),
          get<PaginatedTickets>('/api/tickets', {
            status: 'RESOLVED',
            limit: '1',
          }),
        ]);
        setStats({
          total: allRes.pagination.total,
          open: openRes.pagination.total,
          inProgress: progressRes.pagination.total,
          resolved: resolvedRes.pagination.total,
        });

        const recent = await get<PaginatedTickets>('/api/tickets', {
          limit: '5',
        });
        setRecentTickets(
          recent.data.map((t) => ({
            id: t.id,
            title: t.subject,
            status: t.status,
            updatedAt: t.updatedAt,
          }))
        );
      } catch {
        // silent - empty state shown
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [get, isAuthenticated]);

  const chartData = [
    { name: 'Open', open: stats.open, closed: 0 },
    { name: 'In Progress', open: stats.inProgress, closed: 0 },
    { name: 'Resolved', open: 0, closed: stats.resolved },
  ];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your support tickets
        </p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading dashboard...</p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatsCard
              title="Total Tickets"
              value={stats.total}
              icon={Ticket}
              description="All time"
            />
            <StatsCard
              title="Open Tickets"
              value={stats.open}
              icon={AlertCircle}
              description="Awaiting response"
            />
            <StatsCard
              title="In Progress"
              value={stats.inProgress}
              icon={Clock}
              description="Being worked on"
            />
            <StatsCard
              title="Resolved"
              value={stats.resolved}
              icon={CheckCircle}
              description="Completed"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 mb-8">
            <TicketChart data={chartData} />
            <RecentTickets tickets={recentTickets} />
          </div>
        </>
      )}
    </div>
  );
}
