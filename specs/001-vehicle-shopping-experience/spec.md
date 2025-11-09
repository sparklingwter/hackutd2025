# Feature Specification: Toyota Vehicle Shopping Experience

**Feature Branch**: `001-vehicle-shopping-experience`  
**Created**: November 8, 2025  
**Status**: Draft  
**Input**: User description: "Build a Toyota vehicle-shopping web experience with four pages: (1) Landing/Discovery page with voice and text input, (2) Search/Results page with filtering and vehicle cards, (3) Compare page for side-by-side vehicle comparison (up to 3 vehicles), and (4) Finance page for cost estimation with cash/finance/lease options. The experience uses AI-powered filtering based on user input and provides transparent vehicle recommendations."

## Clarifications

### Session 2025-11-08

- Q: For the AI-guided voice-and-text journey, which AI service architecture should power the recommendation engine and voice interaction? → A: Hybrid approach: Gemini/Gemma for recommendation reasoning + ElevenLabs for high-quality TTS
- Q: For storing vehicle data, user profiles, saved favorites, compare sets, estimates, and dealer leads, which database solution should be used? → A: Firestore (as mentioned in project tech stack) with indexed collections for flexible document storage
- Q: What are the target performance requirements for generating vehicle recommendations and applying filter updates? → A: 3 seconds for initial AI recommendations, 1 second for filter updates (optimal UX)
- Q: For deploying the Next.js application with server-side rendering and API routes (tRPC), which hosting platform should be used? → A: Firebase App Hosting (as mentioned in project tech stack) for integrated Next.js deployment with Firebase services

## User Scenarios *(mandatory)*

### User Story 1 - Landing Page with Voice and Text Input (Priority: P1)

A prospective Toyota buyer visits the landing page featuring the FindMyYota branding with a large search bar and chatbox. They can describe their vehicle needs in natural language using text or voice (ElevenLabs voice recording). The page has a sticky Toyota logo header and theme toggle. The input supports multi-line descriptions and voice-to-text transcription.

**Why this priority**: This is the entry point for the entire experience. Without an intuitive input method, users cannot begin their vehicle search.

**Independent Test**: Can be fully tested by entering text descriptions or using voice recording, with transcription appearing in the chatbox. Delivers immediate value by capturing user needs in natural language.

**Acceptance Scenarios**:

1. **Given** a user arrives at the home page, **When** they see the interface, **Then** they see "FindMyYota" branding, a search bar, and a large chatbox with voice/plus/send buttons
2. **Given** a user wants to use voice, **When** they click the microphone button, **Then** recording starts with visual feedback (animated pulse) and stops when clicked again, with transcribed text appearing in the chatbox
3. **Given** a user enters text like "hybrid SUV with AWD for family trips", **When** they click send/arrow-up, **Then** they are navigated to the results page with filtered recommendations
4. **Given** a user wants to skip voice, **When** they type in the chatbox, **Then** they can describe their needs in text without any voice interaction required

---

### User Story 2 - Search/Results Page with Filtering (Priority: P1)

After entering their needs on the landing page, users see a results page with a filter sidebar (left), chatbox with search bar (top center), and vehicle cards grid (below). Filters are automatically detected from the user's text prompt (e.g., "hybrid", "suv", "awd") and displayed as active chips. Users can toggle additional filters manually. Each vehicle card shows an image, name, price, description, matching tags, and "Buy" + "Compare" buttons. A fixed compare popup (bottom-right) tracks selected vehicles (up to 3) with an "Open Compare" button.

**Why this priority**: Filtering and browsing is core to vehicle discovery. Users need to see relevant results and refine their search.

**Independent Test**: Can be fully tested by viewing filtered results, toggling filters, adding vehicles to compare, and seeing the compare popup update. Delivers value by helping users discover vehicles matching their needs.

**Acceptance Scenarios**:

