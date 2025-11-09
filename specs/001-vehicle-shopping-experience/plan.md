# Implementation Plan: Toyota Vehicle Shopping Experience

**Branch**: `001-vehicle-shopping-experience` | **Date**: 2025-11-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-vehicle-shopping-experience/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a four-page vehicle shopping experience: (1) Landing page with voice/text input, (2) Results page with keyword filtering and vehicle cards, (3) Compare page for side-by-side comparison (up to 3 vehicles), (4) Finance page for cost estimation (cash/finance modes). Technical approach uses Next.js 15.2 (App Router) with client-side components, no tRPC/backend initially, vehicle data in `src/lib/cars.ts`. Frontend uses shadcn/ui + tweakcn components (StickyHeader, InputGroup, ThemeToggle) with Tailwind CSS 4.0. Voice recording via ElevenLabs speech-to-text. Keyword extraction from natural language using dictionary-based matching. No authentication, local browser storage only. Emphasizes simplicity, responsive design, and transparent cost calculations.

## Technical Context

**Language/Version**: TypeScript 5.8, React 19, Next.js 15.2 (App Router with Client Components)  
**Primary Dependencies**: Tailwind CSS 4.0, shadcn/ui, tweakcn, Lucide icons, ElevenLabs API (speech-to-text), Next.js Image optimization  
**Storage**: Static vehicle data in `src/lib/cars.ts` (TypeScript array), optional browser localStorage for user preferences  
**Target Platform**: Web (desktop-first responsive design, mobile/tablet adaptive), deployed to Firebase AppHosting  
**Project Type**: Single Next.js application with integrated utility libraries: 1) Next.js app (root), 2) src/lib/cars.ts (vehicle data), 3) src/components/ui (shadcn/ui components)  
**Performance Goals**: <2s initial page load (Lighthouse), <100ms filter updates, <500ms voice transcription start  
**Scale/Scope**: ~6-10 Toyota vehicles at launch (curated dataset), 4 pages (landing, results, compare, finance), keyword-based filtering with ~15-20 filter tags, support for hundreds of concurrent users

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Compliance Status | Notes |
|-----------|------------------|-------|
| **I. Library-First Architecture** | ✅ COMPLIANT | Vehicle data in `src/lib/cars.ts` as standalone module. Finance calculations as pure functions. Keyword filtering as utility functions. No framework coupling. |
| **II. Framework-First Integration** | ✅ COMPLIANT | Using Next.js, Tailwind CSS, shadcn/ui, tweakcn, Lucide directly. No unnecessary abstractions. Client components for interactivity. |
| **III. Code Quality & Documentation** | ✅ COMPLIANT | ESLint + Prettier enforced. Conventional commits. PR-only merges to main. TypeScript strict mode. |
| **IV. User Experience (UX)** | ✅ COMPLIANT | Voice (ElevenLabs STT) + text input. Desktop-first responsive. Tailwind + tweakcn design system. Clear navigation. |
| **V. Security & Privacy** | ✅ COMPLIANT | No backend storage of user data. Local browser storage only. API keys in env vars. |
| **VI. AI & Audio Transparency** | ✅ COMPLIANT | Keyword filtering transparent (visible filter chips). Voice recording with clear UI feedback. Mute/opt-out available. |
| **VII. Data Governance** | ✅ COMPLIANT | Vehicle data sourced from curated Toyota dataset. Prices/specs clearly labeled. Estimates marked as informational. |
| **VIII. Observability** | ✅ COMPLIANT | Client-side logging for key interactions. Error boundaries for component failures. Console logging during development. |
| **IX. Hosting & Domain** | ✅ COMPLIANT | Firebase AppHosting for Next.js. Environment separation (dev/prod). |

**Gate Evaluation**: ✅ **PASS** — All principles compliant. No violations to justify.

**Re-evaluation Trigger**: After Phase 1 design (data models, contracts, quickstart) to verify no deviations introduced.

---

### Post-Phase 1 Re-evaluation (2025-11-08)

