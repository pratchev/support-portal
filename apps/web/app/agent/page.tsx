'use client';

import { useState, useEffect } from 'react';
import { StatsCard } from '@/components/dashboard/stats-card';
import { TicketList } from '@/components/tickets/ticket-list';
import { Ticket, Clock, Users, TrendingUp } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useApi } from '@/hooks/use-api';

interface TicketItem {
  id: string;
  ticketNumber: number;
  subject: string;
  status: string;
  priority: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedTickets {
  data: TicketItem[];
  pagination: { total: number };
}

export default function AgentDashboardPage() {
  const { get, isAuthenticated } = useApi();
  const [stats, setStats] = useState({
    assigned: 0,
    avgResponseTime: '—',
    resolved: 0,
    satisfaction: '—',
  });
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function load() {
      try {
        const [allRes, resolvedRes] = await Promise.all([
          get<PaginatedTickets>('/api/tickets', { limit: '10' }),
          get<PaginatedTickets>('/api/tickets', {
            status: 'RESOLVED',
            limit: '1',
          }),
        ]);
        setTickets(allRes.data);
        setStats({
          assigned: allRes.pagination.total,
          avgResponseTime: '—',
          resolved: resolvedRes.pagination.total,
          satisfaction: '—',
        });

        // Try to load metrics (agent/admin only)
        try {
          const metrics = await get<{ avgResponseTime: number }>(
            '/api/reports/metrics'
          );
          const mins = metrics.avgResponseTime;
          setStats((s) => ({
            ...s,
            avgResponseTime:
              mins > 0
                ? mins < 60
                  ? `${mins}m`
                  : `${(mins / 60).toFixed(1)}h`
                : '—',
          }));
        } catch {
          /* user may not have permission */
        }

        try {
          const sat = await get<{ averageRating: number }>(
            '/api/reports/satisfaction'
          );
          setStats((s) => ({
            ...s,
            satisfaction:
              sat.averageRating > 0
                ? String(sat.averageRating.toFixed(1))
                : '—',
          }));
        } catch {
          /* permission error is ok */
        }
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
        <h1 className="text-3xl font-bold mb-2">Agent Dashboard</h1>
        <p className="text-muted-foreground">
          Manage and respond to support tickets
        </p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading dashboard...</p>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <StatsCard
              title="Assigned Tickets"
              value={stats.assigned}
              icon={Ticket}
              description="Currently assigned to you"
            />
            <StatsCard
              title="Avg Response Time"
              value={stats.avgResponseTime}
              icon={Clock}
              description="Last 30 days"
            />
            <StatsCard
              title="Resolved"
              value={stats.resolved}
              icon={TrendingUp}
              description="All time"
            />
            <StatsCard
              title="Satisfaction Rating"
              value={stats.satisfaction}
              icon={Users}
              description="Out of 5.0"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>My Tickets</CardTitle>
              <CardDescription>Tickets assigned to you</CardDescription>
            </CardHeader>
            <CardContent>
              <TicketList tickets={tickets} />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
