# Feature Specification: Toyota Vehicle Shopping Experience

**Feature Branch**: `001-vehicle-shopping-experience`  
**Created**: November 8, 2025  
**Status**: Draft  
**Input**: User description: "Build a Toyota vehicle-shopping web experience that helps people discover, compare, and estimate the cost of owning or leasing vehicles through an AI-guided voice-and-text journey that collects key needs (target monthly budget or cash budget, body style, seating, fuel type gas/hybrid/EV, range/MPG priorities, cargo/towing needs, AWD/4x4, safety/driver-assist needs, must-have features, and driving patterns urban/highway/commute length) and then presents a clear, tiered list of recommended vehicles with transparent 'why this was recommended' explanations."

## Clarifications

### Session 2025-11-08

- Q: For the AI-guided voice-and-text journey, which AI service architecture should power the recommendation engine and voice interaction? → A: Hybrid approach: Gemini/Gemma for recommendation reasoning + ElevenLabs for high-quality TTS
- Q: For user sign-in to enable cross-device saving of favorites, searches, compare sets, and estimates, which authentication provider should be used? → A: Auth0 (as mentioned in project tech stack) for comprehensive authentication with social logins
- Q: For storing vehicle data, user profiles, saved favorites, compare sets, estimates, and dealer leads, which database solution should be used? → A: Firestore (as mentioned in project tech stack) with indexed collections for flexible document storage
- Q: What are the target performance requirements for generating vehicle recommendations and applying filter updates? → A: 3 seconds for initial AI recommendations, 1 second for filter updates (optimal UX)
- Q: For deploying the Next.js application with server-side rendering and API routes (tRPC), which hosting platform should be used? → A: Firebase App Hosting (as mentioned in project tech stack) for integrated Next.js deployment with Firebase services

## User Scenarios *(mandatory)*

### User Story 1 - Guided Vehicle Discovery and Recommendations (Priority: P1)

A prospective Toyota buyer visits the site to find the right vehicle. They engage with an AI-guided journey (via voice or text) that asks about their budget, body style preferences, seating needs, fuel type, driving patterns, and must-have features. After providing their needs, they see a tiered list of recommended vehicles organized into Top Picks (up to 3), Strong Contenders, and Explore Alternatives, with clear explanations of why each vehicle was recommended.

**Why this priority**: This is the core value proposition - helping users discover the right vehicle based on their needs. Without this, the entire experience fails to deliver its primary purpose.

**Independent Test**: Can be fully tested by completing a guided discovery session and receiving personalized recommendations with explanations. Delivers immediate value by helping users narrow down choices from Toyota's full lineup to a manageable set of relevant options.

**Acceptance Scenarios**:

1. **Given** a user arrives at the home page, **When** they start the guided journey and provide their monthly budget ($500), body style (SUV), and fuel preference (hybrid), **Then** they see up to 3 Top Picks with explanations like "Recommended because it's a hybrid SUV that fits your $500/month budget" plus Strong Contenders and Explore Alternatives sections
2. **Given** a user completes the discovery journey, **When** they view recommendations, **Then** each vehicle shows why it was recommended with transparent reasoning tied to their input
3. **Given** a user is interacting via voice, **When** the AI asks questions, **Then** they hear spoken prompts with on-screen captions and can respond via voice or text, and receive a brief spoken summary of their top picks
4. **Given** a user wants to skip voice, **When** they mute or decline voice interaction, **Then** they continue the journey using text-only input without any loss of functionality

---

### User Story 2 - Vehicle Comparison (Priority: P1)

After receiving recommendations, a user wants to compare vehicles side-by-side. They add up to 4 vehicles to a compare tray, then view a detailed comparison table showing pricing/MSRP, efficiency (MPG/MPGe, range), performance (hp/torque/0-60), safety ratings and driver-assist features, comfort/infotainment, cargo volume, towing capacity, dimensions, and warranty coverage. The comparison highlights category winners and shows differences clearly.

**Why this priority**: Comparison is essential for making an informed purchase decision. Users need to see differences and trade-offs between options to choose confidently.

**Independent Test**: Can be fully tested by adding vehicles to compare tray and viewing the side-by-side comparison with category winners highlighted. Delivers value by making vehicle differences transparent and helping users choose between finalists.

**Acceptance Scenarios**:

