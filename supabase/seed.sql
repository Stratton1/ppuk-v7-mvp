-- Property Passport UK v7.0 - Comprehensive Seed Data
-- Purpose: Generate realistic test dataset for development and testing
-- Source: /docs/RLS_POLICY_PLAN.md
-- Compatible with: All migrations in /supabase/migrations
-- 
-- This seed file creates:
-- - 10 test users across all roles (admin, owners, buyers, agents, conveyancers, surveyor)
-- - 3 realistic UK properties
-- - Property role assignments with expiry dates
-- - 8+ documents with realistic types
-- - 6+ photos per property
-- - Property flags, events, and audit logs
--
-- Usage: Applied automatically during `supabase db reset`
-- Note: RLS is temporarily disabled during seeding to allow system-level inserts

-- ============================================================================
-- STEP 1: DISABLE RLS TEMPORARILY FOR SEEDING
-- ============================================================================
-- RLS policies prevent direct inserts. We disable them for seeding, then re-enable.
-- ============================================================================

ALTER TABLE public.properties DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_media DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_extended DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_property_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_flags DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;


-- ============================================================================
-- STEP 2: CREATE TEST USERS IN AUTH.USERS
-- ============================================================================
-- These are Supabase Auth users with deterministic UUIDs for easy reference.
-- Password for all test users: "TestPassword123!"
-- ============================================================================

-- Clear existing test data (if any)
DELETE FROM auth.users WHERE email LIKE '%@ppuk.test';

-- Insert test users into auth.users
-- Note: encrypted_password is bcrypt hash of "TestPassword123!"
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  confirmation_token,
  recovery_token,
  email_change_token_new
) VALUES
-- Owner 1: Alice Johnson
(
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'alice.owner@ppuk.test',
  '$2a$10$rKvVw2KJYJYk5FVYHq7OL.HqNp0YXwTVqGYzBqKJ4LmJC1pxK8qwi',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Alice Johnson"}',
  false,
  '',
  '',
  ''
),
-- Owner 2: Robert Smith
(
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'robert.owner@ppuk.test',
  '$2a$10$rKvVw2KJYJYk5FVYHq7OL.HqNp0YXwTVqGYzBqKJ4LmJC1pxK8qwi',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Robert Smith"}',
  false,
  '',
  '',
  ''
),
-- Buyer 1: Emma Wilson
(
  '33333333-3333-3333-3333-333333333333',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'emma.buyer@ppuk.test',
  '$2a$10$rKvVw2KJYJYk5FVYHq7OL.HqNp0YXwTVqGYzBqKJ4LmJC1pxK8qwi',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Emma Wilson"}',
  false,
  '',
  '',
  ''
),
-- Buyer 2: James Brown
(
  '44444444-4444-4444-4444-444444444444',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'james.buyer@ppuk.test',
  '$2a$10$rKvVw2KJYJYk5FVYHq7OL.HqNp0YXwTVqGYzBqKJ4LmJC1pxK8qwi',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"James Brown"}',
  false,
  '',
  '',
  ''
),
-- Estate Agent 1: Sarah Miller
(
  '55555555-5555-5555-5555-555555555555',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'sarah.agent@ppuk.test',
  '$2a$10$rKvVw2KJYJYk5FVYHq7OL.HqNp0YXwTVqGYzBqKJ4LmJC1pxK8qwi',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Sarah Miller"}',
  false,
  '',
  '',
  ''
),
-- Estate Agent 2: David Taylor
(
  '66666666-6666-6666-6666-666666666666',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'david.agent@ppuk.test',
  '$2a$10$rKvVw2KJYJYk5FVYHq7OL.HqNp0YXwTVqGYzBqKJ4LmJC1pxK8qwi',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"David Taylor"}',
  false,
  '',
  '',
  ''
),
-- Conveyancer 1: Laura Anderson
(
  '77777777-7777-7777-7777-777777777777',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'laura.conveyancer@ppuk.test',
  '$2a$10$rKvVw2KJYJYk5FVYHq7OL.HqNp0YXwTVqGYzBqKJ4LmJC1pxK8qwi',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Laura Anderson"}',
  false,
  '',
  '',
  ''
),
-- Conveyancer 2: Michael Thomas
(
  '88888888-8888-8888-8888-888888888888',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'michael.conveyancer@ppuk.test',
  '$2a$10$rKvVw2KJYJYk5FVYHq7OL.HqNp0YXwTVqGYzBqKJ4LmJC1pxK8qwi',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Michael Thomas"}',
  false,
  '',
  '',
  ''
),
-- Surveyor: Jennifer Martin
(
  '99999999-9999-9999-9999-999999999999',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'jennifer.surveyor@ppuk.test',
  '$2a$10$rKvVw2KJYJYk5FVYHq7OL.HqNp0YXwTVqGYzBqKJ4LmJC1pxK8qwi',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"Jennifer Martin"}',
  false,
  '',
  '',
  ''
),
-- System Admin: Admin User
(
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@ppuk.test',
  '$2a$10$rKvVw2KJYJYk5FVYHq7OL.HqNp0YXwTVqGYzBqKJ4LmJC1pxK8qwi',
  NOW(),
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"full_name":"System Administrator"}',
  true,
  '',
  '',
  ''
);


