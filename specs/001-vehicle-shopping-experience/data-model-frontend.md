# Data Model: Toyota Vehicle Shopping Experience (Frontend Implementation)

**Branch**: `001-vehicle-shopping-experience` | **Date**: 2025-11-09  
**Purpose**: Define entities, types, and data structures used in the frontend implementation

## Overview

This data model reflects the **actual frontend implementation** from the `frontend` branch. The application uses static TypeScript data in `src/lib/cars.ts` with no backend database. All vehicle information is hardcoded and served directly from the client.

## Entity Definitions

### 1. Vehicle (Car)

**Purpose**: Represents a Toyota vehicle with specifications, pricing, and filtering metadata

**Location**: `src/lib/cars.ts` - exported as `CARS` array

**TypeScript Definition**:

```typescript
export type Car = {
  id: string;
  name: string;
  img: string;
  price: string;
  tags: string[];
  description: string;
  specs: {
    drivetrain: "awd" | "4wd" | "fwd" | "rwd";
    powertrain: "hybrid" | "ev" | "gas" | "phev";
    body: "suv" | "sedan" | "truck" | "crossover" | "coupe" | "hatchback" | "minivan";
    mpg?: string;
    range?: string;
  };
};
```

**Field Descriptions**:

| Field | Type | Required | Description | Example |
|-------|------|----------|-------------|---------|
| `id` | string | ✅ | Unique kebab-case identifier | `"rav4-hybrid-awd"` |
| `name` | string | ✅ | Full display name with trim | `"Toyota RAV4 Hybrid XSE (AWD)"` |
| `img` | string | ✅ | Path to image in `/public/cars/` | `"/cars/rav4-hybrid.jpg"` |
| `price` | string | ✅ | Formatted MSRP with $ and commas | `"$36,990"` |
| `tags` | string[] | ✅ | Lowercase keywords for filtering | `["toyota", "suv", "hybrid", "awd"]` |
| `description` | string | ✅ | User-facing summary (1-2 sentences) | `"Efficient compact SUV with e-AWD..."` |
| `specs.drivetrain` | enum | ✅ | Drive system type | `"awd"` |
| `specs.powertrain` | enum | ✅ | Fuel/power type | `"hybrid"` |
| `specs.body` | enum | ✅ | Body style category | `"suv"` |
| `specs.mpg` | string | ❌ | Combined MPG (gas/hybrid only) | `"39 mpg"` |
| `specs.range` | string | ❌ | Electric range (EV only) | `"252 mi"` |

**Validation Rules**:

- `id` must be unique across all vehicles
- `img` must point to an existing file in `/public/cars/`
- `price` must be formatted as `"$XX,XXX"` or `"$XXX,XXX"`
- `tags` must be lowercase and match keywords in `KEYWORD_ALIASES`
- Exactly one of `specs.mpg` or `specs.range` should be present (not both)
- `specs.mpg` required for `powertrain: "hybrid" | "gas" | "phev"`
- `specs.range` required for `powertrain: "ev"`

**Example Vehicle**:

```typescript
{
  id: "rav4-hybrid-awd",
  name: "Toyota RAV4 Hybrid XSE (AWD)",
  img: "/cars/rav4-hybrid.jpg",
  description: "Efficient compact SUV with e-AWD, great for families and weekend trips.",
  tags: ["toyota", "suv", "hybrid", "awd", "4wd", "economy"],
  price: "$36,990",
  specs: {
    drivetrain: "awd",
    powertrain: "hybrid",
    body: "suv",
    mpg: "39 mpg"
  }
}
```

**Data Access Utilities**:

```typescript
// Exported from src/lib/cars.ts
export const CARS: Car[] = [...];                        // Array of all vehicles
export const CAR_INDEX: Record<string, Car> = {...};     // Lookup by ID
export function findCar(id: string): Car | undefined;    // Helper function
```

---

