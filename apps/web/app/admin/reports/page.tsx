'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TicketChart } from '@/components/dashboard/ticket-chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useApi } from '@/hooks/use-api';

interface Metrics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  avgResponseTime: number;
  ticketsByPriority: Array<{ priority: string; count: number }>;
  ticketsByCategory: Array<{ category: string; count: number }>;
  ticketsByStatus: Array<{ status: string; count: number }>;
}

interface AgentPerf {
  agentId: string;
  agentName: string;
  totalAssigned: number;
  resolved: number;
  avgResolutionTime: number;
}

export default function AdminReportsPage() {
  const { get, isAuthenticated } = useApi();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [agents, setAgents] = useState<AgentPerf[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    async function load() {
      try {
        const [m, a] = await Promise.all([
          get<Metrics>('/api/reports/metrics'),
          get<AgentPerf[]>('/api/reports/agent-performance'),
        ]);
        setMetrics(m);
        setAgents(a);
      } catch {
        // silent
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, [get, isAuthenticated]);

  const chartData = metrics
    ? metrics.ticketsByStatus.map((s) => ({
        name: s.status.replace(/_/g, ' '),
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
    : [];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
        <p className="text-muted-foreground">
          View system reports and performance metrics
        </p>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading reports...</p>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">Agent Performance</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {metrics && (
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Tickets
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics.totalTickets}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Open</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics.openTickets}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">
                      Resolved
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {metrics.resolvedTickets}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            <TicketChart data={chartData} />
          </TabsContent>

          <TabsContent value="agents">
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
                <CardDescription>
                  Performance metrics for all agents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Agent</TableHead>
                      <TableHead>Total Assigned</TableHead>
                      <TableHead>Tickets Resolved</TableHead>
                      <TableHead>Avg Resolution Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {agents.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-center text-muted-foreground"
                        >
                          No agent data available
                        </TableCell>
                      </TableRow>
                    ) : (
                      agents.map((agent) => (
                        <TableRow key={agent.agentId}>
                          <TableCell className="font-medium">
                            {agent.agentName}
                          </TableCell>
                          <TableCell>{agent.totalAssigned}</TableCell>
                          <TableCell>{agent.resolved}</TableCell>
                          <TableCell>
                            {agent.avgResolutionTime > 0
                              ? `${agent.avgResolutionTime}h`
                              : '—'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Categories</CardTitle>
                <CardDescription>
                  Distribution of tickets by category
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metrics && metrics.ticketsByCategory.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Category</TableHead>
                        <TableHead>Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.ticketsByCategory.map((cat) => (
                        <TableRow key={cat.category}>
                          <TableCell className="font-medium">
                            {cat.category.replace(/_/g, ' ')}
                          </TableCell>
                          <TableCell>{cat.count}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <p className="text-muted-foreground">
                    No category data available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
