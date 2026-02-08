// Attachment types and interfaces
export interface AttachmentUploadResponse {
  id: string;
  fileName: string;
  originalName: string;
  fileUrl: string;
  thumbnailUrl?: string;
  fileSize: number;
  mimeType: string;
  fileType: 'image' | 'document' | 'archive' | 'code' | 'other';
  width?: number;
  height?: number;
  isInline: boolean;
}

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
  siteName?: string;
}

// Supported file extensions by category
export const ALLOWED_FILE_TYPES = {
  image: ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp', 'tiff'],
  document: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'rtf'],
  archive: ['zip', 'rar', '7z', 'tar', 'gz'],
  code: ['js', 'ts', 'py', 'java', 'cs', 'cpp', 'html', 'css', 'json', 'xml', 'yaml', 'sql', 'sh', 'md'],
  other: ['log']
} as const;

// File size limits
export const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_ATTACHMENTS_PER_TICKET = 20;
export const MAX_TOTAL_ATTACHMENT_SIZE = 100 * 1024 * 1024; // 100MB

// Code languages for syntax highlighting
export const CODE_LANGUAGES = [
  'javascript',
  'typescript',
  'python',
  'java',
  'csharp',
  'cpp',
  'sql',
  'html',
  'css',
  'json',
  'xml',
  'yaml',
  'bash',
  'powershell',
  'markdown',
  'plaintext'
] as const;

export type CodeLanguage = typeof CODE_LANGUAGES[number];

// Helper function to determine file type from extension
export function getFileType(extension: string): 'image' | 'document' | 'archive' | 'code' | 'other' {
  const ext = extension.toLowerCase().replace('.', '');
  
  if (ALLOWED_FILE_TYPES.image.includes(ext as any)) return 'image';
  if (ALLOWED_FILE_TYPES.document.includes(ext as any)) return 'document';
  if (ALLOWED_FILE_TYPES.archive.includes(ext as any)) return 'archive';
  if (ALLOWED_FILE_TYPES.code.includes(ext as any)) return 'code';
  
  return 'other';
}

// Helper to check if file type is allowed
export function isFileTypeAllowed(extension: string): boolean {
  const ext = extension.toLowerCase().replace('.', '');
  
  return Object.values(ALLOWED_FILE_TYPES).some(types => 
    types.includes(ext as any)
  );
}
