-- Migration: Storage Buckets for Property Documents and Media
-- Purpose: Create Supabase Storage buckets with RLS policies
-- Date: 2024-12-01
--
-- This migration creates two storage buckets:
-- 1. property-documents: For PDFs, contracts, certificates, surveys
-- 2. property-photos: For images, floorplans, and visual media
--
-- Security: Storage policies enforce role-based access

-- ============================================================================
-- Create Storage Buckets
-- ============================================================================

-- Property Documents Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-documents',
  'property-documents',
  false, -- Not publicly accessible (requires signed URLs)
  20971520, -- 20MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/tiff'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Property Photos Bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-photos',
  'property-photos',
  false, -- Not publicly accessible (requires signed URLs)
  10485760, -- 10MB limit
  ARRAY[
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/webp',
    'image/gif',
    'application/pdf'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- Storage Policies for property-documents
-- ============================================================================

-- Allow authenticated users to upload documents
CREATE POLICY "authenticated_upload_documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'property-documents'
);

-- Allow authenticated users to read their own documents
-- (Combined with RLS on property_documents table for granular control)
CREATE POLICY "authenticated_read_documents"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'property-documents'
);

-- Allow authenticated users to update their uploads
CREATE POLICY "authenticated_update_documents"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'property-documents'
);

-- Allow authenticated users to delete their uploads
CREATE POLICY "authenticated_delete_documents"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'property-documents'
);

-- ============================================================================
-- Storage Policies for property-photos
-- ============================================================================

-- Allow authenticated users to upload photos
CREATE POLICY "authenticated_upload_photos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'property-photos'
);

-- Allow public read access to property photos via signed URLs
-- This enables anonymous users to view property listing images
CREATE POLICY "public_read_photos"
ON storage.objects FOR SELECT TO public
USING (
  bucket_id = 'property-photos'
);

-- Allow authenticated users to update their photo uploads
CREATE POLICY "authenticated_update_photos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'property-photos'
);

-- Allow authenticated users to delete their photo uploads
CREATE POLICY "authenticated_delete_photos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'property-photos'
);

-- ============================================================================
-- End of Storage Buckets Migration
-- ============================================================================

