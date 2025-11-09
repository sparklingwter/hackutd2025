# Frontend Contracts: Toyota Vehicle Shopping Experience

**Branch**: `001-vehicle-shopping-experience` | **Date**: 2025-11-09  
**Purpose**: Define page structures, component interfaces, and data flows for the frontend implementation

## Overview

This document describes the **actual frontend implementation** from the `frontend` branch. The application consists of four pages with client-side components, static vehicle data, and optional ElevenLabs API integration for voice features.

---

## Page Routes

### 1. Landing Page: `/`

**Component**: `src/app/page.tsx`

**Purpose**: Entry point with voice and text input for describing vehicle needs

**Key Features**:
- Large "FindMyYota" heading
- Search bar (decorative, not functional)
- Multi-line chatbox with voice/plus/send buttons
- Voice recording with ElevenLabs speech-to-text
- Theme toggle (light/dark mode)
- Sticky Toyota logo header

**State Management**:

```typescript
const [text, setText] = useState<string>("");           // Chatbox content
const [recording, setRecording] = useState<boolean>(false);  // Voice recording state
```

**User Interactions**:

1. **Text Input**: User types in chatbox, clicks send → navigate to `/result`
2. **Voice Input**: User clicks mic → starts recording → clicks again → stops, transcribes, appends to chatbox
3. **Theme Toggle**: User clicks theme button → toggles light/dark mode

**Component Structure**:

```tsx
<TooltipProvider>
  <ThemeToggle />
  <StickyHeader logoSize={160} />
  <main>
    {/* Title */}
    <h1>FindMy<span>Yota</span></h1>
    
    {/* Search bar (optional) */}
    <InputGroup>
      <InputGroupAddon><Search /></InputGroupAddon>
      <InputGroupInput placeholder="Search..." />
    </InputGroup>
    
    {/* Chatbox with voice */}
    <InputGroup>
      <InputGroupTextarea
        placeholder="Ask, Search or Chat..."
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton onClick={toggleVoice}>
          {recording ? <MicOff /> : <Mic />}
        </InputGroupButton>
        <InputGroupButton><IconPlus /></InputGroupButton>
        <Link href="/result">
          <InputGroupButton><ArrowUpIcon /></InputGroupButton>
        </Link>
      </InputGroupAddon>
    </InputGroup>
  </main>
</TooltipProvider>
```

**API Endpoint Used**:

- `POST /api/stt` (or `/api/elevenlabs/speech-to-text`)
  - **Request**: `FormData` with audio blob as `file`
  - **Response**: `{ text: string, words: [...], language_code: string }`
  - **Used for**: Transcribing voice recordings

---

### 2. Results Page: `/result`

**Component**: `src/app/result/page.tsx`

**Purpose**: Display filtered vehicle cards with keyword-based filtering

**Key Features**:
- Filter sidebar (left) with detected and manual filters
- Chatbox with search bar (top center)
- Vehicle cards grid (below)
- Compare popup (bottom-right, fixed)
- Active filter chips display

**State Management**:

```typescript
const [prompt, setPrompt] = useState<string>("");                  // User's search text
const [selected, setSelected] = useState<string[]>([]);            // Manually toggled filters
const [compareIds, setCompareIds] = useState<string[]>([]);        // Vehicles in compare
const [error, setError] = useState<string | null>(null);           // Compare limit error

// Computed values
const detected = useMemo(() => extractKeywords(prompt), [prompt]);
const activeFilters = useMemo(() => [...new Set([...detected, ...selected])], [detected, selected]);
const filteredCars = useMemo(() => {
  if (activeFilters.length === 0) return CARS;
  return CARS.filter(c => c.tags.some(t => activeFilters.includes(t)));
}, [activeFilters]);
```

**User Interactions**:

