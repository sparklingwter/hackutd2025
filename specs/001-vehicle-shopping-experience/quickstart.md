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

Create `.env.local` in `apps/web/`:

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
cd apps/web
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
cd apps/web
npm run dev

# Terminal 3: Watch package builds (if modifying finance-engine or ranking-engine)
cd packages/finance-engine
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
├── apps/
│   └── web/                 # Next.js application
│       ├── src/
│       │   ├── app/         # App Router pages
│       │   ├── components/  # React components
│       │   ├── lib/         # Client utilities
│       │   └── server/      # Server-side code (tRPC, Firebase)
│       ├── public/          # Static assets
│       └── package.json
├── packages/
│   ├── finance-engine/      # Finance calculation library
│   │   ├── src/lib/         # Core logic (cash, finance, lease, taxes, fuel)
│   │   ├── src/cli.ts       # CLI entry point
│   └── ranking-engine/      # AI ranking library
│       ├── src/lib/         # Gemini, OpenRouter, ranking, safety
│       ├── src/cli.ts       # CLI entry point
├── specs/
│   └── 001-vehicle-shopping-experience/
│       ├── spec.md          # Feature specification
│       ├── plan.md          # Implementation plan
│       ├── research.md      # Technical research
│       ├── data-model.md    # Entity definitions
│       ├── quickstart.md    # This file
│       └── contracts/       # tRPC API contracts
└── .specify/
    ├── memory/
    │   └── constitution.md  # Project principles
    └── adrs/                # Architecture Decision Records
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

```bash
cd packages/finance-engine

# CLI: Calculate cash estimate
echo '{"vehiclePrice": 30000, "zipCode": "75080"}' | node dist/cli.js cash

# CLI: Calculate finance estimate
echo '{"vehiclePrice": 30000, "downPayment": 5000, "termMonths": 60, "apr": 5.99, "zipCode": "75080"}' | node dist/cli.js finance

# CLI: Calculate lease estimate
echo '{"vehiclePrice": 30000, "downPayment": 2000, "termMonths": 36, "residualPercent": 60, "moneyFactor": 0.00125, "mileageCap": 12000, "zipCode": "75080"}' | node dist/cli.js lease

```

## Ranking Engine

```bash
cd packages/ranking-engine

# CLI: Generate recommendations
echo '{"budgetType": "monthly", "budgetAmount": 500, "bodyStyle": "suv", "seating": 7, "fuelType": "hybrid", ...}' | node dist/cli.js recommend

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

```typescript
// Use tRPC playground (development only)
// http://localhost:3000/api/trpc-playground

// Or test via curl
curl http://localhost:3000/api/trpc/vehicles.list \
  -H "Content-Type: application/json" \
  -d '{"filters": {"bodyStyle": "suv"}}'
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

1. **Explore Codebase**: Start with `apps/web/src/app/page.tsx` (homepage)
2. **Review tRPC Routers**: `apps/web/src/server/api/routers/` (API contracts)
3. **Read Constitution**: `.specify/memory/constitution.md` (project principles)
4. **Check ADRs**: `.specify/adrs/` (architectural decisions)
5. **Contribute**: See `CONTRIBUTING.md` (coding standards, PR process)

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
