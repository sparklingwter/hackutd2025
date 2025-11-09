# Quickstart Guide: Toyota Vehicle Shopping Experience

**Branch**: `001-vehicle-shopping-experience` | **Date**: 2025-11-08  
**Purpose**: Get developers up and running quickly

## Prerequisites

- **Node.js**: v18.18+ or v20+ (LTS recommended)
- **npm**: v8+ (comes with Node.js)
- **Git**: v2.30+
- **Firebase CLI**: v13+ (`npm install -g firebase-tools`)
- **Auth0 Account**: Free tier sufficient for development
- **Gemini API Key**: Google AI Studio (free tier: 15 RPM)
- **ElevenLabs API Key**: Starter tier ($5/month, 30k chars)

## Initial Setup

### 1. Clone and Install Dependencies

```bash
git clone <repo-url>
cd hackutd2025
git checkout 001-vehicle-shopping-experience

# Install dependencies
npm install
```

### 2. Set Up Environment Variables

Create `.env.local` in the root directory:

```bash
# Auth0
AUTH0_SECRET='<generate-with: openssl rand -hex 32>'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://your-tenant.auth0.com'
AUTH0_CLIENT_ID='<from-auth0-dashboard>'
AUTH0_CLIENT_SECRET='<from-auth0-dashboard>'

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY='<from-firebase-console>'
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN='your-project.firebaseapp.com'
NEXT_PUBLIC_FIREBASE_PROJECT_ID='your-project-id'
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET='your-project.appspot.com'
FIREBASE_ADMIN_PROJECT_ID='your-project-id'
FIREBASE_ADMIN_CLIENT_EMAIL='<service-account-email>'
FIREBASE_ADMIN_PRIVATE_KEY='<service-account-private-key>'

# AI APIs
GEMINI_API_KEY='<from-google-ai-studio>'
OPENROUTER_API_KEY='<from-openrouter.ai>'

# Voice APIs
ELEVENLABS_API_KEY='<from-elevenlabs.io>'

# Development
NODE_ENV='development'
```

### 3. Configure Firebase

```bash
# Login to Firebase
firebase login

# Initialize Firebase Emulator
firebase init emulators

# Select: Firestore, Storage, Hosting
# Use default ports or customize

# Start emulators
firebase emulators:start
```

### 4. Configure Auth0

**Create Application** (Auth0 Dashboard):

1. Go to Applications → Create Application
2. Choose "Regular Web Application"
3. Set Name: "Toyota Vehicle Shopping (Dev)"
4. Configure:
   - **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
   - **Allowed Logout URLs**: `http://localhost:3000`
   - **Allowed Web Origins**: `http://localhost:3000`

**Add Custom Claims** (Auth0 Action):

```javascript
// Auth0 Dashboard → Actions → Flows → Login
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://toyota-app.com';
  api.idToken.setCustomClaim(`${namespace}/role`, event.user.app_metadata.role || 'user');
  api.accessToken.setCustomClaim(`${namespace}/role`, event.user.app_metadata.role || 'user');
};
```

### 5. Seed Vehicle Data

```bash
# Run seed script (creates ~50 Toyota vehicles)
npm run seed:vehicles

# Verify data in Firebase Emulator UI
# http://localhost:4000/firestore
```

## Development Workflow

### Start Development Server

```bash
# Terminal 1: Firebase Emulators
firebase emulators:start

# Terminal 2: Next.js Dev Server
npm run dev

# Visit: http://localhost:3000
```

### Lint and Format

```bash
# Lint all packages
npm run lint

# Fix lint issues
npm run lint:fix

# Format all files
npm run format

# Type check
npm run typecheck
```

## Project Structure Overview

```text
hackutd2025/
├── src/
│   ├── app/                 # App Router pages
│   ├── components/          # React components
│   ├── lib/                 # Client utilities & libraries
│   │   ├── finance-engine/  # Finance calculations (cash, finance, lease, taxes, fuel)
│   │   └── ranking-engine/  # AI ranking (Gemini, OpenRouter, ranking, safety)
│   └── server/              # Server-side code (tRPC, Firebase)
├── public/                  # Static assets
├── scripts/                 # Seed scripts and utilities
├── specs/
│   └── 001-vehicle-shopping-experience/
│       ├── spec.md          # Feature specification
│       ├── plan.md          # Implementation plan
│       ├── research.md      # Technical research
│       ├── data-model.md    # Entity definitions
│       ├── quickstart.md    # This file
│       └── contracts/       # tRPC API contracts
├── .specify/
│   ├── memory/
│   │   └── constitution.md  # Project principles
│   └── adrs/                # Architecture Decision Records
└── package.json
```

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build all packages for production |
| `npm run lint` | Lint all packages |
| `npm run format` | Format all files with Prettier |
| `npm run seed:vehicles` | Seed vehicle data to Firestore |
| `firebase emulators:start` | Start Firebase emulators |
| `firebase deploy` | Deploy to Firebase (staging/prod) |

