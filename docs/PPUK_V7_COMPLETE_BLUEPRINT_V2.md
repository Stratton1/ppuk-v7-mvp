# Property Passport UK V7.0 - Complete Blueprint V2
## Building From Scratch with Cursor Agent & Codex Mode

**Version:** 2.0  
**Last Updated:** November 2025  
**Purpose:** Complete technical and business blueprint for building Property Passport UK from scratch

---

# PART 1: BUSINESS OVERVIEW & MARKET CONTEXT

## 1.1 Executive Summary

Property Passport UK (PPUK) is a digital property passport platform designed to revolutionize UK residential property transactions. The platform consolidates fragmented property data into a single, secure, always-available digital passport for every UK residential property.

### The Problem We Solve

The UK property transaction system is fundamentally broken, creating massive inefficiencies and costs:

**Transaction Fall-Through Rates:**
- 24-30% of UK property sales collapse before completion (approximately 530,000 failed transactions annually)
- In Q2 2025, the rate spiked to 41% - the highest on record
- This compares to only 15% in the US and under 10% in Scotland

**Completion Times:**
- UK average: 179 days (nearly 6 months) from listing to completion
- This is the slowest among major developed countries
- Compare to: US (53 days), UAE (70 days), New Zealand (72 days), Canada (90 days), Australia (95 days)

**Economic Cost:**
- £1.5 billion per year in direct and indirect costs to the UK economy
- £560 million in direct costs to consumers (surveys, legal fees, mortgage fees)
- Average individual loss: £1,240 per failed transaction
- Average seller loss: £2,727, with 10% losing over £5,000

**Root Causes:**
- Archaic, paper-based processes
- Fragmented property data across multiple sources
- Offers not legally binding until contract exchange (2-3 months in)
- Chain dependencies causing cascading failures
- Gazumping (30-37% of buyers have experienced this)
- Mortgage difficulties (45% of failed sales in 2025)
- Chain breakdowns (18% of failures)

### Our Solution

Property Passport UK creates a permanent, structured digital record for every UK residential property, including:
- Ownership history and title information
- EPC (Energy Performance Certificate) data
- Planning history and applications
- Environmental risk assessments (flood, subsidence, radon)
- Local authority data and council tax information
- Utilities and infrastructure details
- Legal searches and conveyancing documents
- Historical documents, surveys, and guarantees

### Business Value Proposition

**For Property Owners:**
- Pre-prepared sale-ready documentation
- Faster time to exchange (potential 40-70% reduction)
- Reduced fall-through risk
- Transparent property history

**For Buyers:**
- Complete property transparency
- Reduced due diligence time
- Lower risk of surprises post-purchase
- Informed decision-making

**For Professionals (Agents, Conveyancers, Surveyors):**
- Streamlined workflow
- Reduced admin overhead
- Faster deal completion
- Higher conversion rates

---

## 1.2 Competitive Landscape

### UK PropTech Competitors

| Company | Focus | Differentiation |
|---------|-------|-----------------|
| **MoveGenius** | Digital onboarding for estate agents | Reduces fall-through by ~40% |
| **Hipla** | Digital Legal Packs | Transaction-ready sellers |
| **Gazeal** | Reservation Agreements | Reduces fall-through from 33% to 6% |
| **OneDome** | End-to-end platform | Bundles mortgage, conveyancing |
| **Coadjute** | Blockchain property network | Real-time data sharing |
| **PEXA** | Electronic settlement (from Australia) | Same-day completion |
| **Sprift** | Property data aggregation | 300+ data points per property |
| **Offr** | Digital offers platform | Claims 50% fall-through reduction |
| **View My Chain** | Chain visibility | Tracks all chain dependencies |

### PPUK Competitive Advantages

1. **UPRN-Centric Architecture**: Every property uniquely identified
2. **Comprehensive Data Aggregation**: 20+ free government API sources
3. **Multi-Stakeholder Platform**: Owners, buyers, agents, professionals
4. **Permanent Digital Record**: Passport persists across ownership changes
5. **Open Data First**: Leverages free UK government APIs
6. **Role-Based Access Control**: Fine-grained permissions

---

# PART 2: TECHNICAL ARCHITECTURE

## 2.1 Technology Stack

### Frontend
```
React 18.3.1 with TypeScript
Vite 5.x (build tool and dev server)
TailwindCSS 3.4.x with tailwindcss-animate
Shadcn/UI component library (Radix primitives)
React Router v6 for client-side routing
TanStack Query (React Query) 5.x for server state
React Hook Form + Zod for form handling
Framer Motion for animations
Recharts for data visualization
Lucide React for icons
```

### Backend (Supabase)
```
PostgreSQL database with full schema
Supabase Auth for authentication
Row Level Security (RLS) policies
Edge Functions (Deno runtime)
Supabase Storage for file management
Real-time subscriptions (optional)
```

### External APIs (Free Government Data)
```
EPC Register API
HM Land Registry Open Data
Environment Agency Flood Risk API
Police.uk Crime Data API
Postcodes.io
ONS (Office for National Statistics)
Ordnance Survey Open Data
DEFRA environmental datasets
British Geological Survey
And 50+ more free sources (detailed below)
```

---

## 2.2 Brand Identity & Design System

### Color Palette

| Color | Hex | HSL | Usage |
|-------|-----|-----|-------|
| **Navy Blue** | #002A5E | 215 100% 18% | Primary - Trust, Security |
| **Sky Blue** | #87CEEB | 197 71% 73% | Secondary - Transparency |
| **Slate Grey** | #708090 | 210 13% 50% | Tertiary - Accuracy |

### Extended Palette (Tailwind Config)

