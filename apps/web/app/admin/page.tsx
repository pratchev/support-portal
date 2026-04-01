'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { TicketChart } from '@/components/dashboard/ticket-chart';
import { Users, Ticket, TrendingUp, Clock } from 'lucide-react';
import { useApi } from '@/hooks/use-api';

interface Metrics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;
  ticketsByStatus: Array<{ status: string; count: number }>;
}

export default function AdminDashboardPage() {
  const { get, isAuthenticated } = useApi();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTickets: 0,
    avgResolutionTime: '—',
    satisfaction: '—',
  });
  const [chartData, setChartData] = useState<
    Array<{ name: string; open: number; closed: number }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function load() {
      try {
        const [metrics, users, satisfaction] = await Promise.all([
          get<Metrics>('/api/reports/metrics'),
          get<{ pagination: { total: number } }>('/api/users', { limit: '1' }),
          get<{ averageRating: number }>('/api/reports/satisfaction').catch(
            () => ({ averageRating: 0 })
          ),
        ]);

        const mins = metrics.avgResponseTime;
        setStats({
          totalUsers: users.pagination?.total ?? 0,
          totalTickets: metrics.totalTickets,
          avgResolutionTime:
            mins > 0
              ? mins < 60
                ? `${mins}m`
                : `${(mins / 60).toFixed(1)}h`
              : '—',
          satisfaction:
            satisfaction.averageRating > 0
              ? satisfaction.averageRating.toFixed(1)
              : '—',
        });

        // Build chart from ticketsByStatus
        setChartData(
          metrics.ticketsByStatus.map((s) => ({
            name: s.status.replace('_', ' '),
            open: [
              'OPEN',
              'IN_PROGRESS',
              'WAITING_FOR_CUSTOMER',
              'WAITING_FOR_INTERNAL',
            ].includes(s.status)
              ? s.count
              : 0,
            closed: ['RESOLVED', 'CLOSED'].includes(s.status) ? s.count : 0,
          }))
        );
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [get, isAuthenticated]);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and analytics</p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading dashboard...</p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatsCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              description="Registered users"
            />
            <StatsCard
              title="Total Tickets"
              value={stats.totalTickets}
              icon={Ticket}
              description="All time"
            />
            <StatsCard
              title="Avg Resolution Time"
              value={stats.avgResolutionTime}
              icon={Clock}
              description="First response"
            />
            <StatsCard
              title="Satisfaction Rating"
              value={stats.satisfaction}
              icon={TrendingUp}
              description="Out of 5.0"
            />
          </div>

          <div className="grid gap-6">
            <TicketChart data={chartData} />
          </div>
        </>
      )}
    </div>
  );
}
