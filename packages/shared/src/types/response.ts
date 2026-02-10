export interface Response {
  id: string;
  ticketId: string;
  authorId?: string;
  authorEmail: string;
  body: string;
  isInternal: boolean;
  isKBArticle: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Reaction {
  id: string;
  responseId: string;
  userId: string;
  emoji: string;
  createdAt: Date;
}

export interface Rating {
  id: string;
  responseId?: string;
  agentId?: string;
  userId: string;
  score: number;
  comment?: string;
  createdAt: Date;
}

export interface Attachment {
  id: string;
  ticketId?: string;
  responseId?: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadedBy: string;
  createdAt: Date;
}
