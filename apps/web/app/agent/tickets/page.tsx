'use client';

import { useState } from 'react';
import { useTickets } from '@/hooks/use-tickets';
import { TicketList } from '@/components/tickets/ticket-list';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Search } from 'lucide-react';

export default function AgentTicketsPage() {
  const [search, setSearch] = useState('');
  const { tickets, isLoading, error, filters, setFilters } = useTickets();

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Tickets</h1>
        <p className="text-muted-foreground">
          View and manage all support tickets
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') setFilters({ ...filters, search });
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={filters.status || ''}
          onValueChange={(v) =>
            setFilters({ ...filters, status: v === 'all' ? undefined : v })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="NEW">New</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="WAITING_FOR_CUSTOMER">
              Waiting (Customer)
            </SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
            <SelectItem value="CLOSED">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.priority || ''}
          onValueChange={(v) =>
            setFilters({ ...filters, priority: v === 'all' ? undefined : v })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="LOW">Low</SelectItem>
            <SelectItem value="MEDIUM">Medium</SelectItem>
            <SelectItem value="HIGH">High</SelectItem>
            <SelectItem value="URGENT">Urgent</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={filters.category || ''}
          onValueChange={(v) =>
            setFilters({ ...filters, category: v === 'all' ? undefined : v })
          }
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="TECHNICAL">Technical</SelectItem>
            <SelectItem value="BILLING">Billing</SelectItem>
            <SelectItem value="FEATURE_REQUEST">Feature Request</SelectItem>
            <SelectItem value="BUG_REPORT">Bug Report</SelectItem>
            <SelectItem value="GENERAL">General</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tickets</CardTitle>
          <CardDescription>
            All support tickets across the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-12 text-muted-foreground">
              Loading tickets...
            </p>
          ) : error ? (
            <p className="text-center py-12 text-destructive">{error}</p>
          ) : (
            <TicketList tickets={tickets} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
