# Toyota Vehicle Shopping Experience

## Overview

An AI-guided vehicle shopping experience enabling users to discover, compare, and estimate Toyota vehicles through voice and text interactions.

## Features

- 🎯 **Guided Discovery Journey**: AI-powered recommendations based on user needs
- 🔍 **Smart Search & Filters**: Find vehicles by budget, body style, fuel type, and more
- ⚖️ **Side-by-Side Comparison**: Compare up to 4 vehicles with category winners highlighted
- 💰 **Cost Estimation**: Calculate cash, finance, and lease options with tax/fee breakdowns
- 🗣️ **Voice Interface**: Optional voice interaction powered by ElevenLabs
- 💾 **Save & Share**: Authenticated users can save favorites and share selections
- 🏪 **Dealer Connection**: Find nearby dealers and request contact

## Tech Stack

- **Framework**: Next.js 15.2 (App Router) with React 19
- **Language**: TypeScript 5.8
- **API Layer**: tRPC 11 for type-safe APIs
- **Database**: Firebase Firestore
- **Authentication**: Auth0
- **AI**: Google Gemini API (with OpenRouter fallback)
- **Voice**: ElevenLabs (TTS & STT)
- **Styling**: Tailwind CSS 4.0 + shadcn/ui
- **Validation**: Zod

## Quick Start

See [specs/001-vehicle-shopping-experience/quickstart.md](./specs/001-vehicle-shopping-experience/quickstart.md) for detailed setup instructions.

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Start Firebase emulators (in separate terminal)
firebase emulators:start

# Start development server
npm run dev
```

Visit http://localhost:3000

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   └── ui/                 # shadcn/ui components
├── lib/                    # Client utilities & libraries
│   ├── finance-engine/     # Finance calculations
│   └── ranking-engine/     # AI recommendations
├── server/                 # Server-side code
│   ├── api/                # tRPC routers
│   ├── db/                 # Firestore helpers
│   └── ai/                 # AI service wrappers
└── styles/                 # Global styles
```

## Documentation

- **Feature Specification**: [specs/001-vehicle-shopping-experience/spec.md](./specs/001-vehicle-shopping-experience/spec.md)
- **Implementation Plan**: [specs/001-vehicle-shopping-experience/plan.md](./specs/001-vehicle-shopping-experience/plan.md)
- **Data Model**: [specs/001-vehicle-shopping-experience/data-model.md](./specs/001-vehicle-shopping-experience/data-model.md)
- **API Contracts**: [specs/001-vehicle-shopping-experience/contracts/](./specs/001-vehicle-shopping-experience/contracts/)
- **Tasks**: [specs/001-vehicle-shopping-experience/tasks.md](./specs/001-vehicle-shopping-experience/tasks.md)

## Development

```bash
# Development server with Turbo
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Fix lint issues
npm run lint:fix

# Format code
npm run format:write

# Type check
npm run typecheck
```

## License

MIT

---

Built with [T3 Stack](https://create.t3.gg/)
