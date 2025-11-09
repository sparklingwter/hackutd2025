# Firestore Seeding Scripts

Scripts for seeding Toyota vehicle data into Firebase Firestore according to the schema defined in `research.md`.

## Prerequisites

- Node.js 18+ installed
- Firebase Admin SDK credentials (service account key) OR Firebase emulator
- Toyota vehicle dataset JSON file

## Files

- `seed-firestore.js` - Node.js seeding script with batch writes
- `seed-firestore.ps1` - PowerShell wrapper for Windows
- `README.md` - This file

## Quick Start

### Option 1: Using PowerShell (Windows)

```powershell
# Basic usage with emulator
.\scripts\seed-firestore.ps1 -JsonPath "path\to\toyota_dataset.json" -UseEmulator

# Production database with service account
.\scripts\seed-firestore.ps1 -JsonPath "data.json" -ServiceAccountKey "service-account.json"

# Dry run to test without writing
.\scripts\seed-firestore.ps1 -JsonPath "data.json" -UseEmulator -DryRun
```

### Option 2: Using Node.js directly

```bash
# With emulator
FIRESTORE_EMULATOR_HOST=localhost:8080 node scripts/seed-firestore.js path/to/toyota_dataset.json

# With service account
GOOGLE_APPLICATION_CREDENTIALS=service-account.json node scripts/seed-firestore.js data.json

# Dry run
DRY_RUN=true node scripts/seed-firestore.js data.json
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install firebase-admin
```

### 2. Set Up Firebase Credentials

#### Option A: Firebase Emulator (Recommended for Development)

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Initialize Firebase in your project:
   ```bash
   firebase init firestore
   ```

3. Start the emulator:
   ```bash
   firebase emulators:start
   ```

4. Run the seed script with `-UseEmulator` flag

#### Option B: Production Database with Service Account

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** > **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file securely (e.g., `service-account.json`)
6. **IMPORTANT**: Add to `.gitignore`:
   ```
   service-account.json
   *-service-account.json
   ```

### 3. Prepare Your Data

The script expects a JSON file with one of these structures:

```json
// Option 1: Top-level array
[
  {
    "make": "Toyota",
    "model": "Camry",
    "year": 2024,
    "epa_option_desc": "Auto (S6), 4 cyl, 2.5 L",
    "city_mpg": 28,
    "highway_mpg": 39,
    "combined_mpg": 32,
    "fuel_type": "Regular Gasoline",
    "vehicle_type": "Midsize Cars",
    "msrp": 28855
  }
]

// Option 2: Nested structure
{
  "vehicles": [ /* array of vehicles */ ],
  "metadata": { /* optional */ }
}

// Option 3: EPA structure
{
  "epa": {
    "vehicles": [ /* array of vehicles */ ]
  }
}
```

## Schema Mapping

The script transforms source data according to the schema in `research.md`:

### Document Structure

```typescript
{
  // Document ID: toyota_camry_2024_le
  id: "toyota_camry_2024_le",
  make: "Toyota",
  model: "Camry",
  year: 2024,
  trim: "le",
  canonicalKey: "toyota|camry|2024|le",
  
  // Denormalized fields for querying
  bodyStyle: "sedan",      // Mapped from vehicle_type
  fuelType: "hybrid",      // Normalized to: gas, hybrid, electric, diesel
  seating: 5,
  msrp: 28855,
  mpgCity: 51,
  mpgHighway: 53,
  mpgCombined: 52,
  awd: false,
  features: [],
  
  // Source-specific data
  epa: { /* EPA fields */ },
  vpic: { /* VPIC fields (placeholder) */ },
  carquery: { /* CarQuery fields (placeholder) */ },
  
  sources: ["epa"],
  createdAt: <timestamp>,
  updatedAt: <timestamp>
}
```

### Collections Created

1. **`vehicles`** - Main collection with all vehicle documents
2. **`metadata/makes/{make}/stats`** - Aggregated statistics per make

## Features

### ✅ Batch Writing
- Processes vehicles in batches of 500 (Firestore limit)
- Efficient bulk uploads with progress tracking

### ✅ Schema Transformation
- Maps EPA data to standardized schema
- Normalizes trim names, fuel types, body styles
- Creates canonical keys for deduplication

### ✅ Metadata Generation
- Automatically creates aggregated statistics
- Groups vehicles by make and year
- Useful for faceted search and filters

### ✅ Error Handling
- Validates required fields
- Skips invalid records with warnings
- Continues on errors without failing entire batch

