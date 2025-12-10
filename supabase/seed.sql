-- PPUK v7 Seed Data (v7 schema only)
-- Minimal, RLS-safe seed for users, properties, stakeholders, media, documents, tasks, events.

-- Disable RLS during seed
alter table public.users disable row level security;
alter table public.profiles disable row level security;
alter table public.roles disable row level security;
alter table public.user_roles disable row level security;
alter table public.properties disable row level security;
alter table public.property_stakeholders disable row level security;
alter table public.documents disable row level security;
alter table public.document_versions disable row level security;
alter table public.media disable row level security;
alter table public.notifications disable row level security;
alter table public.activity_log disable row level security;
alter table public.property_events disable row level security;
alter table public.property_metadata disable row level security;
alter table public.invitations disable row level security;
alter table public.tasks disable row level security;

-- Clear existing data
delete from public.property_events;
delete from public.tasks;
delete from public.media;
delete from public.documents;
delete from public.property_stakeholders;
delete from public.properties;
delete from public.user_roles;
delete from public.roles;
delete from public.profiles;
delete from public.users;
delete from auth.users where email like '%@ppuk.test';

-- Test auth users (password hash for "TestPassword123!")
insert into auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, created_at, updated_at, raw_app_meta_data, raw_user_meta_data, is_super_admin)
values
('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alice.owner@ppuk.test', '$2a$10$rKvVw2KJYJYk5FVYHq7OL.HqNp0YXwTVqGYzBqKJ4LmJC1pxK8qwi', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Alice Johnson"}', false),
('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'robert.agent@ppuk.test', '$2a$10$rKvVw2KJYJYk5FVYHq7OL.HqNp0YXwTVqGYzBqKJ4LmJC1pxK8qwi', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Robert Agent"}', false),
('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'clara.admin@ppuk.test', '$2a$10$rKvVw2KJYJYk5FVYHq7OL.HqNp0YXwTVqGYzBqKJ4LmJC1pxK8qwi', now(), now(), now(), '{"provider":"email","providers":["email"]}', '{"full_name":"Clara Admin"}', false);

-- Public.users (using new primary_role enum: consumer, agent, conveyancer, surveyor, admin)
insert into public.users (id, email, full_name, avatar_url, organisation, primary_role, created_at, updated_at) values
('11111111-1111-1111-1111-111111111111', 'alice.owner@ppuk.test', 'Alice Johnson', null, 'PPUK Test', 'consumer', now(), now()),
('22222222-2222-2222-2222-222222222222', 'robert.agent@ppuk.test', 'Robert Agent', null, 'PPUK Test', 'agent', now(), now()),
('33333333-3333-3333-3333-333333333333', 'clara.admin@ppuk.test', 'Clara Admin', null, 'PPUK Test', 'admin', now(), now());

-- Profiles
insert into public.profiles (id, user_id, phone, bio, created_at, updated_at) values
(gen_random_uuid(), '11111111-1111-1111-1111-111111111111', '+44 7000 000001', 'Owner profile', now(), now()),
(gen_random_uuid(), '22222222-2222-2222-2222-222222222222', '+44 7000 000002', 'Agent profile', now(), now()),
(gen_random_uuid(), '33333333-3333-3333-3333-333333333333', '+44 7000 000003', 'Admin profile', now(), now());

-- Properties
insert into public.properties (id, uprn, display_address, latitude, longitude, status, created_by_user_id, public_slug, public_visibility, created_at, updated_at)
values
('aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '100023400001', '10 High Street, London', 51.5007, -0.1246, 'active', '11111111-1111-1111-1111-111111111111', '10-high-street-london', true, now(), now()),
('aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '100023400002', '22 Baker Street, London', 51.5237, -0.1585, 'draft', '11111111-1111-1111-1111-111111111111', '22-baker-street-london', false, now(), now());

-- Stakeholders (using new status/permission model: status=owner/buyer/tenant, permission=editor/viewer)
insert into public.property_stakeholders (user_id, property_id, role, status, permission, granted_by_user_id, granted_at, expires_at, created_at, updated_at) values
('11111111-1111-1111-1111-111111111111', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'owner', 'owner', 'editor', '11111111-1111-1111-1111-111111111111', now(), null, now(), now()),
('22222222-2222-2222-2222-222222222222', 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'editor', null, 'editor', '11111111-1111-1111-1111-111111111111', now(), null, now(), now()),
('11111111-1111-1111-1111-111111111111', 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'owner', 'owner', 'editor', '11111111-1111-1111-1111-111111111111', now(), null, now(), now());

-- Media
insert into public.media (id, property_id, uploaded_by_user_id, media_type, title, storage_bucket, storage_path, mime_type, size_bytes, status, checksum, created_at, updated_at)
values
(gen_random_uuid(), 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'photo', 'Front elevation', 'property-photos', 'prop1/front.jpg', 'image/jpeg', 123456, 'active', null, now(), now()),
(gen_random_uuid(), 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'photo', 'Living room', 'property-photos', 'prop1/living.jpg', 'image/jpeg', 223456, 'active', null, now(), now()),
(gen_random_uuid(), 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'photo', 'Exterior', 'property-photos', 'prop2/exterior.jpg', 'image/jpeg', 323456, 'active', null, now(), now());

-- Documents
insert into public.documents (id, property_id, uploaded_by_user_id, title, document_type, storage_bucket, storage_path, mime_type, size_bytes, status, checksum, version, created_at, updated_at)
values
(gen_random_uuid(), 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'EPC Certificate', 'compliance', 'property-documents', 'prop1/epc.pdf', 'application/pdf', 102400, 'active', null, 1, now(), now()),
(gen_random_uuid(), 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'Floorplan', 'planning', 'property-documents', 'prop1/floorplan.pdf', 'application/pdf', 204800, 'active', null, 1, now(), now()),
(gen_random_uuid(), 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'Title Deed', 'title', 'property-documents', 'prop2/title.pdf', 'application/pdf', 304800, 'active', null, 1, now(), now());

-- Tasks
insert into public.tasks (id, property_id, title, description, status, priority, due_date, assigned_to_user_id, created_by_user_id, created_at, updated_at)
values
(gen_random_uuid(), 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Book surveyor', 'Arrange home survey', 'open', 'high', current_date + 7, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', now(), now()),
(gen_random_uuid(), 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Collect documents', 'Upload compliance documents', 'open', 'medium', current_date + 10, null, '11111111-1111-1111-1111-111111111111', now(), now());

-- Property events
insert into public.property_events (id, property_id, actor_user_id, event_type, event_payload, created_at, updated_at)
values
(gen_random_uuid(), 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'created', jsonb_build_object('created_source','seed'), now() - interval '2 days', now() - interval '2 days'),
(gen_random_uuid(), 'aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '22222222-2222-2222-2222-222222222222', 'media_uploaded', jsonb_build_object('file_name','front.jpg'), now() - interval '1 day', now() - interval '1 day'),
(gen_random_uuid(), 'aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'created', jsonb_build_object('created_source','seed'), now() - interval '1 day', now() - interval '1 day');

-- Re-enable RLS
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.roles enable row level security;
alter table public.user_roles enable row level security;
alter table public.properties enable row level security;
alter table public.property_stakeholders enable row level security;
alter table public.documents enable row level security;
alter table public.document_versions enable row level security;
alter table public.media enable row level security;
alter table public.notifications enable row level security;
alter table public.activity_log enable row level security;
alter table public.property_events enable row level security;
alter table public.property_metadata enable row level security;
alter table public.invitations enable row level security;
alter table public.tasks enable row level security;
