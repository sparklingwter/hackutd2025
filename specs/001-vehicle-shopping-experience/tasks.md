# Tasks: Toyota Vehicle Shopping Experience

**Feature Branch**: `001-vehicle-shopping-experience`  
**Generated**: 2025-11-08  
**Input**: plan.md, spec.md, data-model.md, contracts/, research.md, quickstart.md

**Tests**: NOT requested in specification - test tasks are excluded per requirements

**Organization**: Tasks grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story label (US1, US2, US3, etc.)
- Exact file paths included in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize project structure and tooling

- [ ] T001 Create monorepo structure with apps/web, packages/finance-engine, packages/ranking-engine per plan.md
- [ ] T002 Initialize root package.json with npm workspaces configuration for monorepo
- [ ] T003 [P] Configure Turbo build orchestration in turbo.json with dev, build, and lint pipelines
- [ ] T004 [P] Setup TypeScript 5.8 configuration in root tsconfig.json with strict mode
- [ ] T005 [P] Configure ESLint 9.16 with Next.js rules in eslint.config.js
- [ ] T006 [P] Configure Prettier 3.4 in prettier.config.js
- [ ] T007 Initialize Next.js 15.2 App Router project in apps/web with React 19
- [ ] T008 [P] Setup Tailwind CSS 4.0 configuration in apps/web/tailwind.config.ts
- [ ] T009 [P] Install and configure shadcn/ui in apps/web/components/ui
- [ ] T010 [P] Initialize packages/finance-engine with TypeScript library structure
- [ ] T011 [P] Initialize packages/ranking-engine with TypeScript library structure
- [ ] T012 [P] Create .env.local template in apps/web with Auth0, Firebase, Gemini, ElevenLabs, OpenRouter keys
- [ ] T013 Setup Firebase project and initialize firebase.json with Firestore, Storage, Hosting, Emulators
- [ ] T014 [P] Create .firebaserc with project ID and environment aliases
- [ ] T015 [P] Install Firebase Admin SDK and configure service account in apps/web/src/server/db/firebase.ts
- [ ] T016 [P] Configure Firebase Emulators (Firestore, Storage) with ports in firebase.json
- [ ] T017 Create README.md in repository root with project overview and quickstart links

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story implementation

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Database & Schema

- [ ] T018 Define shared Zod schemas in apps/web/src/server/api/schemas.ts from contracts/schemas.md
- [ ] T019 Create Firestore collections structure: vehicles, userProfiles, dealerLeads in apps/web/src/server/db/collections.ts
- [ ] T020 [P] Implement Firestore Security Rules in firebase/firestore.rules enforcing auth and ownership per research.md
- [ ] T021 [P] Create Firestore composite indexes in firebase/firestore.indexes.json for vehicle filtering (bodyStyle, fuelType, msrp, seating)

### Authentication

- [ ] T022 Install @auth0/nextjs-auth0@latest SDK in apps/web
- [ ] T023 Create Auth0 client configuration in apps/web/lib/auth0.ts using Auth0Client per research.md
- [ ] T024 Create middleware.ts at repository root with Auth0 middleware integration (v4 requirement)
- [ ] T025 Wrap app with Auth0Provider in apps/web/src/app/layout.tsx
- [ ] T026 Create LoginButton component in apps/web/src/components/auth/LoginButton.tsx using <a href="/auth/login">
- [ ] T027 [P] Create LogoutButton component in apps/web/src/components/auth/LogoutButton.tsx
- [ ] T028 [P] Create Profile component in apps/web/src/components/auth/Profile.tsx using useUser hook

### tRPC API Setup

- [ ] T029 Create tRPC context in apps/web/src/server/api/trpc.ts with Auth0 session and Firestore client
- [ ] T030 Create tRPC root router in apps/web/src/server/api/root.ts merging all domain routers
- [ ] T031 Setup tRPC API route handler in apps/web/src/app/api/trpc/[trpc]/route.ts
- [ ] T032 [P] Configure tRPC client in apps/web/src/lib/trpc.ts with React Query integration
- [ ] T033 Create publicProcedure and protectedProcedure helpers in apps/web/src/server/api/trpc.ts

### Finance Engine Library

- [ ] T034 [P] Implement cash calculation in packages/finance-engine/src/lib/cash.ts with out-the-door total
- [ ] T035 [P] Implement finance calculation in packages/finance-engine/src/lib/finance.ts with amortization
- [ ] T036 [P] Implement lease calculation in packages/finance-engine/src/lib/lease.ts with residual and money factor
- [ ] T037 [P] Implement tax/fee calculation by ZIP in packages/finance-engine/src/lib/taxes.ts with state fallback
- [ ] T038 [P] Implement fuel cost estimation in packages/finance-engine/src/lib/fuel.ts for gas and electric
- [ ] T039 Create library exports in packages/finance-engine/src/index.ts
- [ ] T040 [P] Create CLI entry point in packages/finance-engine/src/cli.ts with JSON stdin/stdout

