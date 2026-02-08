'use client';

import { formatDate } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TicketStatusBadge } from './ticket-status-badge';
import { TicketPriorityBadge } from './ticket-priority-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';

interface TicketDetailProps {
  ticket: {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
    updatedAt: string;
    user?: {
      name: string;
      email: string;
      image?: string;
    };
    responses?: Array<{
      id: number;
      message: string;
      createdAt: string;
      user: {
        name: string;
        role: string;
      };
    }>;
  };
}

export function TicketDetail({ ticket }: TicketDetailProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <CardTitle className="text-2xl">{ticket.title}</CardTitle>
              <CardDescription>Ticket #{ticket.id}</CardDescription>
            </div>
            <div className="flex gap-2">
              <TicketStatusBadge status={ticket.status} />
              <TicketPriorityBadge priority={ticket.priority} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Description</p>
            <p className="whitespace-pre-wrap">{ticket.description}</p>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Created</p>
              <p>{formatDate(ticket.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Last Updated</p>
              <p>{formatDate(ticket.updatedAt)}</p>
            </div>
            {ticket.user && (
              <div className="col-span-2">
                <p className="text-muted-foreground mb-2">Submitted By</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={ticket.user.image} />
                    <AvatarFallback>{ticket.user.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{ticket.user.name}</p>
                    <p className="text-xs text-muted-foreground">{ticket.user.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {ticket.responses && ticket.responses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Responses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ticket.responses.map((response) => (
              <div key={response.id} className="border-l-2 border-primary pl-4">
                <div className="flex items-center gap-2 mb-2">
                  <p className="font-medium text-sm">{response.user.name}</p>
                  <span className="text-xs text-muted-foreground">•</span>
                  <p className="text-xs text-muted-foreground">{response.user.role}</p>
                  <span className="text-xs text-muted-foreground">•</span>
                  <p className="text-xs text-muted-foreground">{formatDate(response.createdAt)}</p>
                </div>
                <p className="text-sm whitespace-pre-wrap">{response.message}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
