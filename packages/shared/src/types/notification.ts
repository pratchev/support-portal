export interface NotificationSettings {
  id: string;
  notifyEndUserOnReply: boolean;
  notifyAgentsOnNewTicket: boolean;
  notifyManagersOnNewTicket: boolean;
  useTeamEmail: boolean;
  teamEmail?: string;
  emailFromName: string;
  emailFromAddress: string;
  emailProvider: EmailProvider;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  smtpSecure: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum EmailProvider {
  GRAPH = 'graph',
  SMTP = 'smtp',
}

export interface NotificationEvent {
  type: NotificationType;
  ticketId: string;
  ticketNumber: number;
  subject: string;
  recipientEmail: string;
  recipientName?: string;
  data: Record<string, unknown>;
}

export enum NotificationType {
  TICKET_REPLY = 'TICKET_REPLY',
  NEW_TICKET = 'NEW_TICKET',
  TICKET_ASSIGNED = 'TICKET_ASSIGNED',
  SLA_BREACH = 'SLA_BREACH',
}