```typescript
// tailwind.config.ts
colors: {
  navy: {
    50: '#e6eef5',
    100: '#ccdcea',
    200: '#99b9d5',
    300: '#6696c0',
    400: '#3373ab',
    500: '#005096',
    600: '#002A5E', // Primary
    700: '#001f47',
    800: '#001530',
    900: '#000a18',
  },
  sky: {
    50: '#f0f9fc',
    100: '#e1f3f9',
    200: '#c3e7f3',
    300: '#a5dbed',
    400: '#87CEEB', // Primary
    500: '#5fb8de',
    600: '#37a2d1',
    700: '#2a7ea3',
    800: '#1d5a75',
    900: '#103647',
  },
  slate: {
    50: '#f8f9fa',
    100: '#f1f3f5',
    200: '#e9ecef',
    300: '#dee2e6',
    400: '#adb5bd',
    500: '#708090', // Primary
    600: '#5c6b77',
    700: '#48565e',
    800: '#344145',
    900: '#202c2c',
  }
}
```

### Design Principles

1. **Apple/Google/Meta Aesthetic**: Clean, modern, minimal
2. **WCAG 2.1 Accessibility**: Full compliance
3. **Mobile-First Responsive**: Desktop, tablet, mobile
4. **Progressive Disclosure**: Complexity on demand
5. **Skeleton Loading States**: Perceived performance

---

## 2.3 Database Schema

### Core Entities

#### 1. Users (Extended Profile)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'buyer',
  avatar_url TEXT,
  company_name TEXT,
  job_title TEXT,
  address_line_1 TEXT,
  address_line_2 TEXT,
  city TEXT,
  postcode TEXT,
  country TEXT DEFAULT 'UK',
  preferences JSONB DEFAULT '{}',
  is_verified BOOLEAN DEFAULT FALSE,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 2. Properties
```sql
CREATE TABLE properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uprn TEXT UNIQUE,  -- Unique Property Reference Number
  ppuk_reference TEXT UNIQUE NOT NULL,  -- Our internal reference
  address_line_1 TEXT NOT NULL,
  address_line_2 TEXT,
  city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  title_number TEXT,  -- Land Registry title
  property_type property_type NOT NULL,
  property_style property_style,
  bedrooms INTEGER,
  bathrooms INTEGER,
  total_floor_area_sqm DECIMAL,
  year_built INTEGER,
  tenure tenure_type NOT NULL DEFAULT 'freehold',
  lease_years_remaining INTEGER,
  ground_rent_annual DECIMAL,
  service_charge_annual DECIMAL,
  epc_rating TEXT,
  epc_score INTEGER,
  epc_expiry_date DATE,
  flood_risk_level TEXT,
  council_tax_band TEXT,
  local_authority TEXT,
  ward TEXT,
  conservation_area BOOLEAN DEFAULT FALSE,
  listed_building_grade TEXT,
  front_photo_url TEXT,
  claimed_by UUID REFERENCES users(id),
  completion_percentage INTEGER DEFAULT 0,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 3. Property Parties (Relationships)
```sql
CREATE TYPE property_party_role AS ENUM (
  'owner', 'purchaser', 'tenant', 'agent', 'surveyor', 
  'conveyancer', 'solicitor', 'mortgage_broker', 'insurance_advisor'
);

CREATE TYPE relationship_type AS ENUM ('owner', 'occupier', 'interested');

CREATE TABLE property_parties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role property_party_role NOT NULL,
  relationship relationship_type NOT NULL DEFAULT 'interested',
  permissions JSONB DEFAULT '{}',
  is_primary BOOLEAN DEFAULT FALSE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(property_id, user_id, role)
);
```

#### 4. Documents
```sql
CREATE TYPE document_type AS ENUM (
  'epc', 'floorplan', 'title_deed', 'survey', 'planning', 
  'lease', 'guarantee', 'building_control', 'gas_safety', 
  'electrical_safety', 'fensa', 'insurance', 'other'
);

CREATE TYPE document_status AS ENUM (
  'uploading', 'processing', 'ready', 'error', 'archived'
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  document_type document_type NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  storage_path TEXT,
  file_size_bytes INTEGER,
  mime_type TEXT,
  description TEXT,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  status document_status DEFAULT 'ready',
  checksum TEXT,
  tags TEXT[] DEFAULT '{}',
  is_public BOOLEAN DEFAULT FALSE,
  shared_with UUID[] DEFAULT '{}',
  download_count INTEGER DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  ai_summary TEXT,
  metadata JSONB,
  expiry_date DATE,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 5. Media (Photos/Videos)
```sql
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('photo', 'video', 'audio', '360', 'floorplan')),
  url TEXT NOT NULL,
  storage_path TEXT,
  file_name TEXT,
  file_size_bytes INTEGER,
  mime_type TEXT,
  caption TEXT,
  room_type TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  sort_order INTEGER DEFAULT 0,
  width INTEGER,
  height INTEGER,
  thumbnail_url TEXT,
  metadata JSONB,
  uploaded_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 6. API Cache
```sql
CREATE TYPE api_provider AS ENUM (
  'epc', 'hmlr', 'flood', 'police', 'planning', 'postcodes',
  'ons', 'os', 'defra', 'bgs', 'companies_house', 'voa', 'other'
);

CREATE TABLE api_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  provider api_provider NOT NULL,
  cache_key TEXT NOT NULL,
  payload JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ttl_seconds INTEGER NOT NULL DEFAULT 3600,
  etag TEXT,
  request_hash TEXT,
  response_size_bytes INTEGER,
  is_stale BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(provider, cache_key)
);
```

#### 7. Audit Log
```sql
CREATE TYPE audit_action AS ENUM (
  'create', 'read', 'update', 'delete', 'login', 'logout',
  'upload', 'download', 'share', 'invite', 'claim', 'unclaim'
);

CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES users(id),
  action audit_action NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  old_values JSONB,
  new_values JSONB,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  request_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 8. Notifications