-- ============================================================================
-- STEP 3: CREATE USER EXTENDED PROFILES
-- ============================================================================
-- Extended user information for all test users
-- ============================================================================

INSERT INTO public.users_extended (
  id,
  user_id,
  full_name,
  phone,
  organisation,
  primary_role,
  avatar_url,
  created_at,
  updated_at
) VALUES
-- Alice Johnson (Owner)
(
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  'Alice Johnson',
  '+44 7700 900001',
  NULL,
  'owner',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
  NOW(),
  NOW()
),
-- Robert Smith (Owner)
(
  gen_random_uuid(),
  '22222222-2222-2222-2222-222222222222',
  'Robert Smith',
  '+44 7700 900002',
  NULL,
  'owner',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
  NOW(),
  NOW()
),
-- Emma Wilson (Buyer)
(
  gen_random_uuid(),
  '33333333-3333-3333-3333-333333333333',
  'Emma Wilson',
  '+44 7700 900003',
  NULL,
  'buyer',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
  NOW(),
  NOW()
),
-- James Brown (Buyer)
(
  gen_random_uuid(),
  '44444444-4444-4444-4444-444444444444',
  'James Brown',
  '+44 7700 900004',
  NULL,
  'buyer',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
  NOW(),
  NOW()
),
-- Sarah Miller (Estate Agent)
(
  gen_random_uuid(),
  '55555555-5555-5555-5555-555555555555',
  'Sarah Miller',
  '+44 7700 900005',
  'Premier Properties Ltd',
  'agent',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  NOW(),
  NOW()
),
-- David Taylor (Estate Agent)
(
  gen_random_uuid(),
  '66666666-6666-6666-6666-666666666666',
  'David Taylor',
  '+44 7700 900006',
  'London Estates Group',
  'agent',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
  NOW(),
  NOW()
),
-- Laura Anderson (Conveyancer)
(
  gen_random_uuid(),
  '77777777-7777-7777-7777-777777777777',
  'Laura Anderson',
  '+44 7700 900007',
  'Anderson & Partners Solicitors',
  'conveyancer',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Laura',
  NOW(),
  NOW()
),
-- Michael Thomas (Conveyancer)
(
  gen_random_uuid(),
  '88888888-8888-8888-8888-888888888888',
  'Michael Thomas',
  '+44 7700 900008',
  'Thomas Legal Services',
  'conveyancer',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
  NOW(),
  NOW()
),
-- Jennifer Martin (Surveyor)
(
  gen_random_uuid(),
  '99999999-9999-9999-9999-999999999999',
  'Jennifer Martin',
  '+44 7700 900009',
  'Martin Property Surveys',
  'surveyor',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer',
  NOW(),
  NOW()
),
-- System Admin
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'System Administrator',
  '+44 7700 900000',
  'Property Passport UK',
  'admin',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
  NOW(),
  NOW()
);