1. **Detected Filters**: Auto-populated from landing page text input (read-only chips)
2. **Manual Filters**: Click to toggle on/off → updates `selected` → recalculates `filteredCars`
3. **Add to Compare**: Click "Compare" on card → adds to `compareIds` (max 3) → shows in popup
4. **Remove from Compare**: Click × in popup → removes from `compareIds`
5. **Open Compare**: Click "Open Compare" → navigate to `/compare_result?ids=<comma-separated>`
6. **Refine Search**: Edit chatbox and click apply → updates `prompt` → re-detects keywords

**Component Structure**:

```tsx
<>
  <ThemeToggle />
  <StickyHeader />
  <main>
    <div className="grid grid-cols-12 gap-6">
      {/* Filter Sidebar (left) */}
      <aside className="col-span-3">
        <div>Detected from your prompt</div>
        {detected.map(k => <span key={k}>{k}</span>)}
        
        <div>Quick add/remove</div>
        {FLAT_KEYWORDS.map(k => (
          <button onClick={() => toggleManual(k)}>
            {activeFilters.includes(k) ? "✓ " : ""}{k}
          </button>
        ))}
      </aside>
      
      {/* Chatbox (center) */}
      <section className="col-span-9">
        <InputGroup>
          <InputGroupAddon><Search /></InputGroupAddon>
          <InputGroupInput placeholder="Quick search…" />
        </InputGroup>
        
        <InputGroup>
          <InputGroupTextarea
            placeholder="Describe what you want…"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
          <InputGroupAddon align="inline-end">
            <InputGroupButton>Apply <ArrowRight /></InputGroupButton>
          </InputGroupAddon>
        </InputGroup>
        
        {/* Active filters summary */}
        {activeFilters.map(k => <span key={k}>{k}</span>)}
      </section>
    </div>
    
    {/* Vehicle Cards Grid */}
    <section>
      {filteredCars.length === 0 ? (
        <div><AlertTriangle /> No cars match...</div>
      ) : (
        <div className="grid grid-cols-3 gap-6">
          {filteredCars.map(car => (
            <VehicleCard
              key={car.id}
              car={car}
              inCompare={compareIds.includes(car.id)}
              onCompare={() => addCompare(car.id)}
            />
          ))}
        </div>
      )}
    </section>
    
    {/* Compare Popup (fixed) */}
    <div className="fixed bottom-6 right-6">
      <div>Compare ({compareIds.length} / 3)</div>
      {error && <div>{error}</div>}
      <ul>
        {compareIds.map(id => (
          <li key={id}>
            {CARS.find(c => c.id === id)?.name}
            <button onClick={() => removeCompare(id)}>×</button>
          </li>
        ))}
      </ul>
      <Link href={`/compare_result?ids=${compareIds.join(",")}`}>
        Open Compare <ArrowUp />
      </Link>
    </div>
  </main>
</>
```

**Keyword Extraction Logic**:

```typescript
const KEYWORD_ALIASES: Record<string, string[]> = {
  "4wd": ["4wd", "4x4", "four-wheel drive"],
  "awd": ["awd", "all-wheel drive"],
  "hybrid": ["hybrid", "phev"],
  "ev": ["ev", "electric"],
  "suv": ["suv", "crossover"],
  // ... more mappings
};

function extractKeywords(text: string): string[] {
  const q = text.toLowerCase();
  const found = new Set<string>();
  for (const canonical of Object.keys(KEYWORD_ALIASES)) {
    const aliases = KEYWORD_ALIASES[canonical];
    if (aliases.some(a => q.includes(a))) {
      found.add(canonical);
    }
  }
  return Array.from(found);
}
```

**Data Source**:

```typescript
import { CARS, Car } from "~/lib/cars";
```

---

### 3. Compare Page: `/compare_result`

**Component**: `src/app/compare_result/page.tsx`

**Purpose**: Side-by-side comparison table for up to 3 vehicles

