# Quick Start Guide: Seeding Firestore with Toyota Data

This guide will help you seed your Firebase Firestore database with Toyota vehicle data in under 5 minutes.

## 🚀 Quick Start (Using Emulator)

The fastest way to test the seeding script is using the Firebase emulator:

### Step 1: Install Firebase CLI (if not already installed)

```powershell
npm install -g firebase-tools
```

### Step 2: Start the Firestore Emulator

```powershell
# Navigate to your project root
cd "C:\Users\vibhu\Documents\Satyam Stuff No Sync\Github Repos\hackutd2025"

# Start the emulator
firebase emulators:start --only firestore
```

Leave this terminal open. The emulator will run at `localhost:8080` and the UI at `http://localhost:4000`

### Step 3: Run the Seed Script (New Terminal)

```powershell
# Open a new PowerShell terminal
cd "C:\Users\vibhu\Documents\Satyam Stuff No Sync\Github Repos\hackutd2025"

# Test with sample data first
.\scripts\seed-firestore.ps1 -JsonPath ".\scripts\sample-data.json" -UseEmulator

# Or use your full dataset (update path as needed)
.\scripts\seed-firestore.ps1 -JsonPath "C:\Users\vibhu\Documents\Satyam Stuff\UTD\Obsidian\School\Semester 7\7 sem7 Fall 2025\HackUTD\Toyota project\Data\toyota_dataset_2024-2025.json" -UseEmulator
```

### Step 4: Verify the Data

Open your browser to view the seeded data:
- **Emulator UI**: http://localhost:4000/firestore
- Or run verification script:

```powershell
$env:FIRESTORE_EMULATOR_HOST="localhost:8080"; node scripts/verify-data.js; Remove-Item Env:FIRESTORE_EMULATOR_HOST
```

## 📝 Production Database Setup

To seed your production Firestore database:

### Step 1: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ > **Project Settings**
4. Go to **Service Accounts** tab
5. Click **Generate New Private Key**
6. Save as `service-account.json` in your project root

### Step 2: Run Seed Script

```powershell
# Dry run first (no writes, just validation)
.\scripts\seed-firestore.ps1 -JsonPath "path\to\data.json" -ServiceAccountKey "service-account.json" -DryRun

# If looks good, run for real
.\scripts\seed-firestore.ps1 -JsonPath "path\to\data.json" -ServiceAccountKey "service-account.json"
```

## 🎯 Common Usage Patterns

### Test with Sample Data
```powershell
# Includes 8 sample vehicles (Toyota & Lexus)
.\scripts\seed-firestore.ps1 -JsonPath ".\scripts\sample-data.json" -UseEmulator
```

### Dry Run (No Writes)
```powershell
# Validates data without writing to Firestore
.\scripts\seed-firestore.ps1 -JsonPath "data.json" -UseEmulator -DryRun
```

### Custom Emulator Port
```powershell
# If your emulator runs on a different port
.\scripts\seed-firestore.ps1 -JsonPath "data.json" -UseEmulator -EmulatorHost "localhost:9090"
```

### Use Node.js Directly
```powershell
# Set environment variable and run
$env:FIRESTORE_EMULATOR_HOST="localhost:8080"
node scripts/seed-firestore.js "path\to\data.json"
Remove-Item Env:FIRESTORE_EMULATOR_HOST
```

## 📊 Data Structure

Your JSON file should follow this structure (EPA format):

```json
{
  "vehicles": [
    {
      "make": "Toyota",
      "model": "Camry",
      "year": 2024,
      "epa_option_desc": "XLE, Auto (S8), 4 cyl, 2.5 L",
      "city_mpg": 28,
      "highway_mpg": 39,
      "combined_mpg": 32,
      "fuel_type": "Regular Gasoline",
      "fuel_type_primary": "Regular Gasoline",
      "vehicle_type": "Midsize Cars",
      "vehicle_class": "Midsize Car",
      "engine_displacement": 2.5,
      "cylinders": 4,
      "transmission": "Automatic 8-spd",
      "drive_type": "Front-Wheel Drive",
      "seating": 5,
      "msrp": 28855,
      "features": ["adaptive-cruise", "lane-keep", "blind-spot"]
    }
  ]
}
```

The script transforms this into the application schema documented in `src/types/firestore.ts`.

### Transformed Firestore Document

After transformation, each vehicle becomes:

