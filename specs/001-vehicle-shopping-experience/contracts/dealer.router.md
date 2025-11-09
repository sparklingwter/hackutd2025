# Dealer Router

**Domain**: Dealer lookup and lead submission  
**Authentication**: Public (dealer lookup) + Protected (lead submission)  
**Rate Limits**: 5 lead submissions per day per user

## Procedures

### `dealer.findNearby`

Find Toyota dealers near a ZIP code.

**Type**: `query`  
**Authentication**: Public

**Input**:

```typescript
{
  zipCode: string;     // 5-digit ZIP code
  radius?: number;     // Search radius in miles (default 25, max 100)
  limit?: number;      // Max results (default 10, max 20)
}
```

**Output**:

```typescript
{
  dealers: {
    id: string;
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
    };
    phone: string;
    website?: string;
    distance: number;  // Miles from search ZIP
    hours?: {
      [day: string]: string; // e.g., "Monday": "9AM-7PM"
    };
    services: string[]; // e.g., ["sales", "service", "parts"]
  }[];
}
```

**Behavior**:

- Geocodes ZIP code to lat/long (cached)
- Queries dealer database (Firestore collection or external API)
- Returns dealers sorted by distance ascending
- Falls back to state-level search if ZIP invalid

**Errors**:

- `BAD_REQUEST`: Invalid ZIP code format or radius out of range

**Example**:

```typescript
const { data } = trpc.dealer.findNearby.useQuery({
  zipCode: '75080',
  radius: 25,
  limit: 10,
});

// Response:
// {
//   dealers: [
//     {
//       id: 'toyota-of-dallas',
//       name: 'Toyota of Dallas',
//       address: {
//         street: '2500 W Northwest Hwy',
//         city: 'Dallas',
//         state: 'TX',
//         zipCode: '75220'
//       },
//       phone: '214-555-0100',
//       website: 'https://toyotaofdallas.com',
//       distance: 3.2,
//       hours: {
//         Monday: '9AM-7PM',
//         Tuesday: '9AM-7PM',
//         // ...
//       },
//       services: ['sales', 'service', 'parts']
//     },
//     {
//       id: 'toyota-of-plano',
//       name: 'Toyota of Plano',
//       address: { ... },
//       distance: 8.5,
//       // ...
//     }
//   ]
// }
```

---

### `dealer.submitLead`

Submit a dealer contact request (lead).

**Type**: `mutation`  
**Authentication**: Protected  
**Rate Limit**: 5 submissions per day per user

**Input**:

```typescript
{
  vehicleIds: string[];        // 1-10 vehicle IDs
  estimateId?: string;         // Optional saved estimate ID
  contactInfo: ContactInfoSchema; // See schemas.md
  consent: true;               // Must be literal true
  zipCode: string;             // 5-digit ZIP
  message?: string;            // Optional message to dealer (max 500 chars)
}
```

**Output**:

```typescript
{
  leadId: string;              // UUID of created lead
  submittedAt: Date;
  confirmationMessage: string; // User-facing confirmation
}
```

**Behavior**:

- Validates consent is `true` (literal, not just truthy)
- Creates dealer lead in Firestore (`dealerLeads` collection)
- Sends confirmation email to user (optional, via Cloud Function trigger)
- Returns lead ID and confirmation message

**Errors**:

- `UNAUTHORIZED`: User not authenticated
- `BAD_REQUEST`: Invalid inputs, consent not true, or too many vehicle IDs
- `TOO_MANY_REQUESTS`: User exceeded 5 submissions per day
- `NOT_FOUND`: Vehicle ID or estimate ID does not exist

**Example**:

```typescript
const { mutate } = trpc.dealer.submitLead.useMutation();

mutate({
  vehicleIds: ['camry-2024', 'rav4-2024'],
  estimateId: '880h1733-...',
  contactInfo: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '2145550100',
    preferredContact: 'email',
  },
  consent: true,
  zipCode: '75080',
  message: 'Interested in test driving both vehicles.',
});

// Response:
// {
//   leadId: 'cc2l5177-...',
//   submittedAt: '2025-11-08T10:30:00Z',
//   confirmationMessage: 'Thank you! A local Toyota dealer will contact you within 24-48 hours.'
// }
```

---

### `dealer.getMyLeads`

Get all dealer leads submitted by authenticated user.

**Type**: `query`  
**Authentication**: Protected

**Input**: None

**Output**:

```typescript
{
  leads: {
    id: string;
    vehicleIds: string[];
    estimateId?: string;
    contactInfo: ContactInfoSchema;
    zipCode: string;
    message?: string;
    status: 'new' | 'contacted' | 'closed';
    createdAt: Date;
  }[];
}
```

**Behavior**:

- Fetches all dealer leads where `userId` matches authenticated user
- Returns leads sorted by `createdAt` descending
- Status is read-only (only admins can update)

**Errors**:

- `UNAUTHORIZED`: User not authenticated

**Example**:

```typescript
const { data } = trpc.dealer.getMyLeads.useQuery();

// Response:
// {
//   leads: [
//     {
//       id: 'cc2l5177-...',
//       vehicleIds: ['camry-2024', 'rav4-2024'],
//       estimateId: '880h1733-...',
//       contactInfo: { name: 'John Doe', email: 'john@example.com', ... },
//       zipCode: '75080',
//       message: 'Interested in test driving both vehicles.',
//       status: 'new',
//       createdAt: '2025-11-08T10:30:00Z'
//     },
//     {
//       id: 'dd3m6288-...',
//       vehicleIds: ['tacoma-2024'],
//       status: 'contacted',
//       createdAt: '2025-11-05T14:20:00Z'
//     }
//   ]
// }
```

---

### `dealer.getById`

Get details of a specific dealer.

**Type**: `query`  
**Authentication**: Public

**Input**:

```typescript
{
  dealerId: string;
}
```

**Output**:

```typescript
{
  id: string;
  name: string;
  address: { ... };
  phone: string;
  website?: string;
  hours?: { [day: string]: string };
  services: string[];
  reviews?: {
    rating: number;      // 1-5
    count: number;
    source: string;      // e.g., "Google"
  };
}
```

**Behavior**:

- Fetches dealer details from Firestore or external API
- Optionally includes review data if available

**Errors**:

- `NOT_FOUND`: Dealer ID does not exist

**Example**:

```typescript
const { data } = trpc.dealer.getById.useQuery({ dealerId: 'toyota-of-dallas' });

// Response:
// {
//   id: 'toyota-of-dallas',
//   name: 'Toyota of Dallas',
//   address: { ... },
//   phone: '214-555-0100',
//   website: 'https://toyotaofdallas.com',
//   hours: { ... },
//   services: ['sales', 'service', 'parts'],
//   reviews: {
//     rating: 4.5,
//     count: 1234,
//     source: 'Google'
//   }
// }
```

---

## Implementation Notes

- **Rate Limiting**: Track lead submissions per user per day using Firestore counter or Redis
- **Consent Validation**: Firestore Security Rules enforce `consent === true` literal value
- **Dealer Data**: Store static dealer list in Firestore (seeded during setup) or query external Toyota dealer API
- **Geocoding**: Use Google Maps Geocoding API (or Mapbox) to convert ZIP to lat/long for distance calculation
- **Email Notifications**: Use Firebase Extensions (e.g., Trigger Email) or Cloud Function to send confirmation emails
- **Privacy**: PII in dealer leads is write-only for users (only admins can read via Firebase Console or separate admin API)

## Related Files

- [Data Model: DealerLead](../data-model.md#8-dealerlead)
- [Shared Schemas](./schemas.md)
