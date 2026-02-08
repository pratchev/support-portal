'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

export default function AdminReportsPage() {
  // Mock data
  const chartData = [
    { name: 'Mon', open: 24, closed: 18 },
    { name: 'Tue', open: 28, closed: 22 },
    { name: 'Wed', open: 20, closed: 25 },
    { name: 'Thu', open: 32, closed: 28 },
    { name: 'Fri', open: 26, closed: 30 },
    { name: 'Sat', open: 15, closed: 12 },
    { name: 'Sun', open: 18, closed: 14 },
  ];

  const agentPerformance = [
    { name: 'John Doe', resolved: 45, avgTime: '2.5h', satisfaction: 4.8 },
    { name: 'Jane Smith', resolved: 52, avgTime: '2.1h', satisfaction: 4.9 },
    { name: 'Bob Johnson', resolved: 38, avgTime: '3.2h', satisfaction: 4.6 },
  ];

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
        <p className="text-muted-foreground">View system reports and performance metrics</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agent Performance</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <TicketChart data={chartData} />
        </TabsContent>

        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance</CardTitle>
              <CardDescription>Performance metrics for all agents</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Tickets Resolved</TableHead>
                    <TableHead>Avg Response Time</TableHead>
                    <TableHead>Satisfaction Rating</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentPerformance.map((agent) => (
                    <TableRow key={agent.name}>
                      <TableCell className="font-medium">{agent.name}</TableCell>
                      <TableCell>{agent.resolved}</TableCell>
                      <TableCell>{agent.avgTime}</TableCell>
                      <TableCell>{agent.satisfaction}/5.0</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Ticket Categories</CardTitle>
              <CardDescription>Distribution of tickets by category</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Category breakdown coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
