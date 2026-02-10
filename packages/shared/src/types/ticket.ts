export interface Ticket {
  id: string;
  ticketNumber: number;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: string;
  type: TicketType;
  sentiment?: string;
  submitterEmail: string;
  submitterId?: string;
  source: TicketSource;
  aiSummary?: string;
  isPinned: boolean;
  trackingToken: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  firstResponseAt?: Date;
}

export enum TicketStatus {
  OPEN = 'OPEN',
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TicketType {
  QUESTION = 'QUESTION',
  BUG = 'BUG',
  SUGGESTION = 'SUGGESTION',
  ENHANCEMENT = 'ENHANCEMENT',
  OTHER = 'OTHER',
}

export enum TicketSource {
  WEB = 'WEB',
  EMAIL = 'EMAIL',
}

export interface TicketAssignment {
  ticketId: string;
  agentId: string;
  assignedAt: Date;
}