-- ============================================================================
-- STEP 4: CREATE PROPERTIES
-- ============================================================================
-- 3 realistic UK properties in London
-- ============================================================================

INSERT INTO public.properties (
  id,
  uprn,
  display_address,
  latitude,
  longitude,
  status,
  created_by_user_id,
  created_at,
  updated_at
) VALUES
-- Property 1: 12A Elgin Avenue, W9 3QP (Alice's property)
(
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '100023336633',
  '12A Elgin Avenue, Maida Vale, London W9 3QP',
  51.529899,
  -0.193567,
  'active',
  '11111111-1111-1111-1111-111111111111',
  NOW(),
  NOW()
),
-- Property 2: 101 Chamberlayne Road, NW10 3NS (Robert's property)
(
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '100023445544',
  '101 Chamberlayne Road, Kensal Rise, London NW10 3NS',
  51.534221,
  -0.220334,
  'active',
  '22222222-2222-2222-2222-222222222222',
  NOW(),
  NOW()
),
-- Property 3: 4 Queen's Park Terrace, W10 4RP (Alice's second property)
(
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '100023556655',
  '4 Queen''s Park Terrace, Queen''s Park, London W10 4RP',
  51.533556,
  -0.207889,
  'active',
  '11111111-1111-1111-1111-111111111111',
  NOW(),
  NOW()
);


-- ============================================================================
-- STEP 5: ASSIGN PROPERTY ROLES
-- ============================================================================
-- Connect users to properties with appropriate roles and expiry dates
-- ============================================================================

INSERT INTO public.user_property_roles (
  id,
  user_id,
  property_id,
  role,
  granted_by_user_id,
  granted_at,
  expires_at,
  created_at,
  updated_at
) VALUES
-- Property 1 (12A Elgin Avenue) roles
-- Alice is owner
(
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'owner',
  NULL,
  NOW(),
  NULL,
  NOW(),
  NOW()
),
-- Emma is buyer (expires in 60 days)
(
  gen_random_uuid(),
  '33333333-3333-3333-3333-333333333333',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'buyer',
  '11111111-1111-1111-1111-111111111111',
  NOW(),
  NOW() + INTERVAL '60 days',
  NOW(),
  NOW()
),
-- Sarah is agent (expires in 90 days)
(
  gen_random_uuid(),
  '55555555-5555-5555-5555-555555555555',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'agent',
  '11111111-1111-1111-1111-111111111111',
  NOW(),
  NOW() + INTERVAL '90 days',
  NOW(),
  NOW()
),
-- Laura is conveyancer (expires in 90 days)
(
  gen_random_uuid(),
  '77777777-7777-7777-7777-777777777777',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'conveyancer',
  '11111111-1111-1111-1111-111111111111',
  NOW(),
  NOW() + INTERVAL '90 days',
  NOW(),
  NOW()
),
-- Jennifer is surveyor (expires in 30 days)
(
  gen_random_uuid(),
  '99999999-9999-9999-9999-999999999999',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  'surveyor',
  '11111111-1111-1111-1111-111111111111',
  NOW(),
  NOW() + INTERVAL '30 days',
  NOW(),
  NOW()
),

-- Property 2 (101 Chamberlayne Road) roles
-- Robert is owner
(
  gen_random_uuid(),
  '22222222-2222-2222-2222-222222222222',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'owner',
  NULL,
  NOW(),
  NULL,
  NOW(),
  NOW()
),
-- James is buyer (expires in 45 days)
(
  gen_random_uuid(),
  '44444444-4444-4444-4444-444444444444',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'buyer',
  '22222222-2222-2222-2222-222222222222',
  NOW(),
  NOW() + INTERVAL '45 days',
  NOW(),
  NOW()
),
-- David is agent (no expiry)
(
  gen_random_uuid(),
  '66666666-6666-6666-6666-666666666666',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'agent',
  '22222222-2222-2222-2222-222222222222',
  NOW(),
  NULL,
  NOW(),
  NOW()
),
-- Michael is conveyancer (expires in 60 days)
(
  gen_random_uuid(),
  '88888888-8888-8888-8888-888888888888',
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  'conveyancer',
  '22222222-2222-2222-2222-222222222222',
  NOW(),
  NOW() + INTERVAL '60 days',
  NOW(),
  NOW()
),

-- Property 3 (4 Queen's Park Terrace) roles
-- Alice is owner
(
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'owner',
  NULL,
  NOW(),
  NULL,
  NOW(),
  NOW()
),
-- Sarah is agent (different property, same agent)
(
  gen_random_uuid(),
  '55555555-5555-5555-5555-555555555555',
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  'agent',
  '11111111-1111-1111-1111-111111111111',
  NOW(),
  NOW() + INTERVAL '90 days',
  NOW(),
  NOW()
);


-- ============================================================================
-- STEP 6: CREATE DOCUMENTS
-- ============================================================================
-- Realistic documents for each property
-- Note: Schema allows these document_type values:
--   'title', 'survey', 'search', 'identity', 'contract', 'warranty', 
--   'planning', 'compliance', 'other'
-- EPC, Gas Safety, Electrical Safety are stored as 'compliance' type
-- ============================================================================

INSERT INTO public.property_documents (
  id,
  property_id,
  uploaded_by_user_id,
  title,
  document_type,
  storage_bucket,
  storage_path,
  mime_type,
  size_bytes,
  version,
  checksum,
  status,
  created_at,
  updated_at
) VALUES
-- Property 1 Documents
-- Title deed (owner upload)
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  'Official Copy of Title Register - LN123456',
  'title',
  'property-documents',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/title/LN123456_title_deed.pdf',
  'application/pdf',
  2456789,
  1,
  'abc123def456ghi789jkl012mno345pqr678',
  'active',
  NOW(),
  NOW()
),
-- EPC certificate
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  'Energy Performance Certificate - Rating B (82)',
  'compliance',
  'property-documents',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/epc/epc_certificate_2024.pdf',
  'application/pdf',
  1234567,
  1,
  'epc789abc123def456ghi789jkl012mno345',
  'active',
  NOW(),
  NOW()
),
-- Homebuyers survey (surveyor upload)
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '99999999-9999-9999-9999-999999999999',
  'RICS Level 2 Homebuyer Survey Report',
  'survey',
  'property-documents',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/survey/homebuyer_survey_2024.pdf',
  'application/pdf',
  5678901,
  1,
  'survey456def789ghi012jkl345mno678pqr',
  'active',
  NOW(),
  NOW()
),
-- Gas safety certificate
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  'Gas Safety Certificate 2024',
  'compliance',
  'property-documents',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/compliance/gas_safety_2024.pdf',
  'application/pdf',
  345678,
  1,
  'gas123abc456def789ghi012jkl345mno678',
  'active',
  NOW(),
  NOW()
),
-- Electrical safety certificate
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  'Electrical Installation Condition Report (EICR)',
  'compliance',
  'property-documents',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/compliance/eicr_2024.pdf',
  'application/pdf',
  456789,
  1,
  'elec456def789ghi012jkl345mno678pqr90',
  'active',
  NOW(),
  NOW()
),

