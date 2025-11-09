<!--
================================================================================
SYNC IMPACT REPORT
================================================================================
Version Change: 0.0.0 → 1.0.0 (Initial Constitution)
Date: 2025-11-08

Constitution Ratification:
  - Initial creation for Toyota vehicle-shopping web application
  - Project emphasizes simplicity, modularity, UX, accessibility, security, and governance
  - Explicitly excludes testing mandates and performance budgets
  - 9 core principles defined: Library-First, Framework-First, Code Quality, UX, 
    Security & Privacy, AI & Audio Transparency, Data Governance, Observability, 
    Hosting & Domain

Technology Stack:
  - Frontend: React/Next.js, Tailwind CSS, shadcn/ui, tweakcn, Lucide
  - Backend: tRPC, Firebase (AppHosting, Firestore, Storage)
  - AI/Voice: Gemini API (primary), OpenRouter (fallback), ElevenLabs (TTS)
  - Auth: Auth0
  - Hosting: Firebase Hosting with GoDaddy DNS

Modified Principles: N/A (initial creation)
Added Sections: All sections (initial creation)
Removed Sections: N/A

Templates Requiring Updates:
  ✅ .specify/templates/plan-template.md - Reviewed, no changes needed
  ✅ .specify/templates/spec-template.md - Reviewed, no changes needed
  ✅ .specify/templates/tasks-template.md - Reviewed, no changes needed
  ✅ README.md - Consider updating with project description and constitution link

Follow-up TODOs: None

================================================================================
-->

# Toyota Vehicle Shopping Constitution

## Core Principles

### I. Library-First Architecture

Every capability MUST begin as a small, reusable library. Libraries MUST be:

- **Self-contained**: Clear, single-purpose modules with explicit dependencies
- **Text/JSON interface**: Optional CLI that accepts input via stdin/args and returns output via stdout/JSON
- **Independently usable**: Can be consumed directly without framework wrappers
- **Well-documented**: Clear API contracts, usage examples, and purpose statements

**Rationale**: Library-first design enforces modularity, enables easier testing and reuse across contexts, and prevents tight coupling to framework specifics. Text/JSON interfaces ensure debuggability and composability.

### II. Framework-First Integration

Use established frameworks and component libraries directly without unnecessary abstraction:

- **Next.js**: Primary framework for routing, SSR, and app structure
- **Tailwind CSS**: Utility-first styling without CSS-in-JS wrappers
- **shadcn/ui**: Pre-built accessible components copied into project
- **tweakcn**: Component customization tool for shadcn/ui
- **Lucide**: Icon library used directly
- **tRPC**: Type-safe API layer without additional RPC abstractions

**Rationale**: Leveraging mature frameworks accelerates development, reduces maintenance burden, and ensures best practices. Avoiding wrappers prevents needless complexity and keeps code aligned with ecosystem standards.

### III. Code Quality & Documentation

All code MUST adhere to consistent quality standards:

- **Linting & Formatting**: ESLint and Prettier enforced on every commit
- **Naming Conventions**: Consistent, descriptive names following TypeScript/React conventions
- **Architecture Decision Records (ADRs)**: Document all major architectural choices in `.specify/adrs/`
- **Meaningful Commits**: Conventional commit format (e.g., `feat:`, `fix:`, `docs:`, `refactor:`)
- **Pull Request Discipline**: All changes reviewed, no direct commits to main branch

**Rationale**: Consistent code quality reduces cognitive load, eases onboarding, and maintains long-term maintainability. ADRs preserve context for future developers.

### IV. User Experience (UX)

Prioritize intuitive, accessible, and cohesive user experiences:

- **Voice and Text Input**: Primary interaction via both voice (ElevenLabs TTS) or text input which is always available
- **Responsive Layout**: Desktop-first design that adapts seamlessly across devices like mobile, tablet
- **Design Setup**: Centralized color, typography, and spacing values (Tailwind config) using tweakcn
- **Clear Copy**: Concise, jargon-free language that guides users through workflows

**Rationale**: Accessible, user-friendly interfaces reduce friction, broaden audience reach, and demonstrate commitment to inclusive design. Voice interfaces provide modern, hands-free convenience while text ensures universal access.

### V. Security & Privacy

Protect user data and enforce least-privilege access:

- **Auth0 Authentication**: All user authentication via Auth0 (no custom auth)
- **Firebase Security Rules**: Firestore and Storage rules MUST enforce least-privilege access
- **Encrypted Secrets**: All API keys, credentials stored in environment variables or secure vaults (never in code)
- **No Sensitive Data in Logs**: PII, tokens, and credentials MUST be redacted from logs

**Rationale**: Security breaches erode trust and carry legal/financial consequences. Least-privilege principles minimize attack surface. Privacy by design respects user autonomy.

### VI. AI & Audio Transparency

Disclose AI usage and provide user control:

- **AI Recommendations Disclosure**: Clearly label vehicle recommendations as AI-generated (via Gemini/OpenRouter)
- **Synthesized Voice Disclosure**: Indicate that voice interactions use ElevenLabs text-to-speech
- **Mute/Opt-Out Controls**: Users MUST be able to mute audio or disable voice features at any time
- **Estimates Are Informational**: All pricing, financing, and availability data labeled as estimates; disclaimers that they are non-binding

