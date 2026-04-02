'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/dashboard/stats-card';
import {
  TicketChart,
  getStatusChartColor,
  getStatusChartLabel,
} from '@/components/dashboard/ticket-chart';
import type { TicketChartData } from '@/components/dashboard/ticket-chart';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Ticket, TrendingUp, Clock, Sparkles } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { TicketStatusBadge } from '@/components/tickets/ticket-status-badge';
import { TicketPriorityBadge } from '@/components/tickets/ticket-priority-badge';
import { DateRangeFilter } from '@/components/dashboard/date-range-filter';

interface Metrics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;
  ticketsByStatus: Array<{ status: string; count: number }>;
  ticketsByPriority: Array<{ priority: string; count: number }>;
}

export default function AdminDashboardPage() {
  const { get, isAuthenticated } = useApi();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTickets: 0,
    avgResolutionTime: '—',
    satisfaction: '—',
  });
  const [chartData, setChartData] = useState<TicketChartData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async (startDate?: string, endDate?: string) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (startDate && endDate) {
        params.startDate = new Date(startDate).toISOString();
        params.endDate = new Date(endDate + 'T23:59:59').toISOString();
      }

      const [m, users, satisfaction] = await Promise.all([
        get<Metrics>('/api/reports/metrics', params),
        get<{ pagination: { total: number } }>('/api/users', { limit: '1' }),
        get<{ avgScore: number }>('/api/reports/satisfaction', params).catch(
          () => ({
            avgScore: 0,
          })
        ),
      ]);

      setMetrics(m);

      const mins = m.avgResponseTime;
      setStats({
        totalUsers: users.pagination?.total ?? 0,
        totalTickets: m.totalTickets,
        avgResolutionTime:
          mins > 0
            ? mins < 60
              ? `${mins}m`
              : `${(mins / 60).toFixed(1)}h`
            : '—',
        satisfaction:
          satisfaction.avgScore > 0 ? satisfaction.avgScore.toFixed(1) : '—',
      });

      setChartData(
        m.ticketsByStatus.map((s) => ({
          name: getStatusChartLabel(s.status),
          count: s.count,
          fill: getStatusChartColor(s.status),
        }))
      );
    } catch {
      // silent
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

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground mb-4">
          System overview and analytics
        </p>
        <DateRangeFilter onRangeChange={handleDateRangeChange} />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading dashboard...</p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 mb-8">
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
              title="New Tickets"
              value={
                metrics?.ticketsByStatus.find((s) => s.status === 'NEW')
                  ?.count ?? 0
              }
              icon={Sparkles}
              description="Awaiting triage"
            />
            <StatsCard
              title="Avg Response Time"
              value={stats.avgResolutionTime}
              icon={Clock}
              description="First response"
            />
            <StatsCard
              title="Satisfaction"
              value={stats.satisfaction}
              icon={TrendingUp}
              description="Out of 5.0"
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3 mb-8">
            <div className="lg:col-span-2">
              <TicketChart data={chartData} />
            </div>

            <div className="space-y-6">
              {/* Status breakdown */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    By Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {metrics?.ticketsByStatus.map((s) => (
                    <div
                      key={s.status}
                      className="flex items-center justify-between py-1.5"
                    >
                      <TicketStatusBadge status={s.status} />
                      <span className="text-sm font-semibold tabular-nums">
                        {s.count}
                      </span>
                    </div>
                  ))}
                  {(!metrics || metrics.ticketsByStatus.length === 0) && (
                    <p className="text-sm text-muted-foreground">No data</p>
                  )}
                </CardContent>
              </Card>

              {/* Priority breakdown */}
              <Card className="border-0 shadow-sm">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base font-semibold">
                    By Priority
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {metrics?.ticketsByPriority.map((p) => (
                    <div
                      key={p.priority}
                      className="flex items-center justify-between py-1.5"
                    >
                      <TicketPriorityBadge priority={p.priority} />
                      <span className="text-sm font-semibold tabular-nums">
                        {p.count}
                      </span>
                    </div>
                  ))}
                  {(!metrics || metrics.ticketsByPriority.length === 0) && (
                    <p className="text-sm text-muted-foreground">No data</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
