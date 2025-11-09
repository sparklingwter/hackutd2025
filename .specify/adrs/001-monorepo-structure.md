# ADR 001: Monorepo Structure for Toyota Vehicle Shopping Platform

## Status

**Accepted**

## Context

The Toyota Vehicle Shopping Platform is a full-stack web application that combines multiple concerns:

- Frontend (Next.js 15.2 with React 19 and TypeScript 5.8)
- Backend API (tRPC 11 with Firestore)
- Shared libraries (`finance-engine`, `ranking-engine`)
- Infrastructure configuration (Firebase, ESLint, Tailwind)
- Documentation and specifications

We needed to decide on a repository structure that would:

1. **Support rapid iteration** during the HackUTD 2025 hackathon
2. **Enable code sharing** between frontend and backend
3. **Simplify dependency management** across related packages
4. **Facilitate deployment** to Firebase AppHosting
5. **Maintain code quality** with unified linting and formatting

### Decision Drivers

#### Business Constraints
- **Time-limited:** Hackathon development (24-48 hours)
- **Team size:** Small team (1-3 developers)
- **Single product:** No plans for independent services
- **Rapid deployment:** Need to ship quickly to Firebase

#### Technical Requirements
- **Type safety:** Shared TypeScript types between client and server
- **Library reuse:** Finance and ranking logic used by multiple features
- **Consistent tooling:** Same ESLint, Prettier, TypeScript configs everywhere
- **Atomic deploys:** All changes deploy together (no version skew)

## Decision

**We will use a monorepo structure with all code in a single repository.**

### Repository Structure

```
hackutd2025/
├── src/
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # React components
│   ├── lib/
│   │   ├── finance-engine/    # Shared library: Cost calculations
│   │   └── ranking-engine/    # Shared library: AI recommendations
│   ├── server/
│   │   ├── api/               # tRPC routers
│   │   └── db/                # Firestore utilities
│   └── trpc/                  # tRPC client setup
├── public/                     # Static assets
├── specs/                      # Documentation
├── firebase.json               # Firebase configuration
├── package.json               # Single dependency manifest
└── tsconfig.json              # Shared TypeScript config
```

### Key Architectural Decisions

#### 1. Shared Type Definitions

All types are defined once and reused across client and server:

```typescript
// src/server/api/schemas.ts (single source of truth)
export const VehicleSchema = z.object({
  id: z.string(),
  model: z.string(),
  // ...
});

export type Vehicle = z.infer<typeof VehicleSchema>;

// Used in tRPC router
export const vehiclesRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ vehicleId: z.string() }))
    .output(VehicleSchema)
    .query(async ({ input }) => { /* ... */ }),
});

// Used in React component
import type { Vehicle } from '~/server/api/schemas';

function VehicleCard({ vehicle }: { vehicle: Vehicle }) {
  // TypeScript knows exact shape
}
```

#### 2. Internal Libraries as Directories

`finance-engine` and `ranking-engine` are directories under `src/lib/` rather than separate npm packages:

```typescript
// Direct import - no package management needed
import { calculateFinanceEstimate } from '~/lib/finance-engine';
import { generateRecommendations } from '~/lib/ranking-engine';
```

**Benefits:**
- No `npm link` or workspace hoisting complexity
- Instant refactoring across boundaries
- Single `npm install` for all dependencies
- No version mismatches

#### 3. Unified Dependency Management

One `package.json` for the entire project:

```json
{
  "name": "hackutd2025",
  "dependencies": {
    "next": "15.2.0",
    "react": "19.0.0",
    "firebase-admin": "^12.0.0",
    "@trpc/server": "^11.0.0",
    "zod": "^3.22.0"
  },
  "devDependencies": {
    "typescript": "^5.8.0",
    "eslint": "^9.0.0",
    "prettier": "^3.0.0"
  }
}
```

No `lerna`, `turborepo`, or workspace configurations needed.

#### 4. Single Build Pipeline

```bash
# Development
npm run dev          # Start Next.js dev server

# Production
npm run build        # Build Next.js app with all libraries
firebase deploy      # Deploy entire stack
```

No orchestration of multiple build outputs.

## Alternatives Considered

### Option 1: Multi-Repo (Separate Repositories)

**Structure:**
```
hackutd2025-frontend/      (Next.js)
hackutd2025-backend/       (Firebase Functions)
hackutd2025-finance-lib/   (npm package)
hackutd2025-ranking-lib/   (npm package)
```

**Pros:**
- Clear separation of concerns
- Independent versioning
- Easier to open-source specific libraries

**Cons:**
- Requires npm package publishing workflow
- Type synchronization becomes manual
- Complex dependency management (4 repos with interdependencies)
- Slower iteration (publish → install → test cycle)
- Overhead for small team