| Principle | Compliance Status | Phase 1 Changes |
|-----------|------------------|-----------------|
| **I. Library-First Architecture** | ✅ COMPLIANT | Data model confirms `finance-engine` (cash/finance/lease/taxes/fuel) and `ranking-engine` (Gemini/OpenRouter/ranking/safety) as standalone libraries with CLI. No framework coupling introduced. |
| **II. Framework-First Integration** | ✅ COMPLIANT | API contracts confirm direct usage of Next.js, tRPC, Firestore SDKs without abstraction layers. |
| **III. Code Quality & Documentation** | ✅ COMPLIANT | Quickstart guide includes linting, formatting. ADRs referenced for architectural decisions. |
| **IV. User Experience (UX)** | ✅ COMPLIANT | Data model includes `voiceEnabled` preference in UserProfile. API contracts include `voiceEnabled` parameter for audio summaries. Text fallback always available. |
| **V. Security & Privacy** | ✅ COMPLIANT | API contracts note local browser storage for user data. Dealer leads require explicit `consent: true` (literal). No authentication required. |
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
│   │   │   ├── layout.tsx        # Root layout with theme provider
│   │   │   ├── page.tsx          # Landing page (voice + text input)
│   │   │   ├── result/
│   │   │   │   └── page.tsx      # Search/Results page (filters + cards)
│   │   │   ├── compare_result/
│   │   │   │   └── page.tsx      # Compare page (side-by-side table)
│   │   │   ├── finance/
│   │   │   │   └── page.tsx      # Finance page (cost estimation)
│   │   │   └── api/
│   │   │       └── elevenlabs/
│   │   │           ├── speech-to-text/
│   │   │           │   └── route.ts   # STT endpoint
│   │   │           └── text-to-speech/
│   │   │               └── route.ts   # TTS endpoint (optional)
│   │   ├── components/           # UI components
│   │   │   ├── ui/               # shadcn/ui + custom components
│   │   │   │   ├── sticky-header.tsx
│   │   │   │   ├── input-group.tsx
│   │   │   │   ├── button.tsx
│   │   │   │   ├── input.tsx
│   │   │   │   ├── textarea.tsx
│   │   │   │   ├── tooltip.tsx
│   │   │   │   ├── separator.tsx
│   │   │   │   └── dropdown-menu.tsx
│   │   │   └── theme-toggle.tsx
│   │   ├── lib/                  # Utilities and data
│   │   │   ├── cars.ts           # Vehicle data (CARS array, CAR_INDEX, findCar)
│   │   │   └── utils.ts          # cn() helper and other utilities
│   │   └── styles/
│   │       └── globals.css       # Tailwind imports + global styles
│   ├── public/
│   │   ├── cars/                 # Vehicle images (jpg/png)
│   │   └── Toyota-logo.png       # Header logo
│   ├── next.config.js
│   ├── tailwind.config.ts
│   ├── tsconfig.json
│   ├── components.json           # shadcn/ui config
│   ├── prettier.config.js
│   ├── eslint.config.js
│   └── package.json

.specify/
├── memory/
│   └── constitution.md
├── templates/
├── scripts/
└── adrs/                         # Architecture Decision Records
```

**Structure Decision**: Single Next.js application with client-side components and static vehicle data. Chosen because:

- **Simplicity**: No backend complexity, all vehicle data in `src/lib/cars.ts` as a TypeScript array
- **src/lib/cars.ts**: Vehicle data with typing (Car interface), lookup utilities (CAR_INDEX, findCar)
- **Client-side filtering**: Keyword detection and vehicle filtering happen in browser, no API calls needed
- **Page-based routing**: Four pages using Next.js App Router: `/`, `/result`, `/compare_result`, `/finance`

This structure complies with Constitution Principle I (Library-First) by keeping vehicle data and utilities in separate modules, and Principle II (Framework-First) by using Next.js directly without abstraction layers.

## Complexity Tracking

> **No violations to justify.** All Constitution principles are compliant.