1. **Given** a user enters "hybrid SUV with AWD" on the landing page, **When** they arrive at results, **Then** they see filters for "hybrid", "suv", and "awd" automatically detected and applied, with matching vehicle cards displayed
2. **Given** a user sees active filters, **When** they click a filter chip to toggle it, **Then** the vehicle grid updates immediately to reflect the new filter set
3. **Given** a user sees vehicle cards, **When** they click "Compare" on a card, **Then** the vehicle is added to the compare popup (max 3), showing vehicle name and a remove button
4. **Given** a user has added 2-3 vehicles to compare, **When** they click "Open Compare" in the popup, **Then** they navigate to the compare page with those vehicles pre-selected

---

### User Story 3 - Compare Page for Side-by-Side Vehicle Comparison (Priority: P1)

Users arriving from the results page with 1-3 vehicles selected see a side-by-side comparison table. The header row shows vehicle images and names. Rows display specs: Price, Drivetrain, Powertrain, Body Type, Efficiency/Range, and Tags. A final "Actions" row has "Buy" and "Back to card" buttons for each vehicle. The table is responsive and shows up to 3 vehicles (first 3 if more than 3 were selected). An error banner appears if more than 3 vehicles were selected.

**Why this priority**: Comparison is essential for users to see differences and make informed choices between vehicles.

**Independent Test**: Can be fully tested by navigating with multiple vehicle IDs in the URL query parameter and seeing the comparison table. Delivers value by making vehicle differences clear.

**Acceptance Scenarios**:

1. **Given** a user has 2 vehicles in the compare popup, **When** they click "Open Compare", **Then** they see a comparison table with those 2 vehicles showing price, drivetrain, powertrain, body type, efficiency, and tags
2. **Given** a user is viewing the comparison table, **When** they see the specs, **Then** differences between vehicles are visually clear (e.g., "AWD" vs "FWD", "39 mpg" vs "52 mpg")
3. **Given** a user compares vehicles, **When** they click "Back to card", **Then** they navigate to the finance page for that specific vehicle
4. **Given** a user tries to compare more than 3 vehicles, **When** the page loads, **Then** only the first 3 are shown with a warning banner indicating the limit

---

### User Story 4 - Finance Page with Cost Estimation (Priority: P1)

Users navigate to the finance page with a specific vehicle pre-selected (via URL parameter). The page shows the vehicle summary card (left sidebar with image, name, description, and MSRP) and a calculator section (right) with "Finance" and "Buy" toggle buttons. Users input Sales Tax %, Fees, and if using Finance mode: Down Payment %, APR %, and Term (months). A summary panel shows MSRP, sales tax, fees, subtotal, down payment, amount financed, and estimated monthly payment (for Finance) or total due (for Buy/Cash). The page includes "Back" and "Continue" buttons.

**Why this priority**: Cost estimation is the final step before dealer contact. Users need clear, transparent cost breakdowns to make purchase decisions.

**Independent Test**: Can be fully tested by navigating with a vehicle ID, entering financial inputs, and seeing calculated estimates update. Delivers value by providing realistic cost expectations.

**Acceptance Scenarios**:

1. **Given** a user arrives at the finance page with a vehicle ID, **When** the page loads, **Then** they see the vehicle summary with image and MSRP, and calculator inputs with default values
2. **Given** a user is in Finance mode, **When** they adjust down payment %, APR, or term, **Then** the estimated monthly payment recalculates immediately
3. **Given** a user is in Buy mode, **When** they adjust sales tax or fees, **Then** the total due (cash) recalculates immediately
4. **Given** a user enters sales tax and fees, **When** they view the summary, **Then** they see a clear breakdown: MSRP + Tax + Fees = Subtotal, then Down Payment subtracted to show Amount Financed

---

### User Story 5 - Keyboard and Filter System (Priority: P2)

### User Story 5 - Keyword Filtering and Detection (Priority: P2)

The system uses a keyword dictionary to detect filter terms from natural language input. Keywords include drivetrain types ("awd", "4wd", "fwd", "rwd"), powertrain types ("hybrid", "ev", "gas"), body styles ("suv", "sedan", "truck"), and features ("luxury", "sport", "economy", "offroad", "family"). Users see detected keywords as active filter chips on the results page and can manually toggle additional filters.

**Why this priority**: Intelligent keyword detection improves user experience by automatically applying relevant filters from natural language, but is not essential for basic filtering functionality.