### ✅ Dry Run Mode
- Test script without writing to database
- Validates data transformation
- Checks for errors before production run

### ✅ Emulator Support
- Safe testing with local emulator
- No quota consumption
- Faster iteration during development

## Advanced Usage

### Custom JSON Path in Different Location

```powershell
# Use absolute path
.\scripts\seed-firestore.ps1 -JsonPath "C:\Users\vibhu\Documents\...\toyota_dataset.json" -UseEmulator
```

### Batch Processing Large Datasets

For very large datasets (>10,000 vehicles), consider:

1. Split JSON file into smaller chunks:
   ```powershell
   # Split into 5000-vehicle chunks
   node scripts/split-json.js large-dataset.json 5000
   ```

2. Seed each chunk separately:
   ```powershell
   Get-ChildItem ".\chunks\*.json" | ForEach-Object {
     .\scripts\seed-firestore.ps1 -JsonPath $_.FullName -UseEmulator
   }
   ```

### Verify Seeded Data

```powershell
# Query Firestore to count documents
firebase firestore:read /vehicles --limit 10

# Or use Node.js script
node scripts/verify-data.js
```

## Firestore Indexes

After seeding, create composite indexes for common queries:

### Required Indexes

```javascript
// firestore.indexes.json
{
  "indexes": [
    {
      "collectionGroup": "vehicles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "bodyStyle", "order": "ASCENDING" },
        { "fieldPath": "fuelType", "order": "ASCENDING" },
        { "fieldPath": "msrp", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "vehicles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "make", "order": "ASCENDING" },
        { "fieldPath": "year", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "vehicles",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "bodyStyle", "order": "ASCENDING" },
        { "fieldPath": "seating", "order": "ASCENDING" },
        { "fieldPath": "msrp", "order": "ASCENDING" }
      ]
    }
  ]
}
```

Deploy indexes:
```bash
firebase deploy --only firestore:indexes
```

## Security Rules

After seeding, set up security rules:

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read for vehicles
    match /vehicles/{vehicleId} {
      allow read: if true;
      allow write: if request.auth != null 
                   && request.auth.token.role == 'admin';
    }
    
    // Public read for metadata
    match /metadata/{document=**} {
      allow read: if true;
      allow write: if request.auth != null 
                   && request.auth.token.role == 'admin';
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## Troubleshooting

### Error: "GOOGLE_APPLICATION_CREDENTIALS not set"

**Solution**: Use emulator or provide service account:
```powershell
.\scripts\seed-firestore.ps1 -JsonPath "data.json" -UseEmulator
# OR
.\scripts\seed-firestore.ps1 -JsonPath "data.json" -ServiceAccountKey "key.json"
```

### Error: "Permission denied"

**Solution**: Check service account has Firestore permissions:
1. Go to [IAM Console](https://console.cloud.google.com/iam-admin/iam)
2. Find your service account
3. Ensure it has **Cloud Datastore User** or **Owner** role

### Error: "ECONNREFUSED" when using emulator

**Solution**: Start Firebase emulator first:
```bash
firebase emulators:start
```

### Error: "9 FAILED_PRECONDITION: The query requires an index"

**Solution**: Create composite indexes (see Firestore Indexes section above)

### Warning: "Skipping invalid vehicle"

**Solution**: Check JSON structure - ensure required fields (make, model, year) are present

## Performance Tips

1. **Use Emulator for Testing**: Much faster than production database
2. **Batch Size**: Default 500 is optimal for Firestore
3. **Parallel Writes**: For very large datasets, consider parallel processing
4. **Network**: Stable internet connection improves upload speed
5. **Local Emulator**: Processes 10,000+ vehicles in seconds

## Data Validation

The script validates:
- ✅ Required fields: `make`, `model`, `year`
- ✅ Data types: numbers, strings, arrays
- ✅ Field normalization: trim, lowercase
- ⚠️ Skips invalid records with warnings

## Clean Up Data

To delete all seeded data:

```bash
# Delete all vehicles (emulator only)
firebase emulators:exec --only firestore "node scripts/delete-all.js"

# Production: Use Firebase Console or bulk delete script
```

## Next Steps

After seeding:

1. ✅ Verify data in Firestore Console
2. ✅ Create composite indexes
3. ✅ Deploy security rules
4. ✅ Test queries in your app
5. ✅ Set up backups/exports

## Support

For issues or questions:
- Check `research.md` for schema details
- Review Firebase logs: `firebase functions:log`
- Test with dry run first: `-DryRun`
- Use emulator for safe testing

## License

MIT - See project LICENSE file
