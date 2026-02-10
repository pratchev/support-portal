export const TICKET_CATEGORIES = [
  'Technical Support',
  'Billing',
  'Feature Request',
  'Bug Report',
  'General Inquiry',
  'Account Management',
  'Other',
] as const;

export const TICKET_TYPES = {
  QUESTION: 'QUESTION',
  BUG: 'BUG',
  SUGGESTION: 'SUGGESTION',
  ENHANCEMENT: 'ENHANCEMENT',
  OTHER: 'OTHER',
} as const;

export const TICKET_TYPE_LABELS: Record<string, string> = {
  QUESTION: 'Question',
  BUG: 'Bug',
  SUGGESTION: 'Suggestion',
  ENHANCEMENT: 'Enhancement',
  OTHER: 'Other',
};
