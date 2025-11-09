# Research: Toyota Vehicle Shopping Experience

**Branch**: `001-vehicle-shopping-experience` | **Date**: 2025-11-08  
**Purpose**: Resolve technical unknowns and establish best practices for implementation

## Research Tasks

### 1. Gemini API Rate Limits and Tier Selection

**Unknown**: Gemini API rate limits and tier/quotas for production use

**Decision**: **Gemini 2.0 Flash** with **Pay-as-you-go pricing** (no free tier for production)

**Rationale**:

- **Gemini 2.0 Flash**: Optimized for speed (<1s response time for recommendations), supports structured output (JSON mode), multimodal capabilities (future voice/image support), cost-effective at $0.075/1M input tokens, $0.30/1M output tokens
- **Rate Limits**: Free tier has 15 RPM (requests per minute) and 1M TPM (tokens per minute) — insufficient for production. Pay-as-you-go tier has 1,000 RPM and 4M TPM, suitable for thousands of concurrent users
- **Fallback**: OpenRouter provides redundancy if Gemini quota exceeded or API unavailable

**Alternatives Considered**:

- **Gemini 1.5 Pro**: Higher accuracy but slower and more expensive ($1.25/1M input, $5.00/1M output) — overkill for vehicle recommendations
- **Claude via OpenRouter**: Excellent quality but higher cost and no native Google ecosystem integration
- **GPT-4 Turbo**: High cost, rate limits, no native integration with Firebase

**Implementation Notes**:

- Request quota increase from Google AI Studio for production deployment
- Implement caching for repeated recommendation requests (same user profile)
- Use structured output (JSON mode) to ensure consistent response format
- Set timeout to 5s, fallback to OpenRouter if Gemini fails
- Track API usage with Cloud Monitoring to avoid quota exhaustion

---

### 2. Speech-to-Text (STT) Provider Selection

**Unknown**: STT provider selection (browser SpeechRecognition API or third-party)

**Decision**: **ElevenLabs Speech-to-Text** (unified voice solution)

**Rationale**:

- **ElevenLabs STT**: High accuracy (95%+), low latency (<200ms), seamless integration with TTS, unified API and billing, supports 29+ languages
- **Unified Solution**: Single vendor for both STT and TTS simplifies authentication, reduces integration complexity, consistent voice quality
- **Cost Effective**: Included in ElevenLabs subscription tiers, no separate STT billing, predictable pricing model
- **Real-time Streaming**: WebSocket support for live transcription, automatic punctuation and formatting, robust noise handling

**Alternatives Considered**:

- **Browser Web Speech API**: Free but inconsistent accuracy, no Safari support, limited punctuation, privacy concerns with cloud fallback
- **Deepgram**: Excellent quality but separate vendor, additional API key management, $0.0043/min separate billing
- **Google Cloud Speech-to-Text**: Higher cost ($0.016/min), requires separate GCP setup
- **Azure Speech**: Good quality but $1.00/hour, complex authentication, enterprise overkill

**Implementation Notes**:

- Use ElevenLabs WebSocket API for real-time streaming transcription
- Configure automatic punctuation and formatting for better UX
- Display live transcription feedback in UI as user speaks
- Implement error handling with graceful fallback to text input
- Provide text fallback button always visible for accessibility

---

### 3. Firebase Firestore Best Practices for Vehicle Data

**Research Task**: Best practices for Firestore schema design, indexing, and query optimization

**Decision**: **Denormalized schema** with **composite indexes** for faceted search

**Key Patterns**:

#### Schema Design

