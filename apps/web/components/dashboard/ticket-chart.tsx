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
  Cell,
} from 'recharts';

export interface TicketChartData {
  name: string;
  count: number;
  fill: string;
}

const STATUS_CHART_COLORS: Record<string, string> = {
  NEW: 'hsl(217, 91%, 60%)',
  OPEN: 'hsl(0, 72%, 51%)',
  IN_PROGRESS: 'hsl(50, 98%, 47%)',
  WAITING_FOR_CUSTOMER: 'hsl(271, 91%, 65%)',
  WAITING_FOR_INTERNAL: 'hsl(30, 41%, 44%)',
  RESOLVED: 'hsl(142, 71%, 45%)',
  CLOSED: 'hsl(220, 9%, 46%)',
};

export function getStatusChartColor(status: string): string {
  return STATUS_CHART_COLORS[status] || 'hsl(220, 9%, 46%)';
}

interface TicketChartProps {
  data: TicketChartData[];
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
            <Bar dataKey="count" name="Tickets" radius={[6, 6, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
