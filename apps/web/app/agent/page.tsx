'use client';

import { StatsCard } from '@/components/dashboard/stats-card';
import { TicketList } from '@/components/tickets/ticket-list';
import { Ticket, Clock, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AgentDashboardPage() {
  // Mock data
  const stats = {
    assigned: 12,
    avgResponseTime: '2.5h',
    resolved: 45,
    satisfaction: 4.8,
  };

  const tickets = [
    {
      id: 1,
      title: 'Unable to login',
      status: 'open',
      priority: 'high',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-15T10:30:00Z',
    },
    {
      id: 2,
      title: 'Payment failed',
      status: 'in_progress',
      priority: 'urgent',
      createdAt: '2024-01-15T09:15:00Z',
      updatedAt: '2024-01-15T11:20:00Z',
    },
  ];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Agent Dashboard</h1>
        <p className="text-muted-foreground">Manage and respond to support tickets</p>
      </div>

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
          title="Resolved This Month"
          value={stats.resolved}
          icon={TrendingUp}
          description="+12% from last month"
          trend={{ value: 12, isPositive: true }}
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
    </div>
  );
}
