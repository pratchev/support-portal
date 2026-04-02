'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/dashboard/stats-card';
import {
  TicketChart,
  getStatusChartColor,
} from '@/components/dashboard/ticket-chart';
import { RecentTickets } from '@/components/dashboard/recent-tickets';
import {
  Ticket,
  Clock,
  CheckCircle,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { DateRangeFilter } from '@/components/dashboard/date-range-filter';

interface TicketItem {
  id: string;
  subject: string;
  status: string;
  priority: string;
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
    newCount: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
  });
  const [recentTickets, setRecentTickets] = useState<
    Array<{ id: string; title: string; status: string; updatedAt: string }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async (startDate?: string, endDate?: string) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const dateParams: Record<string, string> = {};
      if (startDate && endDate) {
        dateParams.startDate = new Date(startDate).toISOString();
        dateParams.endDate = new Date(endDate + 'T23:59:59').toISOString();
      }

      const [allRes, newRes, openRes, progressRes, resolvedRes] =
        await Promise.all([
          get<PaginatedTickets>('/api/tickets', { limit: '1', ...dateParams }),
          get<PaginatedTickets>('/api/tickets', {
            status: 'NEW',
            limit: '1',
            ...dateParams,
          }),
          get<PaginatedTickets>('/api/tickets', {
            status: 'OPEN',
            limit: '1',
            ...dateParams,
          }),
          get<PaginatedTickets>('/api/tickets', {
            status: 'IN_PROGRESS',
            limit: '1',
            ...dateParams,
          }),
          get<PaginatedTickets>('/api/tickets', {
            status: 'RESOLVED',
            limit: '1',
            ...dateParams,
          }),
        ]);
      setStats({
        total: allRes.pagination.total,
        newCount: newRes.pagination.total,
        open: openRes.pagination.total,
        inProgress: progressRes.pagination.total,
        resolved: resolvedRes.pagination.total,
      });

      const recent = await get<PaginatedTickets>('/api/tickets', {
        limit: '5',
        ...dateParams,
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
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleDateRangeChange = (
    startDate: string | undefined,
    endDate: string | undefined
  ) => {
    loadData(startDate, endDate);
  };

  const chartData = [
    { name: 'New', count: stats.newCount, fill: getStatusChartColor('NEW') },
    { name: 'Open', count: stats.open, fill: getStatusChartColor('OPEN') },
    {
      name: 'In Progress',
      count: stats.inProgress,
      fill: getStatusChartColor('IN_PROGRESS'),
    },
    {
      name: 'Resolved',
      count: stats.resolved,
      fill: getStatusChartColor('RESOLVED'),
    },
  ];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground mb-4">
          Overview of your support tickets
        </p>
        <DateRangeFilter onRangeChange={handleDateRangeChange} />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading dashboard...</p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
            <StatsCard
              title="Total Tickets"
              value={stats.total}
              icon={Ticket}
              description="All time"
            />
            <StatsCard
              title="New"
              value={stats.newCount}
              icon={Sparkles}
              description="Awaiting triage"
            />
            <StatsCard
              title="Open"
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