### 2. Keyword Alias Dictionary

**Purpose**: Maps natural language terms to canonical filter keywords for vehicle search

**Location**: `src/app/result/page.tsx` - defined as `KEYWORD_ALIASES`

**TypeScript Definition**:

```typescript
const KEYWORD_ALIASES: Record<string, string[]> = {
  // Canonical keyword -> array of aliases (including canonical)
  "4wd": ["4wd", "4x4", "four-wheel drive", "four wheel drive"],
  "awd": ["awd", "all-wheel drive", "all wheel drive"],
  // ... more mappings
};
```

**Keyword Categories**:

| Category | Canonical Keywords |
|----------|-------------------|
| **Drivetrain** | `4wd`, `awd`, `fwd`, `rwd` |
| **Powertrain** | `hybrid`, `ev`, `phev` (plug-in hybrid), `gas` |
| **Body Style** | `suv`, `truck`, `sedan`, `coupe`, `hatchback`, `minivan`, `crossover` |
| **Features** | `luxury`, `economy`, `sport`, `offroad`, `towing`, `family` |

**Usage**: The `extractKeywords(text: string)` function parses user input and returns canonical keywords:

```typescript
extractKeywords("I need an all-wheel drive hybrid SUV")
// Returns: ["awd", "hybrid", "suv"]
```

---

### 3. Compare Set

**Purpose**: Tracks vehicles selected for side-by-side comparison

**Location**: URL query parameter on `/compare_result` page

**Format**: Comma-separated vehicle IDs

```text
/compare_result?ids=rav4-hybrid-awd,camry-hybrid,bz4x-ev-awd
```

**Rules**:
- Maximum 3 vehicle IDs
- IDs must match existing vehicles in `CARS` array
- Invalid IDs are filtered out silently
- If more than 3 IDs provided, only first 3 are used

**State Management**: Managed in client component state on `/result` page:

```typescript
const [compareIds, setCompareIds] = useState<string[]>([]);
```

---

### 4. Finance Estimate Inputs

**Purpose**: User-provided values for cost calculation on finance page

**Location**: Client state in `/finance/page.tsx`

**TypeScript Definition** (implicit from component state):

```typescript
type FinanceInputs = {
  mode: "finance" | "buy";
  taxPct: number;        // Sales tax percentage (e.g., 6.25)
  docFee: number;        // Flat fees (doc, title, registration)
  downPct: number;       // Down payment percentage (finance mode only)
  apr: number;           // Annual percentage rate (finance mode only)
  term: number;          // Loan term in months (finance mode only)
};
```

**Default Values**:

```typescript
{
  mode: "finance",
  taxPct: 6.25,      // Texas base sales tax
  docFee: 150,
  downPct: 10,
  apr: 4.5,
  term: 60
}
```

**Validation Rules**:
- `taxPct`: 0-20 (percentage)
- `docFee`: 0-5000 (USD)
- `downPct`: 0-100 (percentage)
- `apr`: 0-30 (percentage)
- `term`: 12-96, must be divisible by 12 (months)

---

### 5. Finance Estimate Outputs

**Purpose**: Calculated cost breakdown displayed on finance page

**Calculation Logic** (in `/finance/page.tsx`):

```typescript
type FinanceOutputs = {
  msrp: number;          // Parsed from vehicle price string
  taxAmount: number;     // msrp * (taxPct / 100)
  subtotal: number;      // msrp + taxAmount + docFee
  downAmt: number;       // subtotal * (downPct / 100)
  principal: number;     // subtotal - downAmt
  monthly: number;       // Monthly payment (finance mode only)
};
```

**Monthly Payment Formula** (finance mode):

```typescript
function monthlyPayment(principal: number, aprPercent: number, months: number) {
  const r = (aprPercent / 100) / 12;  // Monthly interest rate
  if (r <= 0) return principal / months;
  const pow = Math.pow(1 + r, months);
  return principal * (r * pow) / (pow - 1);
}
```

