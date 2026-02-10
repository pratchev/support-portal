'use client';

import { StatsCard } from '@/components/dashboard/stats-card';
import { TicketChart } from '@/components/dashboard/ticket-chart';
import { Users, Ticket, TrendingUp, Clock } from 'lucide-react';

export default function AdminDashboardPage() {
  // Mock data
  const stats = {
    totalUsers: 1247,
    totalTickets: 3892,
    avgResolutionTime: '4.2h',
    satisfaction: 4.6,
  };

  const chartData = [
    { name: 'Jan', open: 120, closed: 110 },
    { name: 'Feb', open: 135, closed: 125 },
    { name: 'Mar', open: 140, closed: 145 },
    { name: 'Apr', open: 125, closed: 130 },
    { name: 'May', open: 150, closed: 148 },
    { name: 'Jun', open: 145, closed: 152 },
  ];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">System overview and analytics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={Users}
          description="Registered users"
          trend={{ value: 8, isPositive: true }}
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
          description="Last 30 days"
          trend={{ value: 15, isPositive: true }}
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
    </div>
  );
}