```typescript
// Recommended Firestore schema that maps closely to the provided JSON files
// Top-level collections:
//  - sources (optional): documents describing each raw source file + generation metadata
//  - vehicles: one document per (make, model, year, trim/option) — stores joined data from epa/vpic/carquery
//  - metadata/makes/{make}/years/{year}: aggregated counts_by_year, useful for fast stats

// Collection: sources (optional)
// doc id example: "lexus_epa_2025"
{
  sourceId: "lexus_epa_2025",
  make: "Lexus",
  source: "epa",
  generatedAt: timestamp, // e.g. metadata.generated_at from JSON
  license: "US Gov (public domain)",
  notes: "raw EPA export stored in GCS",
}

// Collection: vehicles
// Document id recommendation: `${make.toLowerCase()}_${model.toLowerCase()}_${year}_${(trim||'base').replace(/\s+/g,'_')}`
// This document stores joined, denormalized fields for fast querying, plus a raw sub-object per source
{
  id: "toyota_camry_2024_le",
  make: "Toyota",
  model: "Camry",
  year: 2024,
  trim: "LE", // may be null/empty when trim not present
  canonicalKey: "toyota|camry|2024|le", // machine-friendly join key

  // Denormalized / searchable fields (pick the ones you need for facets)
  bodyStyle: "sedan",
  fuelType: "hybrid",
  seating: 5,
  msrp: 28855,
  mpgCity: 51,
  mpgHighway: 53,
  mpgCombined: 52,
  awd: false,
  features: ["adaptive-cruise", "lane-keep", "blind-spot"],

  // Raw / source-specific objects that mirror the JSON structure so you never lose fidelity
  epa: {
    // useful join keys from EPA dataset
    epa_model_year_id: "EPA-123456", // optional if present in EPA record
    epa_option_desc: "Auto (S6), 6 cyl, 3.5 L",
    city_mpg: 51,
    highway_mpg: 53,
    combined_mpg: 52,
    // keep the entire raw object if desired (or a compressed subset)
    raw: {/* small subset or reference to stored raw EPA JSON blob in GCS */}
  },

  vpic: {
    vpic_model_id: "VPIC-98765",
    vehicle_types: ["Passenger Car"],
    models_by_year: {/* structure copied from vpic.models_by_year for this make/model/year */},
    raw: {/* optional raw object or reference */}
  },

  carquery: {
    trim_id: "CARQ-555",
    trim_specs: {/* horsepower, torque, dimensions */},
    raw: {/* optional raw object or reference */}
  },

  // provenance & tooling
  sources: ["epa:lexus/epa/2025", "vpic:lexus/2025", "carquery:lexus/2025"],
  createdAt: timestamp,
  updatedAt: timestamp,
}

// Collection: metadata (aggregates and helper docs)
// Example document to store counts_by_year from the JSON
// path: metadata/makes/toyota
{
  make: "Toyota",
  years: [2015, 2016, 2017, /* ... */ 2025],
  counts_by_year: { "2015": 53, "2016": 51, /* ... */ },
  lastUpdated: timestamp,
  sources: ["epa", "vpic", "carquery"]
}

// Collection: userProfiles (authenticated users)
{
  userId: "auth0|123",
  preferences: {
    budget: 500,
    bodyStyle: "suv",
    fuelType: "hybrid",
    seating: 7,
    // ... all discovery inputs
  },
  favorites: ["4runner-2024", "highlander-2024"],
  savedSearches: [{...}],
  compareSets: [{vehicleIds: [...], name: "My Comparison"}],
  estimates: [{...}],
  createdAt: timestamp,
}

// Collection: dealerLeads
{
  userId: "auth0|123",
  vehicleIds: ["camry-2024"],
  estimateId: "est_123",
  contactInfo: {name, email, phone},
  consent: true,
  zipCode: "75080",
  createdAt: timestamp,
}

// Notes on mapping and joins:
//  - Primary join keys: make, model, year, trim (or option description). Use a deterministic canonicalKey.
//  - EPA tends to be the most granular for engine/option desc; use `epa_option_desc` to disambiguate trims when CarQuery trim names differ.
//  - Store raw source blobs (or a GCS pointer) under each vehicle doc to preserve fidelity for future fixes.
//  - Keep denormalized fields (bodyStyle, fuelType, msrp, mpgs) at top-level of vehicle doc for efficient queries.
//  - Use `metadata/makes/{make}/years/{year}` documents for fast faceting and counts instead of scanning large vehicle collections.

// Example mapping pseudocode (seeding job):
// for each epaVehicle in epa.vehicles:
//   key = canonicalKey(epaVehicle.make, epaVehicle.model, epaVehicle.year, normalizedTrim(epaVehicle.epa_option_desc))
//   doc = getOrCreate(docRef('vehicles', key))
//   doc.epa = minimalEPAFields(epaVehicle)
//   enrich with carquery trim by matching year/make/model/trim
//   enrich with vpic data by matching year/make/model
//   set top-level denormalized fields used for queries
```