1. **Given** a user is viewing recommendations, **When** they add a vehicle to the compare tray, **Then** the vehicle is added to a persistent tray that shows across the experience
2. **Given** a user has added 2-4 vehicles to compare, **When** they navigate to the compare view, **Then** they see a side-by-side table with pricing, efficiency, performance, safety, comfort, cargo, towing, dimensions, and warranty details with category winners highlighted
3. **Given** a user is viewing the comparison, **When** they toggle difference view, **Then** they see only rows where vehicles differ, making trade-offs more visible
4. **Given** a user wants to adjust the comparison, **When** they remove a vehicle or add another (up to 4 total), **Then** the compare table updates immediately

---

### User Story 3 - Cost Estimation (Priority: P1)

After comparing vehicles, a user wants to estimate the cost of ownership. They proceed to the Estimate screen with tabs for Cash (out-the-door), Finance, and Lease. They provide their ZIP code for tax/fee estimation, adjust discounts/rebates, enter down payment and trade-in details, select term lengths and APR (for finance) or residual value, money factor, and mileage caps (for lease), and optionally estimate monthly fuel/energy costs. They see estimated monthly payments, due-at-signing amounts, out-the-door totals, and a simple total-cost-over-time view with plain-language explanations and non-binding disclaimers.

**Why this priority**: Cost estimation is critical to helping users understand affordability and make a purchase decision. Without clear, transparent cost breakdowns, users cannot confidently proceed to dealers.

**Independent Test**: Can be fully tested by entering ZIP code, financial details, and optional fuel costs to generate cash, finance, and lease estimates. Delivers value by providing realistic cost expectations and helping users choose the right payment method.

**Acceptance Scenarios**:

1. **Given** a user has selected a vehicle to estimate, **When** they enter their ZIP code, **Then** the system estimates applicable taxes and fees based on that location
2. **Given** a user is on the Finance tab, **When** they enter down payment, trade-in value/payoff, target monthly payment, term length, and APR, **Then** they see estimated monthly payment, due-at-signing, and out-the-door total with explanations
3. **Given** a user is on the Lease tab, **When** they enter down payment, trade-in details, residual value, money factor, mileage cap, and term, **Then** they see estimated monthly lease payment, due-at-signing, and total cost over lease term with explanations
4. **Given** a user has entered fuel/electricity prices and annual miles, **When** they view estimates, **Then** they see estimated monthly fuel/energy cost included in the total cost-over-time view
5. **Given** a user is reviewing estimates, **When** they view any financial projection, **Then** they see clear disclaimers indicating estimates are informational, non-binding, and subject to dealer confirmation

---

### User Story 4 - Saving and Sharing Selections (Priority: P2)

A user wants to save their favorite vehicles, saved searches, compare sets, and estimates for later review. Signed-in users can save items across devices; unsigned users can save items locally in their browser. Users can also share a read-only link or export/print a summary of their selections.

**Why this priority**: Saving and sharing enables users to take time with their decision, return later, and involve family/friends. This increases engagement and conversion by reducing decision fatigue.

**Independent Test**: Can be fully tested by favoriting vehicles, saving a compare set or estimate, and sharing a read-only link. Delivers value by preserving user work and enabling collaboration.

**Acceptance Scenarios**:

1. **Given** a user favorites a vehicle, **When** they return to the site later (same browser session or signed in), **Then** the vehicle remains in their favorites
2. **Given** a user is signed in, **When** they save a compare set or estimate, **Then** they can access it from any device using their account
3. **Given** a user is not signed in, **When** they save items, **Then** the items persist in browser local storage and are available in that browser only
4. **Given** a user wants to share, **When** they click share on a compare set or estimate, **Then** they receive a read-only link they can send to others
5. **Given** a user wants to export, **When** they click export/print, **Then** they receive a formatted summary document suitable for printing or saving as PDF

---

### User Story 5 - Dealer Connection (Priority: P2)

After exploring vehicles and estimates, a user is ready to take the next step with a dealer. They use the "Find a Dealer / Contact Me" feature to locate nearby dealers or request contact, tied to their saved vehicle selections. An explicit consent step is included before sharing any personal information.

**Why this priority**: Connecting users to dealers is the conversion point for Toyota, turning exploratory interest into actionable leads. Consent ensures compliance and trust.

**Independent Test**: Can be fully tested by clicking "Find a Dealer" or "Contact Me" from a saved selection, providing ZIP code, and confirming consent to share information. Delivers value by facilitating the next step in the purchase journey.

**Acceptance Scenarios**:

1. **Given** a user has a saved vehicle or estimate, **When** they click "Find a Dealer," **Then** they enter their ZIP code and see a list of nearby Toyota dealers with contact information
2. **Given** a user wants to be contacted, **When** they click "Contact Me," **Then** they are asked to provide name, email/phone, and explicitly consent to sharing information before submission
3. **Given** a user submits a contact request, **When** the form is processed, **Then** their selected vehicles and estimates are attached to the lead and they receive confirmation

---

### User Story 6 - Preference Adjustment and Filtering (Priority: P3)

After receiving initial recommendations, a user wants to refine their results. They use filter chips to adjust preferences (e.g., change budget, fuel type, seating) and see updated recommendations immediately without restarting the discovery journey.

**Why this priority**: Allowing quick adjustments improves user experience by letting them explore "what if" scenarios without friction, but is not essential for initial discovery.

**Independent Test**: Can be fully tested by using filter chips to modify preferences and seeing updated recommendations. Delivers value by enabling exploration and refinement.

**Acceptance Scenarios**:

1. **Given** a user is viewing recommendations, **When** they click a filter chip for budget and adjust the range, **Then** recommendations update immediately to reflect the new budget constraint
2. **Given** a user has applied multiple filters, **When** they clear all filters, **Then** recommendations return to the original results based on the initial guided journey inputs

---

### User Story 7 - Vehicle Detail View (Priority: P3)

A user wants to learn more about a specific recommended vehicle. They click on the vehicle to see detailed information including available trims, key specifications, image galleries, and highlighted features.

**Why this priority**: Detail pages provide depth and build confidence, but users can make decisions from comparison and recommendations alone if needed.

**Independent Test**: Can be fully tested by clicking on a vehicle card and viewing the detail page with trim selector, specs, gallery, and features. Delivers value by educating users about specific vehicles.

**Acceptance Scenarios**:

1. **Given** a user clicks on a vehicle card, **When** the detail page loads, **Then** they see available trims, key specs (engine, MPG, seating, cargo), image gallery, and highlighted features
2. **Given** a user is viewing vehicle details, **When** they select a different trim, **Then** the page updates to show specs and features for that trim

---

### Edge Cases

- What happens when a user enters a ZIP code that cannot be matched to tax/fee data? System falls back to state-level averages and displays a message: "Using state-level estimates; actual costs may vary."
- What happens when voice recognition fails or the user speaks unclearly? System displays a message asking the user to repeat or offers to switch to text input.
- What happens when a user tries to add a 5th vehicle to the compare tray? System displays a message: "Compare tray is full (max 4 vehicles). Remove one to add another."
- What happens when no vehicles match the user's criteria (e.g., extremely low budget or conflicting requirements)? System shows the closest matches with a message: "No exact matches found. Here are vehicles that meet most of your needs."
- What happens when a user's saved items (favorites, compare sets) become unavailable (e.g., model discontinued or data unavailable)? System displays a message indicating the item is no longer available and suggests similar alternatives.
- What happens when a user attempts to share or export without any saved selections? System prompts: "Please add vehicles to favorites or create a compare set before sharing."
- What happens when a user declines consent for dealer contact? The "Contact Me" form is not submitted, and the user is returned to their previous view with no data shared.
- What happens when voice is not supported on the user's device or browser? System defaults to text-only mode and hides voice controls.

## Requirements *(mandatory)*

### Functional Requirements

#### Discovery and Recommendations

- **FR-001**: System MUST present a guided discovery journey that collects user needs via text or voice, including target monthly budget or cash budget, body style, seating capacity, fuel type (gas/hybrid/EV), range or MPG priorities, cargo and towing needs, AWD or 4x4 requirements, safety and driver-assist needs, must-have features, and driving patterns (urban/highway/commute length)
- **FR-002**: System MUST generate vehicle recommendations based on collected user needs and organize them into three tiers: Top Picks (up to 3 vehicles), Strong Contenders, and Explore Alternatives
- **FR-003**: System MUST provide transparent explanations for each recommendation, clearly stating why the vehicle matches the user's stated needs
- **FR-004**: Users MUST be able to complete the discovery journey using text input only, with voice being an optional enhancement
- **FR-005**: When voice is enabled, system MUST provide spoken prompts, accept voice responses, provide on-screen captions and transcripts, and offer a brief spoken summary of top picks
- **FR-006**: Users MUST be able to mute or disable voice at any time without losing functionality
- **FR-007**: System MUST use Gemini/Gemma AI models for recommendation reasoning, natural language processing, and generating recommendation explanations
- **FR-008**: System MUST use ElevenLabs API for high-quality text-to-speech voice output when voice mode is enabled