-- Property 2 Documents
-- Title deed
(
  gen_random_uuid(),
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '22222222-2222-2222-2222-222222222222',
  'Official Copy of Title Register - NGL987654',
  'title',
  'property-documents',
  'cccccccc-cccc-cccc-cccc-cccccccccccc/title/NGL987654_title_deed.pdf',
  'application/pdf',
  2345678,
  1,
  'title789ghi012jkl345mno678pqr901stu23',
  'active',
  NOW(),
  NOW()
),
-- Conveyancing contract (conveyancer upload)
(
  gen_random_uuid(),
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '88888888-8888-8888-8888-888888888888',
  'Draft Contract of Sale',
  'contract',
  'property-documents',
  'cccccccc-cccc-cccc-cccc-cccccccccccc/legal/draft_contract_2024.pdf',
  'application/pdf',
  3456789,
  2,
  'contract012jkl345mno678pqr901stu234vwx',
  'active',
  NOW(),
  NOW()
),
-- Planning permission
(
  gen_random_uuid(),
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '66666666-6666-6666-6666-666666666666',
  'Planning Permission - Loft Conversion',
  'planning',
  'property-documents',
  'cccccccc-cccc-cccc-cccc-cccccccccccc/planning/loft_planning_2023.pdf',
  'application/pdf',
  1234567,
  1,
  'planning345mno678pqr901stu234vwx567y',
  'active',
  NOW(),
  NOW()
),

