'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TicketChartProps {
  data: Array<{
    name: string;
    open: number;
    closed: number;
  }>;
}

export function TicketChart({ data }: TicketChartProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-semibold">
          Ticket Statistics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              strokeOpacity={0.3}
            />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              fontSize={12}
            />
            <YAxis axisLine={false} tickLine={false} fontSize={12} />
            <Tooltip
              contentStyle={{
                borderRadius: '0.75rem',
                border: '1px solid hsl(var(--border))',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                fontSize: '0.875rem',
              }}
            />
            <Legend iconType="circle" iconSize={8} />
            <Bar
              dataKey="open"
              fill="hsl(213, 94%, 54%)"
              name="Open"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="closed"
              fill="hsl(160, 84%, 39%)"
              name="Resolved"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