#### Filtering and Preference Adjustment

- **FR-009**: System MUST provide filter chips on the recommendations page to allow users to adjust their preferences (budget, body style, fuel type, seating, etc.) without restarting the discovery journey
- **FR-010**: System MUST update recommendations immediately when filters are applied or preferences are changed

#### Comparison

- **FR-011**: System MUST provide a persistent compare tray that users can access from any page
- **FR-012**: Users MUST be able to add up to 4 vehicles to the compare tray
- **FR-013**: System MUST display a side-by-side comparison table for vehicles in the compare tray, showing pricing/MSRP, efficiency (MPG/MPGe, range), performance (horsepower, torque, 0-60 time), safety ratings and notable driver-assist features, comfort and infotainment details, cargo volume, towing capacity, dimensions, and warranty coverage
- **FR-014**: System MUST highlight category winners in the comparison table (e.g., highest MPG, lowest price, most cargo space)
- **FR-015**: System MUST provide a difference view option that shows only rows where vehicles differ
- **FR-016**: System MUST allow users to remove vehicles from the compare tray and add new ones dynamically

#### Vehicle Details

- **FR-017**: System MUST provide a detail view for each vehicle showing available trims, key specifications, image galleries, and highlighted features
- **FR-018**: Users MUST be able to select different trims and see updated specifications and features for the selected trim

#### Cost Estimation

- **FR-019**: System MUST provide an Estimate screen with three tabs: Cash (out-the-door), Finance, and Lease
- **FR-020**: System MUST accept ZIP code input to estimate applicable state and local taxes and fees
- **FR-021**: When ZIP code tax/fee data is unavailable, system MUST fall back to state-level averages and display a message indicating this fallback
- **FR-022**: For Cash estimates, system MUST calculate out-the-door total including MSRP, taxes, fees, and user-applied discounts/rebates
- **FR-023**: For Finance estimates, system MUST accept down payment, trade-in value, trade-in payoff, target monthly payment or price, term length (in months), and APR, then calculate estimated monthly payment, due-at-signing, and out-the-door total
- **FR-024**: For Lease estimates, system MUST accept down payment, trade-in value and payoff, residual value, money factor, mileage cap, and term length, then calculate estimated monthly lease payment, due-at-signing, and total cost over lease term
- **FR-025**: System MUST provide optional inputs for fuel/electricity price and estimated annual miles to calculate and display estimated monthly fuel or energy cost
- **FR-026**: System MUST present a total-cost-over-time view showing cumulative costs (payments, fuel/energy, maintenance estimate) with plain-language explanations
- **FR-027**: System MUST display clear, prominent non-binding disclaimers on all estimates stating that figures are informational, subject to change, and must be confirmed by a dealer

#### Saving and Persistence

- **FR-028**: Users MUST be able to favorite vehicles, and favorites MUST persist across sessions
- **FR-029**: Users MUST be able to save searches, compare sets, and estimates
- **FR-030**: For signed-in users, saved items MUST be available across devices
- **FR-031**: For unsigned users, saved items MUST persist in browser local storage and be available only in that browser
- **FR-032**: System MUST provide a way for users to sign in or create an account using Auth0 authentication to enable cross-device saving with support for social logins

#### Sharing and Export

- **FR-033**: Users MUST be able to generate a read-only shareable link for any compare set or estimate
- **FR-034**: Users MUST be able to export or print a formatted summary of their selections, comparisons, and estimates
- **FR-035**: Shared links MUST display the compare set or estimate exactly as the user configured it, without requiring sign-in

#### Dealer Connection

- **FR-036**: System MUST provide a "Find a Dealer" feature that accepts ZIP code input and displays nearby Toyota dealers with contact information
- **FR-037**: System MUST provide a "Contact Me" feature that allows users to request dealer contact tied to their saved vehicle selections
- **FR-038**: Before submitting any contact request, system MUST present an explicit consent step requiring user confirmation to share personal information
- **FR-039**: System MUST attach selected vehicles and estimates to any dealer lead or contact request

#### Localization