-- Property 3 Documents
-- Warranty certificate
(
  gen_random_uuid(),
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '11111111-1111-1111-1111-111111111111',
  '10 Year Structural Warranty',
  'warranty',
  'property-documents',
  'dddddddd-dddd-dddd-dddd-dddddddddddd/warranty/structural_warranty_2020.pdf',
  'application/pdf',
  987654,
  1,
  'warranty678pqr901stu234vwx567yz890abc',
  'active',
  NOW(),
  NOW()
);


-- ============================================================================
-- STEP 7: CREATE PROPERTY MEDIA (PHOTOS)
-- ============================================================================
-- 6+ photos per property including featured front elevation
-- Using placeholder image URLs from Unsplash
-- ============================================================================

INSERT INTO public.property_media (
  id,
  property_id,
  uploaded_by_user_id,
  media_type,
  title,
  storage_bucket,
  storage_path,
  mime_type,
  size_bytes,
  checksum,
  status,
  created_at,
  updated_at
) VALUES
-- Property 1 Photos
-- Featured front elevation
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  'photo',
  'Front Elevation - Street View',
  'property-photos',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/exterior/front_view_001.jpg',
  'image/jpeg',
  3456789,
  'photo001abc123def456ghi789jkl012mno',
  'active',
  NOW(),
  NOW()
),
-- Living room
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '55555555-5555-5555-5555-555555555555',
  'photo',
  'Living Room with Bay Window',
  'property-photos',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/interior/living_room_001.jpg',
  'image/jpeg',
  2345678,
  'photo002def456ghi789jkl012mno345pqr',
  'active',
  NOW(),
  NOW()
),
-- Kitchen
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '55555555-5555-5555-5555-555555555555',
  'photo',
  'Modern Fitted Kitchen',
  'property-photos',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/interior/kitchen_001.jpg',
  'image/jpeg',
  2876543,
  'photo003ghi789jkl012mno345pqr678stu',
  'active',
  NOW(),
  NOW()
),
-- Master bedroom
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '55555555-5555-5555-5555-555555555555',
  'photo',
  'Master Bedroom with En-Suite',
  'property-photos',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/interior/bedroom_master_001.jpg',
  'image/jpeg',
  2654321,
  'photo004jkl012mno345pqr678stu901vwx',
  'active',
  NOW(),
  NOW()
),
-- Bathroom
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '55555555-5555-5555-5555-555555555555',
  'photo',
  'Family Bathroom',
  'property-photos',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/interior/bathroom_001.jpg',
  'image/jpeg',
  1987654,
  'photo005mno345pqr678stu901vwx234yz0',
  'active',
  NOW(),
  NOW()
),
-- Floorplan
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '55555555-5555-5555-5555-555555555555',
  'floorplan',
  'Ground and First Floor Plans',
  'property-photos',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/floorplan/floorplan_001.pdf',
  'application/pdf',
  1234567,
  'floor001pqr678stu901vwx234yz0567abc',
  'active',
  NOW(),
  NOW()
),

