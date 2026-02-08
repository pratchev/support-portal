import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';

export const generateTrackingToken = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

export const generateRandomString = (length: number = 32): string => {
  return crypto.randomBytes(length).toString('hex');
};

export const hashPassword = async (password: string): Promise<string> => {
  const bcrypt = await import('bcrypt');
  return bcrypt.hash(password, 10);
};

export const comparePassword = async (
  password: string,
  hash: string
): Promise<boolean> => {
  const bcrypt = await import('bcrypt');
  return bcrypt.compare(password, hash);
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

export const ensureDirectory = async (dirPath: string): Promise<void> => {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
  }
};

export const formatBytes = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const getPriorityColor = (priority: string): string => {
  const colors: Record<string, string> = {
    LOW: '#6c757d',
    MEDIUM: '#17a2b8',
    HIGH: '#fd7e14',
    URGENT: '#dc3545',
  };
  return colors[priority] || colors.MEDIUM;
};

export const loadTemplate = async (templateName: string): Promise<string> => {
  const templatePath = path.join(__dirname, '..', 'templates', templateName);
  return fs.readFile(templatePath, 'utf-8');
};

export const populateTemplate = (template: string, data: Record<string, any>): string => {
  let result = template;
  
  // Replace simple {{variable}} placeholders
  Object.entries(data).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value ?? '');
  });
  
  // Handle conditional blocks {{#variable}}...{{/variable}}
  result = result.replace(/{{#(\w+)}}([\s\S]*?){{\/\1}}/g, (_match, key, content) => {
    return data[key] ? content : '';
  });
  
  return result;
};

export const calculateSLA = (
  priority: string,
  createdAt: Date
): { isBreached: boolean; remainingMinutes: number } => {
  const slaMinutes: Record<string, number> = {
    LOW: 1440, // 24 hours
    MEDIUM: 480, // 8 hours
    HIGH: 240, // 4 hours
    URGENT: 60, // 1 hour
  };
  
  const targetMinutes = slaMinutes[priority] || slaMinutes.MEDIUM;
  const elapsedMinutes = (Date.now() - createdAt.getTime()) / (1000 * 60);
  const remainingMinutes = targetMinutes - elapsedMinutes;
  
  return {
    isBreached: remainingMinutes <= 0,
    remainingMinutes: Math.max(0, remainingMinutes),
  };
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
};