**Independent Test**: Can be fully tested by entering phrases like "affordable hybrid SUV for families" and seeing filters for "hybrid", "suv", "economy", and "family" automatically applied.

**Acceptance Scenarios**:

1. **Given** a user enters "4x4 truck for towing", **When** results load, **Then** filters for "4wd", "truck", and "towing" are automatically detected and active
2. **Given** a user sees detected filters, **When** they manually toggle additional filters like "luxury", **Then** the filter set updates and results refresh immediately
3. **Given** a user enters synonyms like "all-wheel drive", **When** results load, **Then** the canonical filter "awd" is detected and applied

---

### User Story 6 - Theme Toggle and Responsive Design (Priority: P3)

Users can toggle between light and dark themes using a theme toggle button. All pages use a sticky Toyota logo header and responsive layouts that adapt to mobile, tablet, and desktop screens. Components use Tailwind CSS with shadcn/ui and tweakcn styling.

**Why this priority**: Theme support and responsive design improve accessibility and user experience, but are not core to vehicle discovery functionality.

**Independent Test**: Can be fully tested by toggling theme and resizing browser window to see responsive layouts.

**Acceptance Scenarios**:

1. **Given** a user clicks the theme toggle, **When** the theme changes, **Then** all pages update to light or dark mode with appropriate colors
2. **Given** a user views the site on mobile, **When** pages load, **Then** layouts adapt with mobile-friendly navigation and stacked components

---

### Edge Cases

- What happens when voice recording fails or the browser doesn't support getUserMedia? System displays an error message and automatically falls back to text-only input mode.
- What happens when a user tries to add a 4th vehicle to the compare popup? System displays an error message in the popup: "You can compare up to 3 cars." and prevents adding more vehicles.
- What happens when no vehicles match the user's active filters? System shows an empty state with a message: "No cars match the current filters. Try removing a few keywords." with an icon.
- What happens when a user navigates to the compare page without any vehicles selected (no IDs in URL)? System shows a message: "No cars selected for comparison." and a link back to results.
- What happens when more than 3 vehicle IDs are passed to the compare page? System shows only the first 3 vehicles with a warning banner: "Showing first 3 cars only. Remove extras in the Results page."
- What happens when a user navigates to the finance page without a vehicle ID or with an invalid ID? System shows an error: "Car not found. Please go back and select a car."
- What happens when a user enters invalid financial inputs (negative values, very high APR)? System clamps values to reasonable ranges or displays validation errors.
- What happens when keyword detection produces too many filters from a long text prompt? System shows all detected keywords but allows users to manually toggle them off.

## Requirements *(mandatory)*

### Functional Requirements

#### User Interface Structure

- **FR-001**: System MUST provide exactly four pages: (1) Landing/Discovery page (`/`), (2) Search/Results page (`/result`), (3) Compare page (`/compare_result`), and (4) Finance page (`/finance`)
- **FR-002**: System MUST include a sticky header component with Toyota logo on all pages
- **FR-003**: System MUST provide a theme toggle for light/dark mode accessible on all pages
- **FR-004**: System MUST use responsive design adapting to mobile, tablet, and desktop screen sizes

#### Landing/Discovery Page

- **FR-005**: Landing page MUST display "FindMyYota" branding with large heading
- **FR-006**: Landing page MUST provide a search bar (rounded, with search icon) and a large chatbox (rounded, multi-line textarea)
- **FR-007**: Chatbox MUST include three buttons at bottom-right: voice recording (microphone icon), plus icon, and send/arrow-up icon
- **FR-008**: Voice recording button MUST start/stop audio recording with visual feedback (animated pulse during recording)
- **FR-009**: System MUST use ElevenLabs speech-to-text API (`/api/elevenlabs/speech-to-text` or `/api/stt`) to transcribe voice recordings
- **FR-010**: Transcribed text MUST appear in the chatbox, appending to existing text
- **FR-011**: Send button MUST navigate to results page (`/result`) with user's text input
- **FR-012**: System MUST function fully with text-only input (voice is optional enhancement)

#### Search/Results Page and Filtering