```typescript
{
  // Display fields (matching src/lib/cars.ts)
  id: "toyota_camry_2024_xle",
  name: "2024 Toyota Camry XLE",
  img: "/CarImages/camry.jpg",
  description: "2024 Toyota Camry - Midsize Car",
  tags: ["toyota", "sedan", "gas", "fwd", "efficient"],
  price: "$28,855",
  
  specs: {
    drivetrain: "fwd",
    powertrain: "gas",
    body: "sedan",
    mpg: "32 mpg"
  },
  
  // Detailed data for finance/ranking engines
  pricing: { msrp: 28855, invoice: 26835, destinationCharge: 1095 },
  performance: { mpgCity: 28, mpgHighway: 39, mpgCombined: 32, ... },
  dimensions: { seating: 5, cargo: null, ... },
  features: { standard: [...], safety: [], technology: [], ... },
  availability: { available: true, inventory: 0, estimatedDelivery: "4-6 weeks" },
  
  // Source data (preserved)
  epa: { /* original EPA fields */ },
  vpic: { /* placeholder */ },
  carquery: { /* placeholder */ },
  
  sources: ["epa"],
  createdAt: <timestamp>,
  updatedAt: <timestamp>
}
```

See `scripts/sample-data.json` for a complete example with 13 vehicles.

## ✅ Expected Output

When successful, you should see:

```
🔥 Toyota Firestore Seeding Script

📁 Reading data from: sample-data.json
✅ Successfully parsed JSON file

📊 Found 13 vehicles in dataset

📦 Processing 13 vehicles...
✅ Committed batch of 13 vehicles (13/13)

📊 Summary:
   Total processed: 13
   Skipped: 0
   Errors: 0

📋 Creating metadata documents...
✅ Created metadata for 2 makes

✨ Seeding completed in 1.45s
📦 Total vehicles processed: 13
```

### Sample Seeded Vehicles

- 2024 Toyota Camry XLE ($28,855) - Gas Sedan, FWD, 32 mpg
- 2024 Toyota Camry XLE Hybrid ($31,085) - Hybrid Sedan, FWD, 52 mpg
- 2024 Toyota RAV4 XLE ($29,750) - Gas SUV, FWD, 30 mpg
- 2024 Toyota RAV4 Hybrid XSE ($36,990) - Hybrid SUV, AWD, 40 mpg
- 2024 Toyota Highlander XLE ($42,235) - Gas SUV, 8 seats, FWD
- 2024 Toyota Highlander Hybrid XLE ($45,250) - Hybrid SUV, 8 seats, AWD
- 2024 Toyota Tacoma TRD Off-Road ($41,100) - Gas Truck, 4WD
- 2024 Toyota Crown Platinum ($53,000) - Hybrid MAX Sedan, AWD, Luxury
- 2024 Toyota bZ4X XLE ($42,350) - Electric SUV, AWD, 252 mi range
- 2024 Lexus ES 250 ($43,190) - Gas Sedan, Luxury
- 2024 Lexus RX 350 ($50,325) - Gas SUV, Luxury

## 🔧 Troubleshooting

### "Node.js not found"
Install Node.js from https://nodejs.org/ (LTS version recommended)

### "firebase command not found"
Install Firebase CLI:
```powershell
npm install -g firebase-tools
```

### "ECONNREFUSED" error
Make sure the Firebase emulator is running:
```powershell
firebase emulators:start --only firestore
```

### "JSON file not found"
Use absolute path or verify the file exists:
```powershell
# Use absolute path
.\scripts\seed-firestore.ps1 -JsonPath "C:\full\path\to\data.json" -UseEmulator

# Or check if file exists
Test-Path ".\scripts\sample-data.json"  # Should return True
```

### "Permission denied" (Production)
Your service account needs **Cloud Datastore User** role:
1. Go to [IAM Console](https://console.cloud.google.com/iam-admin/iam)
2. Find your service account email
3. Click Edit (pencil icon)
4. Add role: **Cloud Datastore User** or **Editor**

## 📚 Next Steps

After seeding:

1. **View Data**: http://localhost:4000/firestore (emulator) or Firebase Console (production)

2. **Create Indexes**: Required for faceted search queries
   ```bash
   firebase deploy --only firestore:indexes
   ```

3. **Set Security Rules**: Protect your data
   ```bash
   firebase deploy --only firestore:rules
   ```

4. **Test Queries**: Try querying your data in your app

## 🆘 Need Help?

- **Full Documentation**: See `scripts/README.md`
- **Schema Details**: See `research.md` (Firestore Security Rules section)
- **Sample Data**: Use `scripts/sample-data.json` for testing
- **Verify Script**: Run `scripts/verify-data.js` to check seeded data

## 💡 Pro Tips

1. **Always test with emulator first** - It's faster and safer
2. **Use dry run** before production seeding
3. **Check sample-data.json** to understand expected format
4. **Start small** - Test with 8 sample vehicles before full dataset
5. **Monitor costs** - Production writes count against quota

---

Happy seeding! 🎉
