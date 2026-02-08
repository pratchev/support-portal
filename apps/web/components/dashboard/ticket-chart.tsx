'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface TicketChartProps {
  data: Array<{
    name: string;
    open: number;
    closed: number;
  }>;
}

export function TicketChart({ data }: TicketChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ticket Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="open" fill="hsl(var(--primary))" name="Open Tickets" />
            <Bar dataKey="closed" fill="hsl(var(--muted))" name="Closed Tickets" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