**Why Rejected:** Too much overhead for hackathon timeline. Type safety would require manual effort.

### Option 2: Turborepo/Lerna Monorepo

**Structure:**
```
hackutd2025/
├── apps/
│   └── web/              (Next.js)
├── packages/
│   ├── finance-engine/   (npm workspace)
│   ├── ranking-engine/   (npm workspace)
│   └── shared-types/     (npm workspace)
└── package.json          (workspace root)
```

**Pros:**
- Better organized for future multi-app scaling
- Task caching and parallelization
- Independent package versioning

**Cons:**
- Added complexity (Turborepo config, workspace setup)
- Overkill for single web app
- Extra build orchestration
- Learning curve for tool-specific commands

**Why Rejected:** Unnecessary complexity. We don't have multiple apps to justify workspace overhead.

### Option 3: Microservices Architecture

**Structure:**
```
hackutd2025-web/           (Next.js frontend)
hackutd2025-api-gateway/   (Express REST API)
hackutd2025-ranking-svc/   (AI ranking service)
hackutd2025-finance-svc/   (Finance calculator service)
```

**Pros:**
- Independent scaling
- Language flexibility (Python for AI, Node for API)
- Clear service boundaries

**Cons:**
- Massive operational complexity (4 services)
- Network latency between services
- Distributed logging and debugging
- Service discovery and orchestration
- Overkill for traffic levels (MVP/hackathon)

**Why Rejected:** Premature optimization. A monolith serves hundreds of thousands of users before needing microservices.

## Consequences

### Positive

✅ **Fast Development**
- Zero time spent on repository coordination
- Instant refactoring across all code
- One-command setup: `npm install`

✅ **Type Safety Everywhere**
- tRPC provides end-to-end type safety from database to UI
- Zod schemas serve as single source of truth
- TypeScript compiler catches cross-boundary errors

✅ **Simplified Deployment**
- Single Firebase deploy for frontend + backend + functions
- Atomic deploys (all changes go live together)
- No version skew between services

✅ **Easier Code Review**
- All changes in one PR
- Full context for reviewers
- Unified CI/CD pipeline

✅ **Consistent Tooling**
- One ESLint config for everything
- One Prettier config for formatting
- One TypeScript config with consistent rules
- Shared Jest setup for all tests

### Negative

❌ **Slower CI/CD for Large Codebases**
- Every commit triggers full build (not a concern at current scale)
- **Mitigation:** Can add Turborepo later for caching if needed

❌ **Harder to Extract Services Later**
- If we need to split services, requires significant refactoring
- **Mitigation:** Keep libraries self-contained with clear boundaries

❌ **Single Point of Failure**
- If monorepo CI breaks, nothing deploys
- **Mitigation:** Comprehensive testing and staged rollouts

❌ **Cannot Deploy Features Independently**
- All changes deploy together
- **Mitigation:** Feature flags can enable gradual rollouts

## Migration Path (If Needed)

If we outgrow the monorepo structure, here's the migration path:

### Phase 1: Extract Libraries (Minimal Disruption)

```bash
# Create separate npm packages
hackutd2025/               (monorepo)
@hackutd/finance-engine/   (published package)
@hackutd/ranking-engine/   (published package)

# Update imports
- import { calculateFinance } from '~/lib/finance-engine';
+ import { calculateFinance } from '@hackutd/finance-engine';
```

### Phase 2: Split Frontend/Backend (If Needed)

```bash
hackutd2025-web/          (Next.js + tRPC client)
hackutd2025-api/          (tRPC server + Firebase)
```

**Cost:** ~2-4 developer-days to split cleanly

### Phase 3: Microservices (Only if Necessary)

Extract ranking service to Python for advanced ML:

```bash
hackutd2025-ranking-py/   (FastAPI service)
```

**Cost:** ~1-2 developer-weeks for service extraction + deployment setup

## References

- [Monorepo vs Multi-Repo Debate](https://www.toptal.com/developers/monorepo)
- [tRPC Monorepo Setup](https://trpc.io/docs/main/monorepo)
- [Next.js Monorepo Best Practices](https://vercel.com/blog/monorepos-are-changing-how-teams-build-software)
- [Google's Monorepo Philosophy](https://cacm.acm.org/magazines/2016/7/204032-why-google-stores-billions-of-lines-of-code-in-a-single-repository/fulltext)

## Decision Date

**2025-01-08**

## Decision Makers

- Primary Developer (hackutd2025 team)

## Review

This ADR should be reviewed if:
- Team size grows beyond 5 developers
- We need to deploy services independently
- Build times exceed 5 minutes
- We want to open-source specific libraries
- Traffic scales beyond 100k daily active users