**Key Features**:
- Parse vehicle IDs from URL query `?ids=id1,id2,id3`
- Display comparison table with vehicle images in header
- Show specs: Price, Drivetrain, Powertrain, Body, Efficiency/Range, Tags
- Action buttons: "Buy" and "Back to card" (→ finance page)
- Warning banner if >3 IDs provided

**State Management**:

```typescript
const params = useSearchParams();
const idsParam = params.get("ids") || "";
const ids = useMemo(() => idsParam.split(",").map(s => s.trim()).filter(Boolean), [idsParam]);

const selected: Car[] = useMemo(() => {
  const cars = ids.map(id => CAR_INDEX[id]).filter((c): c is Car => !!c);
  return cars.slice(0, 3);  // Cap at 3
}, [ids]);

const hasOverflow = ids.length > 3;
```

**User Interactions**:

1. **View Comparison**: Arrives from results page with IDs → loads vehicles → displays table
2. **Back to Results**: Click link → navigate to `/result`
3. **Go to Finance**: Click "Back to card" → navigate to `/finance?carId=<id>`
4. **Buy**: Click "Buy" → placeholder action (not implemented)

**Component Structure**:

```tsx
<>
  <StickyHeader />
  <main>
    <h1>Compare Cars</h1>
    <Link href="/result">Back to Results</Link>
    
    {ids.length === 0 ? (
      <p>No cars selected for comparison.</p>
    ) : (
      <>
        {hasOverflow && (
          <div><AlertTriangle /> Showing first 3 cars only...</div>
        )}
        
        <table>
          <thead>
            <tr>
              <th>Model</th>
              {selected.map(car => (
                <th key={car.id}>
                  <Image src={car.img} alt={car.name} />
                  <div>{car.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <SpecRow label="Price" values={selected.map(c => c.price)} />
            <SpecRow label="Drivetrain" values={selected.map(c => c.specs.drivetrain.toUpperCase())} />
            <SpecRow label="Powertrain" values={selected.map(c => c.specs.powertrain.toUpperCase())} />
            <SpecRow label="Body" values={selected.map(c => c.specs.body.toUpperCase())} />
            <SpecRow
              label="Efficiency / Range"
              values={selected.map(c => c.specs.powertrain === "ev" ? c.specs.range : c.specs.mpg)}
            />
            <SpecRow label="Tags" values={selected.map(c => c.tags.join(", "))} />
            
            <tr>
              <th>Actions</th>
              {selected.map(car => (
                <td key={car.id}>
                  <Link href="#">Buy</Link>
                  <Link href={`/finance?carId=${car.id}`}>Back to card</Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </>
    )}
  </main>
</>
```

**Data Source**:

```typescript
import { CAR_INDEX, CARS, Car } from "~/lib/cars";
```

---

### 4. Finance Page: `/finance`

**Component**: `src/app/finance/page.tsx`

**Purpose**: Cost estimation with finance and buy (cash) modes

**Key Features**:
- Parse vehicle ID from URL query `?carId=<id>`
- Vehicle summary card (left sidebar)
- Finance/Buy mode toggle
- Input fields for tax, fees, down payment, APR, term
- Live-updating summary with calculated monthly payment or total

**State Management**:

```typescript
const params = useSearchParams();
const carId = params.get("carId") ?? "";
const car: Car | undefined = useMemo(() => findCar(carId), [carId]);

const [mode, setMode] = useState<"finance" | "buy">("finance");
const [downPct, setDownPct] = useState(10);     // %
const [apr, setApr] = useState(4.5);            // %
const [term, setTerm] = useState(60);           // months
const [taxPct, setTaxPct] = useState(6.25);     // %
const [docFee, setDocFee] = useState(150);      // $

// Calculated values
const msrp = parseMoneyToNumber(car?.price);
const taxAmount = useMemo(() => msrp * (taxPct / 100), [msrp, taxPct]);
const subtotal = useMemo(() => msrp + taxAmount + docFee, [msrp, taxAmount, docFee]);
const downAmt = useMemo(() => Math.round(subtotal * (downPct / 100)), [subtotal, downPct]);
const principal = useMemo(() => Math.max(subtotal - downAmt, 0), [subtotal, downAmt]);
const monthly = useMemo(() => monthlyPayment(principal, apr, term), [principal, apr, term]);
```