- **FR-013**: Results page MUST display filter sidebar (left, 3-4 columns on desktop), chatbox with search bar (top center), and vehicle cards grid (below chatbox)
- **FR-014**: System MUST extract keywords from user's text input using a keyword dictionary with aliases (e.g., "all-wheel drive" → "awd", "4x4" → "4wd")
- **FR-015**: Keyword dictionary MUST include: drivetrain types (awd, 4wd, fwd, rwd), powertrain types (hybrid, ev, gas, phev), body styles (suv, sedan, truck, crossover, coupe, hatchback, minivan), and features (luxury, economy, sport, offroad, towing, family)
- **FR-016**: Filter sidebar MUST show two sections: "Detected from your prompt" (auto-detected keywords as read-only chips) and "Quick add/remove" (all available keywords as toggleable buttons)
- **FR-017**: System MUST display active filters as chips below the chatbox showing all currently applied filters
- **FR-018**: Clicking a filter button MUST toggle it on/off and immediately update the vehicle grid
- **FR-019**: Vehicle filtering MUST match vehicles whose tags include ANY active filter (OR logic); if no filters active, show all vehicles
- **FR-020**: System MUST show empty state with AlertTriangle icon and message when no vehicles match active filters

#### Vehicle Cards and Comparison

- **FR-021**: Each vehicle card MUST display: image, name, price (as chip), description, matching filter tags (as small chips), and two buttons ("Buy" and "Compare")
- **FR-022**: Compare button MUST add vehicle to compare popup (bottom-right, fixed position)
- **FR-023**: Compare popup MUST show vehicle count ("X / 3"), list of added vehicles with remove buttons, and "Open Compare" button
- **FR-024**: System MUST limit compare selection to maximum 3 vehicles
- **FR-025**: When user attempts to add a 4th vehicle, system MUST display error message in compare popup and prevent addition
- **FR-026**: "Open Compare" button MUST navigate to `/compare_result?ids=<comma-separated-vehicle-ids>`
- **FR-027**: Compare button on vehicle card MUST show checkmark icon and green background when vehicle is in compare set

#### Compare Page

- **FR-028**: Compare page MUST parse vehicle IDs from URL query parameter `ids` (comma-separated)
- **FR-029**: Compare page MUST display side-by-side comparison table with vehicles as columns
- **FR-030**: Table header row MUST show vehicle images (rounded rectangles) and names
- **FR-031**: Table MUST include rows for: Model (header), Price, Drivetrain, Powertrain, Body, Efficiency/Range, Tags, and Actions
- **FR-032**: Efficiency/Range row MUST show MPG for hybrid/gas vehicles or range for EV vehicles
- **FR-033**: Tags row MUST display comma-separated list of vehicle tags
- **FR-034**: Actions row MUST include "Buy" button and "Back to card" button for each vehicle
- **FR-035**: "Back to card" button MUST navigate to `/finance?carId=<vehicle-id>`
- **FR-036**: When more than 3 vehicle IDs are provided, system MUST show only first 3 with warning banner
- **FR-037**: When no vehicle IDs are provided, system MUST show message "No cars selected for comparison" with link back to results
- **FR-038**: Compare page MUST include "Back to Results" link in header

#### Finance Page

- **FR-039**: Finance page MUST parse vehicle ID from URL query parameter `carId`
- **FR-040**: Finance page MUST display vehicle summary card (left sidebar) showing image, name, description, and MSRP as chip
- **FR-041**: Finance page MUST provide mode toggle buttons: "Finance" and "Buy" (mutually exclusive)
- **FR-042**: Finance page MUST display two-column layout: inputs (left) and summary (right)
- **FR-043**: Inputs panel MUST include: Sales Tax (%), Fees ($), and mode-specific inputs
- **FR-044**: In Finance mode, inputs MUST include: Down Payment (%), APR (%), Term (months)
- **FR-045**: Summary panel MUST display: MSRP, Sales Tax (calculated), Fees, Subtotal
- **FR-046**: In Finance mode, summary MUST additionally show: Down Payment (calculated), Amount Financed, and Estimated Monthly Payment (large, highlighted)
- **FR-047**: In Buy mode, summary MUST show: Total Due (Cash) (large, highlighted)
- **FR-048**: System MUST use monthly payment formula: `P = principal * (r * (1+r)^n) / ((1+r)^n - 1)` where r = APR/12 and n = term in months
- **FR-049**: System MUST recalculate all outputs immediately when any input changes
- **FR-050**: Summary panel MUST include "Back" link to results and "Continue" button
- **FR-051**: When vehicle ID is missing or invalid, system MUST show error message and loading state

