# Implementation Plan: Toyota Vehicle Shopping Experience

**Branch**: `001-vehicle-shopping-experience` | **Date**: 2025-11-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-vehicle-shopping-experience/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build an AI-guided vehicle shopping experience enabling users to discover, compare, and estimate Toyota vehicles through voice and text. Core capabilities include guided discovery with personalized recommendations (Top Picks, Strong Contenders, Alternatives), side-by-side comparison (up to 4 vehicles), cost estimation (cash/finance/lease with tax/fee calculation), and dealer connection. Technical approach uses Next.js (App Router) with tRPC for type-safe APIs, Firestore for persistence, Gemini API for AI recommendations, ElevenLabs for voice, and Auth0 for authentication. Emphasizes simplicity, accessibility (WCAG 2.1 AA), transparency (AI/TTS disclosure, non-binding disclaimers), and modular design (finance-engine and ranking-engine libraries).

## Technical Context

**Language/Version**: TypeScript 5.8, React 19, Next.js 15.2 (App Router with Server Components)  
**Primary Dependencies**: tRPC 11, Zod (validation), Firebase SDK (Firestore, Storage, AppHosting), Auth0 SDK, Gemini API SDK, ElevenLabs API SDK, OpenRouter SDK (fallback), Tailwind CSS 4.0, shadcn/ui, tweakcn, Lucide icons  
**Storage**: Firebase Firestore (vehicles, trims, pricing/incentives, user preferences, comparison sets, estimates, dealer leads), Firebase Storage (vehicle images, audio assets)  
**Target Platform**: Web (desktop-first responsive design, mobile/tablet adaptive), deployed to Firebase AppHosting with GoDaddy DNS  
**Project Type**: Single Next.js application with integrated libraries: 1) Next.js app (root), 2) src/lib/finance-engine (finance calculations), 3) src/lib/ranking-engine (AI recommendations)  
**Performance Goals**: <2s initial page load (Lighthouse), <500ms tRPC API response p95, <1s AI recommendation generation p95, <3s voice synthesis for typical prompts
**Scale/Scope**: ~50 Toyota models/trims at launch, curated dataset seeded during hackathon, 10-20 UI screens (home, discovery journey, recommendations, filters, compare, detail, estimate, profile, dealer), ~5-7 tRPC routers (search, vehicles, compare, estimate, profile, dealer), support for thousands of concurrent users (Firebase auto-scaling)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance Status | Notes |
|-----------|------------------|-------|
| **I. Library-First Architecture** | ✅ COMPLIANT | `finance-engine` and `ranking-engine` are standalone libraries with text/JSON CLI interfaces. Each has clear single purpose: finance calculations and AI-powered ranking. |
| **II. Framework-First Integration** | ✅ COMPLIANT | Using Next.js, Tailwind CSS, shadcn/ui, tweakcn, Lucide, tRPC directly without wrappers. No unnecessary abstractions. |
| **III. Code Quality & Documentation** | ✅ COMPLIANT | ESLint + Prettier enforced. ADRs required for major decisions. Conventional commits. PR-only merges to main. |
| **IV. User Experience (UX)** | ✅ COMPLIANT | Voice (ElevenLabs TTS) + text input. Desktop-first responsive. Tailwind + tweakcn for design system. Clear, jargon-free copy. |
| **V. Security & Privacy** | ✅ COMPLIANT | Auth0 for auth. Firebase Security Rules for Firestore/Storage. Secrets in env vars. No PII in logs. |
| **VI. AI & Audio Transparency** | ✅ COMPLIANT | AI recommendations clearly labeled (Gemini-powered). Voice synthesis disclosed (ElevenLabs). Mute/opt-out controls. Non-binding disclaimers on estimates. |
| **VII. Data Governance** | ✅ COMPLIANT | Data sources documented (curated Toyota dataset, EPA MPG, MSRP). Assumptions in ADRs. Estimates labeled as informational. Last-updated timestamps planned. |
| **VIII. Observability** | ✅ COMPLIANT | Structured JSON logging. Key flows instrumented (search, recommendation, auth, API). Request counts, error rates, latency tracked. PII redacted. |
| **IX. Hosting & Domain** | ✅ COMPLIANT | Firebase AppHosting for Next.js. GoDaddy DNS. Clear environment separation (dev/staging/prod). |

**Gate Evaluation**: ✅ **PASS** — All principles compliant. No violations to justify.

**Re-evaluation Trigger**: After Phase 1 design (data models, contracts, quickstart) to verify no deviations introduced.

---

### Post-Phase 1 Re-evaluation (2025-11-08)

