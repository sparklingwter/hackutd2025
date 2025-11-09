# tRPC API Contracts

**Branch**: `001-vehicle-shopping-experience` | **Date**: 2025-11-08  
**Purpose**: Define type-safe API contracts for all client-server communication

## Overview

This directory contains TypeScript-based tRPC API contracts organized by domain. Each router handles a specific feature area and enforces type safety end-to-end (client ↔ server).

## Router Structure

```text
contracts/
├── README.md                     # This file
├── search.router.md              # Vehicle search and recommendations
├── vehicles.router.md            # Vehicle details and trims
├── compare.router.md             # Comparison functionality
├── estimate.router.md            # Cost estimation (cash/finance/lease)
├── profile.router.md             # User profile and saved items
├── dealer.router.md              # Dealer connection and leads
└── schemas.md                    # Shared Zod schemas
```

## Authentication Levels

- **Public Procedures**: No authentication required (read-only vehicle data)
- **Protected Procedures**: Requires Auth0 authentication (user-specific operations)
- **Admin Procedures**: Requires Auth0 + `role: admin` claim (data management)

## Error Handling

All routers use standardized tRPC error codes:

- `BAD_REQUEST` (400): Invalid input parameters
- `UNAUTHORIZED` (401): Authentication required but missing
- `FORBIDDEN` (403): Authenticated but insufficient permissions
- `NOT_FOUND` (404): Resource does not exist
- `CONFLICT` (409): Resource already exists or state conflict
- `TOO_MANY_REQUESTS` (429): Rate limit exceeded
- `INTERNAL_SERVER_ERROR` (500): Unexpected server error

## Rate Limiting

Expensive operations (AI recommendations, audio generation) have per-user rate limits:

- **Recommendations**: 10 requests/minute/user
- **Voice synthesis**: 20 requests/minute/user
- **Dealer leads**: 5 submissions/day/user

## Pagination

List endpoints support cursor-based pagination:

```typescript
{
  cursor?: string;   // Opaque cursor for next page
  limit?: number;    // Max items per page (default 20, max 50)
}

// Response
{
  items: T[];
  nextCursor?: string;  // null if no more pages
  total?: number;       // Optional total count
}
```

## Versioning

- **Current Version**: v1 (implicit, no version prefix)
- **Future Versions**: Will use explicit prefix (e.g., `v2.vehicles.list`)
- **Deprecation**: Routers marked deprecated 6 months before removal

## Usage Example

```typescript
// Client-side usage
import { trpc } from '@/lib/trpc';

// Query (read-only)
const { data, isLoading, error } = trpc.vehicles.list.useQuery({
  bodyStyle: 'suv',
  maxPrice: 50000,
  limit: 20,
});

// Mutation (write operation)
const { mutate, isLoading } = trpc.profile.addFavorite.useMutation({
  onSuccess: () => {
    console.log('Vehicle favorited');
  },
  onError: (error) => {
    console.error('Failed to favorite:', error);
  },
});

mutate('camry-2024');
```

## Related Documentation

- [Data Model](../data-model.md) — Entity definitions and validation rules
- [Firestore Security Rules](../../firebase/firestore.rules) — Database-level authorization
- [API Architecture Decision Record](../../.specify/adrs/003-trpc-api-design.md) — Why tRPC over REST/GraphQL

## Router Details

See individual router files for detailed procedure definitions:

- **[search.router.md](./search.router.md)** — AI-powered vehicle search and recommendations
- **[vehicles.router.md](./vehicles.router.md)** — Vehicle catalog, details, and trims
- **[compare.router.md](./compare.router.md)** — Side-by-side vehicle comparison
- **[estimate.router.md](./estimate.router.md)** — Cost estimation and finance calculations
- **[profile.router.md](./profile.router.md)** — User profile management
- **[dealer.router.md](./dealer.router.md)** — Dealer lookup and lead submission