-- Property 2 Photos
(
  gen_random_uuid(),
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '22222222-2222-2222-2222-222222222222',
  'photo',
  'Victorian Facade - Front View',
  'property-photos',
  'cccccccc-cccc-cccc-cccc-cccccccccccc/exterior/front_view_001.jpg',
  'image/jpeg',
  3987654,
  'photo006stu901vwx234yz0567abc890def',
  'active',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '66666666-6666-6666-6666-666666666666',
  'photo',
  'Reception Room with Period Features',
  'property-photos',
  'cccccccc-cccc-cccc-cccc-cccccccccccc/interior/reception_001.jpg',
  'image/jpeg',
  2765432,
  'photo007vwx234yz0567abc890def123ghi',
  'active',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '66666666-6666-6666-6666-666666666666',
  'photo',
  'Open Plan Kitchen Dining',
  'property-photos',
  'cccccccc-cccc-cccc-cccc-cccccccccccc/interior/kitchen_dining_001.jpg',
  'image/jpeg',
  3123456,
  'photo008yz0567abc890def123ghi456jkl',
  'active',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '66666666-6666-6666-6666-666666666666',
  'photo',
  'Loft Bedroom with Velux Windows',
  'property-photos',
  'cccccccc-cccc-cccc-cccc-cccccccccccc/interior/loft_bedroom_001.jpg',
  'image/jpeg',
  2876543,
  'photo009abc890def123ghi456jkl789mno',
  'active',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '66666666-6666-6666-6666-666666666666',
  'photo',
  'Private Rear Garden',
  'property-photos',
  'cccccccc-cccc-cccc-cccc-cccccccccccc/exterior/garden_001.jpg',
  'image/jpeg',
  3345678,
  'photo010def123ghi456jkl789mno012pqr',
  'active',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '66666666-6666-6666-6666-666666666666',
  'floorplan',
  'All Floors Layout Plan',
  'property-photos',
  'cccccccc-cccc-cccc-cccc-cccccccccccc/floorplan/floorplan_001.pdf',
  'application/pdf',
  1456789,
  'floor002ghi456jkl789mno012pqr345stu',
  'active',
  NOW(),
  NOW()
),

-- Property 3 Photos
(
  gen_random_uuid(),
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '11111111-1111-1111-1111-111111111111',
  'photo',
  'Terraced House Front',
  'property-photos',
  'dddddddd-dddd-dddd-dddd-dddddddddddd/exterior/front_view_001.jpg',
  'image/jpeg',
  3234567,
  'photo011jkl789mno012pqr345stu678vwx',
  'active',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '55555555-5555-5555-5555-555555555555',
  'photo',
  'Spacious Living Dining Room',
  'property-photos',
  'dddddddd-dddd-dddd-dddd-dddddddddddd/interior/living_dining_001.jpg',
  'image/jpeg',
  2987654,
  'photo012mno012pqr345stu678vwx901yz0',
  'active',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '55555555-5555-5555-5555-555555555555',
  'photo',
  'Contemporary Kitchen',
  'property-photos',
  'dddddddd-dddd-dddd-dddd-dddddddddddd/interior/kitchen_001.jpg',
  'image/jpeg',
  2765432,
  'photo013pqr345stu678vwx901yz0234abc',
  'active',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '55555555-5555-5555-5555-555555555555',
  'photo',
  'Double Bedroom',
  'property-photos',
  'dddddddd-dddd-dddd-dddd-dddddddddddd/interior/bedroom_001.jpg',
  'image/jpeg',
  2543210,
  'photo014stu678vwx901yz0234abc567def',
  'active',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '55555555-5555-5555-5555-555555555555',
  'photo',
  'Shower Room',
  'property-photos',
  'dddddddd-dddd-dddd-dddd-dddddddddddd/interior/shower_room_001.jpg',
  'image/jpeg',
  1876543,
  'photo015vwx901yz0234abc567def890ghi',
  'active',
  NOW(),
  NOW()
),
(
  gen_random_uuid(),
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '55555555-5555-5555-5555-555555555555',
  'floorplan',
  'Two Floor Layout',
  'property-photos',
  'dddddddd-dddd-dddd-dddd-dddddddddddd/floorplan/floorplan_001.pdf',
  'application/pdf',
  1123456,
  'floor003yz0234abc567def890ghi123jkl',
  'active',
  NOW(),
  NOW()
);


-- ============================================================================
-- STEP 8: CREATE PROPERTY FLAGS
-- ============================================================================
-- Quality, compliance, and risk flags for properties
-- ============================================================================

