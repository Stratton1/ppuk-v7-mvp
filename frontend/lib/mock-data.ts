import { DashboardRole } from '@/lib/roles/domain';

export type MockUser = {
  id: string;
  email: string;
  full_name: string;
  primary_role: DashboardRole | 'consumer' | 'surveyor';
};

export type MockProperty = {
  id: string;
  display_address: string;
  uprn: string;
  status: string;
  public_visibility: boolean;
  public_slug: string | null;
  completion?: number;
  imageUrl?: string | null;
};

export type MockDocument = {
  id: string;
  property_id: string;
  title: string;
  document_type: string;
  storage_path: string;
  storage_bucket: string;
  created_at: string;
};

export type MockMedia = {
  id: string;
  property_id: string;
  media_type: string;
  storage_path: string;
  storage_bucket: string;
  created_at: string;
};

export type MockIssue = {
  id: string;
  property_id: string;
  title: string;
  status: string;
  severity: string;
  created_at: string;
};

export const MOCK_USERS: MockUser[] = [
  { id: 'u-owner', email: 'owner.test@ppuk.test', full_name: 'Owner Test', primary_role: 'owner' as DashboardRole },
  { id: 'u-buyer', email: 'buyer.test@ppuk.test', full_name: 'Buyer Test', primary_role: 'buyer' as DashboardRole },
  { id: 'u-agent', email: 'agent.test@ppuk.test', full_name: 'Agent Test', primary_role: 'agent' },
  { id: 'u-conv', email: 'conveyancer.test@ppuk.test', full_name: 'Conveyancer Test', primary_role: 'conveyancer' },
  { id: 'u-surveyor', email: 'surveyor.test@ppuk.test', full_name: 'Surveyor Test', primary_role: 'surveyor' },
  { id: 'u-admin', email: 'admin.test@ppuk.test', full_name: 'Admin Test', primary_role: 'admin' },
];

export const MOCK_PROPERTIES: MockProperty[] = [
  {
    id: 'prop-1',
    display_address: '12 Elgin Avenue, London W9',
    uprn: 'UPRN-ELGIN-12',
    status: 'active',
    public_visibility: true,
    public_slug: 'elgin-avenue-12',
    completion: 82,
    imageUrl: '/placeholder.svg',
  },
  {
    id: 'prop-2',
    display_address: '5 Baker Street, London NW1',
    uprn: 'UPRN-BAKER-5',
    status: 'draft',
    public_visibility: false,
    public_slug: null,
    completion: 45,
    imageUrl: '/placeholder.svg',
  },
];

export const MOCK_DOCUMENTS: MockDocument[] = [
  {
    id: 'doc-1',
    property_id: 'prop-1',
    title: 'EPC Certificate',
    document_type: 'environmental',
    storage_path: 'prop-1/doc-1.pdf',
    storage_bucket: 'property-documents',
    created_at: new Date().toISOString(),
  },
];

export const MOCK_MEDIA: MockMedia[] = [
  {
    id: 'media-1',
    property_id: 'prop-1',
    media_type: 'photo',
    storage_path: 'prop-1/media-1.jpg',
    storage_bucket: 'property-photos',
    created_at: new Date().toISOString(),
  },
];

export const MOCK_ISSUES: MockIssue[] = [
  {
    id: 'issue-1',
    property_id: 'prop-1',
    title: 'Gas safety check due',
    status: 'open',
    severity: 'medium',
    created_at: new Date().toISOString(),
  },
];

export const DEFAULT_MOCK_USER_ID = 'u-owner';