### Ranking Engine Library

- [ ] T041 [P] Implement Gemini API integration in packages/ranking-engine/src/lib/gemini.ts with structured output
- [ ] T042 [P] Implement OpenRouter fallback in packages/ranking-engine/src/lib/openrouter.ts
- [ ] T043 Implement deterministic ranking logic in packages/ranking-engine/src/lib/ranking.ts with score calculation
- [ ] T044 [P] Implement safety filters and guardrails in packages/ranking-engine/src/lib/safety.ts
- [ ] T045 [P] Create Zod schemas for recommendations in packages/ranking-engine/src/lib/schemas.ts
- [ ] T046 Create library exports in packages/ranking-engine/src/index.ts
- [ ] T047 [P] Create CLI entry point in packages/ranking-engine/src/cli.ts with JSON stdin/stdout

### Data Seeding

- [ ] T048 Create vehicle seed data script in apps/web/scripts/seed-vehicles.ts for ~50 Toyota models
- [ ] T049 Create trim seed data for popular models (Camry, RAV4, Tacoma, Highlander) in seed script
- [ ] T050 Seed featured vehicles list for homepage showcase in Firestore

### Voice Integration Setup

- [ ] T051 [P] Install ElevenLabs SDK in apps/web
- [ ] T052 Create ElevenLabs TTS wrapper in apps/web/src/server/ai/elevenlabs.ts with Rachel voice
- [ ] T053 [P] Create audio cache service in apps/web/src/server/ai/audio-cache.ts using Firebase Storage
- [ ] T054 Pre-generate common discovery journey audio prompts at build time in apps/web/scripts/generate-audio.ts

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Guided Vehicle Discovery and Recommendations (Priority: P1) 🎯 MVP

**Goal**: Users complete AI-guided discovery journey (voice or text) and receive tiered recommendations with explanations

**Independent Test**: User provides needs via discovery form, receives Top Picks (up to 3), Strong Contenders, and Explore Alternatives with explanations

### Search Router Implementation (US1)

- [ ] T055 [P] [US1] Create search router in apps/web/src/server/api/routers/search.ts
- [ ] T056 [US1] Implement search.recommend procedure calling ranking-engine library
- [ ] T057 [P] [US1] Implement search.filter procedure for deterministic filtering with Firestore queries
- [ ] T058 [P] [US1] Implement search.semanticSearch procedure using Gemini for natural language queries
- [ ] T059 [US1] Add rate limiting middleware for recommendation endpoint (10 req/min/IP)

### Discovery Journey UI (US1)

- [ ] T060 [P] [US1] Create home page in apps/web/src/app/page.tsx with hero and "Start Discovery" CTA
- [ ] T061 [US1] Create discovery layout in apps/web/src/app/discovery/layout.tsx
- [ ] T062 [US1] Create discovery step 1: Budget input in apps/web/src/app/discovery/budget/page.tsx
- [ ] T063 [P] [US1] Create discovery step 2: Body style selection in apps/web/src/app/discovery/body-style/page.tsx
- [ ] T064 [P] [US1] Create discovery step 3: Fuel type and seating in apps/web/src/app/discovery/preferences/page.tsx
- [ ] T065 [P] [US1] Create discovery step 4: Features and needs in apps/web/src/app/discovery/features/page.tsx
- [ ] T066 [US1] Create discovery progress indicator component in apps/web/src/components/discovery/ProgressBar.tsx
- [ ] T067 [P] [US1] Create discovery form state management using React Context in apps/web/src/components/discovery/DiscoveryContext.tsx

### Recommendations UI (US1)

- [ ] T068 [US1] Create recommendations page in apps/web/src/app/recommendations/page.tsx
- [ ] T069 [P] [US1] Create Top Picks section component in apps/web/src/components/recommendations/TopPicks.tsx
- [ ] T070 [P] [US1] Create Strong Contenders section in apps/web/src/components/recommendations/StrongContenders.tsx
- [ ] T071 [P] [US1] Create Explore Alternatives section in apps/web/src/components/recommendations/ExploreAlternatives.tsx
- [ ] T072 [P] [US1] Create recommendation card component in apps/web/src/components/recommendations/RecommendationCard.tsx with explanation
- [ ] T073 [US1] Create filter chips component in apps/web/src/components/recommendations/FilterChips.tsx for preference adjustment