INSERT INTO public.property_flags (
  id,
  property_id,
  created_by_user_id,
  flag_type,
  severity,
  status,
  description,
  created_at,
  updated_at
) VALUES
-- Property 1 - Data quality flag (resolved)
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  'data_quality',
  'low',
  'resolved',
  'Missing EPC expiry date - now updated with correct information',
  NOW() - INTERVAL '5 days',
  NOW()
),
-- Property 2 - Compliance flag (in review)
(
  gen_random_uuid(),
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '88888888-8888-8888-8888-888888888888',
  'compliance',
  'medium',
  'in_review',
  'Planning permission for loft conversion requires building control sign-off certificate',
  NOW() - INTERVAL '2 days',
  NOW()
),
-- Property 2 - Risk flag (open)
(
  gen_random_uuid(),
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '99999999-9999-9999-9999-999999999999',
  'risk',
  'medium',
  'open',
  'Survey identified minor damp issues in basement requiring treatment and guarantee',
  NOW() - INTERVAL '1 day',
  NOW()
);


-- ============================================================================
-- STEP 9: CREATE PROPERTY EVENTS
-- ============================================================================
-- Activity timeline for properties
-- ============================================================================

INSERT INTO public.property_events (
  id,
  property_id,
  actor_user_id,
  event_type,
  event_payload,
  created_at,
  updated_at
) VALUES
-- Property 1 Events
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  'created',
  '{"message": "Property registered in Property Passport UK system"}',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '30 days'
),
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  'document_uploaded',
  '{"document_type": "title", "title": "Official Copy of Title Register"}',
  NOW() - INTERVAL '28 days',
  NOW() - INTERVAL '28 days'
),
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '55555555-5555-5555-5555-555555555555',
  'media_uploaded',
  '{"media_count": 6, "message": "Property photos and floorplan uploaded"}',
  NOW() - INTERVAL '25 days',
  NOW() - INTERVAL '25 days'
),
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  'status_changed',
  '{"from": "draft", "to": "active", "reason": "Property listing ready"}',
  NOW() - INTERVAL '24 days',
  NOW() - INTERVAL '24 days'
),
(
  gen_random_uuid(),
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '99999999-9999-9999-9999-999999999999',
  'document_uploaded',
  '{"document_type": "survey", "title": "RICS Level 2 Homebuyer Survey Report"}',
  NOW() - INTERVAL '15 days',
  NOW() - INTERVAL '15 days'
),

-- Property 2 Events
(
  gen_random_uuid(),
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '22222222-2222-2222-2222-222222222222',
  'created',
  '{"message": "Property registered in Property Passport UK system"}',
  NOW() - INTERVAL '45 days',
  NOW() - INTERVAL '45 days'
),
(
  gen_random_uuid(),
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '66666666-6666-6666-6666-666666666666',
  'media_uploaded',
  '{"media_count": 6, "message": "Property photos uploaded by agent"}',
  NOW() - INTERVAL '40 days',
  NOW() - INTERVAL '40 days'
),
(
  gen_random_uuid(),
  'cccccccc-cccc-cccc-cccc-cccccccccccc',
  '22222222-2222-2222-2222-222222222222',
  'status_changed',
  '{"from": "draft", "to": "active"}',
  NOW() - INTERVAL '38 days',
  NOW() - INTERVAL '38 days'
),

-- Property 3 Events
(
  gen_random_uuid(),
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '11111111-1111-1111-1111-111111111111',
  'created',
  '{"message": "Second property added to portfolio"}',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '20 days'
),
(
  gen_random_uuid(),
  'dddddddd-dddd-dddd-dddd-dddddddddddd',
  '55555555-5555-5555-5555-555555555555',
  'media_uploaded',
  '{"media_count": 6, "message": "Property photography completed"}',
  NOW() - INTERVAL '18 days',
  NOW() - INTERVAL '18 days'
);


-- ============================================================================
-- STEP 10: CREATE AUDIT LOGS
-- ============================================================================
-- System-wide audit trail of sensitive actions
-- ============================================================================