#### Query Patterns

```typescript
// Faceted search with multiple filters
db.collection('vehicles')
  .where('bodyStyle', '==', 'suv')
  .where('fuelType', '==', 'hybrid')
  .where('seating', '>=', 7)
  .where('msrp', '<=', 50000)
  .orderBy('msrp')
  .limit(20);

// Composite index required: (bodyStyle, fuelType, seating, msrp)
```

#### Best Practices

1. **Denormalize for read performance**: Store frequently-accessed fields directly in vehicles collection (not references)
2. **Use subcollections for 1:many**: Trims as subcollection of vehicles (not separate collection with vehicleId reference)
3. **Composite indexes**: Create indexes for common filter combinations in Firebase Console
4. **Limit query results**: Always use `.limit(N)` to avoid large reads
5. **Pagination**: Use `startAfter(lastDoc)` for cursor-based pagination (not offset)
6. **Security Rules**: Enforce read/write rules at collection level:
   - `vehicles`: read=all, write=admin
   - `userProfiles`: read=owner, write=owner
   - `dealerLeads`: read=admin, write=authenticated

**Alternatives Considered**:

- **Normalized schema**: Requires multiple queries (vehicles, then trims), increases latency and read costs
- **Algolia for search**: Excellent but adds $1/month + usage costs, increases complexity, not needed for 50-model dataset
- **Full-text search in Firestore**: Limited (no fuzzy matching, no ranking), use Gemini for semantic search instead

**Implementation Notes**:

- Use Firestore emulator for local development (`firebase emulators:start`)
- Export production data with `firebase firestore:export` for backups
- Monitor read/write costs in Firebase Console (optimize expensive queries)
- Use batch writes for seeding data (`writeBatch()`)

---

### 4. Auth0 Integration with Next.js and Firebase

**Research Task**: Best practices for Auth0 authentication in Next.js (App Router) with Firebase Firestore authorization

**Decision**: **Auth0 Next.js SDK v4** with **middleware-based routing** and **Firebase JWT verification**

**Key Patterns**:

#### Authentication Flow

1. User signs in via Auth0 Universal Login (social/passwordless)
2. Auth0 issues JWT with custom claims (`sub`, `email`, `email_verified`)
3. Next.js middleware intercepts all requests and handles auth routes automatically
4. Server components use `auth0.getSession()` for user context
5. Client components use `useUser()` hook from `@auth0/nextjs-auth0`
6. Firebase Security Rules verify JWT signature and claims

#### Critical v4 SDK Requirements

**⚠️ BREAKING CHANGES FROM v3:**

- **NO dynamic route handlers** (`app/auth/[...auth0]/route.ts` is obsolete in v4)
- **Middleware is mandatory** for authentication routes to work
- **Auth0Provider** (not UserProvider) for client component wrapping
- **Import hooks from base package**: `@auth0/nextjs-auth0` (not `/client`)
- **Navigation via `<a>` tags**: Login/logout must use href, not onClick handlers

#### Implementation Structure