### Voice Integration (US1)

- [ ] T074 [P] [US1] Create voice controls component in apps/web/src/components/voice/VoiceControls.tsx with mute button
- [ ] T075 [P] [US1] Create speech-to-text integration using ElevenLabs STT in apps/web/src/components/voice/SpeechToText.tsx
- [ ] T076 [US1] Create text-to-speech audio player in apps/web/src/components/voice/AudioPlayer.tsx with captions
- [ ] T077 [US1] Add voice toggle in discovery journey with graceful text-only fallback
- [ ] T078 [US1] Generate audio summary for Top Picks using ElevenLabs TTS

**Checkpoint**: User Story 1 complete - Users can discover vehicles and receive AI recommendations

---

## Phase 4: User Story 2 - Vehicle Comparison (Priority: P1)

**Goal**: Users add up to 4 vehicles to compare tray and view side-by-side comparison with category winners

**Independent Test**: User adds 2-4 vehicles to tray, navigates to compare view, sees pricing, efficiency, performance, safety, features with winners highlighted

### Compare Router Implementation (US2)

- [ ] T079 [P] [US2] Create compare router in apps/web/src/server/api/routers/compare.ts
- [ ] T080 [US2] Implement compare.getComparison procedure with category winner calculation
- [ ] T081 [P] [US2] Implement compare.saveCompareSet mutation for authenticated users
- [ ] T082 [P] [US2] Implement compare.getCompareSets query fetching user saved sets
- [ ] T083 [P] [US2] Implement compare.deleteCompareSet mutation
- [ ] T084 [P] [US2] Implement compare.getSharedCompareSet query for shareable links
- [ ] T085 [US2] Implement compare.generateShareLink mutation with JWT encryption

### Compare Tray UI (US2)

- [ ] T086 [P] [US2] Create persistent compare tray component in apps/web/src/components/comparison/CompareTray.tsx
- [ ] T087 [US2] Create add-to-compare button in apps/web/src/components/shared/AddToCompareButton.tsx
- [ ] T088 [US2] Implement compare tray state management using React Context in apps/web/src/components/comparison/CompareContext.tsx
- [ ] T089 [US2] Add compare tray to app layout in apps/web/src/app/layout.tsx for global access

### Comparison Table UI (US2)

- [ ] T090 [US2] Create comparison page in apps/web/src/app/compare/page.tsx
- [ ] T091 [US2] Create comparison table component in apps/web/src/components/comparison/ComparisonTable.tsx
- [ ] T092 [P] [US2] Create category winner badge component in apps/web/src/components/comparison/WinnerBadge.tsx
- [ ] T093 [P] [US2] Create difference view toggle in apps/web/src/components/comparison/DifferenceToggle.tsx
- [ ] T094 [US2] Implement table row highlighting for category winners
- [ ] T095 [P] [US2] Create share comparison button in apps/web/src/components/comparison/ShareButton.tsx

**Checkpoint**: User Story 2 complete - Users can compare vehicles side-by-side

---

## Phase 5: User Story 3 - Cost Estimation (Priority: P1)

**Goal**: Users generate cash, finance, or lease estimates with ZIP-based taxes/fees and optional fuel costs

**Independent Test**: User selects vehicle, enters ZIP code, provides financial inputs, sees monthly payment, due-at-signing, out-the-door total with disclaimers

### Estimate Router Implementation (US3)

- [ ] T096 [P] [US3] Create estimate router in apps/web/src/server/api/routers/estimate.ts
- [ ] T097 [P] [US3] Implement estimate.calculateCash query calling finance-engine library
- [ ] T098 [P] [US3] Implement estimate.calculateFinance query with amortization
- [ ] T099 [P] [US3] Implement estimate.calculateLease query with residual calculation
- [ ] T100 [P] [US3] Implement estimate.calculateFuelCost query for gas and electric
- [ ] T101 [P] [US3] Implement estimate.saveEstimate mutation for authenticated users
- [ ] T102 [P] [US3] Implement estimate.getSavedEstimates query
- [ ] T103 [P] [US3] Implement estimate.deleteEstimate mutation

### Estimate Form UI (US3)

- [ ] T104 [US3] Create estimate page with tab navigation in apps/web/src/app/estimate/page.tsx
- [ ] T105 [P] [US3] Create Cash tab form in apps/web/src/components/estimate/CashTab.tsx
- [ ] T106 [P] [US3] Create Finance tab form in apps/web/src/components/estimate/FinanceTab.tsx
- [ ] T107 [P] [US3] Create Lease tab form in apps/web/src/components/estimate/LeaseTab.tsx
- [ ] T108 [P] [US3] Create ZIP code input with tax/fee lookup in apps/web/src/components/estimate/ZipCodeInput.tsx
- [ ] T109 [P] [US3] Create fuel cost estimator section in apps/web/src/components/estimate/FuelEstimator.tsx