---

## Data Flows

### Flow 1: Landing → Results (Keyword Detection)

1. User enters text in chatbox on `/` (landing page)
2. User clicks send button, navigates to `/result`
3. `extractKeywords(text)` parses input using `KEYWORD_ALIASES`
4. Detected keywords set as active filters
5. `CARS` array filtered by matching tags (OR logic)
6. Filtered vehicles displayed as cards

### Flow 2: Results → Compare (Vehicle Selection)

1. User clicks "Compare" on vehicle cards
2. Vehicle IDs added to `compareIds` state (max 3)
3. Compare popup shows selected vehicles
4. User clicks "Open Compare"
5. Navigates to `/compare_result?ids=<comma-separated-ids>`
6. Compare page parses IDs and fetches vehicles from `CAR_INDEX`
7. Side-by-side table rendered

### Flow 3: Compare → Finance (Cost Estimation)

1. User clicks "Back to card" on compare table
2. Navigates to `/finance?carId=<vehicle-id>`
3. Finance page calls `findCar(carId)` to load vehicle
4. User adjusts inputs (tax, fees, down payment, APR, term)
5. React state updates trigger recalculation
6. Summary panel updates with new monthly payment/total

---

## State Management

### Client-Side State Only

All data is managed in React component state (no backend, no global state library):

- **Landing page (`/`)**: `text` (chatbox content), `recording` (voice state)
- **Results page (`/result`)**: `prompt`, `selected` (manual filters), `compareIds`, `error`
- **Compare page (`/compare_result`)**: `ids` (parsed from URL), `selected` (filtered vehicles)
- **Finance page (`/finance`)**: `mode`, `taxPct`, `docFee`, `downPct`, `apr`, `term`, calculated outputs

### No Persistence

- No localStorage or sessionStorage usage in current implementation
- All state resets on page refresh
- Compare IDs persist only via URL (shareable link)

---

## Validation and Error Handling

### Client-Side Validation

1. **Keyword extraction**: Returns empty array if no matches (safe fallback)
2. **Compare IDs**: Filters out invalid IDs, caps at 3 vehicles
3. **Finance inputs**: Clamped to reasonable ranges (e.g., APR 0-30%)
4. **Vehicle lookup**: Returns `undefined` for invalid IDs, handled in UI

### Empty States

- **No filters active**: Show all vehicles
- **No vehicles match filters**: Show "No cars match..." message with icon
- **No compare IDs**: Show "No cars selected for comparison"
- **Invalid vehicle ID on finance**: Show "Car not found"

### Error Messages

All error states use inline UI feedback:
- Compare popup: "You can compare up to 3 cars."
- Results page: "No cars match the current filters. Try removing a few keywords."
- Finance page: "Car not found. Please go back and select a car."

---

## Future Enhancements (Not Implemented)

- **User Profiles**: Save favorites, searches, estimates (would require localStorage)
- **Backend Integration**: Move vehicle data to Firestore, add tRPC APIs
- **AI Recommendations**: Use Gemini API for intelligent ranking beyond keyword matching
- **Dealer Integration**: "Find a Dealer" and "Contact Me" features
- **Lease Calculations**: Add third mode to finance page
- **ZIP Code Tax Lookup**: Automatic tax rate based on location

---

## Appendix: Sample Data

### Current Vehicle Inventory (6 vehicles)

1. Toyota RAV4 Hybrid XSE (AWD) - $36,990
2. Toyota Highlander Hybrid (AWD) - $45,250
3. Toyota Tacoma TRD Off-Road (4WD) - $41,100
4. Toyota Camry Hybrid XLE - $34,500
5. Toyota Crown Platinum (AWD Hybrid MAX) - $53,000
6. Toyota bZ4X (EV AWD) - $42,350

All data defined in `src/lib/cars.ts` with images in `/public/cars/`.