```typescript
// lib/auth0.ts - Auth0 Client Configuration
import { Auth0Client } from '@auth0/nextjs-auth0/server';

export const auth0 = new Auth0Client();

// middleware.ts - REQUIRED for v4 (root directory, same level as package.json)
import type { NextRequest } from "next/server";
import { auth0 } from "./lib/auth0";

export async function middleware(request: NextRequest) {
  return await auth0.middleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};

// src/server/api/trpc.ts - tRPC Context with Auth0
import { auth0 } from "@/lib/auth0";

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const session = await auth0.getSession();
  const user = session?.user;

  return {
    db: getFirestore(),
    userId: user?.sub,
    user,
  };
};

// Protected procedure example
const protectedProcedure = publicProcedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({ ctx: { ...ctx, userId: ctx.userId } });
});

// src/app/layout.tsx - Auth0Provider for Client Components
import { Auth0Provider } from "@auth0/nextjs-auth0";
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Auth0Provider>
          {children}
        </Auth0Provider>
      </body>
    </html>
  );
}

// components/LoginButton.tsx - Correct Navigation Pattern
"use client";

export default function LoginButton() {
  return (
    <a href="/auth/login" className="button login">
      Log In
    </a>
  );
}

// components/Profile.tsx - Client Component with useUser Hook
"use client";

import { useUser } from "@auth0/nextjs-auth0";

export default function Profile() {
  const { user, isLoading } = useUser();

  if (isLoading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div>
      <img src={user.picture} alt={user.name || 'User'} />
      <h2>{user.name}</h2>
      <p>{user.email}</p>
    </div>
  );
}

// src/app/page.tsx - Server Component with getSession
import { auth0 } from "@/lib/auth0";
import LoginButton from "@/components/LoginButton";
import Profile from "@/components/Profile";

export default async function Home() {
  const session = await auth0.getSession();
  const user = session?.user;

  return (
    <div>
      {user ? (
        <>
          <p>✅ Logged in as {user.name}</p>
          <Profile />
          <a href="/auth/logout">Log Out</a>
        </>
      ) : (
        <>
          <p>Welcome! Please log in.</p>
          <LoginButton />
        </>
      )}
    </div>
  );
}
```

#### Environment Configuration (.env.local)

```bash
# Auth0 Configuration - ALL REQUIRED
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_SECRET=your-long-random-secret-32-chars-minimum
APP_BASE_URL=http://localhost:3000
```

#### Auth0 Dashboard Configuration

- **Application Type**: Regular Web Application
- **Allowed Callback URLs**: `http://localhost:3000/auth/callback`
- **Allowed Logout URLs**: `http://localhost:3000`
- **Allowed Web Origins**: `http://localhost:3000`
- **Custom Claims**: Add `role` claim via Auth0 Action for admin users
- **Social Connections**: Enable Google, Apple (optional Facebook, GitHub)