## Finance Engine

The finance engine is a library in `src/lib/finance-engine/` that provides functions for calculating cash, finance, and lease estimates.

### Usage in TypeScript/React

```typescript
import { calculateCashEstimate, calculateFinanceEstimate, calculateLeaseEstimate } from '@/lib/finance-engine';

// Calculate cash out-the-door estimate
const cashEstimate = calculateCashEstimate({
  vehiclePrice: 30000,
  zipCode: '75080',
  downPayment: 0,
  tradeInValue: 0,
  tradeInPayoff: 0
});
// Returns: { outTheDoorTotal, salesTax, registrationFee, docFee, totalFees, ... }

// Calculate finance estimate with monthly payments
const financeEstimate = calculateFinanceEstimate({
  vehiclePrice: 30000,
  downPayment: 5000,
  termMonths: 60,
  apr: 5.99,
  zipCode: '75080',
  tradeInValue: 0,
  tradeInPayoff: 0
});
// Returns: { monthlyPayment, totalAmountFinanced, totalInterestPaid, outTheDoorTotal, ... }

// Calculate lease estimate
const leaseEstimate = calculateLeaseEstimate({
  vehiclePrice: 30000,
  downPayment: 2000,
  termMonths: 36,
  residualPercent: 60,
  moneyFactor: 0.00125,
  mileageCap: 12000,
  zipCode: '75080',
  tradeInValue: 0,
  tradeInPayoff: 0
});
// Returns: { monthlyPayment, totalLeasePayments, dueAtSigning, residualValue, ... }

// Calculate fuel/energy costs
import { calculateFuelCost } from '@/lib/finance-engine';

const fuelCost = calculateFuelCost({
  fuelType: 'gas', // or 'electric'
  mpgCombined: 30, // or mpgeCombined for electric
  annualMiles: 12000,
  fuelPricePerUnit: 3.50 // $/gallon for gas, $/kWh for electric
});
// Returns: { monthlyCost, annualCost, costPerMile }
```

### Tax and Fee Calculation

```typescript
import { calculateTaxesAndFees } from '@/lib/finance-engine';

const taxesAndFees = calculateTaxesAndFees({
  vehiclePrice: 30000,
  zipCode: '75080' // Determines state/local tax rates
});
// Returns: { salesTax, salesTaxRate, registrationFee, docFee, totalFees }
```

## Ranking Engine

The ranking engine is a library in `src/lib/ranking-engine/` that provides AI-powered vehicle recommendations with transparent scoring.

### Usage in TypeScript/React

```typescript
import { generateRecommendations } from '@/lib/ranking-engine';

// Generate tiered recommendations based on user needs
const recommendations = await generateRecommendations({
  budgetType: 'monthly', // or 'cash'
  budgetAmount: 500,
  bodyStyle: 'suv',
  seating: 7,
  fuelType: 'hybrid',
  priorityMpg: true,
  priorityRange: false,
  cargoNeeds: 'moderate',
  towingNeeds: 'light',
  requireAwd: true,
  safetyPriority: 'high',
  driverAssistNeeds: ['adaptive-cruise', 'lane-keep', 'blind-spot'],
  mustHaveFeatures: ['apple-carplay', 'heated-seats'],
  drivingPattern: 'mixed',
  commuteLength: 'medium'
});

// Returns tiered structure:
// {
//   topPicks: [{ vehicleId, tier: 'top-pick', score: 95, explanation, matchedCriteria, tradeoffs? }],
//   strongContenders: [{ vehicleId, tier: 'strong-contender', score: 82, ... }],
//   exploreAlternatives: [{ vehicleId, tier: 'explore-alternative', score: 68, ... }]
// }
```

### AI Provider Configuration

