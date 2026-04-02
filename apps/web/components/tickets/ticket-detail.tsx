'use client';

import { useState } from 'react';
import { formatDate } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select';
import { TicketStatusBadge } from './ticket-status-badge';
import { TicketPriorityBadge } from './ticket-priority-badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Pencil, Check, X } from 'lucide-react';
import { useApi } from '@/hooks/use-api';
import { useSession } from 'next-auth/react';

interface TicketDetailProps {
  ticket: {
    id: string;
    ticketNumber?: number;
    subject: string;
    description: string;
    status: string;
    priority: string;
    category?: string;
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    closedAt?: string;
    customer?: {
      name: string;
      email: string;
      avatar?: string;
    };
    responses?: Array<{
      id: number;
      content: string;
      message?: string;
      isInternal?: boolean;
      createdAt: string;
      user: {
        name: string;
        role: string;
        avatar?: string;
      };
    }>;
  };
  onUpdate?: (ticket: any) => void;
}

export function TicketDetail({ ticket, onUpdate }: TicketDetailProps) {
  const { patch } = useApi();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role?.toUpperCase();
  const isStaff = userRole === 'AGENT' || userRole === 'ADMIN';

  const [isEditing, setIsEditing] = useState(false);
  const [editSubject, setEditSubject] = useState(ticket.subject);
  const [editDescription, setEditDescription] = useState(ticket.description);
  const [isSaving, setIsSaving] = useState(false);

  const handleStatusChange = async (newStatus: string) => {
    try {
      const updated = await patch(`/api/tickets/${ticket.id}`, {
        status: newStatus,
      });
      onUpdate?.(updated);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handlePriorityChange = async (newPriority: string) => {
    try {
      const updated = await patch(`/api/tickets/${ticket.id}`, {
        priority: newPriority,
      });
      onUpdate?.(updated);
    } catch (err) {
      console.error('Failed to update priority:', err);
    }
  };

  const handleSaveEdit = async () => {
    setIsSaving(true);
    try {
      const updated = await patch(`/api/tickets/${ticket.id}`, {
        subject: editSubject,
        description: editDescription,
      });
      onUpdate?.(updated);
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update ticket:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditSubject(ticket.subject);
    setEditDescription(ticket.description);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0 space-y-1">
              {isEditing ? (
                <Input
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="text-xl font-semibold"
                />
              ) : (
                <CardTitle className="text-2xl">{ticket.subject}</CardTitle>
              )}
              <CardDescription>
                Ticket #{ticket.ticketNumber || ticket.id}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {isStaff ? (
                <>
                  <Select
                    value={ticket.status}
                    onValueChange={handleStatusChange}
                  >
                    <SelectTrigger className="w-auto h-7 text-xs gap-1 border-0 bg-transparent p-0">
                      <TicketStatusBadge status={ticket.status} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New</SelectItem>
                      <SelectItem value="OPEN">Open</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="WAITING_FOR_CUSTOMER">
                        Waiting on Customer
                      </SelectItem>
                      <SelectItem value="WAITING_FOR_INTERNAL">
                        Waiting on Team
                      </SelectItem>
                      <SelectItem value="RESOLVED">Resolved</SelectItem>
                      <SelectItem value="CLOSED">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={ticket.priority}
                    onValueChange={handlePriorityChange}
                  >
                    <SelectTrigger className="w-auto h-7 text-xs gap-1 border-0 bg-transparent p-0">
                      <TicketPriorityBadge priority={ticket.priority} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LOW">Low</SelectItem>
                      <SelectItem value="MEDIUM">Medium</SelectItem>
                      <SelectItem value="HIGH">High</SelectItem>
                      <SelectItem value="URGENT">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </>
              ) : (
                <>
                  <TicketStatusBadge status={ticket.status} />
                  <TicketPriorityBadge priority={ticket.priority} />
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Description</p>
              {!isEditing && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setIsEditing(true)}
                >
                  <Pencil className="h-3 w-3 mr-1" />
                  Edit
                </Button>
              )}
            </div>
            {isEditing ? (
              <div className="space-y-3">
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={6}
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSaveEdit}
                    disabled={isSaving}
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleCancelEdit}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap">{ticket.description}</p>
            )}
          </div>

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground mb-1">Status</p>
              <p className="font-medium capitalize">
                {ticket.status.replace(/_/g, ' ').toLowerCase()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Priority</p>
              <p className="font-medium capitalize">
                {ticket.priority.toLowerCase()}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Created</p>
              <p>{formatDate(ticket.createdAt)}</p>
            </div>
            <div>
              <p className="text-muted-foreground mb-1">Last Updated</p>
              <p>{formatDate(ticket.updatedAt)}</p>
            </div>
            {ticket.resolvedAt && (
              <div>
                <p className="text-muted-foreground mb-1">Resolved</p>
                <p>{formatDate(ticket.resolvedAt)}</p>
              </div>
            )}
            {ticket.closedAt && (
              <div>
                <p className="text-muted-foreground mb-1">Closed</p>
                <p>{formatDate(ticket.closedAt)}</p>
              </div>
            )}
            {ticket.category && (
              <div>
                <p className="text-muted-foreground mb-1">Category</p>
                <p className="capitalize">
                  {ticket.category.replace(/_/g, ' ').toLowerCase()}
                </p>
              </div>
            )}
            {ticket.customer && (
              <div className="col-span-2">
                <p className="text-muted-foreground mb-2">Submitted By</p>
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={ticket.customer.avatar} />
                    <AvatarFallback>
                      {ticket.customer.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {ticket.customer.name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {ticket.customer.email}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {ticket.responses && ticket.responses.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Responses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {ticket.responses.map((response) => (
              <div
                key={response.id}
                className={`border-l-2 pl-4 ${response.isInternal ? 'border-amber-400 bg-amber-50/50 dark:bg-amber-950/20 rounded-r-lg p-3' : 'border-primary'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={response.user.avatar} />
                    <AvatarFallback className="text-[10px]">
                      {response.user.name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <p className="font-medium text-sm">{response.user.name}</p>
                  <span className="text-xs text-muted-foreground">•</span>
                  <p className="text-xs text-muted-foreground capitalize">
                    {response.user.role?.toLowerCase()}
                  </p>
                  {response.isInternal && (
                    <>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        Internal
                      </span>
                    </>
                  )}
                  <span className="text-xs text-muted-foreground">•</span>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(response.createdAt)}
                  </p>
                </div>
                <div
                  className="text-sm prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: response.content || response.message || '',
                  }}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