### Estimate Results UI (US3)

- [ ] T110 [US3] Create estimate results summary in apps/web/src/components/estimate/ResultsSummary.tsx
- [ ] T111 [P] [US3] Create monthly payment display in apps/web/src/components/estimate/MonthlyPayment.tsx
- [ ] T112 [P] [US3] Create due-at-signing breakdown in apps/web/src/components/estimate/DueAtSigning.tsx
- [ ] T113 [P] [US3] Create total-cost-over-time visualization in apps/web/src/components/estimate/TotalCostChart.tsx
- [ ] T114 [P] [US3] Create tax and fee breakdown in apps/web/src/components/estimate/TaxBreakdown.tsx
- [ ] T115 [US3] Create disclaimer text component in apps/web/src/components/estimate/Disclaimer.tsx
- [ ] T116 [P] [US3] Create save estimate button in apps/web/src/components/estimate/SaveButton.tsx

**Checkpoint**: User Story 3 complete - Users can estimate costs with detailed breakdowns

---

## Phase 6: User Story 4 - Saving and Sharing Selections (Priority: P2)

**Goal**: Signed-in users save favorites, searches, compare sets, estimates across devices; anonymous users save locally; all users can share

**Independent Test**: User favorites vehicle (persists after reload), saves compare set, generates shareable link, exports summary

### Profile Router Implementation (US4)

- [ ] T117 [P] [US4] Create profile router in apps/web/src/server/api/routers/profile.ts
- [ ] T118 [P] [US4] Implement profile.get query with auto-create on first login
- [ ] T119 [P] [US4] Implement profile.update mutation for display name and preferences
- [ ] T120 [P] [US4] Implement profile.addFavorite mutation using Firestore arrayUnion
- [ ] T121 [P] [US4] Implement profile.removeFavorite mutation using Firestore arrayRemove
- [ ] T122 [P] [US4] Implement profile.getFavorites query fetching full vehicle details
- [ ] T123 [P] [US4] Implement profile.saveSearch mutation for discovery journey saves
- [ ] T124 [P] [US4] Implement profile.getSavedSearches query
- [ ] T125 [P] [US4] Implement profile.deleteSearch mutation
- [ ] T126 [P] [US4] Implement profile.setPreferences mutation

### Local Storage for Anonymous Users (US4)

- [ ] T127 [P] [US4] Create localStorage wrapper utility in apps/web/src/lib/localStorage.ts
- [ ] T128 [US4] Implement anonymous favorites persistence in localStorage with migration prompt on sign-in
- [ ] T129 [P] [US4] Implement anonymous compare sets persistence in localStorage
- [ ] T130 [P] [US4] Implement anonymous estimates persistence in localStorage

### Profile UI (US4)

- [ ] T131 [US4] Create profile page in apps/web/src/app/profile/page.tsx
- [ ] T132 [P] [US4] Create favorites section in apps/web/src/components/profile/Favorites.tsx
- [ ] T133 [P] [US4] Create saved searches section in apps/web/src/components/profile/SavedSearches.tsx
- [ ] T134 [P] [US4] Create saved compare sets section in apps/web/src/components/profile/SavedCompareSets.tsx
- [ ] T135 [P] [US4] Create saved estimates section in apps/web/src/components/profile/SavedEstimates.tsx
- [ ] T136 [P] [US4] Create favorite button component in apps/web/src/components/shared/FavoriteButton.tsx

### Sharing & Export (US4)

- [ ] T137 [P] [US4] Create export-to-PDF utility in apps/web/src/lib/exportPdf.ts
- [ ] T138 [P] [US4] Create print-friendly summary template in apps/web/src/components/shared/PrintSummary.tsx
- [ ] T139 [US4] Create shared compare set view page in apps/web/src/app/compare/shared/page.tsx
- [ ] T140 [P] [US4] Create shared estimate view page in apps/web/src/app/estimate/shared/page.tsx

**Checkpoint**: User Story 4 complete - Users can save and share selections

---

## Phase 7: User Story 5 - Dealer Connection (Priority: P2)

**Goal**: Users find nearby dealers and submit contact requests with explicit consent

**Independent Test**: User searches ZIP for dealers, submits contact request with consent checkbox, receives confirmation

### Dealer Router Implementation (US5)

