/**
 * File: document-utils.ts
 * Purpose: Helper utilities for property documents (types, labels, icons)
 */

import { Database } from '@/types/supabase';

type DocumentType = Database['public']['Tables']['documents']['Row']['document_type'];

/**
 * Document type configuration
 * Maps document_type to human-readable labels and icon representations
 */
export const DOCUMENT_TYPE_CONFIG: Record<
  DocumentType,
  { label: string; icon: string; description: string }
> = {
  title: {
    label: 'Title Deed',
    icon: '📜',
    description: 'Official copy of title register',
  },
  survey: {
    label: 'Survey Report',
    icon: '📋',
    description: 'Property survey and inspection',
  },
  search: {
    label: 'Property Search',
    icon: '🔍',
    description: 'Local authority and land searches',
  },
  identity: {
    label: 'ID Document',
    icon: '🪪',
    description: 'Identity verification documents',
  },
  contract: {
    label: 'Contract',
    icon: '📝',
    description: 'Sale or rental contracts',
  },
  warranty: {
    label: 'Warranty',
    icon: '🛡️',
    description: 'Product or structural warranties',
  },
  planning: {
    label: 'Planning Permission',
    icon: '🏗️',
    description: 'Planning applications and approvals',
  },
  compliance: {
    label: 'Compliance Certificate',
    icon: '✓',
    description: 'EPC, gas safety, electrical certificates',
  },
  other: {
    label: 'Other Document',
    icon: '📄',
    description: 'Miscellaneous documents',
  },
};

/**
 * Get human-readable label for document type
 */
export function getDocumentTypeLabel(type: DocumentType): string {
  return DOCUMENT_TYPE_CONFIG[type]?.label || 'Unknown';
}

/**
 * Get icon for document type
 */
export function getDocumentTypeIcon(type: DocumentType): string {
  return DOCUMENT_TYPE_CONFIG[type]?.icon || '📄';
}

/**
 * Get description for document type
 */
export function getDocumentTypeDescription(type: DocumentType): string {
  return DOCUMENT_TYPE_CONFIG[type]?.description || '';
}

/**
 * Format file size in bytes to human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get badge variant based on document status
 */
export function getDocumentStatusVariant(
  status: string
): 'default' | 'secondary' | 'outline' {
  switch (status) {
    case 'active':
      return 'default';
    case 'archived':
      return 'secondary';
    default:
      return 'outline';
  }
}

/**
 * Format mime type to readable format
 */
export function formatMimeType(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    'application/pdf': 'PDF',
    'image/jpeg': 'JPEG',
    'image/jpg': 'JPG',
    'image/png': 'PNG',
    'application/msword': 'DOC',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'DOCX',
    'application/vnd.ms-excel': 'XLS',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'XLSX',
  };

  return mimeMap[mimeType] || mimeType.split('/')[1]?.toUpperCase() || 'FILE';
}