**Rationale**: Transparency builds trust. Users deserve to know when AI is involved in decisions affecting purchases. Clear disclaimers prevent misunderstandings and potential liability.

### VII. Data Governance

Document data sources, assumptions, and limitations:

- **Data Source Attribution**: Document origin of vehicle data (APIs, scraping, manual entry) in code/docs
- **Assumption Documentation**: Record assumptions (e.g., pricing updates frequency, data accuracy) in ADRs
- **Estimate Labeling**: UI MUST label all pricing/financing as "estimates" with disclaimers
- **Data Staleness Indicators**: Show last-updated timestamps for pricing, inventory, and specs

**Rationale**: Transparent data governance prevents user confusion, reduces liability, and helps developers understand data quality/timeliness. Non-binding disclaimers protect against legal claims.

### VIII. Observability

Enable debugging and monitoring of key application flows:

- **Structured Logging**: Use consistent JSON log format with severity levels (info, warn, error)
- **Key Flow Instrumentation**: Log critical paths (search, recommendation, auth, API calls) with correlation IDs
- **Basic Metrics**: Track request counts, error rates, and latency for main API endpoints
- **No PII in Logs**: Redact user identifiers, sensitive data from all log outputs

**Rationale**: Structured logging accelerates troubleshooting. Metrics reveal performance bottlenecks and reliability issues. PII redaction ensures compliance with privacy principles.

### IX. Hosting & Domain

Use Firebase Hosting with GoDaddy DNS management:

- **Firebase AppHosting**: Primary hosting for Next.js app (serverless deployment)
- **GoDaddy DNS**: Domain registrar and DNS management pointing to Firebase Hosting

**Rationale**: Firebase AppHosting simplifies Next.js deployment with built-in CDN, automatic scaling, and SSL. GoDaddy provides established DNS management. Clear environment separation reduces risk of accidental production changes.

## Technology Stack

### Frontend

- **React 19** with **Next.js 15.2**: Server components, app router
- **TypeScript 5.8**: Type safety across codebase
- **Tailwind CSS 4.0**: Utility-first styling
- **shadcn/ui**: Copy-paste accessible component library
- **tweakcn**: Component customization CLI
- **Lucide**: Icon system

### Backend & Data

- **tRPC 11**: Type-safe API layer
- **Firebase Firestore**: NoSQL database
- **Firebase Storage**: File/image storage
- **Firebase AppHosting**: Serverless Next.js hosting

### AI & Voice

- **Gemini API**: Primary AI for vehicle recommendations and conversational features
- **OpenRouter**: Fallback AI provider for redundancy
- **ElevenLabs**: Text-to-speech for voice interactions and vice versa

### Authentication & Infrastructure

- **Auth0**: User authentication and session management
- **GoDaddy**: Domain registration and DNS management
- **Zod**: Runtime schema validation

## Development Workflow

### Code Review Requirements

### Simplicity Gates

Before merging, verify:

1. **Anti-Abstraction Check**: Does this add unnecessary layers? Can it be simplified?
2. **Library-First Compliance**: Could this be a standalone library instead of tightly coupled code?
3. **Framework-First Compliance**: Are we using frameworks directly or adding needless wrappers?

### Complexity Tracking

If a simplicity gate is violated, document in `.specify/complexity-tracking.md`:

| Date | Violation | Justification | Simpler Alternative Rejected Because |
|------|-----------|---------------|-------------------------------------|
| [Date] | [Description] | [Why needed] | [Why simpler approach insufficient] |

### Deployment Process

- **Development**: Push to `dev` branch → auto-deploy to Firebase dev project
- **Staging**: Merge to `staging` → auto-deploy to Firebase staging project
- **Production**: Merge to `main` → manual approval → deploy to Firebase production project

## Governance

This Constitution supersedes all other development practices and guidelines. All code, architecture decisions, and workflows MUST align with these principles.

### Amendment Procedure

1. Propose amendment via pull request to `.specify/memory/constitution.md`
2. Include rationale, impact analysis, and migration plan for existing code
3. Increment `CONSTITUTION_VERSION` following semantic versioning:
   - **MAJOR**: Backward-incompatible changes (removed/redefined principles)
   - **MINOR**: New principles or material expansions
   - **PATCH**: Clarifications, wording fixes, non-semantic refinements
4. Obtain approval from project maintainers
5. Update affected templates, docs, and code to comply with amendment
6. Document changes in sync impact report (HTML comment at top of this file)

### Compliance Review

- All pull requests MUST verify compliance with applicable principles
- Violations MUST be justified in `.specify/complexity-tracking.md`
- Quarterly review of complexity tracking to identify patterns and potential simplifications
- Annual constitution review to ensure principles remain aligned with project needs

### Exceptions

Exceptions to these principles are permitted only when:

1. **Documented**: Recorded in `.specify/complexity-tracking.md` with clear justification
2. **Reviewed**: Approved by at least two maintainers
3. **Time-bound**: Include plan to remediate or formally amend constitution

**Version**: 1.0.0 | **Ratified**: 2025-11-08 | **Last Amended**: 2025-11-08
