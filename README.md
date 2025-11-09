# Toyota Financial Planning Tool

## Overview

An AI-guided financial planning tool for Toyota vehicle purchases, enabling users to discover, compare, and estimate costs through intelligent recommendations and comprehensive financial calculations.

## Features

- 🎯 **Guided Discovery Journey**: AI-powered recommendations based on budget and needs
- 🔍 **Smart Search & Filters**: Find vehicles by budget, body style, fuel type, and more
- ⚖️ **Side-by-Side Comparison**: Compare up to 4 vehicles with category winners highlighted
- 💰 **Comprehensive Cost Estimation**: Calculate cash, finance, and lease options with detailed tax/fee breakdowns
- 🗣️ **Voice Interface**: Optional voice interaction powered by ElevenLabs
- 💾 **Local Storage**: Save comparisons and estimates in browser (no account needed)

## Tech Stack

- **Framework**: Next.js 15.2 (App Router) with React 19
- **Language**: TypeScript 5.8
- **API Layer**: tRPC 11 for type-safe APIs
- **Database**: Firebase Firestore
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

## Deployment

### Prerequisites

Before deploying, ensure you have:
- [ ] Firebase project created with Billing enabled (Blaze plan required for Cloud Functions)
- [ ] All API keys configured in Firebase Console (Gemini, ElevenLabs, OpenRouter)
- [ ] Domain configured (if using custom domain)
- [ ] Production environment variables set in Firebase AppHosting
- [ ] Firestore Security Rules reviewed and tested

### Firebase AppHosting Deployment

#### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

#### 2. Initialize Firebase Project

```bash
# Select your Firebase project
firebase use --add

# Deploy Firestore rules and indexes
firebase deploy --only firestore:rules,firestore:indexes

# Deploy storage rules
firebase deploy --only storage
```

#### 3. Configure Environment Variables

In Firebase Console > AppHosting > Environment Variables, set:

```bash
# Required
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# AI Services
GEMINI_API_KEY=your_gemini_key
ELEVENLABS_API_KEY=your_elevenlabs_key
OPENROUTER_API_KEY=your_openrouter_key

# Optional
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn  # For error tracking
```

#### 4. Deploy to Firebase AppHosting

```bash
# Deploy the application
firebase deploy --only hosting

# Or deploy everything
firebase deploy
```

#### 5. Seed Production Database

```bash
# Run vehicle seed script
npm run seed:vehicles
```

### Custom Domain Setup (GoDaddy)

#### DNS Configuration

Add these CNAME records in GoDaddy DNS management:

```
Type  | Name              | Value
------+-------------------+----------------------------------
CNAME | www               | your-project.web.app
CNAME | @                 | your-project.web.app
```

#### Firebase Hosting Custom Domain

```bash
# In Firebase Console > Hosting > Add custom domain
# Follow the verification process
firebase hosting:channel:deploy production --only hosting
```

### Vercel Deployment (Alternative)

If deploying to Vercel instead of Firebase AppHosting:

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel Dashboard
# Connect to Firebase using service account credentials
```

### Environment-Specific Configurations

#### Development
- Uses Firebase Emulators (Firestore, Storage)
- Mock data for testing
- Debug logging enabled

#### Staging
- Separate Firebase project recommended
- Subset of production data
- Error tracking enabled

#### Production
- Full Firebase project with billing
- Complete vehicle dataset
- Performance monitoring enabled
- Rate limiting enforced

### Post-Deployment Checklist

- [ ] Verify all environment variables are set correctly
- [ ] Verify Firestore queries return expected data
- [ ] Test voice features (TTS/STT)
- [ ] Check AI recommendations are generating properly
- [ ] Test payment calculations for all scenarios (cash, finance, lease)
- [ ] Verify tax calculations for different ZIP codes
- [ ] Check mobile responsiveness
- [ ] Verify custom domain SSL certificate
- [ ] Monitor error rates in first 24 hours
- [ ] Set up uptime monitoring (e.g., UptimeRobot)

### Monitoring & Observability

#### Firebase Console Monitoring

Monitor these metrics:
- Firestore reads/writes/deletes
- Function invocations and errors
- Storage bandwidth usage
- Authentication attempts

#### Error Tracking

If Sentry is configured:
- Check error frequency and patterns
- Review user-reported issues
- Monitor performance metrics

#### Logging

Structured logs are available in:
- Firebase Console > Functions > Logs
- Cloud Logging (if enabled)

### Rollback Strategy

If issues occur after deployment:

```bash
# Rollback to previous hosting version
firebase hosting:clone SOURCE_SITE_ID:SOURCE_CHANNEL_ID TARGET_SITE_ID:live

# Or manually in Firebase Console > Hosting > Release history
```

### Performance Optimization

After deployment, consider:
- Enable Next.js Image Optimization for vehicle images
- Configure CDN caching headers
- Pre-generate static pages for featured vehicles
- Implement tRPC request batching
- Monitor and optimize Firestore query performance

### Cost Monitoring

Monitor Firebase usage to avoid unexpected costs:
- Set budget alerts in Firebase Console
- Review Firestore document reads (recommendations can be costly)
- Monitor AI API usage (Gemini, ElevenLabs)
- Track storage bandwidth usage

### Troubleshooting

**Build Fails**
- Check TypeScript errors: `npm run typecheck`
- Verify environment variables are set
- Check for missing dependencies

**Firestore Permission Denied**
- Verify security rules are deployed
- Check authentication status
- Review Firestore indexes

**AI Recommendations Not Working**
- Verify Gemini API key is valid and has quota
- Check fallback to OpenRouter is configured
- Review logs for API errors

**Voice Features Not Working**
- Verify ElevenLabs API key
- Check browser microphone permissions
- Test with different browsers

## License

MIT

---

Built with [T3 Stack](https://create.t3.gg/)