- **FR-040**: When voice is used, system MUST provide captions and transcripts for all spoken content
- **FR-041**: System MUST be mobile-friendly and responsive across device sizes (mobile, tablet, desktop)
- **FR-042**: System MUST use USD currency and serve the United States market at launch
- **FR-043**: System MUST be designed for future localization with English as the initial language and copy structured to support translation

#### Data Sources and Disclaimers

- **FR-044**: System MUST use official Toyota model and trim information as the source for vehicle data
- **FR-045**: System MUST use published EPA fuel economy and range data for efficiency information
- **FR-046**: System MUST use publicly advertised MSRP as the base pricing data
- **FR-047**: System MUST label all incentives, rebates, and finance/lease figures as example estimates for exploration purposes, clearly marked as informational and subject to change
- **FR-048**: System MUST display disclaimers indicating that actual dealer pricing, incentives, and terms may vary and must be confirmed with a dealer
- **FR-049**: System MUST use Firestore for storing vehicle data, user profiles, saved favorites, searches, compare sets, estimates, and dealer leads with indexed collections for efficient querying
- **FR-050**: System MUST use Firebase Storage for storing vehicle image galleries and media assets

#### Deployment and Infrastructure

- **FR-051**: System MUST be deployed using Firebase App Hosting for integrated Next.js deployment with server-side rendering, tRPC API routes, and seamless Firebase service integration
- **FR-052**: System MUST support automatic scaling to handle variable traffic loads without manual intervention
- **FR-053**: System MUST provide CDN distribution for static assets and optimized content delivery

#### Out of Scope

- **FR-054**: Dealer inventory checking is explicitly out of scope; users cannot see real-time vehicle availability
- **FR-055**: Online purchasing or reservation is out of scope; the experience ends with dealer connection

### Key Entities

- **User**: Represents a person using the vehicle shopping experience; may be signed in (cross-device persistence) or unsigned (local persistence only); has saved favorites, searches, compare sets, and estimates
- **Vehicle**: Represents a Toyota model with attributes including model name, body style, seating capacity, fuel type, MPG/MPGe, range, cargo volume, towing capacity, dimensions, MSRP, available trims, performance specs (horsepower, torque, 0-60), safety ratings, driver-assist features, comfort/infotainment details, warranty coverage, and image galleries
- **User Needs Profile**: Represents the collection of preferences and requirements gathered during the guided discovery journey, including budget (monthly or cash), body style, seating, fuel type, range/MPG priorities, cargo/towing needs, AWD/4x4 preference, safety/driver-assist needs, must-have features, and driving patterns
- **Recommendation**: Represents a suggested vehicle matched to a User Needs Profile, with a tier (Top Pick, Strong Contender, Explore Alternative) and explanation text describing why it was recommended
- **Compare Set**: Represents a collection of up to 4 vehicles selected for side-by-side comparison, with associated comparison data (category winners, difference highlights)
- **Estimate**: Represents a cost projection for a specific vehicle, including type (Cash, Finance, Lease), ZIP code for taxes/fees, user-provided financial inputs (down payment, trade-in, APR, term, residual, money factor, mileage cap), calculated outputs (monthly payment, due-at-signing, out-the-door total, total cost over time), and optional fuel/energy cost estimate
- **Dealer Lead**: Represents a user's request for dealer contact, including user contact information, explicit consent status, selected vehicles, and attached estimates

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete the guided discovery journey and receive personalized vehicle recommendations in under 5 minutes
- **SC-002**: At least 80% of users who complete the discovery journey view the comparison table for at least two vehicles
- **SC-003**: At least 60% of users who view comparisons proceed to create at least one cost estimate
- **SC-004**: At least 90% of users successfully complete a cost estimate (Cash, Finance, or Lease) with valid inputs and see calculated results
- **SC-005**: The experience loads and renders on mobile devices (iOS and Android) with full functionality and responsive layout
- **SC-006**: At least 70% of users who create estimates either favorite a vehicle, save their work, or share a link, indicating engagement and intent
- **SC-007**: Users who enable voice receive spoken prompts and summaries with on-screen captions, and can complete the journey with voice commands alone if desired
- **SC-008**: At least 40% of users who save estimates proceed to "Find a Dealer" or "Contact Me," indicating conversion readiness
- **SC-009**: Shared links load successfully for recipients and display the exact compare set or estimate as configured, without errors
- **SC-010**: Initial AI-powered vehicle recommendations are generated and displayed within 3 seconds of completing the guided discovery journey
- **SC-011**: Filter updates to recommendations are applied and results are updated within 1 second of user interaction