INSERT INTO public.audit_logs (
  id,
  actor_user_id,
  action,
  resource_type,
  resource_id,
  resource_path,
  ip_address,
  user_agent,
  metadata,
  created_at,
  updated_at
) VALUES
-- User registration events
(
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  'create',
  'user',
  '11111111-1111-1111-1111-111111111111',
  '/auth/register',
  '192.168.1.100'::inet,
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  '{"email": "alice.owner@ppuk.test", "role": "owner"}',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '30 days'
),
-- Property creation
(
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  'create',
  'property',
  'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
  '/properties',
  '192.168.1.100'::inet,
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  '{"uprn": "100023336633", "address": "12A Elgin Avenue"}',
  NOW() - INTERVAL '30 days',
  NOW() - INTERVAL '30 days'
),
-- Document upload
(
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  'upload',
  'document',
  NULL,
  '/properties/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/documents',
  '192.168.1.100'::inet,
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  '{"document_type": "title", "size_bytes": 2456789}',
  NOW() - INTERVAL '28 days',
  NOW() - INTERVAL '28 days'
),
-- Role grant (buyer access)
(
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  'create',
  'role',
  NULL,
  '/properties/bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb/roles',
  '192.168.1.100'::inet,
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  '{"granted_to": "emma.buyer@ppuk.test", "role": "buyer", "expires_in_days": 60}',
  NOW() - INTERVAL '20 days',
  NOW() - INTERVAL '20 days'
),
-- Admin login
(
  gen_random_uuid(),
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  'login',
  'auth',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '/auth/login',
  '192.168.1.50'::inet,
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
  '{"email": "admin@ppuk.test", "role": "admin", "method": "password"}',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
);


-- ============================================================================
-- STEP 11: RE-ENABLE ROW LEVEL SECURITY
-- ============================================================================
-- Security policies are now active again
-- ============================================================================

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_extended ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_property_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;


-- ============================================================================
-- SEED DATA SUMMARY
-- ============================================================================
-- 
-- TEST USERS CREATED:
-- - alice.owner@ppuk.test       (Owner - ID: 11111111-1111-1111-1111-111111111111)
-- - robert.owner@ppuk.test      (Owner - ID: 22222222-2222-2222-2222-222222222222)
-- - emma.buyer@ppuk.test        (Buyer - ID: 33333333-3333-3333-3333-333333333333)
-- - james.buyer@ppuk.test       (Buyer - ID: 44444444-4444-4444-4444-444444444444)
-- - sarah.agent@ppuk.test       (Agent - ID: 55555555-5555-5555-5555-555555555555)
-- - david.agent@ppuk.test       (Agent - ID: 66666666-6666-6666-6666-666666666666)
-- - laura.conveyancer@ppuk.test (Conveyancer - ID: 77777777-7777-7777-7777-777777777777)
-- - michael.conveyancer@ppuk.test (Conveyancer - ID: 88888888-8888-8888-8888-888888888888)
-- - jennifer.surveyor@ppuk.test (Surveyor - ID: 99999999-9999-9999-9999-999999999999)
-- - admin@ppuk.test             (Admin - ID: aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa)
--
-- Password for all users: TestPassword123!
--
-- PROPERTIES CREATED:
-- - 12A Elgin Avenue, W9 3QP (ID: bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb)
-- - 101 Chamberlayne Road, NW10 3NS (ID: cccccccc-cccc-cccc-cccc-cccccccccccc)
-- - 4 Queen's Park Terrace, W10 4RP (ID: dddddddd-dddd-dddd-dddd-dddddddddddd)
--
-- DATA COUNTS:
-- - 10 users (auth.users + users_extended)
-- - 3 properties
-- - 11 role assignments (user_property_roles)
-- - 9 documents (various types)
-- - 18 photos/media items
-- - 3 flags
-- - 10 events
-- - 5 audit logs
--
-- READY FOR TESTING:
-- - RLS policies are active
-- - Role-based access working
-- - Time-bound access (expiry dates set)
-- - Document access matrix implemented
-- - Public property data accessible
-- - Audit trail active
-- ============================================================================