**User Interactions**:

1. **Mode Toggle**: Click "Finance" or "Buy" → switches calculation mode
2. **Adjust Inputs**: Change tax %, fees, down payment, APR, term → recalculates outputs
3. **View Summary**: Real-time updates as inputs change
4. **Navigation**: Click "Back" → `/result`, Click "Continue" → placeholder (not implemented)

**Component Structure**:

```tsx
<>
  <StickyHeader />
  <main>
    <h1>Finance Options</h1>
    <Link href="/result">Back to Results</Link>
    
    {!car ? (
      <div>Car not found...</div>
    ) : (
      <div className="grid grid-cols-3 gap-6">
        {/* Vehicle Summary (left) */}
        <aside className="col-span-1">
          <div>
            <Image src={car.img} alt={car.name} />
            <h2>{car.name}</h2>
            <div>{car.description}</div>
            <div><DollarSign /> MSRP: {car.price}</div>
          </div>
        </aside>
        
        {/* Calculator (right) */}
        <section className="col-span-2">
          {/* Mode Toggle */}
          <div>
            <button onClick={() => setMode("finance")}>
              <CreditCard /> Finance
            </button>
            <button onClick={() => setMode("buy")}>
              <DollarSign /> Buy
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            {/* Inputs (left) */}
            <div>
              <h3>Your Inputs</h3>
              <label>Sales Tax (%)</label>
              <input type="number" value={taxPct} onChange={...} />
              
              <label>Fees (doc/title/etc.)</label>
              <input type="number" value={docFee} onChange={...} />
              
              {mode === "finance" && (
                <>
                  <label>Down Payment (%)</label>
                  <input type="number" value={downPct} onChange={...} />
                  
                  <label>APR (%)</label>
                  <input type="number" value={apr} onChange={...} />
                  
                  <label>Term (months)</label>
                  <input type="number" value={term} onChange={...} />
                </>
              )}
            </div>
            
            {/* Summary (right) */}
            <div>
              <h3>Summary</h3>
              <dl>
                <dt>MSRP</dt><dd>{fmtUSD(msrp)}</dd>
                <dt>Sales Tax ({taxPct}%)</dt><dd>{fmtUSD(taxAmount)}</dd>
                <dt>Fees</dt><dd>{fmtUSD(docFee)}</dd>
                <dt>Subtotal</dt><dd>{fmtUSD(subtotal)}</dd>
                
                {mode === "finance" ? (
                  <>
                    <dt>Down Payment ({downPct}%)</dt><dd>− {fmtUSD(downAmt)}</dd>
                    <dt>Amount Financed</dt><dd>{fmtUSD(principal)}</dd>
                    <div>
                      <span>Estimated Monthly</span>
                      <span>{fmtUSD(Math.round(monthly))}</span>
                    </div>
                  </>
                ) : (
                  <div>
                    <span>Total Due (Cash)</span>
                    <span>{fmtUSD(subtotal)}</span>
                  </div>
                )}
              </dl>
              
              <Link href="/result">Back</Link>
              <Link href="#">Continue</Link>
            </div>
          </div>
        </section>
      </div>
    )}
  </main>
</>
```

**Calculation Functions**:

```typescript
function parseMoneyToNumber(display?: string): number {
  if (!display) return 0;
  return Number(display.replace(/[^\d.]/g, "")) || 0;  // "$36,990" → 36990
}

function fmtUSD(n: number): string {
  return n.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  });
}

function monthlyPayment(principal: number, aprPercent: number, months: number): number {
  const r = (aprPercent / 100) / 12;  // Monthly rate
  if (r <= 0) return principal / months;
  const pow = Math.pow(1 + r, months);
  return principal * (r * pow) / (pow - 1);
}
```

