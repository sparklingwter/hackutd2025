# 🚀 Quick Reference: Firestore Seeding

## One-Liner Commands

```powershell
# Test with sample data (13 vehicles)
.\scripts\seed-firestore.ps1 -JsonPath ".\scripts\sample-data.json" -UseEmulator

# Seed your full dataset
.\scripts\seed-firestore.ps1 -JsonPath "C:\path\to\toyota_dataset.json" -UseEmulator

# Production (with service account)
.\scripts\seed-firestore.ps1 -JsonPath "data.json" -ServiceAccountKey "key.json"

# Dry run (no writes)
.\scripts\seed-firestore.ps1 -JsonPath "data.json" -UseEmulator -DryRun
```

## File Locations

| File | Purpose |
|------|---------|
| `scripts/seed-firestore.js` | Main seeding script (Node.js) |
| `scripts/seed-firestore.ps1` | PowerShell wrapper (Windows) |
| `scripts/sample-data.json` | Test data (13 vehicles) |
| `scripts/verify-data.js` | Verify seeded data |
| `src/types/firestore.ts` | TypeScript schema definitions |
| `docs/FIRESTORE-SCHEMA.md` | Complete schema documentation |
| `QUICKSTART-SEEDING.md` | Quick start guide |

## Schema Quick Reference

```typescript
// Document: vehicles/{id}
{
  // Display
  name: "2024 Toyota Camry XLE"
  price: "$28,855"
  tags: ["toyota", "sedan", "gas", "fwd"]
  
  // Specs (UI)
  specs: {
    drivetrain: "fwd" | "awd" | "4wd" | "rwd"
    powertrain: "gas" | "hybrid" | "ev" | "phev"
    body: "sedan" | "suv" | "truck" | ...
    mpg: "32 mpg"      // or range: "252 mi" for EVs
  }
  
  // Finance data
  pricing: { msrp, invoice, destinationCharge }
  performance: { mpgCity, mpgHighway, mpgCombined, ... }
  dimensions: { seating, cargo, ... }
  features: { standard[], safety[], technology[], ... }
  
  // Source data
  epa: { /* EPA fields */ }
}
```

## Common Queries

```typescript
// Get all hybrid SUVs under $50k
api.vehicles.list.useQuery({
  bodyStyle: 'suv',
  powertrain: 'hybrid',
  maxPrice: 50000
});

// Family vehicles (7+ seats)
api.vehicles.list.useQuery({
  minSeating: 7,
  tags: ['family']
});

// Efficient commuters
api.vehicles.list.useQuery({
  bodyStyle: 'sedan',
  tags: ['efficient']
});
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Node.js not found" | Install from https://nodejs.org/ |
| "firebase not found" | `npm install -g firebase-tools` |
| "ECONNREFUSED" | Start emulator: `firebase emulators:start` |
| "Permission denied" | Add **Cloud Datastore User** role to service account |
| "JSON parse error" | Check JSON format, use `sample-data.json` as template |

## Next Steps

1. ✅ Seed data with sample or full dataset
2. ✅ Verify at http://localhost:4000/firestore (emulator)
3. ✅ Create indexes: `firebase deploy --only firestore:indexes`
4. ✅ Set security rules: `firebase deploy --only firestore:rules`
5. ✅ Test queries in your app

## Resources

- 📖 **Full Docs**: `docs/FIRESTORE-SCHEMA.md`
- 🚀 **Quick Start**: `QUICKSTART-SEEDING.md`
- 📝 **Schema Types**: `src/types/firestore.ts`
- 🧪 **Sample Data**: `scripts/sample-data.json`
- 🔍 **Verify**: `node scripts/verify-data.js`

---

**Need help?** See `scripts/README.md` for detailed documentation.