```sql
CREATE TYPE notification_type AS ENUM (
  'info', 'warning', 'action_required', 'success', 'error',
  'planning_update', 'epc_update', 'document_shared', 'property_update'
);

CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  type notification_type NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  action_url TEXT,
  read_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 9. Watchlist (Saved Properties)
```sql
CREATE TABLE watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  notes TEXT,
  alert_on_changes BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, property_id)
);
```

#### 10. Notes
```sql
CREATE TYPE note_visibility AS ENUM ('private', 'shared', 'public');

CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  visibility note_visibility NOT NULL DEFAULT 'private',
  tags TEXT[] DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT FALSE,
  parent_note_id UUID REFERENCES notes(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### 11. Tasks
```sql
CREATE TYPE task_status AS ENUM (
  'pending', 'in_progress', 'completed', 'cancelled', 'on_hold'
);

CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'pending',
  priority task_priority NOT NULL DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),
  estimated_hours DECIMAL,
  actual_hours DECIMAL,
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 2.4 User Roles & Permissions

### Role Definitions

| Role | Code | Description |
|------|------|-------------|
| **ADMIN** | admin | Full system access, user management |
| **OWNER** | owner | Property owners, full property control |
| **PURCHASER** | purchaser | Potential buyers, view shared properties |
| **TENANT** | tenant | Current tenants, limited read access |
| **AGENT** | agent | Estate agents, upload/edit listings |
| **SURVEYOR** | surveyor | Upload surveys and reports |
| **CONVEYANCER** | conveyancer | Access legal docs, upload certifications |
| **LENDER** | lender | Mortgage lenders, valuation access |
| **PARTNER** | partner | API access, integration partners |

### Permission Matrix

| Resource | ADMIN | OWNER | BUYER | TENANT | AGENT | SURVEYOR | CONVEYANCER |
|----------|-------|-------|-------|--------|-------|----------|-------------|
| View Property | ✅ | ✅ Own | ✅ Shared | ✅ Own | ✅ Assigned | ✅ Assigned | ✅ Assigned |
| Edit Property | ✅ | ✅ Own | ❌ | ❌ | ✅ Assigned | ❌ | ❌ |
| Upload Documents | ✅ | ✅ Own | ❌ | ❌ | ✅ | ✅ | ✅ |
| View Documents | ✅ | ✅ Own | ✅ Public | ✅ Relevant | ✅ Assigned | ✅ Assigned | ✅ |
| Delete Documents | ✅ | ✅ Own | ❌ | ❌ | ❌ | ❌ | ❌ |
| Upload Photos | ✅ | ✅ Own | ❌ | ❌ | ✅ | ❌ | ❌ |
| View Photos | ✅ | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All | ✅ All |
| Manage Users | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Analytics | ✅ | ✅ Own | ❌ | ❌ | ✅ Limited | ❌ | ❌ |
| API Access | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

---

# PART 3: FREE UK GOVERNMENT APIs

## 3.1 Comprehensive API Catalog

### A. Property Data APIs

#### 1. EPC Register API (FREE)
```
URL: https://epc.opendatacommunities.org/api
Data: Energy Performance Certificates
Rate Limit: Fair use
Auth: API key (free registration)
Fields: Rating, score, recommendations, costs, floor area, build form
```

#### 2. HM Land Registry Open Data (FREE)
```
URLs:
- Price Paid Data: https://www.gov.uk/government/collections/price-paid-data
- INSPIRE Polygons: https://use-land-property-data.service.gov.uk/
- UK House Price Index: https://www.gov.uk/government/collections/uk-house-price-index-reports

Data: Transaction prices, property boundaries, price indices
Format: CSV, GeoJSON, API
```

#### 3. VOA Council Tax Data (FREE)
```
URL: https://voadata.uk/
Data: Council tax bands, valuations
Coverage: All UK properties
```

### B. Environmental & Risk APIs

#### 4. Environment Agency Flood Risk API (FREE)
```
URL: https://environment.data.gov.uk/flood-monitoring/
Endpoints:
- /id/floods - Current flood warnings
- /id/stations - Monitoring stations
- Long-term flood risk data

Data: Surface water, rivers, sea, groundwater risk
Format: JSON, GeoJSON
```

#### 5. DEFRA APIs (FREE)
```
Water Quality: https://environment.data.gov.uk/water-quality/
Air Quality: https://uk-air.defra.gov.uk/openair/R_data/
Noise Maps: Strategic noise maps

Data: Water quality, air pollution, noise levels
```

#### 6. British Geological Survey (FREE)
```
URL: https://www.bgs.ac.uk/data/services/
APIs:
- AGS File Utilities
- BGS OpenGeoscience OGCAPI Server
- BGS Sensor Data Service

Data: Geology, radon risk, ground stability, mining
```

#### 7. Coal Authority (FREE)
```
URL: https://www.gov.uk/government/organisations/coal-authority
Data: Mining risk, subsidence, coal workings
Coverage: England
```

### C. Planning & Local Authority APIs

#### 8. Local Planning Authority Feeds (FREE)
```
Format: RSS, GeoJSON, REST (varies by council)
Data: Planning applications, decisions, appeals
Note: Each council has different APIs - check individual councils

Examples:
- London: planning.london.gov.uk
- Many councils use Idox/Ocella systems with API access
```

#### 9. DLUHC Planning API (Prototype - FREE)
```
URL: https://www.planning.data.gov.uk/
Data: National planning data aggregation
Status: In development but accessible
```

#### 10. Conservation Areas (FREE)
```
Source: Historic England, Local Authorities
URL: https://historicengland.org.uk/listing/the-list/
Data: Conservation area boundaries, listed buildings
Format: GeoJSON, Shapefiles
```

### D. Maps & Geographic APIs

#### 11. Ordnance Survey Open Data (FREE)
```
URL: https://osdatahub.os.uk/
Free Products:
- OS OpenMap Local
- Boundary-Line
- OS Open Rivers
- OS Terrain 50
- CodePoint Open

Paid (but free tier): OS Places API (1000 calls/month free)
```

#### 12. Postcodes.io (FREE)
```
URL: https://postcodes.io/
Data: Postcode lookup, nearest postcodes, outcode data
Fields: Lat/long, admin districts, LSOA, parliamentary constituency
Rate Limit: Generous free tier
No Auth Required
```

#### 13. ONS Geographic Portal (FREE)
```
URL: https://geoportal.statistics.gov.uk/
Data: 
- Census boundaries
- Statistical geography
- Population data
- Index of Multiple Deprivation (IMD)
```

#### 14. OpenStreetMap Overpass API (FREE)
```
URL: https://overpass-api.de/
Data: Amenities, transport, POIs
Queries: Flexible query language
```

### E. Crime & Safety APIs

#### 15. Police.uk API (FREE)
```
URL: https://data.police.uk/api/
Endpoints:
- /crimes-street/{category}
- /crimes-at-location
- /crime-categories
- /stops-street

Data: Street-level crime, outcomes, stop and search
Coverage: England, Wales, Northern Ireland
No Auth Required
```

### F. Transport APIs

#### 16. Transport for London Unified API (FREE)
```
URL: https://api.tfl.gov.uk/
Data: Tube, bus, rail, cycling routes
Coverage: Greater London
Auth: Free API key
```

#### 17. National Public Transport (NaPTAN/NPTG) (FREE)
```
URL: https://naptan.api.dft.gov.uk/
Data: Bus stops, rail stations, access points
Format: XML, CSV, API
```

#### 18. Bus Open Data Service (FREE)
```
URL: https://data.bus-data.dft.gov.uk/
Data: Bus routes, schedules, real-time
Coverage: England
```

### G. Education APIs

#### 19. OFSTED Data (FREE)
```
URL: https://www.gov.uk/government/collections/maintained-schools-and-academies-inspections-and-outcomes
Data: School ratings, inspections
Format: CSV, API
```

#### 20. Department for Education (FREE)
```
URL: https://www.gov.uk/school-performance-tables
Data: School performance, catchment areas
```

### H. Utilities APIs

#### 21. Open Charge Map (FREE)
```
URL: https://openchargemap.org/site/develop/api
Data: EV charging points
Coverage: Global
```

#### 22. Ofcom Broadband Coverage (FREE)
```
URL: https://www.ofcom.org.uk/research-and-data/
Data: Broadband speeds, availability
Coverage: UK-wide
```

### I. Company & Financial APIs

#### 23. Companies House API (FREE)
```
URL: https://developer.companieshouse.gov.uk/
Data: Company information, directors, filings
Auth: Free API key
Rate Limit: 600 requests/5 minutes
```

#### 24. The Gazette (FREE)
```
URL: https://www.thegazette.co.uk/data
Data: Insolvency, property notices, legal announcements
Format: XML, JSON
```

#### 25. Bank of England Data (FREE)
```
URL: https://www.bankofengland.co.uk/boeapps/database/
Data: Interest rates, mortgage rates, economic indicators
```

### J. Additional Free Data Sources

#### 26. UK Hydrographic Office (FREE tier)
```
URLs: Various APIs for coastal/marine data
```

#### 27. Met Office (FREE datasets)
```
URL: https://www.metoffice.gov.uk/services/data
Data: Historical weather, climate projections
```

#### 28. NHS Locations (FREE)
```
URL: https://digital.nhs.uk/services/organisation-data-service
Data: GP surgeries, hospitals, pharmacies
```

#### 29. Prison API (FREE)
```
URL: https://prison-api.hmpps.service.justice.gov.uk/
Data: Prison locations (for location context)
```

#### 30. Carbon Intensity API (FREE)
```
URL: https://carbonintensity.org.uk/
Data: Regional carbon intensity of electricity
```

---

## 3.2 API Integration Architecture

### Edge Function Pattern

All external API calls should go through Supabase Edge Functions to:
1. Keep API keys secure (server-side only)
2. Implement caching (reduce API calls)
3. Add rate limiting
4. Transform data to consistent format
5. Handle errors gracefully

### Example Edge Function Structure

```typescript
// supabase/functions/api-epc/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Zod schemas for validation
const RequestSchema = z.object({
  postcode: z.string().regex(/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i),
  address: z.string().optional(),
  uprn: z.string().optional(),
});

serve(async (req: Request) => {
  // 1. CORS handling
  // 2. Rate limiting
  // 3. Request validation
  // 4. Cache check
  // 5. External API call (if cache miss)
  // 6. Response transformation
  // 7. Cache store
  // 8. Return response
});
```

---

# PART 4: APPLICATION STRUCTURE

## 4.1 Directory Structure

```
ppuk-v7/
├── 📄 README.md
├── 📄 QUICK_START.md
├── 📦 package.json
├── ⚙️ .env.example
├── 🎨 components.json (shadcn config)
├── 🚫 .gitignore
├── 📜 .cursorrules
│
├── 🎯 src/
│   ├── 📱 components/
│   │   ├── 🎨 ui/                    # Shadcn/ui primitives
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ... (40+ components)
│   │   │
│   │   ├── 🏢 business/              # Domain components
│   │   │   ├── PropertyCard.tsx
│   │   │   ├── PropertyDataPanel.tsx
│   │   │   ├── PhotoGallery.tsx
│   │   │   ├── DocumentUploader.tsx
│   │   │   ├── DocumentList.tsx
│   │   │   ├── PassportScore.tsx
│   │   │   ├── APIPreviewCard.tsx
│   │   │   ├── EPCDisplay.tsx
│   │   │   ├── FloodRiskDisplay.tsx
│   │   │   ├── CrimeDataDisplay.tsx
│   │   │   ├── PlanningDisplay.tsx
│   │   │   ├── PriceHistoryChart.tsx
│   │   │   ├── LocalAreaInfo.tsx
│   │   │   ├── StakeholderList.tsx
│   │   │   └── TimelineEvents.tsx
│   │   │
│   │   ├── 🏗️ layout/               # Layout components
│   │   │   ├── Navbar.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── AppLayout.tsx
│   │   │   ├── AuthLayout.tsx
│   │   │   └── DevAuthBypass.tsx
│   │   │
│   │   ├── 🔧 common/                # Shared components
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── EmptyState.tsx
│   │   │   ├── ErrorBanner.tsx
│   │   │   ├── DataAttribution.tsx
│   │   │   ├── SkeletonCard.tsx
│   │   │   └── ConfirmDialog.tsx
│   │   │
│   │   └── 📤 index.ts               # Barrel exports
│   │
│   ├── 📄 pages/
│   │   ├── 🌐 public/                # No auth required
│   │   │   ├── Home.tsx
│   │   │   ├── SearchResults.tsx
│   │   │   ├── PropertyPassport.tsx
│   │   │   ├── About.tsx
│   │   │   ├── Contact.tsx
│   │   │   ├── Pricing.tsx
│   │   │   └── TermsPrivacy.tsx
│   │   │
│   │   ├── 🔐 auth/                  # Authentication
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── ForgotPassword.tsx
│   │   │   ├── ResetPassword.tsx
│   │   │   └── VerifyEmail.tsx
│   │   │
│   │   ├── 📊 dashboard/             # Authenticated
│   │   │   ├── Dashboard.tsx
│   │   │   ├── MyProperties.tsx
│   │   │   ├── ClaimProperty.tsx
│   │   │   ├── PropertyEdit.tsx
│   │   │   ├── Watchlist.tsx
│   │   │   ├── Notifications.tsx
│   │   │   └── Settings.tsx
│   │   │
│   │   ├── 👑 admin/                 # Admin only
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── UserManagement.tsx
│   │   │   ├── PropertyManagement.tsx
│   │   │   ├── SystemLogs.tsx
│   │   │   └── APIStatus.tsx
│   │   │
│   │   ├── 🛠️ dev/                   # Dev tools
│   │   │   ├── TestLogin.tsx
│   │   │   ├── DebugStorage.tsx
│   │   │   ├── APIPlayground.tsx
│   │   │   └── ComponentGallery.tsx
│   │   │
│   │   ├── ❌ NotFound.tsx
│   │   └── 📤 index.ts
│   │
│   ├── 🧠 lib/
│   │   ├── 🌐 api/                   # API utilities
│   │   │   ├── client.ts
│   │   │   ├── hooks.ts
│   │   │   ├── mocks.ts
│   │   │   └── schemas.ts
│   │   │
│   │   ├── 🔧 utils/
│   │   │   ├── cn.ts
│   │   │   ├── formatters.ts
│   │   │   ├── validators.ts
│   │   │   └── constants.ts
│   │   │
│   │   └── 🛠️ dev/
│   │       └── devSeed.ts
│   │
│   ├── 🎣 hooks/
│   │   ├── useAuth.ts
│   │   ├── useProperty.ts
│   │   ├── useDocuments.ts
│   │   ├── useMedia.ts
│   │   ├── useNotifications.ts
│   │   ├── useWatchlist.ts
│   │   ├── useEPC.ts
│   │   ├── useFloodRisk.ts
│   │   ├── useCrimeData.ts
│   │   ├── useMobile.tsx
│   │   └── useToast.ts
│   │
│   ├── 📝 types/
│   │   ├── api.ts
│   │   ├── database.ts
│   │   ├── components.ts
│   │   └── index.ts
│   │
│   ├── 🔌 integrations/
│   │   └── supabase/
│   │       ├── client.ts
│   │       ├── types.ts
│   │       └── schema.ts
│   │
│   ├── 🎨 styles/
│   │   ├── globals.css
│   │   └── components.css
│   │
│   ├── 🎨 App.tsx
│   ├── 🎨 App.css
│   ├── 🎨 index.css
│   ├── 🚀 main.tsx
│   └── 📝 vite-env.d.ts
│
├── 🗄️ supabase/
│   ├── ⚙️ config.toml
│   │
│   ├── 📊 migrations/
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_create_tables.sql
│   │   ├── 003_create_enums.sql
│   │   ├── 004_create_indexes.sql
│   │   ├── 005_create_rls_policies.sql
│   │   ├── 006_create_triggers.sql
│   │   ├── 007_create_functions.sql
│   │   ├── 008_create_storage_buckets.sql
│   │   └── 009_seed_test_data.sql
│   │
│   └── ⚡ functions/
│       ├── 🔧 shared/
│       │   ├── types.ts
│       │   ├── utils.ts
│       │   ├── validation.ts
│       │   ├── cache.ts
│       │   └── errors.ts
│       │
│       ├── 🌐 api-epc/
│       │   └── index.ts
│       ├── 🌐 api-flood/
│       │   └── index.ts
│       ├── 🌐 api-hmlr/
│       │   └── index.ts
│       ├── 🌐 api-crime/
│       │   └── index.ts
│       ├── 🌐 api-planning/
│       │   └── index.ts
│       ├── 🌐 api-education/
│       │   └── index.ts
│       ├── 🌐 postcodes/
│       │   └── index.ts
│       ├── 🌐 search-address/
│       │   └── index.ts
│       │
│       ├── 📊 property-snapshot/
│       │   └── index.ts
│       ├── 📊 my-properties/
│       │   └── index.ts
│       ├── 📊 watchlist-add/
│       │   └── index.ts
│       ├── 📊 watchlist-remove/
│       │   └── index.ts
│       │
│       ├── 📤 upload-webhook/
│       │   └── index.ts
│       ├── 📤 document-worker/
│       │   └── index.ts
│       │
│       └── 🛠️ dev/
│           ├── create-test-users/
│           │   └── index.ts
│           ├── seed-dev-data/
│           │   └── index.ts
│           └── seed-property-media/
│               └── index.ts
│
├── 🛠️ dev/
│   ├── 📚 docs/
│   │   ├── API_DOCUMENTATION.md
│   │   ├── DATABASE_SETUP.md
│   │   ├── TESTING_GUIDE.md
│   │   └── DEPLOYMENT.md
│   │
│   ├── 📜 scripts/
│   │   ├── database/
│   │   │   ├── check-schema.sql
│   │   │   ├── setup-rls.sql
│   │   │   └── verify-setup.sql
│   │   └── testing/
│   │       ├── run-e2e-tests.sh
│   │       └── test-apis.sh
│   │
│   ├── 🧪 tests/
│   │   ├── e2e/
│   │   │   ├── owner-workflow.spec.ts
│   │   │   ├── buyer-workflow.spec.ts
│   │   │   └── security.spec.ts
│   │   └── fixtures/
│   │       ├── test-data.ts
│   │       └── files/
│   │
│   └── 🛠️ utils/
│       ├── auth-helpers.ts
│       └── property-helpers.ts
│
├── ⚙️ config/
│   ├── tailwind.config.ts
│   ├── vite.config.ts
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── tsconfig.app.json
│   ├── postcss.config.js
│   ├── eslint.config.js
│   └── playwright.config.ts
│
└── 🎨 public/
    ├── favicon.ico
    ├── robots.txt
    └── images/
        └── logo.svg
```

---

## 4.2 Page Routes

```typescript
// src/App.tsx - Route Configuration

const routes = [
  // Public Routes
  { path: '/', element: <Home /> },
  { path: '/search', element: <SearchResults /> },
  { path: '/property/:id', element: <PropertyPassport /> },
  { path: '/about', element: <About /> },
  { path: '/contact', element: <Contact /> },
  { path: '/pricing', element: <Pricing /> },
  { path: '/terms', element: <TermsPrivacy /> },
  { path: '/privacy', element: <TermsPrivacy /> },

  // Auth Routes
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/verify-email', element: <VerifyEmail /> },

  // Protected Routes (require auth)
  { 
    path: '/dashboard', 
    element: <RequireAuth><Dashboard /></RequireAuth> 
  },
  { 
    path: '/my-properties', 
    element: <RequireAuth><MyProperties /></RequireAuth> 
  },
  { 
    path: '/claim', 
    element: <RequireAuth><ClaimProperty /></RequireAuth> 
  },
  { 
    path: '/property/:id/edit', 
    element: <RequireAuth><PropertyEdit /></RequireAuth> 
  },
  { 
    path: '/watchlist', 
    element: <RequireAuth><Watchlist /></RequireAuth> 
  },
  { 
    path: '/notifications', 
    element: <RequireAuth><Notifications /></RequireAuth> 
  },
  { 
    path: '/settings', 
    element: <RequireAuth><Settings /></RequireAuth> 
  },

  // Admin Routes
  { 
    path: '/admin', 
    element: <RequireRole role="admin"><AdminDashboard /></RequireRole> 
  },
  { 
    path: '/admin/users', 
    element: <RequireRole role="admin"><UserManagement /></RequireRole> 
  },

  // Dev Routes (development only)
  { path: '/test-login', element: <TestLogin /> },
  { path: '/debug/storage', element: <DebugStorage /> },

  // 404
  { path: '*', element: <NotFound /> },
];
```

---

# PART 5: IMPLEMENTATION PHASES

## Phase 1: Foundation (Week 1-2)

### 1.1 Project Setup
```bash
# Create new Vite project
npm create vite@latest ppuk-v7 -- --template react-ts
cd ppuk-v7

# Install dependencies
npm install @supabase/supabase-js @tanstack/react-query react-router-dom
npm install @hookform/resolvers react-hook-form zod
npm install date-fns lucide-react recharts sonner
npm install tailwind-merge clsx class-variance-authority

# Install Radix primitives (via shadcn)
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card dialog form input tabs toast

# Install dev dependencies
npm install -D @types/node tailwindcss postcss autoprefixer
npm install -D @playwright/test eslint prettier typescript
```

### 1.2 Environment Configuration
```bash
# .env.example
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_APP_URL=http://localhost:5173

# Server-side only (in Supabase)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
EPC_API_KEY=your-epc-api-key
```

### 1.3 Supabase Setup
```sql
-- Run in Supabase SQL Editor
-- 1. Create enums
-- 2. Create all tables
-- 3. Create indexes
-- 4. Enable RLS on all tables
-- 5. Create RLS policies
-- 6. Create triggers
-- 7. Create storage buckets
```

### 1.4 Authentication System
- Implement Supabase Auth context
- Create auth hooks (useAuth, useUser, useRole)
- Build Login, Register, Password Reset pages
- Implement protected route components

### 1.5 Base UI Components
- Set up Tailwind with brand colors
- Configure shadcn/ui components
- Create layout components (Navbar, Sidebar, Footer)
- Build common components (Loading, Empty, Error states)

---

## Phase 2: Core Features (Week 3-4)

### 2.1 Property Management
- Property listing page
- Property detail page (Passport)
- Property search functionality
- Property claiming flow

### 2.2 Property Passport Tabs
```typescript
const passportTabs = [
  { id: 'overview', label: 'Overview', icon: Home },
  { id: 'documents', label: 'Documents', icon: FileText },
  { id: 'photos', label: 'Photos', icon: Image },
  { id: 'data', label: 'Data', icon: Database },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'stakeholders', label: 'People', icon: Users },
];
```

### 2.3 Document Management
- Document uploader component
- Document list with categories
- Download with signed URLs
- Document preview

### 2.4 Photo Gallery
- Photo upload with progress
- Gallery grid layout
- Lightbox viewer
- Featured image selection

### 2.5 Passport Score
- Calculate completion percentage
- Display requirements checklist
- Progress visualization

---

## Phase 3: API Integration (Week 5-6)

### 3.1 Edge Functions Development
- Create shared utilities (validation, caching, errors)
- Implement EPC API function
- Implement Flood Risk API function
- Implement HMLR API function
- Implement Crime Data API function
- Implement Planning API function
- Implement Postcodes function

### 3.2 Frontend API Hooks
```typescript
// Example: useEPC hook
export function useEPC(postcode: string, enabled = true) {
  return useQuery({
    queryKey: ['epc', postcode],
    queryFn: () => fetchEPCData(postcode),
    enabled: enabled && !!postcode,
    staleTime: 1000 * 60 * 60, // 1 hour
  });
}
```

### 3.3 Data Display Components
- EPCDisplay component
- FloodRiskDisplay component
- CrimeDataDisplay component
- PlanningDisplay component
- PriceHistoryChart component

---

## Phase 4: User Features (Week 7-8)

### 4.1 Dashboard
- Role-based dashboard views
- Property summary cards
- Recent activity feed
- Quick actions

### 4.2 Watchlist
- Add/remove properties
- Alert configuration
- Notes per property

### 4.3 Notifications
- In-app notifications
- Email notifications (via Supabase)
- Notification preferences

### 4.4 User Settings
- Profile management
- Password change
- Notification preferences
- Account deletion

---

## Phase 5: Professional Features (Week 9-10)

### 5.1 Multi-Stakeholder Access
- Invite stakeholders to property
- Role-based permissions
- Stakeholder management UI

### 5.2 Notes & Tasks
- Property-level notes
- Task assignment
- Task status tracking
- Task notifications

### 5.3 Report Generation
- Property report PDF
- Passport summary
- Data export

---

## Phase 6: Admin & Analytics (Week 11-12)

### 6.1 Admin Dashboard
- System overview
- User management
- Property management
- API usage stats

### 6.2 Audit Logging
- Track all actions
- View audit trail
- Export logs

### 6.3 Analytics
- User engagement metrics
- Property statistics
- API usage tracking

---

## Phase 7: Polish & Launch (Week 13-14)

### 7.1 Performance Optimization
- Image optimization
- Lazy loading
- Bundle splitting
- Caching strategies

### 7.2 Security Hardening
- Security audit
- Rate limiting
- Input validation
- CSP headers

### 7.3 Testing
- E2E test suite
- Integration tests
- Performance tests
- Accessibility tests

### 7.4 Documentation
- User documentation
- API documentation
- Developer docs
- Deployment guide

---

# PART 6: CURSOR CODEX INSTRUCTIONS

## 6.1 Initial Setup Prompts

### Prompt 1: Project Initialization
```
Create a new React + TypeScript project with Vite for Property Passport UK.
Set up the following:
1. React 18 with TypeScript strict mode
2. Tailwind CSS with custom brand colors (Navy #002A5E, Sky #87CEEB, Slate #708090)
3. React Router v6 with typed routes
4. Supabase client configuration
5. TanStack Query setup
6. shadcn/ui initialization with all base components

Create the complete folder structure as specified in the blueprint.
```

### Prompt 2: Database Schema
```
Create Supabase migrations for Property Passport UK:
1. All enums (user_role, property_type, document_type, etc.)
2. All tables (users, properties, property_parties, documents, media, etc.)
3. All indexes for performance
4. All RLS policies for security
5. All triggers for updated_at timestamps
6. Storage buckets for documents and photos

Follow the exact schema from the blueprint.
```

### Prompt 3: Authentication System
```
Implement the complete authentication system:
1. AuthContext with Supabase Auth
2. useAuth, useUser, useRole hooks
3. RequireAuth and RequireRole components
4. Login page with email/password and test user buttons
5. Register page with role selection
6. Password reset flow
7. Email verification handling

Include proper error handling and loading states.
```

## 6.2 Feature Implementation Prompts

### Prompt 4: Property Passport Page
```
Create the PropertyPassport page with 6 tabs:
1. Overview - Property details, key stats, passport score
2. Documents - Document list with upload, download, categories
3. Photos - Photo gallery with upload, lightbox, featured
4. Data - API data cards (EPC, Flood, Crime, Planning)
5. History - Timeline of events and changes
6. Stakeholders - List of connected users with roles

Include loading skeletons, error states, and empty states for each tab.
```

### Prompt 5: Edge Functions
```
Create Supabase Edge Functions for external APIs:
1. api-epc - Fetch EPC data with caching
2. api-flood - Fetch flood risk data
3. api-hmlr - Fetch land registry data
4. api-crime - Fetch police crime data
5. api-planning - Fetch planning applications
6. postcodes - Postcode lookup and validation

Each function should:
- Validate input with Zod
- Check cache first
- Handle rate limiting
- Transform response to consistent format
- Store in cache
- Return typed response
```

### Prompt 6: Dashboard
```
Create role-based dashboards:
1. Owner dashboard - My properties, completion scores, pending tasks
2. Buyer dashboard - Watchlist, saved properties, recent views
3. Agent dashboard - Assigned properties, client list, activity
4. Admin dashboard - System stats, user management, API status

Include stat cards, property lists, and quick actions appropriate to each role.
```

## 6.3 Component Prompts

### Prompt 7: Document Uploader
```
Create DocumentUploader component with:
1. Drag-drop file upload
2. File type validation (PDF, DOCX, PNG, JPG)
3. Size limit (10MB)
4. Document type selection dropdown
5. Description field
6. Upload progress indicator
7. Success/error toast notifications
8. Integration with Supabase Storage

Handle both public and private document buckets.
```

### Prompt 8: Photo Gallery
```
Create PhotoGallery component with:
1. Grid layout (responsive 2/3/4 columns)
2. Drag-drop upload for owners
3. Caption and room type fields
4. Lightbox viewer for full-size
5. Featured image selection
6. Thumbnail generation
7. Lazy loading with blur placeholders

Include read-only mode for non-owners.
```

### Prompt 9: API Data Cards
```
Create reusable APIPreviewCard components for:
1. EPCDisplay - Rating badge, score, costs, recommendations
2. FloodRiskDisplay - Risk levels with color coding, mitigation
3. CrimeDataDisplay - Crime categories, trends, comparison
4. PlanningDisplay - Recent applications, decisions, constraints
5. PriceHistoryDisplay - Transaction chart, price trends

Each should show:
- Loading skeleton
- "Simulated Data" badge when using mocks
- Data source attribution
- Last updated timestamp
- Error state with retry option
```

## 6.4 Testing Prompts

### Prompt 10: Test Setup
```
Create test infrastructure:
1. Playwright configuration for E2E tests
2. Test user accounts and fixtures
3. Owner workflow test (claim, upload, edit)
4. Buyer workflow test (search, view, save)
5. Security test (RLS policies, unauthorized access)

Include test data seeding and cleanup.
```

---

# PART 7: TEST USERS & CREDENTIALS

## 7.1 Test Accounts

| Role | Email | Password | Purpose |
|------|-------|----------|---------|
| Admin | admin@ppuk.test | Password123! | Full system access |
| Owner | owner@ppuk.test | Password123! | Property management |
| Buyer | buyer@ppuk.test | Password123! | Browse, watchlist |
| Tenant | tenant@ppuk.test | Password123! | Limited access |
| Agent | agent@ppuk.test | Password123! | Professional workflow |
| Surveyor | surveyor@ppuk.test | Password123! | Document upload |
| Conveyancer | conveyancer@ppuk.test | Password123! | Legal documents |

## 7.2 Test Login Page

```typescript
// Display credentials on login page for development
const testUsers = [
  { role: 'Admin', email: 'admin@ppuk.test', icon: Shield },
  { role: 'Owner', email: 'owner@ppuk.test', icon: Home },
  { role: 'Buyer', email: 'buyer@ppuk.test', icon: Search },
  { role: 'Agent', email: 'agent@ppuk.test', icon: Building },
];

// Quick login buttons that auto-create user if needed
```

---

# PART 8: DEPLOYMENT CHECKLIST

## 8.1 Pre-Launch

- [ ] All RLS policies enabled and tested
- [ ] Environment variables configured
- [ ] API keys secured (server-side only)
- [ ] CORS configured correctly
- [ ] Storage buckets created with policies
- [ ] Error monitoring set up
- [ ] Performance budgets met
- [ ] Accessibility audit passed
- [ ] Security audit passed
- [ ] E2E tests passing
- [ ] Documentation complete

## 8.2 Go-Live

- [ ] DNS configured
- [ ] SSL certificates active
- [ ] CDN configured
- [ ] Database backups scheduled
- [ ] Monitoring dashboards active
- [ ] Alerting configured
- [ ] Support channels ready
- [ ] Analytics tracking live

---

# PART 9: FUTURE ROADMAP

## Phase 2 Features (Post-MVP)

1. **AI Document Analysis** - OCR and data extraction from uploaded documents
2. **Property Walkthrough Wizard** - Guided onboarding for owners
3. **Chain Visibility** - Track linked transactions
4. **Valuation Estimates** - Automated valuations using HMLR data
5. **Mobile App** - React Native companion app
6. **API Marketplace** - Third-party integrations
7. **Blockchain Verification** - Immutable document hashing
8. **White-Label Solution** - For estate agents and conveyancers

---

# APPENDIX A: ADDITIONAL FREE API DETAILS

## A.1 Microsoft Building Footprints (FREE)
```
URL: https://github.com/microsoft/GlobalMLBuildingFootprints
Data: High-resolution building outlines for UK
Format: GeoJSON
```

## A.2 DEFRA Noise Maps (FREE)
```
URL: Strategic noise maps from DEFRA
Data: Aircraft, road, rail noise levels
Format: Shapefiles, GeoJSON
```

## A.3 Local Authority Open Data Portals
Most councils publish via ArcGIS:
- Tree preservation orders
- Parking zones
- Public rights of way
- Conservation areas
- Local plan layers

## A.4 ArcGIS REST Services
```
Many councils expose data via ESRI servers with anonymous API queries
Example: https://maps.council.gov.uk/arcgis/rest/services/
```

---

# APPENDIX B: CURSOR RULES FILE

```
// .cursorrules - Place in project root

Persona & Mission
You are Lead AI Engineer for Property Passport UK (PPUK).
Mission: build a secure, scalable, delightful property data platform.

Core Principles:
1. TypeScript strict mode - no 'any' without justification
2. Zod validation for all external inputs
3. RLS policies on all user-data tables
4. Edge Functions for external API calls
5. Component-per-file with co-located tests
6. Prefer composition over inheritance
7. Use React Query for server state
8. Use Tailwind + shadcn/ui for styling
9. Keep secrets server-side only
10. Add comprehensive error handling

File Structure:
- src/components/ui/ - shadcn primitives
- src/components/business/ - domain components
- src/components/layout/ - layout components
- src/pages/ - route components
- src/hooks/ - custom hooks
- src/lib/ - utilities
- src/types/ - TypeScript types
- supabase/functions/ - Edge Functions
- supabase/migrations/ - Database migrations

Coding Standards:
- Function components + hooks only
- Export named components
- Use React.memo for expensive renders
- Add data-testid for E2E tests
- Comment complex business logic
- Use semantic HTML + ARIA
- Mobile-first responsive design
```

---

**End of Blueprint V2**

*This document provides the complete foundation for building Property Passport UK from scratch using Cursor with Agent and Codex mode. Follow the phases sequentially, using the provided prompts as starting points for each feature.*