**Data Source**:

```typescript
import { findCar, Car } from "~/lib/cars";
```

---

## Shared Components

### StickyHeader

**Location**: `src/components/ui/sticky-header.tsx`

**Props**:

```typescript
type StickyHeaderProps = {
  logoSize?: number;     // Default: 96px
  src?: string;          // Default: "/Toyota-logo.png"
  alt?: string;          // Default: "Logo"
};
```

**Usage**: Displays Toyota logo in a sticky header across all pages

---

### InputGroup Components

**Location**: `src/components/ui/input-group.tsx`

**Components**:
- `InputGroup`: Container wrapper
- `InputGroupAddon`: Icon or button container (inline-start, inline-end, block-start, block-end)
- `InputGroupInput`: Single-line text input
- `InputGroupTextarea`: Multi-line text input
- `InputGroupButton`: Button within input group
- `InputGroupText`: Static text within input group

**Usage**: Used for search bars and chatboxes on landing and results pages

---

### ThemeToggle

**Location**: `src/components/theme-toggle.tsx`

**Purpose**: Toggle between light and dark mode

**Usage**: Appears on all pages (typically top-right corner)

---

## API Endpoints

### POST `/api/elevenlabs/speech-to-text` (or `/api/stt`)

**Purpose**: Transcribe audio recording to text using ElevenLabs API

**Request**:
- Method: `POST`
- Body: `FormData` with audio file
  - Field name: `file`
  - File format: `audio/webm` (opus) or `audio/mp4` (m4a)

**Response**:

```json
{
  "text": "I need a hybrid SUV with all-wheel drive",
  "words": [...],
  "language_code": "en"
}
```

**Implementation**: Proxies request to ElevenLabs API with API key from env vars

**Used by**: Landing page voice recording feature

---

## Data Access

### Vehicle Data Module

**Location**: `src/lib/cars.ts`

**Exports**:

```typescript
export type Car = { ... };                              // Type definition
export const CARS: Car[] = [ ... ];                     // Array of all vehicles
export const CAR_INDEX: Record<string, Car> = { ... };  // Lookup by ID
export function findCar(id: string): Car | undefined;   // Helper function
```

**Usage**: Imported by results, compare, and finance pages

---

## Error Handling

### Client-Side Errors

1. **Voice Recording Fails**: Show error message, fall back to text input
2. **No Vehicles Match Filters**: Display empty state with icon and message
3. **Compare Limit Exceeded**: Show error in popup, prevent addition
4. **Invalid Vehicle ID**: Show "Car not found" message
5. **Invalid Finance Inputs**: Clamp to reasonable ranges

All errors handled locally within components (no global error boundary in current implementation).

---

## Future API Integration Points

**Note**: These are **not implemented** in the current frontend, but identified for future backend work:

1. **Vehicle Search API**: Replace static `CARS` array with Firestore query
2. **AI Recommendations API**: Use Gemini to rank vehicles instead of keyword matching
3. **Dealer Finder API**: Implement "Find a Dealer" feature
4. **Lead Submission API**: Implement "Contact Me" feature
5. **User Profile API**: Save favorites, searches, estimates (requires auth)

---

## Summary

The frontend implementation is **fully self-contained** with:
- ✅ Static vehicle data in `src/lib/cars.ts`
- ✅ Client-side keyword filtering
- ✅ URL-based state sharing (compare IDs)
- ✅ Live-calculating finance estimator
- ✅ Optional voice input via ElevenLabs API
- ❌ No backend APIs (except voice transcription)
- ❌ No authentication or user accounts
- ❌ No data persistence (except URL params)

This architecture allows rapid prototyping and hackathon deployment without backend infrastructure.

