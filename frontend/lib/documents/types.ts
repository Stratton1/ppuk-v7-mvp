import { getSignedUrl } from '@/lib/signed-url';
import type { Database } from '@/types/supabase';

export type DocumentCategoryId =
  | 'ownership'
  | 'legal'
  | 'safety'
  | 'environmental'
  | 'surveys'
  | 'guarantees'
  | 'works'
  | 'planning'
  | 'insurance'
  | 'miscellaneous';

export interface DocumentCategory {
  id: DocumentCategoryId;
  label: string;
  description: string;
  allowedFileTypes?: string[];
}

export const DOCUMENT_CATEGORIES: DocumentCategory[] = [
  { id: 'ownership', label: 'Ownership', description: 'Title, deeds, ownership proof' },
  { id: 'legal', label: 'Legal', description: 'Contracts, conveyancing, legal notices' },
  { id: 'safety', label: 'Safety', description: 'Safety certificates, fire risk assessments' },
  { id: 'environmental', label: 'Environmental', description: 'EPC, flood, environmental reports' },
  { id: 'surveys', label: 'Surveys', description: 'Homebuyer reports, structural surveys' },
  { id: 'guarantees', label: 'Guarantees', description: 'Warranties, guarantees, service plans' },
  { id: 'works', label: 'Works', description: 'Works, maintenance, repairs evidence' },
  { id: 'planning', label: 'Planning', description: 'Planning permissions, building control' },
  { id: 'insurance', label: 'Insurance', description: 'Insurance policies, cover documents' },
  { id: 'miscellaneous', label: 'Miscellaneous', description: 'Other supporting documents' },
];

export interface UidDocument {
  id: string;
  propertyId: string;
  name: string;
  category: DocumentCategoryId;
  url: string | null;
  uploadedAt: string;
  uploadedBy: string | null;
  size?: number | null;
  mimeType?: string | null;
}

export function mapDocumentTypeToCategory(documentType?: string | null): DocumentCategoryId {
  const value = (documentType || '').toLowerCase();
  if (value === 'title' || value === 'ownership') return 'ownership';
  if (value === 'contract' || value === 'legal' || value === 'identity') return 'legal';
  if (value === 'safety' || value === 'compliance') return 'safety';
  if (value === 'epc' || value === 'environmental' || value === 'flood') return 'environmental';
  if (value === 'survey' || value === 'search') return 'surveys';
  if (value === 'warranty' || value === 'guarantee') return 'guarantees';
  if (value === 'works' || value === 'maintenance') return 'works';
  if (value === 'planning') return 'planning';
  if (value === 'insurance') return 'insurance';
  return 'miscellaneous';
}

export function documentCategoryLabel(category: DocumentCategoryId): string {
  return DOCUMENT_CATEGORIES.find((c) => c.id === category)?.label ?? 'Document';
}

type DocumentRow = Database['public']['Tables']['documents']['Row'];

export async function docRowToUidDocument(row: DocumentRow): Promise<UidDocument> {
  const signedUrl = row.storage_path
    ? await getSignedUrl(row.storage_bucket || 'property-documents', row.storage_path)
    : null;

  return {
    id: row.id,
    propertyId: row.property_id,
    name: row.title ?? 'Document',
    category: mapDocumentTypeToCategory(row.document_type),
    url: signedUrl,
    uploadedAt: row.created_at,
    uploadedBy: row.uploaded_by_user_id ?? null,
    size: row.size_bytes ?? null,
    mimeType: row.mime_type ?? null,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function storageObjectToUidDocument(propertyId: string, file: any): Promise<UidDocument> {
  const signedUrl = file.name ? await getSignedUrl(file.bucket ?? 'property-documents', file.name) : null;

  return {
    id: file.id ?? file.name,
    propertyId,
    name: file.name ?? 'Document',
    category: 'miscellaneous',
    url: signedUrl,
    uploadedAt: file.created_at ?? new Date().toISOString(),
    uploadedBy: file.metadata?.uploaded_by ?? null,
    size: file.metadata?.size ?? null,
    mimeType: file.metadata?.mimetype ?? null,
  };
}