- [ ] T141 [P] [US5] Create dealer router in apps/web/src/server/api/routers/dealer.ts
- [ ] T142 [P] [US5] Implement dealer.findNearby query with geocoding and distance calculation
- [ ] T143 [P] [US5] Implement dealer.submitLead mutation with consent validation (literal true)
- [ ] T144 [P] [US5] Implement dealer.getMyLeads query fetching user submissions
- [ ] T145 [P] [US5] Implement dealer.getById query for dealer details
- [ ] T146 [US5] Add rate limiting for dealer lead submissions (5 per day per user)

### Dealer Data Setup (US5)

- [ ] T147 [P] [US5] Create dealer seed data script in apps/web/scripts/seed-dealers.ts with Texas Toyota dealers
- [ ] T148 [US5] Implement ZIP-to-lat/long geocoding using Google Maps API in apps/web/src/lib/geocoding.ts

### Dealer UI (US5)

- [ ] T149 [US5] Create dealer finder page in apps/web/src/app/dealer/page.tsx
- [ ] T150 [P] [US5] Create ZIP code search form in apps/web/src/components/dealer/ZipSearch.tsx
- [ ] T151 [P] [US5] Create dealer list component in apps/web/src/components/dealer/DealerList.tsx
- [ ] T152 [P] [US5] Create dealer card with directions link in apps/web/src/components/dealer/DealerCard.tsx
- [ ] T153 [US5] Create contact me form in apps/web/src/components/dealer/ContactForm.tsx
- [ ] T154 [US5] Create explicit consent checkbox in apps/web/src/components/dealer/ConsentCheckbox.tsx with legal text
- [ ] T155 [P] [US5] Create contact confirmation page in apps/web/src/app/dealer/confirmation/page.tsx
- [ ] T156 [P] [US5] Create my leads page in apps/web/src/app/profile/leads/page.tsx

**Checkpoint**: User Story 5 complete - Users can connect with dealers

---

## Phase 8: User Story 6 - Preference Adjustment and Filtering (Priority: P3)

**Goal**: Users refine recommendations using filter chips without restarting discovery journey

**Independent Test**: User adjusts budget filter chip on recommendations page, sees updated results immediately

### Filter UI (US6)

- [ ] T157 [P] [US6] Create filter panel component in apps/web/src/components/recommendations/FilterPanel.tsx
- [ ] T158 [P] [US6] Create budget filter chip in apps/web/src/components/recommendations/filters/BudgetFilter.tsx
- [ ] T159 [P] [US6] Create body style filter chip in apps/web/src/components/recommendations/filters/BodyStyleFilter.tsx
- [ ] T160 [P] [US6] Create fuel type filter chip in apps/web/src/components/recommendations/filters/FuelTypeFilter.tsx
- [ ] T161 [P] [US6] Create seating filter chip in apps/web/src/components/recommendations/filters/SeatingFilter.tsx
- [ ] T162 [P] [US6] Create clear all filters button in apps/web/src/components/recommendations/ClearFilters.tsx
- [ ] T163 [US6] Implement filter state management and instant updates using React Query cache invalidation

**Checkpoint**: User Story 6 complete - Users can refine results with filters

---

## Phase 9: User Story 7 - Vehicle Detail View (Priority: P3)

**Goal**: Users view detailed vehicle information including trims, specs, gallery, features

**Independent Test**: User clicks vehicle card, sees detail page with trim selector, specs, images, features

### Vehicles Router Implementation (US7)

- [ ] T164 [P] [US7] Create vehicles router in apps/web/src/server/api/routers/vehicles.ts
- [ ] T165 [P] [US7] Implement vehicles.list query with pagination and filters
- [ ] T166 [P] [US7] Implement vehicles.getById query fetching full vehicle details
- [ ] T167 [P] [US7] Implement vehicles.getTrims query for subcollection
- [ ] T168 [P] [US7] Implement vehicles.getTrimById query
- [ ] T169 [P] [US7] Implement vehicles.search query for text search
- [ ] T170 [P] [US7] Implement vehicles.getFeaturedVehicles query for homepage

### Vehicle Detail UI (US7)

- [ ] T171 [US7] Create vehicle detail page in apps/web/src/app/vehicles/[id]/page.tsx
- [ ] T172 [P] [US7] Create trim selector component in apps/web/src/components/vehicle/TrimSelector.tsx
- [ ] T173 [P] [US7] Create image gallery with lightbox in apps/web/src/components/vehicle/ImageGallery.tsx
- [ ] T174 [P] [US7] Create specs grid in apps/web/src/components/vehicle/SpecsGrid.tsx
- [ ] T175 [P] [US7] Create features list in apps/web/src/components/vehicle/FeaturesList.tsx
- [ ] T176 [P] [US7] Create safety ratings display in apps/web/src/components/vehicle/SafetyRatings.tsx
- [ ] T177 [US7] Create breadcrumb navigation in apps/web/src/components/vehicle/Breadcrumbs.tsx