#### Firebase Security Rules Integration

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    match /vehicles/{vehicleId} {
      allow read: if true; // Public read
      allow write: if isAuthenticated() && request.auth.token.role == 'admin';
    }
    
    match /userProfiles/{userId} {
      allow read, write: if isOwner(userId);
    }
    
    match /dealerLeads/{leadId} {
      allow create: if isAuthenticated() && request.resource.data.userId == request.auth.uid;
      allow read: if isAuthenticated() && request.auth.token.role == 'admin';
    }
  }
}
```

**Security Best Practices**:

1. **Never hardcode credentials**: Always use environment variables from `.env.local`
2. **HTTP-only cookies**: Auth0 SDK manages this automatically (prevents XSS)
3. **Middleware is mandatory**: Without it, `/auth/*` routes return 404
4. **Server-side session validation**: Use `getSession()` in server components, not client-side token parsing
5. **Role-based access**: Add custom claims via Auth0 Actions, verify in Firebase rules

**Common Integration Pitfalls**:

1. ❌ **Creating dynamic route handlers** - v4 handles this automatically via middleware
2. ❌ **Using button onClick for auth** - Must use `<a href="/auth/login">` for proper routing
3. ❌ **Importing from wrong path** - Use `@auth0/nextjs-auth0` not `@auth0/nextjs-auth0/client`
4. ❌ **Missing middleware.ts** - Auth routes won't work without it
5. ❌ **Wrong provider name** - Use `Auth0Provider` not `UserProvider` in v4

**Alternatives Considered**:

- **Firebase Authentication**: Simpler but lacks social login flexibility, no enterprise SSO
- **NextAuth.js**: Open-source but requires self-managed OAuth flows, more complex setup
- **Clerk**: Modern alternative but Auth0 has better enterprise features and compliance

**Implementation Notes**:

- Install SDK: `npm install @auth0/nextjs-auth0@latest`
- Generate AUTH0_SECRET: `openssl rand -hex 32` (Windows: PowerShell RandomNumberGenerator)
- Use Auth0 CLI for automated setup (optional): `auth0 apps create`
- Configure Auth0 Actions for custom claims (e.g., adding Firestore user ID on first login)
- Monitor authentication in Auth0 Dashboard > Monitoring > Logs

---

### 6. ElevenLabs TTS Best Practices

**Research Task**: Best practices for ElevenLabs text-to-speech integration (voice selection, caching, latency)

**Decision**: **ElevenLabs Turbo v2.5** with **browser-side audio playback** and **Firebase Storage caching**

**Key Patterns**:

#### Voice Selection

- **Primary Voice**: "Rachel" (Professional Female) — clear, friendly, trustworthy tone for automotive context
- **Fallback Voice**: "Adam" (Professional Male) — alternative for user preference
- **Model**: `eleven_turbo_v2_5` — lowest latency (300-500ms), sufficient quality for prompts/summaries
- **Settings**: `stability=0.5, similarity_boost=0.75` — balanced for natural speech

#### Caching Strategy

```typescript
// Cache static prompts in Firebase Storage
// Path: gs://bucket/audio-cache/{voiceId}/{hash}.mp3

// Generate hash from text + voice + settings
const cacheKey = `${voiceId}/${md5(text + model + stability)}`;

// Check cache before API call
const cachedUrl = await storage.ref(cacheKey).getDownloadURL();
if (cachedUrl) return cachedUrl;

// Generate via ElevenLabs API
const audio = await elevenlabs.generate(text, voiceId, model);
await storage.ref(cacheKey).put(audio);

return downloadUrl;
```

#### Latency Optimization

1. **Pre-generate common prompts**: Cache discovery journey questions at build time
2. **Stream audio**: Use WebSocket API for long-form content (>100 words)
3. **Client-side playback**: Return audio URL, play in browser (no server streaming)
4. **Prefetch next prompt**: Load next question audio while user responds

**Rate Limits & Pricing**:

- **Free Tier**: 10,000 characters/month — insufficient for production
- **Starter Tier**: $5/month, 30,000 characters — suitable for hackathon/demo
- **Creator Tier**: $22/month, 100,000 characters — production tier for 1000s users
- **Rate Limit**: 2 requests/second on paid tiers

**Best Practices**:

1. **Chunk long text**: Split summaries into <500 character chunks (better latency)
2. **Graceful degradation**: If ElevenLabs fails, display text only (no voice)
3. **User control**: Mute button always visible, persist preference in localStorage
4. **Accessibility**: Always show captions alongside audio

**Alternatives Considered**:

- **Google Cloud TTS**: Cheaper ($4/1M chars) but robotic quality, not suitable for conversational experience
- **Amazon Polly**: Good quality but $4/1M chars, less natural than ElevenLabs
- **Azure Speech**: $15/1M chars, high quality but expensive
- **PlayHT**: Similar quality to ElevenLabs but higher pricing ($19/month for 50k chars)

**Implementation Notes**:

- Store ElevenLabs API key in `.env.local`
- Use `elevenlabs` npm package for API calls
- Create server action for generating audio (not tRPC, avoid timeout)
- Use `<audio>` HTML element with controls for playback
- Track audio generation costs in Firebase Cloud Functions logs

---

### 7. tRPC API Contract Design Best Practices

**Research Task**: Best practices for tRPC router design, input validation, error handling

**Decision**: **Modular routers** with **Zod schemas** and **typed errors**

**Key Patterns**:

#### Router Structure

```typescript
// apps/web/src/server/api/routers/vehicles.ts
import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';

export const vehiclesRouter = createTRPCRouter({
  // Public endpoints
  list: publicProcedure
    .input(
      z.object({
        bodyStyle: z.enum(['sedan', 'suv', 'truck', 'van']).optional(),
        fuelType: z.enum(['gas', 'hybrid', 'electric']).optional(),
        maxPrice: z.number().positive().optional(),
        limit: z.number().min(1).max(50).default(20),
      })
    )
    .query(async ({ input, ctx }) => {
      let query = ctx.db.collection('vehicles');
      
      if (input.bodyStyle) query = query.where('bodyStyle', '==', input.bodyStyle);
      if (input.fuelType) query = query.where('fuelType', '==', input.fuelType);
      if (input.maxPrice) query = query.where('msrp', '<=', input.maxPrice);
      
      const snapshot = await query.limit(input.limit).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }),

  getById: publicProcedure
    .input(z.string())
    .query(async ({ input, ctx }) => {
      const doc = await ctx.db.collection('vehicles').doc(input).get();
      if (!doc.exists) throw new TRPCError({ code: 'NOT_FOUND', message: 'Vehicle not found' });
      return { id: doc.id, ...doc.data() };
    }),

  // Protected endpoints
  favorite: protectedProcedure
    .input(z.string())
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.userId!;
      await ctx.db.collection('userProfiles').doc(userId).update({
        favorites: FieldValue.arrayUnion(input),
      });
      return { success: true };
    }),
});
```

#### Error Handling

```typescript
// Custom error types
export class VehicleNotFoundError extends TRPCError {
  constructor(vehicleId: string) {
    super({
      code: 'NOT_FOUND',
      message: `Vehicle ${vehicleId} not found`,
    });
  }
}

export class RateLimitError extends TRPCError {
  constructor() {
    super({
      code: 'TOO_MANY_REQUESTS',
      message: 'Rate limit exceeded. Please try again later.',
    });
  }
}

// Client-side error handling
const { data, error } = trpc.vehicles.getById.useQuery('camry-2024');

if (error) {
  if (error.data?.code === 'NOT_FOUND') {
    return <NotFoundMessage />;
  }
  if (error.data?.code === 'TOO_MANY_REQUESTS') {
    return <RateLimitMessage />;
  }
  return <GenericError />;
}
```

#### Input Validation

- **Use Zod schemas**: Define reusable schemas in `server/api/schemas.ts`
- **Validate at boundary**: Input validation in procedure, business logic assumes valid input
- **Type-safe outputs**: Return types inferred from query/mutation return value
- **Pagination**: Use cursor-based (not offset) for large result sets

**Best Practices**:

1. **One router per domain**: `vehicles`, `compare`, `estimate`, `profile`, `dealer` (not one giant router)
2. **Public vs protected**: Use `publicProcedure` for read-only, `protectedProcedure` for user-specific writes
3. **Keep procedures thin**: Move business logic to separate service functions (easier to test)
4. **Return DTOs**: Don't expose raw Firestore documents (transform before return)
5. **Handle rate limits**: Implement rate limiting middleware for expensive operations (AI recommendations)

**Alternatives Considered**:

- **REST API**: tRPC provides better type safety, no need to maintain OpenAPI specs
- **GraphQL**: More complex, overkill for simple CRUD operations
- **Server Actions**: Good for forms but tRPC better for complex queries/mutations

**Implementation Notes**:

- Define shared Zod schemas in `server/api/schemas.ts`
- Use tRPC React Query hooks for client-side data fetching
- Enable request batching in tRPC config (reduce round trips)
- Use tRPC links for auth, logging, error transformation

---

### 8. Firestore Security Rules Best Practices

**Research Task**: Best practices for Firebase Security Rules design

**Decision**: **Least-privilege rules** with **function-based validation**

**Key Patterns**:

#### Security Rules Structure

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    
    function isOwner(userId) {
      return isAuthenticated() && request.auth.uid == userId;
    }
    
    function isAdmin() {
      return isAuthenticated() && request.auth.token.role == 'admin';
    }
    
    function incomingData() {
      return request.resource.data;
    }
    
    function existingData() {
      return resource.data;
    }
    
    // Public collections
    match /vehicles/{vehicleId} {
      allow read: if true;
      allow write: if isAdmin();
      
      match /trims/{trimId} {
        allow read: if true;
        allow write: if isAdmin();
      }
    }
    
    // User-specific collections
    match /userProfiles/{userId} {
      allow read: if isOwner(userId);
      allow create: if isOwner(userId) && incomingData().userId == userId;
      allow update: if isOwner(userId) && existingData().userId == userId;
      allow delete: if isOwner(userId);
    }
    
    // Write-only collections (dealer leads)
    match /dealerLeads/{leadId} {
      allow read: if isAdmin();
      allow create: if isAuthenticated() 
        && incomingData().userId == request.auth.uid
        && incomingData().consent == true
        && incomingData().keys().hasAll(['userId', 'vehicleIds', 'contactInfo', 'consent', 'zipCode']);
      allow update, delete: if false; // Immutable
    }
    
    // Anonymous user data (local storage fallback)
    match /anonymousSessions/{sessionId} {
      allow read, write: if request.auth == null; // Unauthenticated only
      // Auto-delete after 30 days via TTL policy
    }
  }
}
```

---

### 9. Monorepo Tooling and Dependency Management

**Research Task**: Best practices for monorepo setup with multiple packages (apps/web, packages/finance-engine, packages/ranking-engine)

**Decision**: **npm workspaces** with **Turbo** for build orchestration

**Rationale**:

- **npm**: Native Node.js package manager, well-established workspace support, no additional installation required
- **Turbo**: Incremental builds with caching, parallel task execution, optimal for monorepos with shared packages
- **No Lerna/Nx**: Simpler alternatives, Turbo sufficient for 3-package monorepo

**Workspace Structure**:

```json
// package.json (root)
{
  "name": "toyota-vehicle-shopping",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "lint": "turbo run lint"
  },
  "devDependencies": {
    "turbo": "^2.3.0",
    "typescript": "^5.8.0",
    "prettier": "^3.4.2",
    "eslint": "^9.16.0"
  }
}

// turbo.json
{
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {}
  }
}

// packages/finance-engine/package.json
{
  "name": "@toyota/finance-engine",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
  }
}

// apps/web/package.json
{
  "name": "@toyota/web",
  "dependencies": {
    "@toyota/finance-engine": "workspace:*",
    "@toyota/ranking-engine": "workspace:*",
    "next": "^15.2.0",
    "react": "^19.0.0"
  }
}
```

**Best Practices**:

1. **Shared dependencies in root**: Install common devDependencies (TypeScript, ESLint, Prettier) at root
2. **Scoped packages**: Use `@toyota/` namespace for internal packages
3. **Workspace protocol**: Reference local packages with `workspace:*` (npm resolves correctly)
4. **Incremental builds**: Turbo caches build outputs, only rebuilds changed packages
5. **Parallel execution**: Turbo runs independent tasks in parallel (e.g.,  finance-engine and ranking-engine simultaneously)

**Alternatives Considered**:

- **pnpm workspaces**: Faster with hard links, but requires additional global installation
- **Yarn workspaces**: Good workspace support but adds another dependency
- **Lerna**: Legacy tool, overly complex for 3 packages
- **Nx**: Powerful but overkill, steeper learning curve

**Implementation Notes**:

- Initialize workspace: `npm init` at root
- Add packages: `npm install <package> --workspace=@toyota/web`
- Run commands: `npm run dev` (runs all dev scripts) or `npm run dev --workspace=@toyota/web` (specific package)

---

## Summary of Decisions

| Area | Decision | Key Benefit |
|------|----------|-------------|
| **Gemini API** | Gemini 2.0 Flash, Pay-as-you-go | Speed, cost-effective, structured output |
| **STT** | ElevenLabs Speech-to-Text | Unified solution, high accuracy, low latency |
| **Firestore Schema** | Denormalized with composite indexes | Fast reads, faceted search |
| **Auth0** | Next.js SDK + custom JWT | Secure, social login, enterprise-ready |
| **ElevenLabs** | Turbo v2.5 + Firebase Storage cache | Low latency, natural voice, cost-effective |
| **tRPC Design** | Modular routers + Zod validation | Type-safe, maintainable |
| **Security Rules** | Least-privilege | Secure, validated, prevents unauthorized access |
| **Monorepo** | npm + Turbo | Fast, efficient, incremental builds |

---

## Next Steps (Phase 1)

1. Create `data-model.md` defining entities and relationships
2. Generate tRPC API contracts in `/contracts/`
3. Write `quickstart.md` for developer onboarding
4. Run `update-agent-context.ps1` to update agent knowledge
5. Re-evaluate Constitution Check after design phase