#### Data Sources and Vehicle Data

- **FR-052**: System MUST store vehicle data in `src/lib/cars.ts` as a TypeScript array
- **FR-053**: Each vehicle entity MUST include: id (string), name (string), img (path string), price (display string with $), tags (array of lowercase keywords), description (string), specs object
- **FR-054**: Vehicle specs object MUST include: drivetrain ("awd"|"4wd"|"fwd"|"rwd"), powertrain ("hybrid"|"ev"|"gas"|"phev"), body ("suv"|"sedan"|"truck"|"crossover"|etc), mpg (optional string), range (optional string)
- **FR-055**: System MUST provide `CAR_INDEX` lookup object mapping vehicle IDs to vehicle objects
- **FR-056**: System MUST provide `findCar(id)` utility function returning vehicle or undefined
- **FR-057**: Vehicle images MUST be stored in `/public/cars/` directory
- **FR-058**: Price strings MUST be formatted as USD with commas (e.g., "$36,990")

#### UI Components

- **FR-059**: System MUST use shadcn/ui and tweakcn for UI component library
- **FR-060**: System MUST use Tailwind CSS 4.0 for styling with utility classes
- **FR-061**: System MUST use Lucide icons for all iconography
- **FR-062**: System MUST implement `InputGroup` components (InputGroupInput, InputGroupTextarea, InputGroupAddon, InputGroupButton) for search/chat inputs
- **FR-063**: System MUST implement `StickyHeader` component with configurable logo size
- **FR-064**: System MUST implement `ThemeToggle` component for light/dark mode switching

#### Deployment and Infrastructure

- **FR-065**: System MUST be deployed using Firebase App Hosting for Next.js with server-side rendering
- **FR-066**: System MUST support automatic scaling to handle variable traffic loads
- **FR-067**: System MUST use Next.js 15.2 App Router with Server Components
- **FR-068**: System MUST use TypeScript 5.8 with strict type checking

#### Out of Scope

- **FR-069**: User authentication and cross-device synchronization is out of scope; no sign-in required
- **FR-070**: Saving favorites, searches, and estimates to server/database is out of scope (browser local storage only if implemented)
- **FR-071**: Dealer inventory checking and real-time availability is out of scope
- **FR-072**: Online purchasing, reservation, or payment processing is out of scope
- **FR-073**: Dealer connection, "Find a Dealer", and "Contact Me" features are out of scope
- **FR-074**: Lease calculations are out of scope (Finance and Buy modes only)
- **FR-075**: ZIP code-based tax estimation is simplified (single tax % input)

### Key Entities

- **Vehicle**: Represents a Toyota model with attributes including id (unique string), name (display name), img (path to image file), price (formatted string like "$36,990"), tags (array of lowercase keywords for filtering like ["toyota", "suv", "hybrid", "awd"]), description (user-facing summary), and specs object containing drivetrain (awd/4wd/fwd/rwd), powertrain (hybrid/ev/gas/phev), body (suv/sedan/truck/crossover/etc), mpg (optional string for hybrid/gas), range (optional string for EV)
- **Keyword**: Represents a filterable attribute with a canonical form (e.g., "awd") and aliases (e.g., ["awd", "all-wheel drive", "all wheel drive"]). Used for natural language filter detection
- **Compare Set**: Represents a collection of up to 3 vehicle IDs selected for comparison, passed via URL query parameter `ids` (comma-separated)
- **Finance Estimate**: Represents cost calculations for a specific vehicle including inputs (sales tax %, fees, down payment %, APR, term in months, mode: finance or buy) and outputs (MSRP, tax amount, subtotal, down payment amount, amount financed, monthly payment for finance or total due for buy)

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