**Checkpoint**: User Story 7 complete - Users can view detailed vehicle information

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

### Error Handling & Edge Cases

- [ ] T178 [P] Create global error boundary in apps/web/src/app/error.tsx
- [ ] T179 [P] Create 404 not found page in apps/web/src/app/not-found.tsx
- [ ] T180 [P] Implement graceful fallback for voice synthesis failures
- [ ] T181 [P] Add ZIP code validation with state-level fallback messaging
- [ ] T182 [P] Handle "no vehicles match criteria" edge case with closest matches
- [ ] T183 Add compare tray full (4 vehicles) error message
- [ ] T184 [P] Handle unavailable vehicle/trim gracefully in detail pages

### Logging & Observability

- [ ] T185 [P] Create structured JSON logger in apps/web/src/lib/logger.ts with PII redaction
- [ ] T186 Add logging for search and recommendation flows
- [ ] T187 [P] Add logging for authentication events
- [ ] T188 [P] Add logging for API errors with request IDs
- [ ] T189 Add logging for dealer lead submissions
- [ ] T190 Create error tracking integration (Sentry or similar) in apps/web/src/lib/errorTracking.ts

### Legal & Disclaimers

- [ ] T191 [P] Create disclaimer text config in apps/web/src/config/disclaimers.ts
- [ ] T192 [P] Create legal footer component in apps/web/src/components/shared/Footer.tsx
- [ ] T193 Add AI disclosure badge "Powered by Gemini" in apps/web/src/components/shared/AiBadge.tsx
- [ ] T194 [P] Add voice synthesis disclosure in voice controls
- [ ] T195 Create privacy policy placeholder page in apps/web/src/app/privacy/page.tsx
- [ ] T196 [P] Create terms of service placeholder page in apps/web/src/app/terms/page.tsx

### Accessibility (WCAG 2.1 AA)

- [ ] T197 [P] Add ARIA labels to all interactive elements
- [ ] T198 [P] Ensure keyboard navigation for all user flows
- [ ] T199 [P] Add focus indicators with sufficient contrast
- [ ] T200 Add screen reader announcements for dynamic content updates
- [ ] T201 [P] Ensure color contrast ratios meet WCAG AA standards
- [ ] T202 [P] Add skip-to-content links

### Performance Optimization

- [ ] T203 [P] Enable Next.js image optimization for vehicle images
- [ ] T204 [P] Add loading skeletons for async content in apps/web/src/components/shared/Skeleton.tsx
- [ ] T205 [P] Implement tRPC request batching
- [ ] T206 Optimize Firestore queries with query result caching
- [ ] T207 [P] Pre-generate static pages for featured vehicles
- [ ] T208 Add CDN caching headers for public API endpoints

### Feature Flags & Configuration

- [ ] T209 [P] Create feature flags config in apps/web/src/config/features.ts
- [ ] T210 Add feature flag for voice synthesis (enable/disable globally)
- [ ] T211 [P] Add feature flag for AI recommendations fallback behavior
- [ ] T212 [P] Create environment-specific config for dev/staging/prod

### Documentation

- [ ] T213 [P] Update README.md with deployment instructions
- [ ] T214 [P] Add API documentation comments to all tRPC procedures
- [ ] T215 [P] Document finance-engine library API in packages/finance-engine/README.md
- [ ] T216 [P] Document ranking-engine library API in packages/ranking-engine/README.md
- [ ] T217 Create ADR for Auth0 v4 middleware pattern in .specify/adrs/
- [ ] T218 [P] Create ADR for monorepo structure decision in .specify/adrs/

### Deployment Preparation

- [ ] T219 Configure Firebase AppHosting deployment in firebase.json
- [ ] T220 [P] Setup GoDaddy DNS CNAME records per quickstart.md
- [ ] T221 [P] Create production environment variables in Firebase Console
- [ ] T222 Deploy Firestore Security Rules and indexes to production
- [ ] T223 Run seed scripts to populate production Firestore with vehicle data
- [ ] T224 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies - can start immediately
- **Phase 2 (Foundational)**: Depends on Setup (Phase 1) - BLOCKS all user stories
- **Phase 3 (US1)**: Depends on Foundational (Phase 2) - No dependencies on other stories
- **Phase 4 (US2)**: Depends on Foundational (Phase 2) - Can integrate with US1 but independently testable
- **Phase 5 (US3)**: Depends on Foundational (Phase 2) - Independently testable
- **Phase 6 (US4)**: Depends on US1, US2, US3 for meaningful save operations - But saving mechanism testable independently
- **Phase 7 (US5)**: Depends on US3 (estimate attachment optional) - Independently testable
- **Phase 8 (US6)**: Depends on US1 (recommendations page) - Enhances US1
- **Phase 9 (US7)**: Depends on Foundational (Phase 2) - Independently testable
- **Phase 10 (Polish)**: Depends on all desired user stories being complete