```typescript
import { rankVehicles } from '@/lib/ranking-engine';

// Uses Gemini API by default, falls back to OpenRouter if unavailable
const ranked = await rankVehicles({
  vehicles: vehicleList,
  userNeeds: userProfile,
  provider: 'gemini' // or 'openrouter' to force fallback
});

// Apply safety filters
import { applySafetyFilters } from '@/lib/ranking-engine';

const safeVehicles = applySafetyFilters(vehicles, {
  minSafetyRating: 4,
  requiredFeatures: ['abs', 'stability-control', 'airbags']
});
```

## Debugging

### Firebase Emulator UI

- **Firestore**: http://localhost:4000/firestore
- **Storage**: http://localhost:4000/storage
- **Logs**: http://localhost:4000/logs

### Next.js Debugger

```bash
# Enable debug logs
DEBUG=* npm run dev

# VS Code launch.json (attach debugger)
{
  "type": "node",
  "request": "attach",
  "name": "Next.js: debug server-side",
  "port": 9229,
  "restart": true
}
```

### tRPC API Testing

```bash
# Test via curl (PowerShell)
curl http://localhost:3000/api/trpc/vehicles.list `
  -H "Content-Type: application/json" `
  -d '{"filters": {"bodyStyle": "suv"}}'

# Test via curl (bash/Linux/macOS)
curl http://localhost:3000/api/trpc/vehicles.list \
  -H "Content-Type: application/json" \
  -d '{"filters": {"bodyStyle": "suv"}}'

# Or use Invoke-RestMethod (PowerShell native)
$body = @{ filters = @{ bodyStyle = "suv" } } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/trpc/vehicles.list" `
  -Method Post `
  -ContentType "application/json" `
  -Body $body

# Or use the tRPC client directly in React components
# See src/trpc/react.tsx for usage
```

### Using tRPC in Components

```typescript
'use client';

import { api } from '@/trpc/react';

export function VehicleList() {
  // Query vehicles with filters
  const { data: vehicles, isLoading } = api.vehicles.list.useQuery({
    filters: { bodyStyle: 'suv', fuelType: 'hybrid' },
    limit: 20
  });

  // Mutation example
  const addToFavorites = api.profile.addFavorite.useMutation();

  const handleFavorite = (vehicleId: string) => {
    addToFavorites.mutate({ vehicleId });
  };

  // ...
}
```

## Common Issues

### Issue: Firebase Emulator connection refused

**Solution**: Ensure emulators are running (`firebase emulators:start`). Check `.env.local` has correct `FIREBASE_ADMIN_PROJECT_ID`.

### Issue: Auth0 callback fails

**Solution**: Verify `AUTH0_BASE_URL` matches localhost URL. Check Auth0 dashboard has correct callback URL configured.

### Issue: Gemini API rate limit

**Solution**: Free tier limited to 15 RPM. Upgrade to pay-as-you-go or reduce request frequency during development.

### Issue: npm install fails

**Solution**: Clear cache (`npm cache clean --force`) and retry. Ensure Node.js v18.18+ or v20+.

### Issue: TypeScript errors in IDE

**Solution**: Restart TypeScript server (VS Code: Cmd/Ctrl+Shift+P → "TypeScript: Restart TS Server"). Ensure `npm install` completed successfully.

## Next Steps

1. **Explore Codebase**: Start with `src/app/page.tsx` (homepage)
2. **Review tRPC Routers**: `src/server/api/routers/` (API contracts)
3. **Check Libraries**: `src/lib/finance-engine/` and `src/lib/ranking-engine/`
4. **Read Constitution**: `.specify/memory/constitution.md` (project principles)
5. **Check ADRs**: `.specify/adrs/` (architectural decisions)

## Resources

- **Next.js Docs**: https://nextjs.org/docs
- **tRPC Docs**: https://trpc.io/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **Auth0 Docs**: https://auth0.com/docs
- **Gemini API Docs**: https://ai.google.dev/docs
- **ElevenLabs Docs**: https://docs.elevenlabs.io
- **Tailwind CSS Docs**: https://tailwindcss.com/docs
- **shadcn/ui Docs**: https://ui.shadcn.com

## Support

- **Issues**: Open GitHub issue with `bug` or `question` label
- **Discussions**: Use GitHub Discussions for general questions
- **Code Review**: Tag maintainers in PR for review
- **Slack/Discord**: (If applicable) Join team chat for real-time help

---
