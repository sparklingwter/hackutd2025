# Vehicle Detail Components

This directory contains all UI components for the Vehicle Detail View (User Story 7).

## Components

### `Breadcrumbs.tsx`
**T044 [US7]**: Navigation breadcrumb component
- Shows user's path: Home > Recommendations > Vehicle
- Displays current location and allows easy navigation back

### `ImageGallery.tsx`
**T040 [P] [US7]**: Image gallery with lightbox functionality
- Main image display with navigation arrows
- Thumbnail strip for quick image selection
- Full-screen lightbox view with keyboard navigation
- Image counter showing current position

### `TrimSelector.tsx`
**T039 [P] [US7]**: Trim level selector component
- Base model option with MSRP
- Individual trim cards with specifications
- Shows engine, horsepower, torque, transmission, drivetrain
- Displays 0-60 mph time when available
- Visual indication of selected trim

### `SpecsGrid.tsx`
**T041 [P] [US7]**: Vehicle specifications grid
- Core specs: fuel type, seating, fuel economy, cargo volume, towing, drivetrain
- Trim-specific specs when trim is selected: engine, power, transmission, acceleration
- Additional details: city/highway MPG, body style, model year
- Icon-based visual presentation

### `FeaturesList.tsx`
**T042 [P] [US7]**: Features list component
- Categorized feature display (safety, technology, etc.)
- Standard features section
- Checkmark icons for easy scanning
- Responsive grid layout

### `SafetyRatings.tsx`
**T043 [P] [US7]**: Safety ratings display
- NHTSA overall safety rating with star display
- Safety features list with checkmarks
- Disclaimer about rating variations by trim

## Usage

Import components in vehicle detail page:

```tsx
import { Breadcrumbs } from "~/components/vehicle/Breadcrumbs";
import { ImageGallery } from "~/components/vehicle/ImageGallery";
import { TrimSelector } from "~/components/vehicle/TrimSelector";
import { SpecsGrid } from "~/components/vehicle/SpecsGrid";
import { FeaturesList } from "~/components/vehicle/FeaturesList";
import { SafetyRatings } from "~/components/vehicle/SafetyRatings";
```

## API Integration

All components use data from:
- `api.vehicles.getById` - Main vehicle details
- `api.vehicles.getTrims` - Available trims
- `api.vehicles.getTrimById` - Selected trim details

## Dependencies

- shadcn/ui components: `Card`, `Button`, `Dialog`
- Lucide React icons
- Next.js `Image` component for optimized image loading