### User Story Completion Order for MVP

**Recommended MVP (US1 only)**:
1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: US1 (Discovery & Recommendations)
4. STOP, VALIDATE, DEMO

**Full P1 Scope (US1, US2, US3)**:
1. Complete Phases 1-2 (Setup + Foundation)
2. Complete Phase 3: US1
3. Complete Phase 4: US2
4. Complete Phase 5: US3
5. STOP, VALIDATE, DEPLOY

**P2 Features (US4, US5)**:
6. Complete Phase 6: US4 (Saving & Sharing)
7. Complete Phase 7: US5 (Dealer Connection)

**P3 Features (US6, US7)**:
8. Complete Phase 8: US6 (Filtering)
9. Complete Phase 9: US7 (Vehicle Details)

**Polish**:
10. Complete Phase 10: Cross-cutting concerns

### Parallel Opportunities

#### Within Setup (Phase 1)
All tasks marked [P] can run in parallel:
- T003, T004, T005, T006 (tooling configs)
- T008, T009, T010, T011 (framework setup)
- T014, T015, T016 (Firebase config)

#### Within Foundational (Phase 2)
Parallel groups:
- **Group A**: T020, T021 (Firestore rules & indexes)
- **Group B**: T034-T038 (finance-engine functions)
- **Group C**: T041, T042, T044, T045 (ranking-engine functions)
- **Group D**: T051, T053 (voice services)

#### Across User Stories (if team capacity allows)
Once Phase 2 completes:
- **Developer A**: Phase 3 (US1) - Discovery & Recommendations
- **Developer B**: Phase 4 (US2) - Comparison
- **Developer C**: Phase 5 (US3) - Estimation
- **Developer D**: Phase 9 (US7) - Vehicle Details

All can proceed in parallel as they're independently testable.

---

## Parallel Example: User Story 1

