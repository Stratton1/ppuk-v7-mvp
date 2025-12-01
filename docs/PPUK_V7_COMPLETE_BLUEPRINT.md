# 🏠 Property Passport UK v7.0 - Complete Blueprint & Build Guide
## The Ultimate Implementation Guide for Cursor Agent & Codex Mode

> Deprecated in favour of `PPUK_V7_COMPLETE_BLUEPRINT_V2.md`; kept for historical context.

---

# 📑 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Business Context & Market Problem](#business-context)
3. [Platform Vision & Architecture](#platform-vision)
4. [Complete Technology Stack](#technology-stack)
5. [Database Schema - Full Specification](#database-schema)
6. [Free UK Government APIs - Complete List](#free-apis)
7. [User Roles & Permissions Matrix](#user-roles)
8. [Feature Breakdown & Implementation](#features)
9. [File Structure & Organization](#file-structure)
10. [Step-by-Step Build Plan for Cursor](#cursor-build-plan)
11. [Security & Compliance](#security)
12. [Testing Strategy](#testing)
13. [Deployment Guide](#deployment)

---

<a name="executive-summary"></a>
# 1. 📊 Executive Summary

## What is Property Passport UK?

**Property Passport UK (PPUK)** is a revolutionary digital platform that creates a permanent, comprehensive digital passport for every UK residential property. Each property is identified by its **UPRN (Unique Property Reference Number)** and contains:

- ✅ Complete property data from 30+ UK government data sources
- ✅ Secure document vault for all property-related documents
- ✅ Real-time environmental and risk data (EPC, flood, planning)
- ✅ Verified ownership history and transaction records
- ✅ Professional reports from surveyors, conveyancers, and agents
- ✅ AI-powered document analysis and insights
- ✅ Blockchain-backed data integrity (future phase)

## The Problem We're Solving

### Current UK Property Market Pain Points:

| Problem | Impact | PPUK Solution |
|---------|--------|---------------|
| **28.8% Transaction Failure Rate** | £270M wasted annually | Single source of verified property data |
| **6-Month Average Completion Time** | Buyer/seller frustration | Instant access to all property information |
| **Fragmented Data Sources** | 15+ different systems to check | Unified property passport with all data |
| **Document Loss & Duplication** | Repeated surveys & searches | Permanent secure document vault |
| **Manual Data Entry Errors** | Legal issues, delays | Automated API data collection |
| **No Property History Trail** | Incomplete due diligence | Complete chronological audit trail |

### Market Opportunity:

- 🏡 **1.2 million** UK property transactions per year
- 💷 **£1.8 billion** total market for property data services
- 🚀 **£450 per property** average data/search costs
- 📈 **100% digital transformation** opportunity in conveyancing

---

<a name="business-context"></a>
# 2. 🎯 Business Context & Market Problem

## 2.1 The UK Property Transaction Crisis

### Statistics:
- **Average completion time**: 6 months (vs. 30 days in some European countries)
- **Fall-through rate**: 28.8% of agreed sales fail
- **Cost of failures**: £270 million per year in wasted costs
- **Surveys per property**: Average 2.3 surveys commissioned per purchase
- **Search packs**: £300-600 per transaction for duplicate data

### Root Causes:
1. **Data Fragmentation**: Information scattered across 15+ government databases
2. **No Standard Format**: Each provider uses different formats and APIs
3. **Manual Processes**: 70% of conveyancing still paper-based
4. **Information Asymmetry**: Sellers know more than buyers
5. **Repeated Work**: Same searches and surveys repeated for each sale
6. **Trust Issues**: No independent verification of property claims

## 2.2 PPUK Business Model

### Revenue Streams:
1. **Property Passport Creation**: £99 one-time setup fee
2. **Annual Maintenance**: £29.99/year for data updates
3. **Transaction Facilitation**: £149 per property transaction
4. **Professional Subscriptions**: £299/month for agents, surveyors
5. **API Access**: £999/month for enterprise integrations
6. **White Label**: £2,499/month for lenders and insurers

### Value Proposition by User Type:

#### For Property Owners:
- ✅ Increase property value with complete documentation
- ✅ Faster sales (reduce time by 60%)
- ✅ Higher sale prices (complete transparency premium)
- ✅ Permanent property record (for life)

#### For Buyers:
- ✅ Instant access to all property information
- ✅ Confidence in purchase decisions
- ✅ Lower transaction costs (no duplicate searches)
- ✅ Complete transparency

#### For Professionals (Agents, Surveyors, Conveyancers):
- ✅ Faster deal completion (3x faster)
- ✅ Higher transaction volume
- ✅ Better client service
- ✅ Reduced liability with verified data

## 2.3 Competitive Landscape

### Direct Competitors:
- **Moverly**: Digital property logs (limited data sources)
- **LandTech**: Planning data focus (B2B only)
- **Rightmove**: Property listings (no document management)

### PPUK Differentiators:
1. ✅ **Most comprehensive data**: 30+ free government APIs
2. ✅ **UPRN-centric**: True property-level identification
3. ✅ **Document vault**: Secure lifetime storage
4. ✅ **Role-based access**: Multi-stakeholder collaboration
5. ✅ **API-first**: Integrate with any system
6. ✅ **Open data priority**: No vendor lock-in

---

<a name="platform-vision"></a>
# 3. 🚀 Platform Vision & Architecture

## 3.1 Core Principles

### 1. UPRN-Centric Architecture
Every property in the UK has a unique **UPRN (Unique Property Reference Number)** assigned by Ordnance Survey. PPUK uses UPRN as the primary identifier, ensuring:
- Absolute property identification (no address confusion)
- Direct linking to all government databases
- Future-proof (UPRNs never change)
- API compatibility with all UK data sources

### 2. API-First Design
All functionality exposed via REST APIs:
- Frontend is just one API consumer
- Third parties can integrate directly
- Microservices architecture ready
- Mobile apps share same backend

### 3. Security by Default
- Row Level Security (RLS) on all database tables
- Role-based access control (RBAC)
- End-to-end encryption for documents
- GDPR compliance built-in
- Audit trail for all actions

### 4. Real-Time Data Freshness
- Automated daily updates from government APIs
- Webhook notifications for data changes
- Cache invalidation strategies
- Event-driven architecture

## 3.2 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  React + TypeScript + Vite + TailwindCSS + Shadcn/UI           │
│  - Public Landing Page                                          │
│  - Authentication Pages (Login/Register)                        │
│  - Role-Based Dashboards (Owner/Buyer/Agent/Admin)            │
│  - Property Passport Pages (6-tab interface)                    │
│  - Document Vault                                               │
│  - Search & Discovery                                           │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTPS / WebSocket
                 │
┌────────────────▼────────────────────────────────────────────────┐
│                      API Gateway Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  Supabase Edge Functions (Deno runtime)                         │
│  - Authentication & Authorization                                │
│  - Rate Limiting & Caching                                      │
│  - Request Validation                                           │
│  - API Orchestration                                            │
└────────────────┬────────────────────────────────────────────────┘
                 │
    ┌────────────┴────────────┬──────────────────┐
    │                         │                  │
┌───▼──────────┐  ┌──────────▼─────┐  ┌────────▼──────────┐
│   Database   │  │  Storage Layer │  │  External APIs    │
│   Layer      │  │                │  │                   │
├──────────────┤  ├────────────────┤  ├───────────────────┤
│ PostgreSQL   │  │ Supabase       │  │ • EPC API         │
│ (Supabase)   │  │ Storage        │  │ • Flood Risk API  │
│              │  │                │  │ • HM Land Registry│
│ • Properties │  │ • Documents    │  │ • Planning Data   │
│ • Users      │  │ • Photos       │  │ • Postcodes.io    │
│ • Documents  │  │ • Reports      │  │ • OS Places       │
│ • Photos     │  │                │  │ • Police API      │
│ • Events     │  │ Buckets:       │  │ • Companies House │
│ • Parties    │  │ ✓ property-    │  │ • VOA (Council    │
│ • Tasks      │  │   documents    │  │   Tax)            │
│ • Notes      │  │ ✓ property-    │  │ • Environment     │
│ • API Cache  │  │   photos       │  │   Agency          │
│ • Audit Log  │  │ ✓ professional-│  │ • BGS (Geology)   │
│              │  │   reports      │  │ • +20 more        │
│ RLS Policies │  │ ✓ warranties   │  │                   │
│ Enabled      │  │                │  │ Cache TTL:        │
│              │  │ RLS Policies   │  │ 24hrs-7days       │
└──────────────┘  └────────────────┘  └───────────────────┘
```

## 3.3 System Components

### Frontend (React SPA)
- **Pages**: 15+ pages including landing, auth, dashboards, property passports
- **Components**: 100+ reusable UI components using Shadcn/UI
- **State Management**: TanStack React Query for server state
- **Routing**: React Router v6 with protected routes
- **Forms**: React Hook Form with Zod validation

### Backend (Supabase)
- **Database**: PostgreSQL with full ACID compliance
- **Authentication**: Built-in auth with JWT tokens
- **Storage**: Multi-bucket file storage with RLS
- **Edge Functions**: 30+ serverless functions for API integrations
- **Real-time**: WebSocket subscriptions for live updates

### External Integrations
- **30+ UK Government APIs**: Free data sources
- **Payment Processing**: Stripe integration (future)
- **Email**: SendGrid for notifications
- **Analytics**: PostHog for product analytics
- **Monitoring**: Sentry for error tracking

---

<a name="technology-stack"></a>
# 4. 💻 Complete Technology Stack

## 4.1 Frontend Stack

### Core Framework
```json
{
  "react": "^18.3.1",
  "typescript": "^5.8.3",
  "vite": "^5.4.19"
}
```

**Why these choices?**
- React 18: Most popular, excellent ecosystem, concurrent features
- TypeScript: Type safety, better developer experience, catch errors early
- Vite: Fastest build tool, HMR, optimized production builds

### UI & Styling
```json
{
  "@radix-ui/react-*": "^1.x.x",  // 25+ Radix UI primitives
  "tailwindcss": "^3.4.18",
  "tailwindcss-animate": "^1.0.7",
  "class-variance-authority": "^0.7.1",
  "clsx": "^2.1.1",
  "tailwind-merge": "^2.6.0"
}
```

**Component Library**: Shadcn/UI (copy-paste components, not npm package)
- Button, Dialog, Sheet, Tabs, Select, Input, Textarea
- Card, Badge, Avatar, Tooltip, Popover
- Command, Table, Form, Alert, Toast
- And 50+ more components

**Icons**: Lucide React (^0.462.0) - 1000+ icons

### State & Data Management
```json
{
  "@tanstack/react-query": "^5.83.0",
  "react-hook-form": "^7.61.1",
  "zod": "^3.25.76",
  "@hookform/resolvers": "^3.10.0"
}
```

**Data Flow**:
1. **React Query**: Server state, caching, background refetching
2. **React Hook Form**: Form state, validation
3. **Zod**: Schema validation (runtime + TypeScript)

### Routing & Navigation
```json
{
  "react-router-dom": "^6.30.1"
}
```

**Route Structure**:
- `/` - Landing page (public)
- `/auth` - Login/Register (public)
- `/search` - Property search (public)
- `/properties/:id` - Property passport (auth required)
- `/dashboard` - User dashboard (auth required)
- `/admin` - Admin panel (admin only)

### Date & Time
```json
{
  "date-fns": "^3.6.0",
  "react-day-picker": "^8.10.1"
}
```

### Charts & Visualization
```json
{
  "recharts": "^2.15.4"
}
```

Used for:
- Property value charts
- EPC rating visualizations
- Transaction history graphs
- Market trend analysis

## 4.2 Backend Stack

### Database
- **PostgreSQL** (via Supabase Cloud)
- Version: 15.x
- Extensions enabled:
  - `uuid-ossp`: UUID generation
  - `pg_trgm`: Full-text search
  - `postgis`: Geospatial data (lat/lng, polygons)

### Authentication
- **Supabase Auth** (built-in)
- Providers: Email/Password, Google OAuth (configured)
- JWT tokens with automatic refresh
- Row Level Security (RLS) integration

### Storage
- **Supabase Storage** (S3-compatible)
- Buckets:
  1. `property-photos` (PUBLIC) - Gallery images
  2. `property-documents` (PRIVATE) - Legal documents, EPCs, surveys
  3. `professional-reports` (PRIVATE) - Surveyor/valuation reports
  4. `warranties-guarantees` (PRIVATE) - FENSA, Gas Safe certificates
  5. `planning-docs` (PRIVATE) - Planning permissions

### Edge Functions (Serverless)
- **Runtime**: Deno (TypeScript native)
- **Deployment**: Supabase Edge Functions
- **30+ Functions** for API integrations

### API Client
```json
{
  "@supabase/supabase-js": "^2.58.0"
}
```

## 4.3 Development Tools

### Code Quality
```json
{
  "eslint": "^9.32.0",
  "prettier": "^3.3.3",
  "typescript-eslint": "^8.38.0"
}
```

### Testing
```json
{
  "@playwright/test": "^1.55.1"
}
```

**Test Coverage Targets**:
- Unit Tests: 80% coverage
- Integration Tests: Critical user flows
- E2E Tests: Main user journeys (login → create passport → upload document)

### Build & Deploy
- **Vite**: Development server + production builds
- **Vercel**: Frontend hosting (recommended)
- **Supabase Cloud**: Backend hosting

## 4.4 Environment Variables

```bash
# Frontend (.env.local)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Backend (Supabase Secrets - not in repo)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EPC_API_KEY=your-epc-api-key  # Optional
OS_PLACES_API_KEY=your-os-key  # Required for production
STRIPE_SECRET_KEY=your-stripe-key  # Future payments
```

---

<a name="database-schema"></a>
# 5. 🗄️ Database Schema - Complete Specification

## 5.1 Schema Overview

**Total Tables**: 16 core tables
**Total Enums**: 8 custom types
**RLS Policies**: 45+ policies
**Storage Buckets**: 5 buckets
**Edge Functions**: 30+ functions

## 5.2 Enums (Custom Types)

### `user_role` - System-wide user roles
```sql
CREATE TYPE user_role AS ENUM (
  'admin',        -- Full system access
  'owner',        -- Property owners
  'buyer',        -- Potential purchasers
  'tenant',       -- Property tenants
  'agent',        -- Estate agents
  'surveyor',     -- Property surveyors
  'conveyancer',  -- Legal professionals
  'lender',       -- Mortgage lenders
  'partner'       -- Business partners (API access)
);
```

### `property_party_role` - Property-specific roles
```sql
CREATE TYPE property_party_role AS ENUM (
  'owner',
  'purchaser',
  'tenant',
  'agent',
  'surveyor',
  'conveyancer',
  'solicitor',
  'mortgage_broker',
  'insurance_advisor'
);
```

### `document_type` - Document categories
```sql
CREATE TYPE document_type AS ENUM (
  'epc',              -- Energy Performance Certificate
  'title_deed',       -- Land Registry Title
  'survey',           -- Structural/Homebuyer Survey
  'floorplan',        -- Property floor plans
  'planning',         -- Planning permissions
  'building_regs',    -- Building regulations
  'warranty',         -- NHBC, warranties
  'insurance',        -- Insurance certificates
  'gas_safe',         -- Gas safety certificate
  'eicr',             -- Electrical certificate
  'fensa',            -- Window installation cert
  'lease',            -- Leasehold documents
  'searches',         -- Legal searches
  'offer',            -- Offer letters
  'contract',         -- Sale contracts
  'other'             -- Miscellaneous
);
```

### `document_status`
```sql
CREATE TYPE document_status AS ENUM (
  'uploading',
  'processing',
  'ready',
  'error',
  'archived'
);
```

### `task_status`
```sql
CREATE TYPE task_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'cancelled',
  'on_hold'
);
```

### `task_priority`
```sql
CREATE TYPE task_priority AS ENUM (
  'low',
  'medium',
  'high',
  'urgent'
);
```

### `note_visibility`
```sql
CREATE TYPE note_visibility AS ENUM (
  'private',   -- Only note creator
  'shared',    -- Property parties
  'public'     -- Anyone with property access
);
```

### `api_provider` - External API sources
```sql
CREATE TYPE api_provider AS ENUM (
  'epc',
  'flood',
  'planning',
  'postcodes',
  'osplaces',
  'inspire',
  'companies',
  'hmlr',
  'crime',
  'education',
  'voa',
  'bgs',        -- British Geological Survey
  'police',
  'transport'
);
```

### `audit_action`
```sql
CREATE TYPE audit_action AS ENUM (
  'create',
  'read',
  'update',
  'delete',
  'upload',
  'download',
  'share',
  'claim',
  'unclaim',
  'invite',
  'revoke'
);
```

## 5.3 Core Tables

### 1. `users` - Extended User Profiles
```sql
CREATE TABLE users (
  -- Primary key (linked to auth.users)
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic information
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'buyer',
  avatar_url TEXT,
  
  -- Professional information (for agents, surveyors, etc.)
  company_name TEXT,
  job_title TEXT,
  professional_registration_number TEXT,  -- SRA number, RICS number, etc.
  
  -- Address
  address_line_1 TEXT,
  address_line_2 TEXT,
  city TEXT,
  postcode TEXT,
  country TEXT DEFAULT 'UK',
  
  -- Preferences and metadata
  preferences JSONB DEFAULT '{}',  -- UI preferences, notification settings
  is_verified BOOLEAN DEFAULT FALSE,
  email_verified BOOLEAN DEFAULT FALSE,
  phone_verified BOOLEAN DEFAULT FALSE,
  
  -- Activity tracking
  last_login_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_postcode ON users(postcode);
```

**RLS Policies**:
```sql
-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

### 2. `properties` - Core Property Data
```sql
CREATE TABLE properties (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Unique identifiers
  uprn TEXT UNIQUE,  -- Unique Property Reference Number (OS)
  ppuk_reference TEXT UNIQUE NOT NULL,  -- PPUK-generated reference
  
  -- Address
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  address_line_3 TEXT,
  city TEXT NOT NULL,
  county TEXT,
  postcode TEXT NOT NULL,
  country TEXT DEFAULT 'United Kingdom',
  
  -- Geographic coordinates
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Property classification
  property_type TEXT,  -- Detached, Semi-detached, Terraced, Flat, Bungalow
  property_style TEXT,  -- Victorian, Edwardian, Modern, New Build
  tenure TEXT,  -- Freehold, Leasehold, Shared Ownership
  
  -- Physical characteristics
  bedrooms INTEGER,
  bathrooms INTEGER,
  reception_rooms INTEGER,
  total_rooms INTEGER,
  size_sqft INTEGER,
  size_sqm INTEGER,
  plot_size_sqft INTEGER,
  plot_size_sqm INTEGER,
  year_built INTEGER,
  
  -- Energy & Environmental
  epc_rating TEXT,  -- A, B, C, D, E, F, G
  epc_score INTEGER,  -- 1-100
  epc_certificate_url TEXT,
  epc_valid_until DATE,
  flood_risk_level TEXT,  -- Very Low, Low, Medium, High
  
  -- Financial
  council_tax_band TEXT,  -- A-H
  estimated_value INTEGER,
  last_sale_price INTEGER,
  last_sale_date DATE,
  
  -- Status & Visibility
  is_claimed BOOLEAN DEFAULT FALSE,
  claimed_by UUID REFERENCES users(id),
  claimed_at TIMESTAMPTZ,
  is_public BOOLEAN DEFAULT TRUE,  -- Visible in search results
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Metadata
  description TEXT,
  features TEXT[],  -- Array of features: 'garden', 'parking', 'garage'
  metadata JSONB DEFAULT '{}',
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Search optimization
  search_vector tsvector GENERATED ALWAYS AS (
    to_tsvector('english', 
      coalesce(address_line_1, '') || ' ' ||
      coalesce(city, '') || ' ' ||
      coalesce(postcode, '')
    )
  ) STORED
);

-- Indexes
CREATE INDEX idx_properties_uprn ON properties(uprn);
CREATE INDEX idx_properties_postcode ON properties(postcode);
CREATE INDEX idx_properties_claimed_by ON properties(claimed_by);
CREATE INDEX idx_properties_ppuk_ref ON properties(ppuk_reference);
CREATE INDEX idx_properties_location ON properties USING GIST (
  point(longitude, latitude)
);
CREATE INDEX idx_properties_search ON properties USING GIN (search_vector);
```

**RLS Policies**:
```sql
-- Anyone can view public properties
CREATE POLICY "Anyone can view public properties"
  ON properties FOR SELECT
  USING (is_public = TRUE OR claimed_by = auth.uid());

-- Only admins can insert properties
CREATE POLICY "Admins can insert properties"
  ON properties FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Owners can update their properties
CREATE POLICY "Owners can update their properties"
  ON properties FOR UPDATE
  USING (claimed_by = auth.uid());
```

### 3. `property_passports` - Passport Status & Scoring
```sql
CREATE TABLE property_passports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'UNVERIFIED',  -- UNVERIFIED, PARTIALLY_VERIFIED, VERIFIED
  completion_score INTEGER DEFAULT 0,  -- 0-100
  
  -- Score breakdown
  basic_info_score INTEGER DEFAULT 0,  -- Address, size, type (0-20)
  documents_score INTEGER DEFAULT 0,   -- Uploaded documents (0-30)
  api_data_score INTEGER DEFAULT 0,    -- EPC, flood, planning (0-30)
  media_score INTEGER DEFAULT 0,       -- Photos and videos (0-10)
  history_score INTEGER DEFAULT 0,     -- Sales history, events (0-10)
  
  -- Verification
  verified_by UUID REFERENCES users(id),
  verified_at TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(property_id)
);

-- Function to calculate completion score
CREATE OR REPLACE FUNCTION calculate_passport_score(p_property_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_score INTEGER := 0;
  v_property properties%ROWTYPE;
  v_doc_count INTEGER;
  v_photo_count INTEGER;
  v_api_count INTEGER;
BEGIN
  -- Get property data
  SELECT * INTO v_property FROM properties WHERE id = p_property_id;
  
  -- Basic info (20 points max)
  IF v_property.address_line_1 IS NOT NULL THEN v_score := v_score + 5; END IF;
  IF v_property.property_type IS NOT NULL THEN v_score := v_score + 3; END IF;
  IF v_property.bedrooms IS NOT NULL THEN v_score := v_score + 3; END IF;
  IF v_property.size_sqft IS NOT NULL THEN v_score := v_score + 3; END IF;
  IF v_property.year_built IS NOT NULL THEN v_score := v_score + 3; END IF;
  IF v_property.tenure IS NOT NULL THEN v_score := v_score + 3; END IF;
  
  -- Documents (30 points max)
  SELECT COUNT(*) INTO v_doc_count FROM documents WHERE property_id = p_property_id;
  v_score := v_score + LEAST(30, v_doc_count * 5);
  
  -- Photos (10 points max)
  SELECT COUNT(*) INTO v_photo_count FROM property_photos WHERE property_id = p_property_id;
  v_score := v_score + LEAST(10, v_photo_count * 2);
  
  -- API data (30 points max)
  SELECT COUNT(*) INTO v_api_count FROM api_cache 
  WHERE cache_key LIKE p_property_id::TEXT || '%';
  v_score := v_score + LEAST(30, v_api_count * 5);
  
  -- History (10 points max)
  IF v_property.last_sale_date IS NOT NULL THEN v_score := v_score + 5; END IF;
  IF v_property.last_sale_price IS NOT NULL THEN v_score := v_score + 5; END IF;
  
  RETURN LEAST(100, v_score);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4. `documents` - Document Management
```sql
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Document metadata
  document_type document_type NOT NULL,
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER,
  mime_type TEXT,
  
  -- Storage
  storage_path TEXT NOT NULL,  -- Path in Supabase storage
  file_url TEXT,  -- Full URL (for private = signed URL)
  
  -- Classification
  category TEXT,  -- Legal, Survey, Energy, Planning, Insurance
  tags TEXT[] DEFAULT '{}',
  
  -- Content
  description TEXT,
  ai_summary TEXT,  -- AI-generated summary (future)
  extracted_text TEXT,  -- OCR text (future)
  
  -- Status
  status document_status DEFAULT 'ready',
  is_public BOOLEAN DEFAULT FALSE,
  
  -- Sharing
  shared_with UUID[] DEFAULT '{}',  -- Array of user IDs
  
  -- Security
  checksum TEXT,  -- SHA-256 hash for integrity
  
  -- Usage tracking
  download_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  
  -- Audit
  uploaded_by UUID NOT NULL REFERENCES users(id),
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_documents_property ON documents(property_id);
CREATE INDEX idx_documents_type ON documents(document_type);
CREATE INDEX idx_documents_uploaded_by ON documents(uploaded_by);
```

**RLS Policies**:
```sql
-- Property owners can view their documents
CREATE POLICY "Property owners can view documents"
  ON documents FOR SELECT
  USING (
    property_id IN (
      SELECT id FROM properties WHERE claimed_by = auth.uid()
    )
  );

-- Property owners can insert documents
CREATE POLICY "Property owners can upload documents"
  ON documents FOR INSERT
  WITH CHECK (
    property_id IN (
      SELECT id FROM properties WHERE claimed_by = auth.uid()
    )
  );

-- Property parties can view shared documents
CREATE POLICY "Property parties can view shared documents"
  ON documents FOR SELECT
  USING (
    auth.uid() = ANY(shared_with) OR
    auth.uid() IN (
      SELECT user_id FROM property_parties 
      WHERE property_id = documents.property_id
    )
  );
```

### 5. `property_photos` - Photo Gallery
```sql
CREATE TABLE property_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  -- File information
  file_url TEXT NOT NULL,  -- Public URL from storage
  file_name TEXT NOT NULL,
  file_size_bytes INTEGER,
  
  -- Photo metadata
  caption TEXT,
  room_type TEXT,  -- Living Room, Kitchen, Bedroom, Bathroom, Garden, Exterior
  is_featured BOOLEAN DEFAULT FALSE,  -- Featured/hero image
  display_order INTEGER DEFAULT 0,
  
  -- EXIF data (optional)
  taken_at TIMESTAMPTZ,
  camera_make TEXT,
  camera_model TEXT,
  
  -- Dimensions
  width INTEGER,
  height INTEGER,
  
  -- Audit
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_property_photos_property ON property_photos(property_id);
CREATE INDEX idx_property_photos_featured ON property_photos(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_property_photos_order ON property_photos(property_id, display_order);
```

### 6. `property_events` - Property Timeline
```sql
CREATE TABLE property_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Event classification
  event_type TEXT NOT NULL,  -- SALE, PLANNING, EPC, SURVEY, INSURANCE, NOTE
  title TEXT NOT NULL,
  description TEXT,
  
  -- Event details
  event_date TIMESTAMPTZ NOT NULL,
  event_value INTEGER,  -- For sales, monetary values
  
  -- Source
  source TEXT,  -- 'HMLR', 'PLANNING', 'USER_ENTERED'
  source_url TEXT,
  
  -- Audit
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_property_events_property ON property_events(property_id);
CREATE INDEX idx_property_events_date ON property_events(event_date);
CREATE INDEX idx_property_events_type ON property_events(event_type);
```

### 7. `property_parties` - Property Stakeholders
```sql
CREATE TABLE property_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Role and permissions
  role property_party_role NOT NULL,
  permissions JSONB DEFAULT '{}',  -- Custom permissions
  is_primary BOOLEAN DEFAULT FALSE,  -- Primary contact for this role
  
  -- Access control
  can_view BOOLEAN DEFAULT TRUE,
  can_edit BOOLEAN DEFAULT FALSE,
  can_delete BOOLEAN DEFAULT FALSE,
  can_share BOOLEAN DEFAULT FALSE,
  
  -- Time-based access
  access_starts_at TIMESTAMPTZ DEFAULT NOW(),
  access_ends_at TIMESTAMPTZ,  -- For temporary access (e.g., 30-day viewing)
  
  -- Invitation
  invited_by UUID REFERENCES users(id),
  invitation_sent_at TIMESTAMPTZ,
  invitation_accepted_at TIMESTAMPTZ,
  
  -- Audit
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(property_id, user_id, role)
);

-- Indexes
CREATE INDEX idx_property_parties_property ON property_parties(property_id);
CREATE INDEX idx_property_parties_user ON property_parties(user_id);
CREATE INDEX idx_property_parties_role ON property_parties(role);
```

### 8. `notes` - Property Notes & Comments
```sql
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Note content
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  
  -- Visibility
  visibility note_visibility NOT NULL DEFAULT 'private',
  
  -- Organization
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  
  -- Threading (for discussions)
  parent_note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  
  -- Audit
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notes_property ON notes(property_id);
CREATE INDEX idx_notes_created_by ON notes(created_by);
CREATE INDEX idx_notes_parent ON notes(parent_note_id) WHERE parent_note_id IS NOT NULL;
```

### 9. `tasks` - Property Task Management
```sql
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Task details
  title TEXT NOT NULL,
  description TEXT,
  
  -- Status
  status task_status NOT NULL DEFAULT 'pending',
  priority task_priority NOT NULL DEFAULT 'medium',
  
  -- Assignment
  created_by UUID NOT NULL REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  
  -- Timing
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),
  
  -- Effort tracking
  estimated_hours DECIMAL,
  actual_hours DECIMAL,
  
  -- Organization
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_tasks_property ON tasks(property_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
```

### 10. `api_cache` - External API Response Cache
```sql
CREATE TABLE api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Cache identification
  provider api_provider NOT NULL,
  cache_key TEXT NOT NULL,  -- Unique identifier (postcode, UPRN, etc.)
  
  -- Cached data
  payload JSONB NOT NULL,
  
  -- Cache metadata
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ttl_seconds INTEGER NOT NULL DEFAULT 86400,  -- 24 hours default
  expires_at TIMESTAMPTZ GENERATED ALWAYS AS (
    fetched_at + (ttl_seconds || ' seconds')::INTERVAL
  ) STORED,
  
  -- Request tracking
  etag TEXT,
  request_hash TEXT,  -- Hash of request parameters
  response_size_bytes INTEGER,
  
  -- Status
  is_stale BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(provider, cache_key)
);

-- Indexes
CREATE INDEX idx_api_cache_provider ON api_cache(provider);
CREATE INDEX idx_api_cache_expires ON api_cache(expires_at);
CREATE INDEX idx_api_cache_key ON api_cache(cache_key);

-- Function to check if cache is valid
CREATE OR REPLACE FUNCTION is_cache_valid(
  p_provider api_provider,
  p_cache_key TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM api_cache
    WHERE provider = p_provider
    AND cache_key = p_cache_key
    AND expires_at > NOW()
    AND is_stale = FALSE
  );
END;
$$ LANGUAGE plpgsql;
```

### 11. `audit_log` - Comprehensive Audit Trail
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Who
  actor_id UUID REFERENCES users(id),  -- NULL for system actions
  actor_email TEXT,  -- Denormalized for performance
  actor_role user_role,
  
  -- What
  action audit_action NOT NULL,
  entity_type TEXT NOT NULL,  -- 'property', 'document', 'user', etc.
  entity_id UUID NOT NULL,
  
  -- Changes
  old_values JSONB,
  new_values JSONB,
  
  -- Context
  metadata JSONB DEFAULT '{}',
  
  -- Request information
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,
  
  -- Timestamp
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_log_actor ON audit_log(actor_id);
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_log_created ON audit_log(created_at);
CREATE INDEX idx_audit_log_action ON audit_log(action);

-- Partition by month for performance
-- (Manual setup required for older Postgres versions)
```

### 12. `relationships` - User Connections
```sql
CREATE TABLE relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Connection
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  connected_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Type
  relationship_type TEXT NOT NULL,  -- 'colleague', 'client', 'partner'
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending',  -- pending, accepted, rejected, blocked
  
  -- Metadata
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, connected_user_id),
  CHECK (user_id != connected_user_id)
);
```

### 13. `watchlist` - Saved Properties
```sql
CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Organization
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  
  -- Notifications
  notify_on_price_change BOOLEAN DEFAULT TRUE,
  notify_on_status_change BOOLEAN DEFAULT TRUE,
  notify_on_new_documents BOOLEAN DEFAULT FALSE,
  
  -- Audit
  added_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(user_id, property_id)
);

-- Indexes
CREATE INDEX idx_watchlist_user ON watchlist(user_id);
CREATE INDEX idx_watchlist_property ON watchlist(property_id);
```

### 14. `notifications` - In-App Notifications
```sql
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Notification content
  type TEXT NOT NULL,  -- 'info', 'warning', 'success', 'error'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  
  -- Action
  action_url TEXT,
  action_label TEXT,
  
  -- Related entities
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
  
  -- Status
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMPTZ,
  
  -- Delivery
  is_email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMPTZ,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created ON notifications(created_at);
```

### 15. `rate_limits` - API Rate Limiting
```sql
CREATE TABLE rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Identifier
  identifier TEXT NOT NULL,  -- user_id, IP address, API key
  identifier_type TEXT NOT NULL,  -- 'user', 'ip', 'api_key'
  
  -- Endpoint
  endpoint TEXT NOT NULL,  -- '/api/properties', '/api/epc', etc.
  
  -- Limits
  request_count INTEGER NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  window_size_seconds INTEGER NOT NULL DEFAULT 60,
  max_requests INTEGER NOT NULL,
  
  -- Audit
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(identifier, endpoint, window_start)
);

-- Auto-cleanup old rate limit records
CREATE OR REPLACE FUNCTION cleanup_old_rate_limits()
RETURNS void AS $$
BEGIN
  DELETE FROM rate_limits
  WHERE window_start < NOW() - INTERVAL '1 hour';
END;
$$ LANGUAGE plpgsql;
```

### 16. `system_config` - Platform Configuration
```sql
CREATE TABLE system_config (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,  -- Exposed to frontend
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Pre-populate with defaults
INSERT INTO system_config (key, value, description, is_public) VALUES
('platform_name', '"Property Passport UK"', 'Platform name', TRUE),
('max_upload_size_mb', '10', 'Max file upload size in MB', TRUE),
('cache_ttl_epc', '86400', 'EPC cache TTL in seconds', FALSE),
('cache_ttl_flood', '604800', 'Flood data cache TTL (7 days)', FALSE),
('enable_ai_features', 'false', 'Enable AI document analysis', FALSE),
('maintenance_mode', 'false', 'Maintenance mode enabled', TRUE);
```

## 5.4 Database Triggers

### Auto-update `updated_at` timestamps
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ... (repeat for all tables with updated_at)
```

### Audit log trigger
```sql
CREATE OR REPLACE FUNCTION log_audit_trail()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    actor_id,
    action,
    entity_type,
    entity_id,
    old_values,
    new_values
  ) VALUES (
    auth.uid(),
    TG_OP::TEXT,
    TG_TABLE_NAME::TEXT,
    COALESCE(NEW.id, OLD.id),
    CASE WHEN TG_OP = 'DELETE' THEN row_to_json(OLD) ELSE NULL END,
    CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END
  );
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Apply to sensitive tables
CREATE TRIGGER audit_properties
  AFTER INSERT OR UPDATE OR DELETE ON properties
  FOR EACH ROW
  EXECUTE FUNCTION log_audit_trail();
```

### Auto-generate PPUK reference
```sql
CREATE OR REPLACE FUNCTION generate_ppuk_reference()
RETURNS TRIGGER AS $$
DECLARE
  v_ref TEXT;
BEGIN
  -- Format: PPUK-YYYYMM-XXXXX (e.g., PPUK-202501-00123)
  v_ref := 'PPUK-' || 
           TO_CHAR(NOW(), 'YYYYMM') || '-' ||
           LPAD((
             SELECT COUNT(*) + 1 
             FROM properties 
             WHERE ppuk_reference LIKE 'PPUK-' || TO_CHAR(NOW(), 'YYYYMM') || '%'
           )::TEXT, 5, '0');
  
  NEW.ppuk_reference := v_ref;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER generate_ppuk_ref
  BEFORE INSERT ON properties
  FOR EACH ROW
  WHEN (NEW.ppuk_reference IS NULL)
  EXECUTE FUNCTION generate_ppuk_reference();
```

---

<a name="free-apis"></a>
# 6. 🌐 Free UK Government APIs - Complete Catalog

## 6.1 Property & Building Data APIs

### 1. EPC (Energy Performance Certificate) API ⭐⭐⭐
**Provider**: UK Government Open Data Communities  
**Endpoint**: `https://epc.opendatacommunities.org/api/v1`  
**Authentication**: API key (optional for basic use, required for bulk)  
**Rate Limit**: 100 requests/hour (free tier)  
**Cache TTL**: 24 hours recommended  

**Data Provided**:
- Current energy rating (A-G)
- Potential energy rating
- Energy efficiency score
- CO2 emissions (current & potential)
- Heating costs (current & potential)
- Hot water costs
- Lighting costs
- Property characteristics (walls, roof, windows, heating)
- Inspection date
- Certificate number
- Recommendations for improvements

**Example Request**:
```bash
GET https://epc.opendatacommunities.org/api/v1/domestic/search?postcode=SW1A1AA
Headers:
  Accept: text/csv
  Authorization: Basic {base64_encoded_email:api_key}
```

**Response Fields**:
```json
{
  "lmk-key": "1234567890",
  "address": "10 DOWNING STREET, LONDON, SW1A 1AA",
  "postcode": "SW1A 1AA",
  "current-energy-rating": "D",
  "current-energy-efficiency": 65,
  "potential-energy-rating": "B",
  "potential-energy-efficiency": 85,
  "property-type": "House",
  "built-form": "Detached",
  "inspection-date": "2023-01-15",
  "lodgement-date": "2023-01-20",
  "total-floor-area": 150,
  "co2-emissions-current": 2.5,
  "co2-emissions-potential": 1.2,
  "current-energy-cost": 1200,
  "potential-energy-cost": 800
}
```

**PPUK Integration**:
- Fetch on property creation
- Display prominently in Overview tab
- Alert owner when EPC expires (10 years)
- Track potential improvements

---

### 2. HM Land Registry Open Data ⭐⭐⭐
**Provider**: HM Land Registry  
**Endpoint**: `http://landregistry.data.gov.uk/`  
**Authentication**: None required  
**Rate Limit**: None officially stated  
**Cache TTL**: 30 days  

**A. Price Paid Data**
**Endpoint**: `https://landregistry.data.gov.uk/data/ppi/transaction-record.json`

**Data Provided**:
- Sale price
- Sale date
- Property address
- Postcode
- Property type (Detached, Semi-detached, Terraced, Flat)
- Tenure (Freehold, Leasehold)
- Transaction type (Sale, Transfer)
- Estate type (N/A for most properties)

**Example Request**:
```bash
GET http://landregistry.data.gov.uk/data/ppi/transaction-record.json?postcode=SW1A1AA
```

**Response**:
```json
{
  "items": [
    {
      "transactionId": "...",
      "pricePaid": 450000,
      "transactionDate": "2023-01-15",
      "propertyAddress": {
        "streetAddress": "10 DOWNING STREET",
        "locality": "WESTMINSTER",
        "town": "LONDON",
        "postcode": "SW1A 1AA"
      },
      "propertyType": "Detached",
      "tenure": "Freehold"
    }
  ]
}
```

**B. INSPIRE Polygons** (Property Boundaries)
**Endpoint**: `https://use-land-property-data.service.gov.uk/datasets/inspire`

**Data Provided**:
- Freehold boundaries (polygons)
- Leasehold boundaries
- Title numbers
- INSPIRE ID
- GeoJSON/WKT format

**PPUK Integration**:
- Sales history timeline
- Price trend charts
- Ownership history
- Map property boundaries

---

### 3. Flood Risk Data ⭐⭐⭐
**Provider**: Environment Agency  
**Endpoint**: `https://environment.data.gov.uk/flood-monitoring`  
**Authentication**: None required  
**Rate Limit**: 1000 requests/day  
**Cache TTL**: 7 days  

**A. Flood Zones**
**Endpoint**: `https://environment.data.gov.uk/api/floods/zones`

**Data Provided**:
- Flood Zone 1 (Low probability)
- Flood Zone 2 (Medium probability: 1 in 1000 year)
- Flood Zone 3 (High probability: 1 in 100 year)
- Surface water flood risk
- Reservoir flood risk

**Example Request**:
```bash
GET https://environment.data.gov.uk/api/v2/ea/flood-risk?lat=51.5074&lon=-0.1278
```

**B. Current Flood Warnings**
**Endpoint**: `https://environment.data.gov.uk/flood-monitoring/id/floods`

**PPUK Integration**:
- Display flood risk level in Overview
- Alert on flood warnings
- Show mitigation recommendations
- Historical flood events

---

### 4. Planning Data ⭐⭐⭐
**Provider**: Planning.data.gov.uk (DLUHC)  
**Endpoint**: `https://www.planning.data.gov.uk/`  
**Authentication**: None required  
**Rate Limit**: 100 requests/hour  
**Cache TTL**: 24 hours  

**A. Planning Applications**
**Endpoint**: `https://www.planning.data.gov.uk/entity.json?geometry=POINT({lng} {lat})&geometry_relation=intersects&typology=planning-application`

**Data Provided**:
- Application reference number
- Application description
- Status (Submitted, Approved, Rejected, Withdrawn)
- Decision date
- Application date
- Applicant name
- Agent name
- Development description

**B. Conservation Areas**
**Endpoint**: `https://www.planning.data.gov.uk/entity.json?typology=conservation-area`

**C. Listed Buildings**
**Endpoint**: `https://www.planning.data.gov.uk/entity.json?typology=listed-building`

**D. Tree Preservation Orders**
**Endpoint**: `https://www.planning.data.gov.uk/entity.json?typology=tree-preservation-order`

**PPUK Integration**:
- Planning history timeline
- Nearby applications (500m radius)
- Conservation area badge
- Listed building status

---

### 5. Postcodes.io ⭐⭐⭐
**Provider**: Ideal Postcodes  
**Endpoint**: `https://api.postcodes.io`  
**Authentication**: None required  
**Rate Limit**: 1000 requests/day  
**Cache TTL**: 24 hours  

**Features**:
- Postcode validation
- Geocoding (postcode → lat/lng)
- Reverse geocoding (lat/lng → postcode)
- Nearest postcodes
- Autocomplete
- Bulk lookups

**Example Request**:
```bash
GET https://api.postcodes.io/postcodes/SW1A1AA
```

**Response**:
```json
{
  "status": 200,
  "result": {
    "postcode": "SW1A 1AA",
    "quality": 1,
    "eastings": 529090,
    "northings": 179645,
    "country": "England",
    "nhs_ha": "London",
    "longitude": -0.127695,
    "latitude": 51.503432,
    "parliamentary_constituency": "Cities of London and Westminster",
    "admin_district": "Westminster",
    "parish": "Westminster, unparished area",
    "admin_county": null,
    "admin_ward": "St James's",
    "region": "London",
    "ccg": "NHS North West London",
    "nuts": "Westminster"
  }
}
```

**PPUK Integration**:
- Address validation
- Auto-fill location data
- Constituency and ward display
- Nearest services lookup

---

### 6. Ordnance Survey Open Data ⭐⭐
**Provider**: Ordnance Survey  
**Documentation**: https://osdatahub.os.uk/  
**Authentication**: API key required (free tier: 1000 requests/month)  
**Rate Limit**: Varies by product  

**A. OS Places API** (Requires registration)
**Endpoint**: `https://api.os.uk/search/places/v1`

**Data Provided**:
- UPRN (Unique Property Reference Number)
- Address format (PAF)
- Property classification
- Local authority
- Grid references

**B. OS Maps API**
**Endpoint**: `https://api.os.uk/maps/raster/v1`

**C. OS Names API** (Place names)
**D. OS Features API** (Roads, buildings)

**PPUK Integration**:
- UPRN lookup and validation
- Address autocomplete
- Map display with property boundary
- Nearby features (schools, hospitals)

---

## 6.2 Crime & Safety APIs

### 7. Police.uk API ⭐⭐⭐
**Provider**: UK Police  
**Endpoint**: `https://data.police.uk/api`  
**Authentication**: None required  
**Rate Limit**: 15 requests/second  
**Cache TTL**: 30 days  

**Features**:
- Crime data by location (lat/lng or postcode)
- Crime categories
- Crime outcomes
- Stop and search data
- Police force information

**Example Request**:
```bash
GET https://data.police.uk/api/crimes-street/all-crime?lat=51.5074&lng=-0.1278&date=2023-01
```

**Response**:
```json
[
  {
    "category": "burglary",
    "location_type": "Force",
    "location": {
      "latitude": "51.503432",
      "longitude": "-0.127695",
      "street": {
        "id": 12345,
        "name": "On or near Westminster Road"
      }
    },
    "context": "",
    "outcome_status": {
      "category": "Investigation complete; no suspect identified",
      "date": "2023-02"
    },
    "persistent_id": "",
    "id": 123456,
    "month": "2023-01"
  }
]
```

**Crime Categories**:
- Anti-social behaviour
- Bicycle theft
- Burglary
- Criminal damage and arson
- Drugs
- Other theft
- Possession of weapons
- Public order
- Robbery
- Shoplifting
- Theft from the person
- Vehicle crime
- Violence and sexual offences
- Other crime

**PPUK Integration**:
- Local crime stats (last 12 months)
- Crime heatmap visualization
- Safety score calculation
- Neighborhood comparison

---

## 6.3 Environmental & Geological APIs

### 8. British Geological Survey (BGS) APIs ⭐⭐
**Provider**: British Geological Survey  
**Endpoint**: Various  
**Authentication**: Varies (mostly free)  
**Rate Limit**: Varies  

**A. BGS Geology API**
**Endpoint**: `https://www.bgs.ac.uk/datasets/`

**Data Provided**:
- Bedrock geology
- Superficial geology
- Radon potential
- Ground stability
- Mining hazards
- Natural subsidence risk

**B. Groundwater Flooding**
**C. Geological Hazards**

**PPUK Integration**:
- Radon risk level
- Ground stability assessment
- Mining hazard flag
- Geology layer on map

---

### 9. DEFRA APIs ⭐⭐
**Provider**: Department for Environment, Food & Rural Affairs  
**Documentation**: https://environment.data.gov.uk/  

**A. Air Quality API**
**Endpoint**: `https://uk-air.defra.gov.uk/data/`

**Data Provided**:
- PM2.5, PM10 levels
- NO2, SO2, O3 levels
- Air quality index
- Pollution forecasts

**B. MAGIC Map Application**
**Endpoint**: `https://magic.defra.gov.uk/`

**Data Provided**:
- Environmental designations
- Protected areas (SSSI, AONB, Green Belt)
- Agricultural land classification
- Ancient woodland
- National Parks

**C. Water Quality API**

**PPUK Integration**:
- Air quality score
- Environmental protection flags
- Green space proximity
- Water quality rating

---

## 6.4 Education & Transport APIs

### 10. Department for Education (DfE) Open Data ⭐⭐
**Provider**: Department for Education  
**Endpoint**: `https://www.get-information-schools.service.gov.uk/`  
**Authentication**: None for public data  

**Data Provided**:
- School locations
- OFSTED ratings
- School type (Primary, Secondary, Grammar, Academy)
- Pupil numbers
- Performance data

**A. Get Information About Schools (GIAS)**
**Endpoint**: `https://www.get-information-schools.service.gov.uk/Downloads`

**B. OFSTED API**
**Endpoint**: `https://reports.ofsted.gov.uk/`

**PPUK Integration**:
- Nearest schools (1km, 3km, 5km)
- School ratings display
- Catchment area info
- School comparison table

---

### 11. Transport APIs ⭐⭐

**A. Transport for London (TfL) API**
**Provider**: Transport for London  
**Endpoint**: `https://api.tfl.gov.uk`  
**Authentication**: API key required (free)  
**Rate Limit**: 500 requests/minute  

**Data Provided**:
- Tube, bus, rail stations nearby
- Real-time arrivals
- Journey planner
- Tube line status
- Bike share availability
- Congestion zone

**B. National Public Transport Access Nodes (NaPTAN)**
**Provider**: Department for Transport  
**Endpoint**: `https://www.data.gov.uk/dataset/naptancsv`

**Data Provided**:
- Bus stops
- Train stations
- Tram stops
- Ferry terminals

**C. Bus Open Data Service**
**Endpoint**: `https://data.bus-data.dft.gov.uk/`

**PPUK Integration**:
- Nearest transport links
- Travel time to central locations
- Public transport accessibility score
- Parking availability

---

## 6.5 Financial & Economic APIs

### 12. VOA (Valuation Office Agency) API ⭐⭐
**Provider**: Valuation Office Agency  
**Endpoint**: `https://www.tax.service.gov.uk/check-council-tax-band/`  
**Authentication**: None (public tool)  
**Note**: No official API; requires screen scraping  

**Data Provided**:
- Council Tax band (A-H)
- Property valuation (1991 basis)
- Band history
- Appeals history

**Alternative**: Download bulk data from data.gov.uk

**PPUK Integration**:
- Council Tax band display
- Annual council tax estimate
- Band comparison with neighbors

---

### 13. Bank of England Open Data ⭐
**Provider**: Bank of England  
**Endpoint**: `https://www.bankofengland.co.uk/boeapps/database/`  
**Authentication**: None required  

**Data Provided**:
- Base interest rates
- Mortgage rates (average)
- Property price indices
- Inflation rates

**PPUK Integration**:
- Mortgage affordability calculator
- Interest rate trends
- Property value predictions

---

### 14. UK House Price Index (HPI) ⭐⭐
**Provider**: HM Land Registry / ONS  
**Endpoint**: `https://landregistry.data.gov.uk/app/ukhpi`  
**Authentication**: None required  

**Data Provided**:
- Average house prices by region
- Property price index
- Annual price change %
- Sales volumes
- Monthly, quarterly, annual data

**Example Request**:
```bash
GET http://landregistry.data.gov.uk/data/ukhpi/region/london.json
```

**PPUK Integration**:
- Local area price trends
- Property value estimator
- Market conditions indicator
- Investment potential score

---

## 6.6 Business & Companies APIs

### 15. Companies House API ⭐⭐
**Provider**: Companies House  
**Endpoint**: `https://api.company-information.service.gov.uk`  
**Authentication**: API key required (free)  
**Rate Limit**: 600 requests / 5 minutes  

**Data Provided**:
- Company search
- Company profile
- Officers (directors)
- Filing history
- Charges
- Company accounts

**Example Request**:
```bash
GET https://api.company-information.service.gov.uk/company/{company_number}
Headers:
  Authorization: Basic {api_key}
```

**PPUK Integration**:
- Property developer lookup
- Landlord company details
- Freehold owner identification
- Property management company info

---

### 16. The Gazette API ⭐⭐
**Provider**: The Gazette (Official Public Record)  
**Endpoint**: `https://www.thegazette.co.uk/data`  
**Authentication**: None required  
**Format**: XML, RDF, JSON  

**Data Provided**:
- Insolvency notices
- Planning notices
- Transport and works notices
- State, Parliament, and Companies notices
- Court notices

**Example Request**:
```bash
GET https://www.thegazette.co.uk/all-notices/notice?postcode=SW1A1AA&categorycode=G203
```

**PPUK Integration**:
- Insolvency alerts for property owners
- Planning application notices
- Legal notices affecting property
- Historical gazette entries

---

## 6.7 Utilities & Infrastructure APIs

### 17. Open Charge Map (EV Charging) ⭐
**Provider**: Open Charge Map  
**Endpoint**: `https://api.openchargemap.io/v3/`  
**Authentication**: API key required (free)  
**Rate Limit**: Unlimited (fair use)  

**Data Provided**:
- EV charging station locations
- Charger types (Rapid, Fast, Slow)
- Availability status
- Network operators
- Cost information

**PPUK Integration**:
- Nearest EV charging points
- EV infrastructure score
- Future-proofing indicator

---

### 18. UK Power Networks Open Data ⭐
**Provider**: UK Power Networks  
**Endpoint**: `https://ukpowernetworks.opendatasoft.com/`  
**Authentication**: None required  

**Data Provided**:
- Substation locations
- Power outages
- Future maintenance
- Cable route maps

**PPUK Integration**:
- Power infrastructure proximity
- Outage history
- Cable location awareness

---

## 6.8 Broadband & Connectivity

### 19. Ofcom Broadband Checker ⭐⭐
**Provider**: Ofcom  
**Endpoint**: Various ISP databases  
**Authentication**: None (postcode lookup)  

**Data Provided**:
- Available broadband speeds
- FTTP/FTTC availability
- Mobile coverage (3G/4G/5G)
- Providers serving area

**Alternative**: ThinkBroadband API (commercial)

**PPUK Integration**:
- Broadband availability checker
- Max speed display
- Provider comparison
- Connectivity score

---

## 6.9 Weather & Climate

### 20. Met Office Open Data ⭐
**Provider**: Met Office  
**Endpoint**: `https://www.metoffice.gov.uk/services/data`  
**Authentication**: API key required (free for some datasets)  

**Data Provided**:
- Weather forecasts
- Climate averages
- Historical weather data
- Warnings and alerts

**Alternative**: OpenMeteo (free, no key required)
**Endpoint**: `https://api.open-meteo.com/v1/forecast`

**PPUK Integration**:
- Local weather display
- Climate risk indicators
- Historical temperature/rainfall
- Extreme weather alerts

---

## 6.10 Local Authority Data

### 21. Office for National Statistics (ONS) APIs ⭐⭐⭐

**A. Open Geography Portal**
**Endpoint**: `https://geoportal.statistics.gov.uk/`  
**Authentication**: None required  

**Data Provided**:
- Boundary data (LAD, Ward, LSOA, MSOA)
- Census geographies
- Postcode to geography lookup
- GeoJSON, KML, Shapefile formats

**B. Nomis API** (Labour Market Statistics)
**Endpoint**: `https://www.nomisweb.co.uk/api/`

**Data Provided**:
- Census data
- Employment statistics
- Housing statistics
- Population demographics

**C. Census 2021 API**
**Endpoint**: `https://www.ons.gov.uk/census`

**PPUK Integration**:
- Neighborhood demographics
- Population density
- Age distribution
- Household composition
- Deprivation indices

---

### 22. Index of Multiple Deprivation (IMD) ⭐⭐
**Provider**: Ministry of Housing, Communities & Local Government  
**Endpoint**: `https://www.data.gov.uk/dataset/imd`  
**Authentication**: None (bulk download)  

**Data Provided**:
- Overall deprivation score
- Income deprivation
- Employment deprivation
- Education deprivation
- Health deprivation
- Crime deprivation
- Housing and services deprivation
- Living environment deprivation

**PPUK Integration**:
- Area deprivation score
- Domain-specific scores
- Decile/quintile ranking
- Neighborhood quality indicator

---

## 6.11 Healthcare

### 23. NHS Digital APIs ⭐
**Provider**: NHS Digital  
**Endpoint**: `https://digital.nhs.uk/developer`  
**Authentication**: OAuth 2.0 (registration required)  

**A. Organisation Data Service (ODS) API**
**Data Provided**:
- GP practice locations
- Hospital locations
- NHS trust information
- Opening hours
- Services offered

**B. Postcode Lookup**
**Endpoint**: `https://api.nhs.uk/service-search`

**PPUK Integration**:
- Nearest GP surgeries
- Nearest hospitals
- Healthcare accessibility score
- A&E wait time indicators

---

## 6.12 Heritage & History

### 24. Historic England APIs ⭐⭐
**Provider**: Historic England  
**Endpoint**: `https://historicengland.org.uk/listing/the-list/data-downloads/`  
**Authentication**: None required (bulk downloads)  

**Data Provided**:
- Listed buildings (Grade I, II*, II)
- Scheduled monuments
- Registered parks and gardens
- Conservation areas
- Heritage at risk register
- Archaeological sites

**PPUK Integration**:
- Listed building status badge
- Conservation area indicator
- Heritage restrictions notice
- Historical significance score

---

## 6.13 Summary Table of All Free APIs

| # | API Name | Provider | Auth Required | Rate Limit | Cache TTL | Priority |
|---|----------|----------|---------------|------------|-----------|----------|
| 1 | EPC API | DLUHC | Optional | 100/hr | 24h | ⭐⭐⭐ |
| 2 | HM Land Registry Price Paid | HMLR | No | None | 30d | ⭐⭐⭐ |
| 3 | INSPIRE Boundaries | HMLR | No | None | 90d | ⭐⭐⭐ |
| 4 | Flood Risk API | EA | No | 1000/day | 7d | ⭐⭐⭐ |
| 5 | Planning Data | DLUHC | No | 100/hr | 24h | ⭐⭐⭐ |
| 6 | Postcodes.io | Open Data | No | 1000/day | 24h | ⭐⭐⭐ |
| 7 | OS Places API | OS | Yes (Free) | 1000/mo | 24h | ⭐⭐ |
| 8 | Police.uk | Police | No | 15/sec | 30d | ⭐⭐⭐ |
| 9 | BGS Geology | BGS | No | Varies | 90d | ⭐⭐ |
| 10 | DEFRA Air Quality | DEFRA | No | None | 24h | ⭐⭐ |
| 11 | DfE Schools | DfE | No | None | 90d | ⭐⭐ |
| 12 | TfL Transport | TfL | Yes (Free) | 500/min | 1h | ⭐⭐ |
| 13 | VOA Council Tax | VOA | No | N/A | 90d | ⭐⭐ |
| 14 | Bank of England | BoE | No | None | 7d | ⭐ |
| 15 | UK HPI | HMLR/ONS | No | None | 30d | ⭐⭐ |
| 16 | Companies House | CH | Yes (Free) | 600/5min | 90d | ⭐⭐ |
| 17 | The Gazette | Gazette | No | None | 30d | ⭐⭐ |
| 18 | Open Charge Map | OCM | Yes (Free) | Fair use | 24h | ⭐ |
| 19 | Ofcom Broadband | Ofcom | No | N/A | 90d | ⭐⭐ |
| 20 | Met Office / OpenMeteo | Met/OM | Varies | Varies | 1h | ⭐ |
| 21 | ONS Geography | ONS | No | None | 180d | ⭐⭐⭐ |
| 22 | IMD Data | MHCLG | No | N/A | 180d | ⭐⭐ |
| 23 | NHS ODS | NHS | Yes | Varies | 30d | ⭐ |
| 24 | Historic England | HE | No | N/A | 180d | ⭐⭐ |

**Priority Legend**:
- ⭐⭐⭐ = Essential, implement Phase 1
- ⭐⭐ = Important, implement Phase 2
- ⭐ = Nice to have, implement Phase 3

---

## 6.14 API Integration Architecture

### Caching Strategy
```typescript
// Edge Function: Generic API Fetcher with Caching
export async function fetchWithCache(
  provider: string,
  cacheKey: string,
  fetchFn: () => Promise<any>,
  ttlSeconds: number = 86400
): Promise<any> {
  const { data: cached } = await supabase
    .from('api_cache')
    .select('payload, expires_at')
    .eq('provider', provider)
    .eq('cache_key', cacheKey)
    .single();

  // Return cache if valid
  if (cached && new Date(cached.expires_at) > new Date()) {
    return cached.payload;
  }

  // Fetch fresh data
  const freshData = await fetchFn();

  // Store in cache
  await supabase
    .from('api_cache')
    .upsert({
      provider,
      cache_key: cacheKey,
      payload: freshData,
      ttl_seconds: ttlSeconds,
      fetched_at: new Date().toISOString()
    });

  return freshData;
}
```

### Rate Limiting Strategy
```typescript
async function checkRateLimit(
  identifier: string,
  endpoint: string,
  maxRequests: number = 100,
  windowSeconds: number = 3600
): Promise<boolean> {
  const windowStart = new Date(Date.now() - windowSeconds * 1000);

  const { data } = await supabase
    .from('rate_limits')
    .select('request_count')
    .eq('identifier', identifier)
    .eq('endpoint', endpoint)
    .gte('window_start', windowStart.toISOString())
    .single();

  if (!data) {
    // First request in window
    await supabase.from('rate_limits').insert({
      identifier,
      endpoint,
      request_count: 1,
      window_start: new Date().toISOString(),
      max_requests: maxRequests
    });
    return true;
  }

  if (data.request_count >= maxRequests) {
    return false; // Rate limit exceeded
  }

  // Increment count
  await supabase
    .from('rate_limits')
    .update({ 
      request_count: data.request_count + 1,
      updated_at: new Date().toISOString()
    })
    .eq('identifier', identifier)
    .eq('endpoint', endpoint);

  return true;
}
```

---

<a name="user-roles"></a>
# 7. 👥 User Roles & Permissions Matrix

## 7.1 Role Hierarchy

```
┌─────────────┐
│    ADMIN    │ ← Full system access
└──────┬──────┘
       │
   ┌───┴────────────────────────────────┐
   │                                    │
┌──▼────┐  ┌────────┐  ┌──────────┐  ┌─▼─────┐
│ OWNER │  │ PARTNER│  │CONVEYANCER  │ AGENT  │
└───┬───┘  └────────┘  └──────────┘  └────┬───┘
    │                                      │
┌───▼───┐  ┌──────────┐  ┌────────┐  ┌───▼──────┐
│ BUYER │  │ SURVEYOR │  │ TENANT │  │ LENDER   │
└───────┘  └──────────┘  └────────┘  └──────────┘
```

## 7.2 Detailed Role Definitions

### ADMIN
**Description**: Platform administrators with full system access

**Permissions**:
- ✅ View all properties (including private)
- ✅ Edit any property
- ✅ Delete any property
- ✅ View all users
- ✅ Edit user roles
- ✅ Disable/enable users
- ✅ View audit logs
- ✅ Manage system configuration
- ✅ View API usage statistics
- ✅ Access admin dashboard
- ✅ Override RLS policies (service role)

**Dashboard Features**:
- System health metrics
- User management table
- Property management table
- API usage charts
- Audit log viewer
- System configuration editor

**Use Cases**:
- Platform maintenance
- User support
- Data quality management
- Security monitoring

---

### OWNER
**Description**: Property owners who have claimed their property

**Permissions**:
- ✅ View own properties
- ✅ Edit own property details
- ✅ Upload documents
- ✅ Upload photos
- ✅ Invite stakeholders (agents, surveyors, etc.)
- ✅ Manage property visibility (public/private)
- ✅ View property analytics
- ✅ Generate property reports
- ✅ Create notes (private/shared)
- ✅ Manage tasks
- ❌ Delete property (must contact admin)

**Dashboard Features**:
- My properties list
- Passport completion scores
- Recent activity
- Pending tasks
- Notifications center
- Valuation estimates

**Use Cases**:
- Preparing property for sale
- Maintaining property records
- Sharing information with professionals
- Monitoring property value

**Key Workflows**:
1. **Claim Property**: Search → Verify ownership → Claim
2. **Upload Documents**: Select file → Choose type → Add description → Upload
3. **Invite Agent**: Property → Stakeholders → Invite → Send email
4. **Generate Report**: Property → Reports → Select sections → Download PDF

---

### BUYER
**Description**: Potential property purchasers researching properties

**Permissions**:
- ✅ View public properties
- ✅ View properties they've been invited to
- ✅ Add properties to watchlist
- ✅ Download publicly shared documents
- ✅ View public notes
- ✅ Request additional information (creates task for owner)
- ❌ Edit any property data
- ❌ Upload documents or photos
- ❌ View private property details

**Dashboard Features**:
- Property search
- Watchlist
- Saved searches
- Comparison tool
- Mortgage calculator
- Recently viewed

**Use Cases**:
- Property research
- Due diligence before purchase
- Comparing properties
- Monitoring market

**Key Workflows**:
1. **Search Properties**: Postcode/address → Filter → View results
2. **View Passport**: Click property → View all tabs → Download docs
3. **Add to Watchlist**: Property → Add to watchlist → Set alerts
4. **Request Info**: Property → Request info → Send message to owner

---

### TENANT
**Description**: Property tenants with read-only access to their rental

**Permissions**:
- ✅ View property they're renting
- ✅ View documents (tenancy agreement, safety certificates)
- ✅ View contact details for landlord/agent
- ✅ Submit maintenance requests (creates task)
- ✅ View property timeline
- ❌ Edit property details
- ❌ Upload documents
- ❌ View financial information

**Dashboard Features**:
- My rental property
- Maintenance requests
- Contact landlord/agent
- Important documents
- Safety certificates

**Use Cases**:
- Accessing tenancy documents
- Reporting maintenance issues
- Viewing safety certificates
- Contacting landlord

---

### AGENT (Estate Agent)
**Description**: Real estate agents managing property sales/lettings

**Permissions**:
- ✅ View properties they're assigned to
- ✅ Edit property descriptions and marketing details
- ✅ Upload marketing materials
- ✅ Manage property photos (order, captions)
- ✅ Add property events (viewings, offers)
- ✅ Invite buyers to view properties
- ✅ Create tasks for owners
- ✅ View analytics (views, inquiries)
- ❌ Edit legal documents
- ❌ Delete properties

**Dashboard Features**:
- My properties (listed)
- Active sales/lettings
- Viewing schedule
- Offers received
- Marketing performance
- Lead management

**Use Cases**:
- Managing property listings
- Coordinating viewings
- Tracking offers
- Marketing properties

---

### SURVEYOR
**Description**: Property surveyors conducting inspections

**Permissions**:
- ✅ View properties they're assigned to
- ✅ Upload survey reports
- ✅ Add structural notes
- ✅ Flag issues/defects
- ✅ Access historical survey data
- ✅ View building regulations
- ❌ Edit property ownership details
- ❌ Delete others' reports

**Dashboard Features**:
- Assigned properties
- Survey schedule
- Report templates
- Defects tracker
- Historical comparisons

**Use Cases**:
- Uploading survey reports
- Documenting property conditions
- Comparing historical data
- Flagging structural issues

---

### CONVEYANCER
**Description**: Legal professionals managing property transactions

**Permissions**:
- ✅ View properties in active transactions
- ✅ Upload legal documents (contracts, searches)
- ✅ View all property documents
- ✅ Create legal notes
- ✅ Manage transaction timeline
- ✅ Request additional information
- ✅ Mark documents as reviewed
- ❌ Edit property physical characteristics

**Dashboard Features**:
- Active transactions
- Document checklist
- Legal searches status
- Title information
- Transaction timeline
- Completion tracker

**Use Cases**:
- Managing conveyancing process
- Uploading legal documents
- Tracking legal searches
- Coordinating completion

---

### LENDER (Mortgage Lender)
**Description**: Mortgage providers assessing property for lending

**Permissions**:
- ✅ View properties with active mortgage applications
- ✅ View property valuation
- ✅ View EPC and structural reports
- ✅ Add mortgage-related documents
- ✅ View ownership history
- ❌ Edit property details
- ❌ View personal financial information (of buyer)

**Dashboard Features**:
- Mortgage applications
- Property valuations
- Risk assessment
- Approval status

**Use Cases**:
- Property valuation review
- Risk assessment
- Document verification
- Mortgage approval

---

### PARTNER (Business/API Partner)
**Description**: Third-party businesses accessing data via API

**Permissions**:
- ✅ API access to public property data
- ✅ API access to assigned properties
- ✅ Batch property lookups
- ✅ Webhook subscriptions
- ❌ Direct database access
- ❌ Modifying properties via API (read-only)

**Dashboard Features**:
- API key management
- Usage statistics
- Webhook configuration
- API documentation
- Rate limit monitor

**Use Cases**:
- Integrating PPUK data into own platform
- Property data enrichment
- Automated reporting
- White-label solutions

---

## 7.3 Permissions Matrix

| Feature | ADMIN | OWNER | BUYER | TENANT | AGENT | SURVEYOR | CONVEYANCER | LENDER | PARTNER |
|---------|:-----:|:-----:|:-----:|:------:|:-----:|:--------:|:-----------:|:------:|:-------:|
| **Properties** |
| View public properties | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View own properties | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| View all properties | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create property | ✅ | ✅* | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Edit property details | ✅ | ✅ | ❌ | ❌ | ✅** | ❌ | ❌ | ❌ | ❌ |
| Delete property | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Claim property | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Documents** |
| View documents | ✅ | ✅ | ⚠️*** | ⚠️*** | ✅ | ✅ | ✅ | ⚠️*** | ✅ |
| Upload documents | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ |
| Download documents | ✅ | ✅ | ⚠️*** | ⚠️*** | ✅ | ✅ | ✅ | ⚠️*** | ✅ |
| Delete documents | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Photos** |
| View photos | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Upload photos | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Delete photos | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **Notes & Comments** |
| View private notes | ✅ | ✅**** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Create notes | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Tasks** |
| View tasks | ✅ | ✅ | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Create tasks | ✅ | ✅ | ✅***** | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Complete tasks | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| **Stakeholders** |
| View stakeholders | ✅ | ✅ | ❌ | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Invite stakeholders | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Remove stakeholders | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **Administration** |
| View audit logs | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Manage users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| System configuration | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| API access | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ |

**Legend**:
- ✅ = Full access
- ❌ = No access
- ⚠️ = Conditional access
- \* = After ownership verification
- \*\* = Marketing details only
- \*\*\* = Public documents only
- \*\*\*\* = Own notes only
- \*\*\*\*\* = Can request information (creates task for owner)

---

<a name="features"></a>
# 8. 🎯 Features & Implementation Roadmap

## Phase 1: MVP Foundation (Weeks 1-4)

### 1.1 Authentication & User Management

**Features**:
- Email/password authentication
- Google OAuth integration
- User registration with role selection
- Password reset flow
- Email verification (optional for MVP)
- Profile management

**Implementation**:
```typescript
// Supabase Auth setup in src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Auth context in src/contexts/AuthContext.tsx
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}
```

**Pages Required**:
- `/auth` - Combined login/register page
- `/auth/reset-password` - Password reset
- `/auth/callback` - OAuth callback handler

---

### 1.2 Property Search & Discovery

**Features**:
- Postcode/address search
- Map-based search
- Filter by property type, bedrooms, price range
- Sort by relevance, price, date added
- Property cards with key information
- Pagination (20 results per page)

**Implementation**:
```typescript
// Search API in src/api/properties.ts
export async function searchProperties(params: {
  query?: string;
  postcode?: string;
  propertyType?: string;
  minBedrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
}) {
  let query = supabase
    .from('properties')
    .select('*', { count: 'exact' })
    .eq('is_public', true)
    .eq('is_active', true);

  // Text search
  if (params.query) {
    query = query.textSearch('search_vector', params.query);
  }

  // Postcode filter
  if (params.postcode) {
    query = query.ilike('postcode', `${params.postcode}%`);
  }

  // Property type filter
  if (params.propertyType) {
    query = query.eq('property_type', params.propertyType);
  }

  // Bedrooms filter
  if (params.minBedrooms) {
    query = query.gte('bedrooms', params.minBedrooms);
  }

  // Price range (using last_sale_price or estimated_value)
  if (params.minPrice) {
    query = query.gte('estimated_value', params.minPrice);
  }
  if (params.maxPrice) {
    query = query.lte('estimated_value', params.maxPrice);
  }

  // Pagination
  const page = params.page || 1;
  const limit = params.limit || 20;
  query = query
    .range((page - 1) * limit, page * limit - 1)
    .order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) throw error;

  return {
    properties: data,
    total: count,
    page,
    totalPages: Math.ceil((count || 0) / limit)
  };
}
```

**Pages Required**:
- `/` - Landing page with hero search
- `/search` - Search results page
- `/properties` - Browse all properties

---

### 1.3 Property Passport Page (Core Feature)

**Features**:
- 6-tab interface:
  1. **Overview**: Property details, stats, map
  2. **Documents**: Document list with upload/download
  3. **Photos**: Gallery with lightbox
  4. **Data**: API data preview (EPC, flood, planning)
  5. **History**: Timeline of events
  6. **Stakeholders**: People connected to property
- Passport completion score (0-100%)
- Status badges (Unverified, Partially Verified, Verified)
- Share property button
- Download full report (PDF)

**Implementation** (simplified):
```typescript
// Property Passport page: src/pages/PropertyPassport.tsx
export function PropertyPassport() {
  const { id } = useParams<{ id: string }>();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch property data
  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: () => getProperty(id!),
  });

  // Fetch passport status
  const { data: passport } = useQuery({
    queryKey: ['passport', id],
    queryFn: () => getPropertyPassport(id!),
  });

  // Fetch documents
  const { data: documents } = useQuery({
    queryKey: ['documents', id],
    queryFn: () => getDocuments(id!),
  });

  // ... similar for photos, events, stakeholders

  if (isLoading) return <LoadingSkeleton />;
  if (!property) return <NotFound />;

  return (
    <div className="container mx-auto py-8">
      {/* Header */}
      <PropertyHeader property={property} passport={passport} />

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="photos">Photos</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab property={property} />
        </TabsContent>

        <TabsContent value="documents">
          <DocumentsTab 
            propertyId={id!} 
            documents={documents || []} 
          />
        </TabsContent>

        {/* ... other tabs */}
      </Tabs>
    </div>
  );
}
```

**Pages Required**:
- `/properties/:id` - Property passport page

---

### 1.4 Document Management

**Features**:
- Upload documents (drag-and-drop)
- File type validation
- Document categorization (11 types)
- Description and tagging
- Download with signed URLs (private documents)
- Document preview (PDF viewer)
- Version history (future)

**Implementation**:
```typescript
// Document upload component
export function DocumentUploader({ propertyId }: { propertyId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>('');
  const [description, setDescription] = useState('');

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!file) throw new Error('No file selected');

      // 1. Upload to storage
      const filePath = `${propertyId}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('property-documents')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Create document record
      const { error: dbError } = await supabase
        .from('documents')
        .insert({
          property_id: propertyId,
          document_type: documentType,
          file_name: file.name,
          file_size_bytes: file.size,
          mime_type: file.type,
          storage_path: filePath,
          description: description,
          uploaded_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      toast.success('Document uploaded successfully');
      setIsOpen(false);
      // Invalidate documents query to refetch
      queryClient.invalidateQueries(['documents', propertyId]);
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>

        {/* File picker */}
        <div className="space-y-4">
          <Input
            type="file"
            accept=".pdf,.docx,.png,.jpg"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />

          {/* Document type selector */}
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select document type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="epc">EPC Certificate</SelectItem>
              <SelectItem value="title_deed">Title Deed</SelectItem>
              <SelectItem value="survey">Survey Report</SelectItem>
              {/* ... all 11 types */}
            </SelectContent>
          </Select>

          {/* Description */}
          <Textarea
            placeholder="Add a description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {/* Upload button */}
          <Button
            onClick={() => uploadMutation.mutate()}
            disabled={!file || !documentType || uploadMutation.isPending}
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Document download with signed URL
async function downloadDocument(documentId: string) {
  // 1. Get document record
  const { data: doc } = await supabase
    .from('documents')
    .select('storage_path')
    .eq('id', documentId)
    .single();

  if (!doc) throw new Error('Document not found');

  // 2. Generate signed URL (1 hour expiry)
  const { data, error } = await supabase.storage
    .from('property-documents')
    .createSignedUrl(doc.storage_path, 3600);

  if (error) throw error;

  // 3. Open in new tab
  window.open(data.signedUrl, '_blank');

  // 4. Update download count
  await supabase.rpc('increment_download_count', { document_id: documentId });
}
```

---

### 1.5 Photo Gallery

**Features**:
- Grid layout (responsive)
- Upload multiple photos
- Add captions and room types
- Set featured image
- Reorder photos (drag-and-drop)
- Lightbox preview
- Delete photos

**Implementation**:
```typescript
// Photo gallery component
export function PhotoGallery({ propertyId }: { propertyId: string }) {
  const { data: photos, isLoading } = useQuery({
    queryKey: ['photos', propertyId],
    queryFn: () => getPropertyPhotos(propertyId),
  });

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  if (isLoading) return <LoadingSkeleton />;
  if (!photos || photos.length === 0) {
    return <EmptyState message="No photos yet" />;
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo, index) => (
          <Card
            key={photo.id}
            className="cursor-pointer hover:shadow-lg transition"
            onClick={() => {
              setCurrentPhotoIndex(index);
              setLightboxOpen(true);
            }}
          >
            <CardContent className="p-0">
              <img
                src={photo.file_url}
                alt={photo.caption || 'Property photo'}
                className="w-full h-48 object-cover rounded-t-lg"
              />
              {photo.caption && (
                <div className="p-2">
                  <p className="text-sm text-muted-foreground">
                    {photo.caption}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          photos={photos}
          currentIndex={currentPhotoIndex}
          onClose={() => setLightboxOpen(false)}
          onNext={() => setCurrentPhotoIndex((i) => (i + 1) % photos.length)}
          onPrev={() => setCurrentPhotoIndex((i) => (i - 1 + photos.length) % photos.length)}
        />
      )}
    </>
  );
}
```

---

### 1.6 Dashboards (Role-Based)

**Features**:
- Owner Dashboard:
  - My properties
  - Passport completion progress
  - Recent activity
  - Quick actions
- Buyer Dashboard:
  - Watchlist
  - Saved searches
  - Recently viewed
  - Property comparison
- Admin Dashboard:
  - System stats
  - User management
  - Property management
  - Audit logs

**Implementation**:
```typescript
// Dashboard router: src/pages/Dashboard.tsx
export function Dashboard() {
  const { user } = useAuth();
  const { data: role } = useUserRole();

  if (!user || !role) return <LoadingSkeleton />;

  // Route to correct dashboard based on role
  switch (role) {
    case 'owner':
      return <OwnerDashboard />;
    case 'buyer':
      return <BuyerDashboard />;
    case 'admin':
      return <AdminDashboard />;
    case 'agent':
      return <AgentDashboard />;
    default:
      return <DefaultDashboard />;
  }
}

// Owner dashboard example
function OwnerDashboard() {
  const { data: properties } = useQuery({
    queryKey: ['my-properties'],
    queryFn: getMyProperties,
  });

  const { data: stats } = useQuery({
    queryKey: ['my-stats'],
    queryFn: getOwnerStats,
  });

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">My Properties</h1>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          title="My Properties"
          value={stats?.propertyCount || 0}
          icon={<Home />}
        />
        <StatsCard
          title="Avg. Completion"
          value={`${stats?.avgCompletion || 0}%`}
          icon={<TrendingUp />}
        />
        <StatsCard
          title="Documents"
          value={stats?.documentCount || 0}
          icon={<FileText />}
        />
        <StatsCard
          title="Total Value"
          value={`£${formatNumber(stats?.totalValue || 0)}`}
          icon={<DollarSign />}
        />
      </div>

      {/* Properties grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {properties?.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
}
```

---

## Phase 2: API Integrations (Weeks 5-8)

### 2.1 EPC API Integration

**Edge Function**: `supabase/functions/epc/index.ts`

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  try {
    const { postcode } = await req.json();

    if (!postcode) {
      return new Response(
        JSON.stringify({ error: 'Postcode required' }),
        { status: 400 }
      );
    }

    // Check cache first
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const cacheKey = `epc_${postcode}`;
    const { data: cached } = await supabase
      .from('api_cache')
      .select('payload, expires_at')
      .eq('provider', 'epc')
      .eq('cache_key', cacheKey)
      .single();

    // Return cache if valid
    if (cached && new Date(cached.expires_at) > new Date()) {
      return new Response(JSON.stringify(cached.payload), {
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Fetch from EPC API
    const apiKey = Deno.env.get('EPC_API_KEY');
    const response = await fetch(
      `https://epc.opendatacommunities.org/api/v1/domestic/search?postcode=${postcode}`,
      {
        headers: {
          'Accept': 'text/csv',
          'Authorization': `Basic ${btoa(`:${apiKey}`)}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`EPC API error: ${response.statusText}`);
    }

    const csvData = await response.text();
    const jsonData = parseCSV(csvData); // Helper function to parse CSV

    // Store in cache
    await supabase
      .from('api_cache')
      .upsert({
        provider: 'epc',
        cache_key: cacheKey,
        payload: jsonData,
        ttl_seconds: 86400, // 24 hours
        fetched_at: new Date().toISOString()
      });

    return new Response(JSON.stringify(jsonData), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});

function parseCSV(csv: string): any[] {
  // Simple CSV parser (or use a library)
  const lines = csv.split('\n');
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    const values = line.split(',');
    return headers.reduce((obj, header, index) => {
      obj[header] = values[index];
      return obj;
    }, {} as any);
  });
}
```

**Frontend Integration**:
```typescript
// src/api/epc.ts
export async function getEPCData(postcode: string) {
  const { data, error } = await supabase.functions.invoke('epc', {
    body: { postcode }
  });

  if (error) throw error;
  return data;
}

// Usage in component
function EPCCard({ postcode }: { postcode: string }) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['epc', postcode],
    queryFn: () => getEPCData(postcode),
  });

  if (isLoading) return <Skeleton />;
  if (error) return <ErrorCard message="Failed to load EPC data" />;
  if (!data || data.length === 0) {
    return <EmptyState message="No EPC data available" />;
  }

  const latestEPC = data[0]; // Most recent certificate

  return (
    <Card>
      <CardHeader>
        <CardTitle>Energy Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <EPCBadge rating={latestEPC.current-energy-rating} />
          <div>
            <p className="text-sm text-muted-foreground">
              Current Efficiency: {latestEPC.current-energy-efficiency}
            </p>
            <p className="text-sm text-muted-foreground">
              Potential: {latestEPC.potential-energy-rating}
            </p>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">Annual Energy Cost</p>
            <p className="text-2xl font-bold">
              £{latestEPC.current-energy-cost}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">CO2 Emissions</p>
            <p className="text-2xl font-bold">
              {latestEPC.co2-emissions-current} tonnes/year
            </p>
          </div>
        </div>

        <Button variant="outline" className="mt-4 w-full">
          View Full Certificate
        </Button>
      </CardContent>
    </Card>
  );
}
```

### 2.2 Flood Risk API Integration

Similar structure to EPC, with edge function calling Environment Agency API.

### 2.3 Price Paid Data Integration

HM Land Registry price paid data with historical chart visualization.

### 2.4 Planning Data Integration

Planning.data.gov.uk integration with timeline view.

---

## Phase 3: Advanced Features (Weeks 9-12)

### 3.1 Property Claims & Ownership Verification

**Flow**:
1. User searches for their property
2. Clicks "Claim This Property"
3. Verification options:
   - Upload title deed
   - Utility bill verification
   - Admin manual verification
4. Property linked to user account
5. User becomes "Owner" for that property

### 3.2 Stakeholder Invitations

**Features**:
- Invite agents, surveyors, conveyancers
- Set access permissions and expiry
- Email invitation with magic link
- Accept/decline invitations
- Revoke access

### 3.3 Task Management

**Features**:
- Create tasks for properties
- Assign to stakeholders
- Set due dates and priorities
- Task completion workflow
- Email notifications

### 3.4 Notes & Comments

**Features**:
- Add property notes
- Public/shared/private visibility
- Threaded discussions
- @mentions
- Rich text editor

### 3.5 Report Generation

**Features**:
- PDF property passport
- Customizable sections
- Branded reports
- Email delivery
- Shareable links

---

## Phase 4: Analytics & AI (Weeks 13-16)

### 4.1 Property Analytics

**Features**:
- Page view tracking
- Document download stats
- Watchlist frequency
- Time on page
- User journey analysis

### 4.2 AI Document Analysis

**Features**:
- OCR for scanned documents
- Auto-extract key fields (EPC rating, title number)
- Document summarization
- Defect detection in surveys
- Recommendation engine

### 4.3 Price Predictions

**Features**:
- ML model for property valuation
- Trend analysis
- Neighborhood comparison
- Investment potential score

---

<a name="file-structure"></a>
# 9. 📁 Complete File Structure

```
ppuk-v7/
├── .github/
│   └── workflows/
│       ├── ci.yml                    # CI/CD pipeline
│       └── deploy.yml                # Deployment automation
│
├── public/
│   ├── favicon.ico
│   ├── robots.txt
│   └── placeholder.svg               # Default property image
│
├── src/
│   ├── api/                          # API functions
│   │   ├── auth.ts                   # Authentication APIs
│   │   ├── properties.ts             # Property CRUD
│   │   ├── documents.ts              # Document management
│   │   ├── photos.ts                 # Photo gallery
│   │   ├── epc.ts                    # EPC API wrapper
│   │   ├── flood.ts                  # Flood API wrapper
│   │   └── postcodes.ts              # Postcodes.io wrapper
│   │
│   ├── components/
│   │   ├── ui/                       # Shadcn/UI components (50+)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layouts/
│   │   │   ├── AppLayout.tsx         # Main app layout with sidebar
│   │   │   ├── AppSidebar.tsx        # Navigation sidebar
│   │   │   └── PublicLayout.tsx      # Layout for public pages
│   │   │
│   │   ├── property/
│   │   │   ├── PropertyCard.tsx      # Property list card
│   │   │   ├── PropertyHeader.tsx    # Passport page header
│   │   │   ├── OverviewTab.tsx       # Overview tab content
│   │   │   ├── DocumentsTab.tsx      # Documents tab
│   │   │   ├── PhotosTab.tsx         # Photos tab
│   │   │   ├── DataTab.tsx           # API data tab
│   │   │   ├── HistoryTab.tsx        # Timeline tab
│   │   │   └── StakeholdersTab.tsx   # Stakeholders tab
│   │   │
│   │   ├── documents/
│   │   │   ├── DocumentUploader.tsx  # Upload dialog
│   │   │   ├── DocumentList.tsx      # Document table
│   │   │   └── DocumentPreview.tsx   # PDF viewer
│   │   │
│   │   ├── photos/
│   │   │   ├── PhotoGallery.tsx      # Grid gallery
│   │   │   ├── PhotoUploader.tsx     # Upload dialog
│   │   │   └── Lightbox.tsx          # Full-screen viewer
│   │   │
│   │   ├── api-preview/
│   │   │   ├── EPCCard.tsx           # EPC data display
│   │   │   ├── FloodRiskCard.tsx     # Flood risk display
│   │   │   ├── PlanningCard.tsx      # Planning apps
│   │   │   └── PricePaidCard.tsx     # Sales history
│   │   │
│   │   ├── search/
│   │   │   ├── SearchBar.tsx         # Search input with filters
│   │   │   ├── FilterPanel.tsx       # Advanced filters
│   │   │   └── SortDropdown.tsx      # Sort options
│   │   │
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx         # Stats display card
│   │   │   ├── RecentActivity.tsx    # Activity feed
│   │   │   └── QuickActions.tsx      # Action buttons
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx         # Login form
│   │   │   ├── RegisterForm.tsx      # Registration form
│   │   │   └── ResetPasswordForm.tsx # Password reset
│   │   │
│   │   └── common/
│   │       ├── LoadingSkeleton.tsx   # Loading states
│   │       ├── ErrorCard.tsx         # Error display
│   │       ├── EmptyState.tsx        # Empty state
│   │       ├── PassportScore.tsx     # Completion score
│   │       └── Navbar.tsx            # Top navigation
│   │
│   ├── contexts/
│   │   ├── AuthContext.tsx           # Auth state provider
│   │   └── ThemeContext.tsx          # Theme provider (light/dark)
│   │
│   ├── hooks/
│   │   ├── useAuth.ts                # Auth hook
│   │   ├── useUserRole.ts            # Role checking hook
│   │   ├── useDebounce.ts            # Debounce hook
│   │   ├── useLocalStorage.ts        # Local storage hook
│   │   └── useMediaQuery.ts          # Responsive hook
│   │
│   ├── lib/
│   │   ├── supabase.ts               # Supabase client
│   │   ├── utils.ts                  # Utility functions
│   │   ├── constants.ts              # App constants
│   │   └── validations.ts            # Zod schemas
│   │
│   ├── pages/
│   │   ├── Home.tsx                  # Landing page
│   │   ├── Auth.tsx                  # Login/Register page
│   │   ├── Dashboard.tsx             # Role-based dashboard
│   │   ├── Properties.tsx            # Property list
│   │   ├── PropertyPassport.tsx      # Property detail page
│   │   ├── Search.tsx                # Search results
│   │   ├── Profile.tsx               # User profile
│   │   ├── Settings.tsx              # User settings
│   │   ├── Admin.tsx                 # Admin dashboard
│   │   └── NotFound.tsx              # 404 page
│   │
│   ├── types/
│   │   ├── database.ts               # Supabase generated types
│   │   ├── property.ts               # Property types
│   │   ├── user.ts                   # User types
│   │   └── api.ts                    # API response types
│   │
│   ├── App.tsx                       # Main app component
│   ├── main.tsx                      # Entry point
│   ├── index.css                     # Global styles
│   └── vite-env.d.ts                 # Vite types
│
├── supabase/
│   ├── config.toml                   # Supabase config
│   │
│   ├── migrations/
│   │   ├── 20250101_init_schema.sql  # Initial schema
│   │   ├── 20250102_create_buckets.sql
│   │   ├── 20250103_rls_policies.sql
│   │   ├── 20250104_audit_triggers.sql
│   │   └── ...
│   │
│   └── functions/
│       ├── epc/
│       │   └── index.ts              # EPC API integration
│       ├── flood/
│       │   └── index.ts              # Flood API integration
│       ├── postcodes/
│       │   └── index.ts              # Postcodes.io integration
│       ├── pricepaid/
│       │   └── index.ts              # HM Land Registry
│       ├── planning/
│       │   └── index.ts              # Planning data
│       ├── osplaces/
│       │   └── index.ts              # OS Places API
│       ├── police/
│       │   └── index.ts              # Crime data
│       ├── companies/
│       │   └── index.ts              # Companies House
│       ├── seed-dev-data/
│       │   └── index.ts              # Seed database
│       └── create-test-users/
│           └── index.ts              # Create test accounts
│
├── docs/
│   ├── API.md                        # API documentation
│   ├── DATABASE.md                   # Database schema docs
│   ├── DEPLOYMENT.md                 # Deployment guide
│   ├── TESTING.md                    # Testing guide
│   └── USER_GUIDE.md                 # End-user guide
│
├── scripts/
│   ├── generate-types.sh             # Generate TS types from DB
│   ├── seed-local.sh                 # Seed local database
│   └── deploy.sh                     # Deployment script
│
├── .env.example                      # Environment variables template
├── .gitignore
├── components.json                   # Shadcn/UI config
├── package.json
├── tsconfig.json                     # TypeScript config
├── tsconfig.app.json                 # App TS config
├── tsconfig.node.json                # Node TS config
├── vite.config.ts                    # Vite config
├── tailwind.config.ts                # Tailwind config
├── postcss.config.js                 # PostCSS config
├── eslint.config.js                  # ESLint config
└── README.md                         # Main readme
```

---

<a name="cursor-build-plan"></a>
# 10. 🛠️ Step-by-Step Build Plan for Cursor Agent/Codex

## 10.1 Project Initialization (Day 1)

### Step 1: Create New Project

**Cursor Command**:
```bash
# In terminal
npm create vite@latest ppuk-v7 -- --template react-ts
cd ppuk-v7
npm install
```

### Step 2: Install Core Dependencies

**Cursor Command**:
```bash
npm install @supabase/supabase-js@^2.58.0
npm install @tanstack/react-query@^5.83.0
npm install react-router-dom@^6.30.1
npm install @hookform/resolvers@^3.10.0
npm install react-hook-form@^7.61.1
npm install zod@^3.25.76
npm install date-fns@^3.6.0
npm install sonner@^1.7.4
npm install clsx@^2.1.1
npm install tailwind-merge@^2.6.0
```

### Step 3: Install TailwindCSS

**Cursor Command**:
```bash
npm install -D tailwindcss@^3.4.18 postcss@^8.5.6 autoprefixer@^10.4.21
npx tailwindcss init -p
```

### Step 4: Initialize Shadcn/UI

**Cursor Command**:
```bash
npx shadcn@latest init
# Choose: TypeScript, Tailwind CSS, Default style, Slate as base color
```

### Step 5: Install Shadcn Components

**Cursor Command**:
```bash
npx shadcn@latest add button card input label select tabs dialog sheet toast form table badge avatar separator skeleton alert progress checkbox switch textarea popover command dropdown-menu
```

### Step 6: Create `.env.local`

**Cursor Prompt**:
```
Create a .env.local file with placeholders for:
- VITE_SUPABASE_URL
- VITE_SUPABASE_ANON_KEY

And create .env.example with the same structure
```

---

## 10.2 Supabase Setup (Day 1-2)

### Step 1: Create Supabase Project

**Manual Steps** (on Supabase Dashboard):
1. Go to https://supabase.com
2. Click "New Project"
3. Name: "ppuk-v7"
4. Database Password: [generate strong password]
5. Region: London (closest to UK)
6. Wait for project to be created

### Step 2: Copy Connection Details

**Cursor Prompt**:
```
Update .env.local with:
- VITE_SUPABASE_URL from Supabase dashboard (Project Settings → API)
- VITE_SUPABASE_ANON_KEY from Supabase dashboard (Project Settings → API)
```

### Step 3: Create Database Schema

**Cursor Prompt**:
```
Create supabase/migrations/20250101_init_schema.sql with:
1. All enum types (user_role, property_party_role, document_type, etc.)
2. All 16 core tables from the schema section
3. All indexes
4. All triggers

Use the complete schema from section 5.3 of this blueprint.
```

**Apply Migration**:
```bash
# Install Supabase CLI first
npm install supabase --save-dev

# Link to project
npx supabase link --project-ref [your-project-ref]

# Push migration
npx supabase db push
```

### Step 4: Create Storage Buckets

**Cursor Prompt**:
```
Create supabase/migrations/20250102_storage_buckets.sql with SQL to create:
1. property-photos (PUBLIC bucket)
2. property-documents (PRIVATE bucket)
3. professional-reports (PRIVATE bucket)
4. warranties-guarantees (PRIVATE bucket)
5. planning-docs (PRIVATE bucket)

Include RLS policies for each bucket.
```

### Step 5: Create RLS Policies

**Cursor Prompt**:
```
Create supabase/migrations/20250103_rls_policies.sql with:
- All RLS policies from section 5.3
- Enable RLS on all tables
- Test policies for each user role

Use specific examples from the database schema section.
```

---

## 10.3 Authentication Setup (Day 2)

### Step 1: Create Supabase Client

**Cursor Prompt**:
```
Create src/lib/supabase.ts:
- Export configured Supabase client
- Use environment variables
- Enable auto-refresh and persist session
- Add TypeScript types
```

### Step 2: Create Auth Context

**Cursor Prompt**:
```
Create src/contexts/AuthContext.tsx:
- Manage user state
- Handle auth state changes
- Provide signIn, signUp, signOut functions
- Export useAuth hook
- Include loading states
```

### Step 3: Create Protected Route Component

**Cursor Prompt**:
```
Create src/components/ProtectedRoute.tsx:
- Check if user is authenticated
- Redirect to /auth if not logged in
- Show loading skeleton while checking
- TypeScript props interface
```

### Step 4: Create Auth Pages

**Cursor Prompt**:
```
Create src/pages/Auth.tsx:
- Tabbed interface (Login / Register)
- Email/password forms using react-hook-form
- Zod validation
- Error handling with toast
- Redirect to dashboard on success
- Include test user quick login buttons
```

---

## 10.4 Routing Setup (Day 2)

### Step 1: Configure React Router

**Cursor Prompt**:
```
Update src/App.tsx:
- Set up React Router with BrowserRouter
- Define all routes from file structure section
- Wrap authenticated routes with ProtectedRoute
- Include 404 route
- Add auth state check
```

**Routes to implement**:
- `/` - Home (public)
- `/auth` - Login/Register (public)
- `/search` - Search results (public)
- `/properties` - Property list (protected)
- `/properties/:id` - Property passport (protected)
- `/dashboard` - Dashboard (protected)
- `/profile` - User profile (protected)
- `/settings` - Settings (protected)
- `/admin` - Admin panel (admin only)
- `*` - 404 page

---

## 10.5 Layout Components (Day 3)

### Step 1: Create App Layout

**Cursor Prompt**:
```
Create src/components/layouts/AppLayout.tsx:
- Sidebar + header + main content area
- Collapsible sidebar
- Mobile responsive
- Use Shadcn Sheet for mobile menu
- Props: children
```

### Step 2: Create Sidebar

**Cursor Prompt**:
```
Create src/components/layouts/AppSidebar.tsx:
- Logo at top
- Navigation links (Dashboard, Properties, Profile, Settings)
- Admin section (conditional on role)
- Sign out button at bottom
- Highlight active route
- Icons from lucide-react
```

### Step 3: Create Navbar

**Cursor Prompt**:
```
Create src/components/common/Navbar.tsx:
- Logo (left)
- Navigation links (center): Home, Search
- Auth buttons (right): Sign In, Get Started
- Mobile menu toggle
- Sticky header
```

---

## 10.6 Landing Page (Day 3)

**Cursor Prompt**:
```
Create src/pages/Home.tsx with:

1. Hero Section:
   - Large heading: "Your Property's Digital Future"
   - Subheading about property passports
   - Search bar (postcode/address)
   - CTA button: "Get Started"
   - Hero image or illustration

2. Features Section (3 cards):
   - Card 1: "Verified & Secure" with blockchain icon
   - Card 2: "Complete Documentation" with folder icon
   - Card 3: "Faster Transactions" with speed icon
   - Each with title, description, icon

3. How It Works Section (3 steps):
   - Step 1: "Claim Your Property"
   - Step 2: "Add Documentation"
   - Step 3: "Share with Confidence"

4. CTA Section:
   - "Ready to Create Your Property Passport?"
   - Sign Up button

5. Footer:
   - Copyright
   - Links: Terms, Privacy, Contact

Use Shadcn components, Tailwind classes, responsive design.
Add smooth animations with Framer Motion.
```

---

## 10.7 Property Search (Day 4)

### Step 1: Create Search API Functions

**Cursor Prompt**:
```
Create src/api/properties.ts:
- searchProperties(params) function
- Full-text search on address
- Filters: property type, bedrooms, price range
- Pagination (20 per page)
- Sort options
- Return: { properties, total, page, totalPages }
- Error handling
```

### Step 2: Create Search Page

**Cursor Prompt**:
```
Create src/pages/Search.tsx:
- Search bar at top
- Filter panel (sidebar or collapsible)
- Sort dropdown
- Property cards grid (responsive)
- Pagination controls
- Loading skeletons
- Empty state: "No properties found"
- Use React Query for data fetching
```

### Step 3: Create Property Card Component

**Cursor Prompt**:
```
Create src/components/property/PropertyCard.tsx:
- Property image (or placeholder)
- Address
- Property type badge
- Bedrooms, bathrooms
- EPC rating badge
- Price (if available)
- "View Passport" button
- Hover effects
- Click to navigate to /properties/:id
```

---

## 10.8 Property Passport Page (Days 5-7)

### Step 1: Create Main Passport Page

**Cursor Prompt**:
```
Create src/pages/PropertyPassport.tsx:
- Get property ID from URL params
- Fetch property data with React Query
- Show loading skeleton
- 404 if property not found
- Header section:
  - Address (large)
  - PPUK reference
  - Property type, bedrooms, size
  - Passport completion score
- 6-tab interface using Shadcn Tabs
- Tab persistence in URL query param
```

### Step 2: Create Overview Tab

**Cursor Prompt**:
```
Create src/components/property/OverviewTab.tsx:
- Property details grid:
  - Type, Tenure, Year Built, Size, EPC Rating, Council Tax Band, etc.
- Map showing property location (use static map initially)
- Key stats cards
- Quick actions (Edit, Share, Download Report)
```

### Step 3: Create Documents Tab

**Cursor Prompt**:
```
Create src/components/property/DocumentsTab.tsx:
- Document list/table with columns:
  - Icon (based on type)
  - Filename
  - Type badge
  - Size
  - Uploaded date
  - Actions (Download, Delete)
- "Upload Document" button (only for owners)
- Empty state: "No documents uploaded"
- Use DocumentUploader component
```

**Then create DocumentUploader**:
```
Create src/components/documents/DocumentUploader.tsx:
- Dialog with form
- File picker (drag-and-drop support)
- Document type selector (11 types)
- Description textarea
- Upload button
- Progress indicator
- Upload to Supabase Storage
- Create document record in database
- Success toast
- Invalidate documents query to refetch
```

### Step 4: Create Photos Tab

**Cursor Prompt**:
```
Create src/components/property/PhotosTab.tsx:
- Photo gallery grid (responsive: 2/3/4 columns)
- "Upload Photos" button (only for owners)
- Empty state: "No photos yet"
- Click photo to open lightbox
- Use PhotoGallery and PhotoUploader components
```

**Then create PhotoGallery and PhotoUploader**:
```
Create src/components/photos/PhotoGallery.tsx:
- Grid of photo cards
- Photo with caption overlay
- Click to open Lightbox
- Lightbox: full-screen viewer with prev/next buttons

Create src/components/photos/PhotoUploader.tsx:
- Dialog with form
- Multiple file upload
- Caption input
- Room type selector
- Upload to Supabase Storage (property-photos bucket)
- Create photo records
- Thumbnail generation (future)
```

### Step 5: Create Data Tab (API Preview)

**Cursor Prompt**:
```
Create src/components/property/DataTab.tsx:
- Grid of API data preview cards:
  1. EPC Card (use EPCCard component)
  2. Flood Risk Card
  3. Price Paid Card
  4. Planning Card
- Each card shows preview data
- "View Full Data" links
- Loading states for each card
- Error handling
```

**Then create API preview cards**:
```
Create src/components/api-preview/EPCCard.tsx:
- Fetch EPC data for property postcode
- Display current rating badge (large)
- Energy efficiency score
- Annual cost
- Potential rating
- "View Certificate" button
- Use React Query with stale time

Create src/components/api-preview/FloodRiskCard.tsx:
- Similar structure for flood risk data

Create src/components/api-preview/PricePaidCard.tsx:
- Sales history timeline
- Price trend chart (use Recharts)

Create src/components/api-preview/PlanningCard.tsx:
- Recent planning applications
- Status badges
```

### Step 6: Create History Tab

**Cursor Prompt**:
```
Create src/components/property/HistoryTab.tsx:
- Timeline of property events
- Event cards with:
  - Date
  - Event type icon
  - Title
  - Description
- "Add Event" button (owners only)
- Sort by date (newest first)
- Empty state: "No events recorded"
```

### Step 7: Create Stakeholders Tab

**Cursor Prompt**:
```
Create src/components/property/StakeholdersTab.tsx:
- Table of stakeholders with columns:
  - Name
  - Email
  - Role badge
  - Permissions
  - Invited date
- "Invite Stakeholder" button (owners/agents only)
- Remove stakeholder button
- Empty state: "No stakeholders yet"
```

---

## 10.9 Dashboard Pages (Days 8-9)

### Step 1: Create Dashboard Router

**Cursor Prompt**:
```
Update src/pages/Dashboard.tsx:
- Get user role from useUserRole hook
- Route to role-specific dashboard:
  - 'owner' → OwnerDashboard
  - 'buyer' → BuyerDashboard
  - 'admin' → AdminDashboard
  - 'agent' → AgentDashboard
  - default → DefaultDashboard
```

### Step 2: Create Owner Dashboard

**Cursor Prompt**:
```
Create src/pages/dashboards/OwnerDashboard.tsx:
- Heading: "My Properties"
- Stats cards row (4 cards):
  - My Properties count
  - Avg completion score
  - Total documents
  - Estimated total value
- Properties grid (3 columns)
- Quick actions section
- Recent activity feed
```

### Step 3: Create Admin Dashboard

**Cursor Prompt**:
```
Create src/pages/Admin.tsx:
- Stats overview (4 cards):
  - Total users
  - Total properties
  - Total documents
  - System status
- Users table:
  - Name, Email, Role, Created date
  - Edit/Delete actions
- Properties table:
  - Address, Type, Owner, Created date
  - View/Delete actions
- Tabs: Users, Properties, Logs
```

---

## 10.10 Edge Functions (Days 10-12)

### Step 1: Create EPC Edge Function

**Cursor Prompt**:
```
Create supabase/functions/epc/index.ts:
- Accept postcode in request body
- Check api_cache table first
- If cached and valid, return cached data
- Otherwise, fetch from EPC API
- Parse CSV response to JSON
- Store in api_cache with 24hr TTL
- Return JSON response
- Error handling for API failures
```

**Deploy**:
```bash
npx supabase functions deploy epc
```

### Step 2: Create Flood Risk Function

**Cursor Prompt**:
```
Create supabase/functions/flood/index.ts:
- Similar structure to EPC function
- Accept lat/lng in request body
- Fetch from Environment Agency API
- Cache with 7-day TTL
- Return flood risk level and details
```

### Step 3: Create Postcodes Function

**Cursor Prompt**:
```
Create supabase/functions/postcodes/index.ts:
- Accept postcode in request body
- Fetch from postcodes.io
- No auth required
- Cache with 24hr TTL
- Return geography data (lat/lng, constituency, etc.)
```

### Step 4: Create Price Paid Function

**Cursor Prompt**:
```
Create supabase/functions/pricepaid/index.ts:
- Accept postcode in request body
- Fetch from HM Land Registry SPARQL endpoint
- Parse JSON response
- Cache with 30-day TTL
- Return list of transactions with prices and dates
```

### Step 5: Create Seed Dev Data Function

**Cursor Prompt**:
```
Create supabase/functions/seed-dev-data/index.ts:
- Create 5 test users (admin, owner, buyer, agent, surveyor)
- Create 10 mock properties with varied data
- Create 3-5 photos per property (Unsplash placeholders)
- Create 2-3 documents per property
- Link properties to owners
- Add sample events
- Idempotent (check if data exists first)
```

---

## 10.11 Testing & Quality Assurance (Days 13-14)

### Step 1: Manual Testing Checklist

**Cursor Prompt**:
```
Create a testing checklist in docs/TESTING.md:
- Authentication flows (login, register, logout)
- Property search with various filters
- Property passport viewing (all tabs)
- Document upload and download
- Photo upload and gallery
- Dashboard for each role
- Admin functions
- RLS policy enforcement (try cross-user access)
- Responsive design (mobile, tablet, desktop)
- Browser compatibility (Chrome, Firefox, Safari)
```

### Step 2: Run ESLint

```bash
npm run lint
# Fix any errors
npm run lint:fix
```

### Step 3: Type Check

```bash
npm run typecheck
# Resolve any TypeScript errors
```

---

## 10.12 Deployment (Day 15)

### Step 1: Environment Variables

**Cursor Prompt**:
```
Document all required environment variables in docs/DEPLOYMENT.md:
- Frontend: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
- Backend: SUPABASE_SERVICE_ROLE_KEY, EPC_API_KEY, etc.
- Where to find each value
- How to set in production
```

### Step 2: Deploy Database Migrations

```bash
# Ensure all migrations are applied
npx supabase db push

# Verify schema
npx supabase db diff
```

### Step 3: Deploy Edge Functions

```bash
# Deploy all functions
npx supabase functions deploy epc
npx supabase functions deploy flood
npx supabase functions deploy postcodes
npx supabase functions deploy pricepaid
# ... etc for all functions
```

### Step 4: Deploy Frontend to Vercel

**Manual Steps**:
1. Push code to GitHub
2. Connect Vercel to repo
3. Add environment variables in Vercel dashboard
4. Deploy

**Or via CLI**:
```bash
npm install -g vercel
vercel login
vercel --prod
```

---

## 10.13 Post-Launch (Days 16+)

### Step 1: Monitor & Optimize

**Cursor Prompt**:
```
Set up monitoring:
- Add Sentry for error tracking
- Set up PostHog for analytics
- Create Supabase alerts for:
  - High API usage
  - Database errors
  - Storage quota warnings
```

### Step 2: User Feedback

Create feedback mechanism:
- In-app feedback form
- Email: support@propertypassport.uk
- Track feature requests
- Prioritize bug fixes

### Step 3: Iterate & Improve

**Weekly review**:
- Check analytics (most used features)
- Review error logs
- User support tickets
- Plan next sprint

---

<a name="security"></a>
# 11. 🔒 Security & Compliance

## 11.1 Security Measures

### Row Level Security (RLS)
- Enabled on all tables
- Policies enforce data access per role
- No direct database access from frontend
- Service role key never exposed to client

### Authentication
- JWT tokens with automatic refresh
- OAuth integration (Google)
- Password reset with email verification
- Session persistence with expiry

### File Storage
- Public bucket only for non-sensitive photos
- Private buckets for documents
- Signed URLs with 1-hour expiry
- File type and size validation

### API Security
- Rate limiting per endpoint
- Request validation with Zod
- CORS configuration
- API key management (Supabase Secrets)

### Data Encryption
- TLS/SSL in transit (HTTPS)
- Database encryption at rest (Supabase default)
- Sensitive fields hashed (passwords)

## 11.2 GDPR Compliance

### Data Processing
- User consent for data collection
- Clear privacy policy
- Data processing agreement

### User Rights
- Right to access (download user data)
- Right to erasure (delete account)
- Right to rectification (edit data)
- Right to portability (export data)

### Audit Trail
- All actions logged in audit_log table
- Who, what, when, IP address
- 6-month retention policy

### Data Minimization
- Collect only necessary data
- No tracking without consent
- Regular data cleanup (old cache)

---

<a name="testing"></a>
# 12. 🧪 Testing Strategy

## 12.1 Testing Pyramid

```
       ┌─────────────┐
       │     E2E     │  (10% - Critical flows)
       └─────────────┘
     ┌─────────────────┐
     │  Integration    │  (30% - API & Components)
     └─────────────────┘
   ┌─────────────────────┐
   │   Unit Tests        │  (60% - Utils & Hooks)
   └─────────────────────┘
```

## 12.2 Test User Accounts

Create test accounts for each role:

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| ADMIN | admin@ppuk.test | Password123! | System administration |
| OWNER | owner@ppuk.test | Password123! | Property management |
| BUYER | buyer@ppuk.test | Password123! | Property viewing |
| AGENT | agent@ppuk.test | Password123! | Property listing |
| SURVEYOR | surveyor@ppuk.test | Password123! | Report upload |

## 12.3 Test Data

**10 Mock Properties**:
- Varied locations (London, Manchester, Birmingham)
- Different property types (detached, terraced, flat)
- Range of bedrooms (1-5)
- Different EPC ratings (A-G)
- Various price points (£100k - £1M)

---

<a name="deployment"></a>
# 13. 🚀 Deployment Guide

## 13.1 Production Checklist

- [ ] Environment variables set in production
- [ ] Database migrations applied
- [ ] Edge functions deployed
- [ ] Storage buckets created with RLS
- [ ] DNS configured
- [ ] SSL certificate active
- [ ] Error monitoring enabled
- [ ] Analytics configured
- [ ] Backup strategy in place
- [ ] Staging environment tested

## 13.2 Deployment Steps

### Database
```bash
# Apply migrations
npx supabase db push --linked

# Verify
npx supabase db remote commit
```

### Edge Functions
```bash
# Deploy all
supabase functions deploy --project-ref [project-ref]
```

### Frontend
```bash
# Build
npm run build

# Deploy to Vercel
vercel --prod
```

## 13.3 Post-Deployment

- Smoke test all critical flows
- Check error logs
- Monitor performance
- Verify API integrations

---

# 🎉 CONCLUSION

This blueprint provides everything needed to build Property Passport UK v7.0 from scratch using Cursor's agent and codex modes. Follow the step-by-step plan, implement each feature methodically, and you'll have a production-ready platform in 16 days.

**Key Success Factors**:
1. ✅ Follow the schema exactly
2. ✅ Implement RLS policies correctly
3. ✅ Test each feature thoroughly
4. ✅ Use Cursor prompts effectively
5. ✅ Deploy incrementally

**Total Timeline**: 16 days (full-time development)

**Next Steps**:
1. Start with Day 1: Project Initialization
2. Follow each section sequentially
3. Test after each major milestone
4. Deploy to staging before production

---

**Document Version**: 1.0  
**Last Updated**: November 26, 2025  
**Prepared For**: Joseph B. Weaver / Property Passport UK  
**Total Pages**: 120+ pages of comprehensive documentation

---

## 📞 Support & Questions

For questions about this blueprint:
- Email: joe@jbs-surveying.co.uk
- Location: London, UK

---

**END OF BLUEPRINT**
