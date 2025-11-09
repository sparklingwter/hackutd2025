# Dealer Connection Components

This directory contains UI components for the dealer connection feature (Phase 7 / User Story 5).

## Demo Mode

**Current Status:** These components are in **DEMO MODE** and display sample data.

### What's Implemented

- ✅ Complete UI/UX for dealer search, contact forms, and lead tracking
- ✅ Full component structure and styling
- ✅ Form validation and user interactions
- ✅ Mock data responses for demonstration

### What's Not Implemented

- ❌ Actual geocoding (requires GOOGLE_MAPS_API_KEY)
- ❌ Real dealer database queries (requires seeded data)
- ❌ Persistent lead storage in Firestore
- ❌ Rate limiting for submissions
- ❌ Authentication integration

## Components

### `ZipSearch.tsx`
Search form for finding dealers by ZIP code. Includes client-side validation for 5-digit ZIP codes.

### `DealerList.tsx`
Displays a grid of dealer cards with distance sorting.

### `DealerCard.tsx`
Individual dealer information card with:
- Distance from search location
- Address and contact information
- Business hours
- Google Maps directions link
- Services offered

### `ContactForm.tsx`
Multi-field form for submitting dealer contact requests with:
- Personal information (name, email, phone)
- Preferred contact method selector
- Optional message field
- Explicit consent checkbox
- Form validation

### `ConsentCheckbox.tsx`
Standalone consent checkbox component with legal text explaining data usage.

## To Enable Full Functionality

### 1. Add Environment Variables

Add to your `.env` file:
```env
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

### 2. Install Additional Dependencies

Already installed:
- `uuid` - For generating lead IDs
- `date-fns` - For date formatting
- `@radix-ui/react-*` - For UI primitives

### 3. Seed Dealers Collection

Run the seed script to populate the Firestore `dealers` collection:

```bash
# Add to package.json scripts:
"seed-dealers": "tsx scripts/seed-dealers.ts"

# Then run:
npm run seed-dealers
```

The seed script is located at `scripts/seed-dealers.ts` and contains 10 Texas Toyota dealerships.

### 4. Enable Authentication

Update `src/server/api/trpc.ts` to implement proper authentication:
- Replace `userId: null` with actual user session handling
- Implement `protectedProcedure` middleware to verify user authentication

### 5. Update Router Implementations

The dealer router at `src/server/api/routers/dealer.ts` currently returns mock data. To enable full functionality:

1. Uncomment the geocoding and database query logic
2. Remove mock data responses
3. Enable rate limiting for lead submissions

## Usage Examples

### Finding Dealers

```tsx
import { ZipSearch } from '~/components/dealer/ZipSearch';
import { DealerList } from '~/components/dealer/DealerList';

// In your component:
const [zipCode, setZipCode] = useState('');
const { data } = api.dealer.findNearby.useQuery({ zipCode, radius: 25 });

<ZipSearch onSearch={setZipCode} />
<DealerList dealers={data?.dealers ?? []} searchZipCode={zipCode} />
```

### Submitting a Lead

```tsx
import { ContactForm } from '~/components/dealer/ContactForm';

<ContactForm 
  vehicleIds={['camry-2024', 'rav4-2024']}
  zipCode="75080"
  estimateId={optionalEstimateId}
/>
```

## Testing

Pages to test the implementation:
- `/dealer` - Main dealer finder page
- `/dealer/confirmation` - Confirmation after submitting a lead
- `/profile/leads` - View all submitted leads

All pages display a blue notice banner indicating demo mode status.