```bash
# After T054 completes, launch all these together:

# Routers (different files):
Task T055: Create search router in apps/web/src/server/api/routers/search.ts
Task T057: Implement search.filter procedure
Task T058: Implement search.semanticSearch procedure

# Discovery pages (different files):
Task T063: Create discovery step 2 in apps/web/src/app/discovery/body-style/page.tsx
Task T064: Create discovery step 3 in apps/web/src/app/discovery/preferences/page.tsx
Task T065: Create discovery step 4 in apps/web/src/app/discovery/features/page.tsx

# Recommendation sections (different files):
Task T069: Create TopPicks.tsx
Task T070: Create StrongContenders.tsx
Task T071: Create ExploreAlternatives.tsx
Task T072: Create RecommendationCard.tsx

# Voice components (different files):
Task T074: Create VoiceControls.tsx
Task T075: Create SpeechToText.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup → Project initialized
2. Complete Phase 2: Foundational → **CRITICAL CHECKPOINT** - Foundation ready
3. Complete Phase 3: User Story 1 → MVP ready
4. **STOP and VALIDATE**: Test guided discovery and recommendations independently
5. Deploy/demo if ready

**MVP Deliverable**: Users can complete discovery journey and receive AI-powered recommendations with explanations

### Incremental Delivery (P1 Features)

1. Foundation ready (Phases 1-2) ✅
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!) ✅
3. Add User Story 2 → Test independently → Deploy/Demo (comparison added)
4. Add User Story 3 → Test independently → Deploy/Demo (estimation added)

**P1 Complete**: Users can discover, compare, and estimate vehicles

### P2 Expansion (Saving & Dealer)

5. Add User Story 4 → Test independently → Deploy/Demo (save & share)
6. Add User Story 5 → Test independently → Deploy/Demo (dealer connection)

**P2 Complete**: Users can save work and connect with dealers

### P3 Enhancement (Filtering & Details)

7. Add User Story 6 → Test independently → Deploy/Demo (advanced filtering)
8. Add User Story 7 → Test independently → Deploy/Demo (detailed views)

**P3 Complete**: Full feature set with refinement and exploration

### Parallel Team Strategy

With 4+ developers:

1. **All devs**: Complete Setup + Foundational together (Phases 1-2)
2. Once Foundational done:
   - **Dev A**: User Story 1 (Discovery & Recommendations) - Priority 1
   - **Dev B**: User Story 2 (Comparison) - Priority 1
   - **Dev C**: User Story 3 (Estimation) - Priority 1
   - **Dev D**: User Story 7 (Vehicle Details) - Priority 3 (independent)
3. Stories complete and integrate independently
4. Integration testing once all P1 stories done

---

## Acceptance Criteria (Observable User Outcomes)

### User Story 1 (Discovery & Recommendations)
✅ User speaks or types needs, completes 4-step discovery journey  
✅ User receives Top Picks (1-3), Strong Contenders, Explore Alternatives  
✅ Each recommendation shows clear explanation of why it matched  
✅ Voice users hear spoken prompts and summary with captions  
✅ User can mute voice and continue with text only

### User Story 2 (Comparison)
✅ User adds 2-4 vehicles to persistent compare tray  
✅ User views side-by-side table with pricing, MPG, performance, safety, cargo  
✅ Category winners highlighted (lowest price, highest MPG, etc.)  
✅ Difference view shows only rows where vehicles differ  
✅ User can remove vehicles and add new ones dynamically

### User Story 3 (Estimation)
✅ User enters ZIP code and sees tax/fee estimate  
✅ User switches between Cash, Finance, Lease tabs with separate inputs  
✅ User sees monthly payment, due-at-signing, out-the-door total  
✅ Finance shows amortization and total interest paid  
✅ Lease shows residual calculation and total lease cost  
✅ Optional fuel cost estimate included in total-cost-over-time  
✅ Clear disclaimers displayed: "Informational only, subject to dealer confirmation"

### User Story 4 (Saving & Sharing)
✅ Signed-in user favorites vehicle, returns later, vehicle still favorited (cross-device)  
✅ Anonymous user favorites vehicle, reloads page, vehicle still favorited (same browser)  
✅ User saves compare set or estimate, accesses from profile page  
✅ User generates shareable link, sends to friend, friend views read-only version  
✅ User exports/prints summary as formatted PDF

### User Story 5 (Dealer Connection)
✅ User enters ZIP, sees list of nearby Toyota dealers with distance  
✅ User clicks "Contact Me", fills form, checks explicit consent checkbox  
✅ User submits, receives confirmation message  
✅ User views submitted leads in profile with status (new/contacted/closed)  
✅ Consent checkbox must be checked or form cannot submit

### User Story 6 (Filtering)
✅ User adjusts budget filter chip on recommendations page  
✅ Results update immediately without page reload  
✅ User changes fuel type filter, sees updated vehicles  
✅ User clears all filters, sees original recommendations

### User Story 7 (Vehicle Details)
✅ User clicks vehicle card, navigates to detail page  
✅ User selects different trim, sees updated specs and pricing  
✅ User views image gallery with lightbox  
✅ User sees safety ratings, features, warranty coverage

---

## Notes

- **[P] tasks**: Different files, no dependencies - can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Each user story**: Independently completable and testable without breaking others
- **Checkpoints**: Stop after each phase or story to validate independently
- **Tests excluded**: Per specification, no test tasks included (not requested)
- **Avoid**: Vague tasks, same-file conflicts, cross-story dependencies that break independence
- **CLI tools**: finance-engine and ranking-engine have CLI interfaces for testing calculations and prompts separately
- **Voice**: Always optional - text fallback required for all voice features
- **Auth**: Public procedures work without auth, protected procedures require sign-in
- **Firestore**: Security rules enforce all access controls at database level
- **Rate limiting**: Applied to expensive operations (AI recommendations, voice synthesis, dealer leads)

---

## Total Task Count: 224 tasks

**Breakdown by Phase**:
- Phase 1 (Setup): 17 tasks
- Phase 2 (Foundational): 33 tasks (CRITICAL - blocks all stories)
- Phase 3 (US1): 24 tasks
- Phase 4 (US2): 17 tasks
- Phase 5 (US3): 21 tasks
- Phase 6 (US4): 24 tasks
- Phase 7 (US5): 16 tasks
- Phase 8 (US6): 7 tasks
- Phase 9 (US7): 14 tasks
- Phase 10 (Polish): 51 tasks

**MVP Scope (US1 only)**: 74 tasks (Setup + Foundation + US1)  
**Full P1 Scope (US1+US2+US3)**: 112 tasks  
**P2 Scope (add US4+US5)**: 152 tasks  
**Full Feature Set (all stories)**: 173 tasks before polish  
**Complete (with polish)**: 224 tasks

**Parallel Opportunities**: 89 tasks marked [P] can run in parallel (40% of total)

**Independent Test Coverage**: Each user story (Phase 3-9) has clear acceptance criteria and can be validated independently
