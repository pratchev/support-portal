'use client';

import { StatsCard } from '@/components/dashboard/stats-card';
import { TicketChart } from '@/components/dashboard/ticket-chart';
import { RecentTickets } from '@/components/dashboard/recent-tickets';
import { Ticket, Clock, CheckCircle, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  // Mock data - replace with real API calls
  const stats = {
    total: 24,
    open: 8,
    inProgress: 6,
    resolved: 10,
  };

  const chartData = [
    { name: 'Mon', open: 4, closed: 2 },
    { name: 'Tue', open: 3, closed: 5 },
    { name: 'Wed', open: 2, closed: 3 },
    { name: 'Thu', open: 5, closed: 4 },
    { name: 'Fri', open: 4, closed: 6 },
    { name: 'Sat', open: 2, closed: 1 },
    { name: 'Sun', open: 3, closed: 2 },
  ];

  const recentTickets = [
    { id: 1, title: 'Login issues', status: 'open', updatedAt: '2024-01-15T10:30:00Z' },
    { id: 2, title: 'Feature request', status: 'in_progress', updatedAt: '2024-01-14T15:20:00Z' },
    { id: 3, title: 'Bug report', status: 'resolved', updatedAt: '2024-01-13T09:15:00Z' },
  ];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your support tickets</p>
      </div>

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
    </div>
  );
}
