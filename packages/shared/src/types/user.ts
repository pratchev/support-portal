export interface User {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  role: UserRole;
  authProvider: AuthProvider;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = 'USER',
  AGENT = 'AGENT',
  ADMIN = 'ADMIN',
}

export enum AuthProvider {
  EMAIL = 'EMAIL',
  GOOGLE = 'GOOGLE',
  MICROSOFT = 'MICROSOFT',
}

export interface UserNotificationPreference {
  id: string;
  userId: string;
  emailOnTicketReply: boolean;
  emailOnNewTicket: boolean;
  emailOnTicketAssignment: boolean;
  emailOnSLABreach: boolean;
  emailDigestFrequency: DigestFrequency;
  createdAt: Date;
  updatedAt: Date;
}

export enum DigestFrequency {
  NONE = 'NONE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}
