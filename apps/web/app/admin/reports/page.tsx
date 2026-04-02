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
import {
  TicketChart,
  getStatusChartColor,
} from '@/components/dashboard/ticket-chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useApi } from '@/hooks/use-api';
import { TicketStatusBadge } from '@/components/tickets/ticket-status-badge';
import { TicketPriorityBadge } from '@/components/tickets/ticket-priority-badge';
import { StatsCard } from '@/components/dashboard/stats-card';
import { DateRangeFilter } from '@/components/dashboard/date-range-filter';
import { Ticket, AlertCircle, CheckCircle, Clock } from 'lucide-react';

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

interface DurationMetrics {
  byPriority: Array<{ priority: string; count: number; avgHours: number }>;
  byAgent: Array<{ id: string; name: string; count: number; avgHours: number }>;
  byUser: Array<{ id: string; name: string; count: number; avgHours: number }>;
  totalResolved: number;
  overallAvgHours: number;
}

export default function AdminReportsPage() {
  const { get, isAuthenticated } = useApi();
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [agents, setAgents] = useState<AgentPerf[]>([]);
  const [duration, setDuration] = useState<DurationMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<{
    startDate?: string;
    endDate?: string;
  }>({});

  const loadData = async (startDate?: string, endDate?: string) => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const params: Record<string, string> = {};
      if (startDate && endDate) {
        params.startDate = new Date(startDate).toISOString();
        params.endDate = new Date(endDate + 'T23:59:59').toISOString();
      }
      const [m, a, d] = await Promise.all([
        get<Metrics>('/api/reports/metrics', params),
        get<AgentPerf[]>('/api/reports/agent-performance', params),
        get<DurationMetrics>('/api/reports/duration', params).catch(() => null),
      ]);
      setMetrics(m);
      setAgents(a);
      setDuration(d);
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData(dateRange.startDate, dateRange.endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleDateRangeChange = (
    startDate: string | undefined,
    endDate: string | undefined
  ) => {
    setDateRange({ startDate, endDate });
    loadData(startDate, endDate);
  };

  const chartData = metrics
    ? metrics.ticketsByStatus.map((s) => ({
        name: s.status.replace(/_/g, ' '),
        count: s.count,
        fill: getStatusChartColor(s.status),
      }))
    : [];

  const formatHours = (h: number) => {
    if (h < 1) return `${Math.round(h * 60)}m`;
    if (h < 24) return `${h}h`;
    return `${(h / 24).toFixed(1)}d`;
  };

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
        <p className="text-muted-foreground mb-4">
          View system reports and performance metrics
        </p>
        <DateRangeFilter onRangeChange={handleDateRangeChange} />
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Loading reports...</p>
      ) : (
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="agents">Agent Performance</TabsTrigger>
            <TabsTrigger value="priority">Priority</TabsTrigger>
            <TabsTrigger value="duration">Processing Time</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          {/* OVERVIEW TAB */}
          <TabsContent value="overview" className="space-y-6">
            {metrics && (
              <div className="grid gap-4 md:grid-cols-4 mb-6">
                <StatsCard
                  title="Total Tickets"
                  value={metrics.totalTickets}
                  icon={Ticket}
                  description="All time"
                />
                <StatsCard
                  title="Open"
                  value={metrics.openTickets}
                  icon={AlertCircle}
                  description="Needs attention"
                />
                <StatsCard
                  title="Resolved"
                  value={metrics.resolvedTickets}
                  icon={CheckCircle}
                  description="Completed"
                />
                <StatsCard
                  title="Avg Response"
                  value={
                    metrics.avgResponseTime > 0
                      ? metrics.avgResponseTime < 60
                        ? `${metrics.avgResponseTime}m`
                        : `${(metrics.avgResponseTime / 60).toFixed(1)}h`
                      : '—'
                  }
                  icon={Clock}
                  description="First response time"
                />
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <TicketChart data={chartData} />
              </div>
              <div className="space-y-6">
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
                  </CardContent>
                </Card>
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
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* AGENT PERFORMANCE TAB */}
          <TabsContent value="agents">
            <Card className="border-0 shadow-sm">
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
                      <TableHead className="text-right">Assigned</TableHead>
                      <TableHead className="text-right">Resolved</TableHead>
                      <TableHead className="text-right">
                        Avg Resolution
                      </TableHead>
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
                          <TableCell className="text-right tabular-nums">
                            {agent.totalAssigned}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {agent.resolved}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
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

          {/* PRIORITY TAB */}
          <TabsContent value="priority">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Tickets by Priority</CardTitle>
                <CardDescription>
                  Distribution of tickets across priority levels
                </CardDescription>
              </CardHeader>
              <CardContent>
                {metrics && metrics.ticketsByPriority.length > 0 ? (
                  <div className="space-y-4">
                    {metrics.ticketsByPriority.map((p) => {
                      const pct =
                        metrics.totalTickets > 0
                          ? (p.count / metrics.totalTickets) * 100
                          : 0;
                      return (
                        <div key={p.priority} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <TicketPriorityBadge priority={p.priority} />
                            <span className="text-sm text-muted-foreground">
                              {p.count} ({pct.toFixed(0)}%)
                            </span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                p.priority === 'URGENT'
                                  ? 'bg-red-500'
                                  : p.priority === 'HIGH'
                                    ? 'bg-orange-500'
                                    : p.priority === 'MEDIUM'
                                      ? 'bg-blue-500'
                                      : 'bg-slate-400'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    No priority data available
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* DURATION / PROCESSING TIME TAB */}
          <TabsContent value="duration" className="space-y-6">
            {duration && (
              <div className="grid gap-4 md:grid-cols-2 mb-6">
                <StatsCard
                  title="Total Resolved"
                  value={duration.totalResolved}
                  icon={CheckCircle}
                  description="Tickets with resolution data"
                />
                <StatsCard
                  title="Overall Avg Time"
                  value={formatHours(duration.overallAvgHours)}
                  icon={Clock}
                  description="New → Resolved"
                />
              </div>
            )}

            <div className="grid gap-6 lg:grid-cols-3">
              {/* By Priority */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    By Priority
                  </CardTitle>
                  <CardDescription>
                    Avg processing time per priority
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {duration && duration.byPriority.length > 0 ? (
                    <div className="space-y-3">
                      {duration.byPriority.map((p) => (
                        <div
                          key={p.priority}
                          className="flex items-center justify-between py-1.5"
                        >
                          <TicketPriorityBadge priority={p.priority} />
                          <div className="text-right">
                            <span className="text-sm font-semibold tabular-nums">
                              {formatHours(p.avgHours)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({p.count})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No data</p>
                  )}
                </CardContent>
              </Card>

              {/* By Agent */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    By Support User
                  </CardTitle>
                  <CardDescription>
                    Avg processing time per agent
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {duration && duration.byAgent.length > 0 ? (
                    <div className="space-y-3">
                      {duration.byAgent.map((a) => (
                        <div
                          key={a.id}
                          className="flex items-center justify-between py-1.5"
                        >
                          <span className="text-sm font-medium truncate mr-2">
                            {a.name}
                          </span>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-semibold tabular-nums">
                              {formatHours(a.avgHours)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({a.count})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No data</p>
                  )}
                </CardContent>
              </Card>

              {/* By End User */}
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">
                    By End User
                  </CardTitle>
                  <CardDescription>
                    Avg processing time per end user
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {duration && duration.byUser.length > 0 ? (
                    <div className="space-y-3">
                      {duration.byUser.map((u) => (
                        <div
                          key={u.id}
                          className="flex items-center justify-between py-1.5"
                        >
                          <span className="text-sm font-medium truncate mr-2">
                            {u.name}
                          </span>
                          <div className="text-right shrink-0">
                            <span className="text-sm font-semibold tabular-nums">
                              {formatHours(u.avgHours)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-2">
                              ({u.count})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No data</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* CATEGORIES TAB */}
          <TabsContent value="categories">
            <Card className="border-0 shadow-sm">
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
                        <TableHead className="text-right">Count</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {metrics.ticketsByCategory.map((cat) => (
                        <TableRow key={cat.category}>
                          <TableCell className="font-medium capitalize">
                            {cat.category.replace(/_/g, ' ').toLowerCase()}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {cat.count}
                          </TableCell>
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