| Principle | Compliance Status | Phase 1 Changes |
|-----------|------------------|-----------------|
| **I. Library-First Architecture** | ✅ COMPLIANT | Data model confirms `finance-engine` (cash/finance/lease/taxes/fuel) and `ranking-engine` (Gemini/OpenRouter/ranking/safety) as standalone libraries with CLI. No framework coupling introduced. |
| **II. Framework-First Integration** | ✅ COMPLIANT | API contracts confirm direct usage of Next.js, tRPC, Firestore, Auth0 SDKs without abstraction layers. |
| **III. Code Quality & Documentation** | ✅ COMPLIANT | Quickstart guide includes linting, formatting. ADRs referenced for architectural decisions. |
| **IV. User Experience (UX)** | ✅ COMPLIANT | Data model includes `voiceEnabled` preference in UserProfile. API contracts include `voiceEnabled` parameter for audio summaries. Text fallback always available. |
| **V. Security & Privacy** | ✅ COMPLIANT | API contracts enforce authentication (public/protected procedures). Dealer leads require explicit `consent: true` (literal). PII in DealerLead is write-only for users. |
| **VI. AI & Audio Transparency** | ✅ COMPLIANT | API contracts return `explanation` and `matchedCriteria` for recommendations. Estimates include `disclaimer` text. Voice synthesis optional (`voiceEnabled` flag). |
| **VII. Data Governance** | ✅ COMPLIANT | Data model documents entity validation rules, indexes, relationships. Estimates include `calculatedAt` timestamp. Tax/fee breakdowns provided. |
| **VIII. Observability** | ✅ COMPLIANT | API contracts note structured logging for key flows (search, recommendation, estimate). Rate limits tracked. Error codes standardized. |
| **IX. Hosting & Domain** | ✅ COMPLIANT | Quickstart guide confirms Firebase AppHosting deployment. Environment variables documented for dev/staging/prod separation. |

**Post-Phase 1 Gate Evaluation**: ✅ **PASS** — Design compliant with all constitution principles. No deviations introduced during Phase 1.

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
apps/
├── web/                          # Next.js 15.2 app (App Router)
│   ├── src/
│   │   ├── app/                  # App Router pages & layouts
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx          # Home page
│   │   │   ├── discovery/        # Guided journey
│   │   │   ├── recommendations/  # Results with filters
│   │   │   ├── compare/          # Side-by-side comparison
│   │   │   ├── vehicles/[id]/    # Vehicle detail pages
│   │   │   ├── estimate/         # Cost estimation
│   │   │   ├── profile/          # User saved items
│   │   │   ├── dealer/           # Find/contact dealer
│   │   │   └── api/
│   │   │       └── trpc/[trpc]/  # tRPC handler
│   │   ├── components/           # UI components (shadcn/ui + custom)
│   │   │   ├── ui/               # shadcn/ui components
│   │   │   ├── discovery/
│   │   │   ├── comparison/
│   │   │   ├── estimate/
│   │   │   └── shared/
│   │   ├── lib/                  # Client utilities
│   │   │   ├── trpc.ts
│   │   │   ├── firebase.ts
│   │   │   └── auth0.ts
│   │   ├── server/               # Server-side code
│   │   │   ├── api/
│   │   │   │   ├── routers/      # tRPC routers
│   │   │   │   │   ├── search.ts
│   │   │   │   │   ├── vehicles.ts
│   │   │   │   │   ├── compare.ts
│   │   │   │   │   ├── estimate.ts
│   │   │   │   │   ├── profile.ts
│   │   │   │   │   └── dealer.ts
│   │   │   │   ├── root.ts       # Root router
│   │   │   │   └── trpc.ts       # tRPC context
│   │   │   ├── db/               # Firestore helpers
│   │   │   └── ai/               # Gemini/OpenRouter wrappers
│   │   ├── styles/
│   │   │   └── globals.css
│   │   └── env.js                # Env validation (Zod)
│   ├── public/
│   │   ├── images/
│   │   └── audio/
│   ├── firebase.json
│   ├── .firebaserc
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   └── package.json

.specify/
├── memory/
│   └── constitution.md
├── templates/
├── scripts/
└── adrs/                         # Architecture Decision Records
```

**Structure Decision**: Single Next.js application with integrated libraries in src/lib/. Chosen because:

- **Simpler structure**: No monorepo complexity, all code in one project
- **src/lib/finance-engine**: Library for all finance calculations (cash/finance/lease/taxes/fuel)
- **src/lib/ranking-engine**: Library wrapping AI providers (Gemini/OpenRouter) with deterministic reranking and safety filters
- **Co-location**: Libraries live alongside the code that uses them, easier to develop and test

This structure complies with Constitution Principle I (Library-First) and II (Framework-First) by separating domain logic into libraries while keeping Next.js/tRPC/Firebase integration in the app.

## Complexity Tracking

> **No violations to justify.** All Constitution principles are compliant.
