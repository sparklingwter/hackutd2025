#!/usr/bin/env pwsh

<#
.SYNOPSIS
    PowerShell wrapper for Firestore seeding script

.DESCRIPTION
    Seeds Toyota vehicle data into Firestore from a JSON file.
    Handles service account credentials and emulator configuration.

.PARAMETER JsonPath
    Path to the Toyota dataset JSON file

.PARAMETER ServiceAccountKey
    Path to Firebase service account JSON key file

.PARAMETER UseEmulator
    Use Firestore emulator instead of production database

.PARAMETER EmulatorHost
    Firestore emulator host (default: localhost:8080)

.PARAMETER DryRun
    Perform a dry run without writing to Firestore

.EXAMPLE
    .\seed-firestore.ps1 -JsonPath "C:\data\toyota_dataset.json"

.EXAMPLE
    .\seed-firestore.ps1 -JsonPath "data.json" -UseEmulator

.EXAMPLE
    .\seed-firestore.ps1 -JsonPath "data.json" -ServiceAccountKey "service-account.json"

.EXAMPLE
    .\seed-firestore.ps1 -JsonPath "data.json" -DryRun
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true, Position=0)]
    [string]$JsonPath,
    
    [Parameter(Mandatory=$false)]
    [string]$ServiceAccountKey,
    
    [Parameter(Mandatory=$false)]
    [switch]$UseEmulator,
    
    [Parameter(Mandatory=$false)]
    [string]$EmulatorHost = "localhost:8080",
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

# Script directory
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir
$SeedScript = Join-Path $ScriptDir "seed-firestore.cjs"

# Check if Node.js is installed
Write-Host "🔍 Checking Node.js installation..." -ForegroundColor Cyan
try {
    $nodeVersion = node --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Node.js not found"
    }
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Error: Node.js is not installed or not in PATH" -ForegroundColor Red
    Write-Host "Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Check if seed script exists
if (-not (Test-Path $SeedScript)) {
    Write-Host "❌ Error: Seed script not found: $SeedScript" -ForegroundColor Red
    exit 1
}

# Check if JSON file exists
$ResolvedJsonPath = Resolve-Path $JsonPath -ErrorAction SilentlyContinue
if (-not $ResolvedJsonPath) {
    Write-Host "❌ Error: JSON file not found: $JsonPath" -ForegroundColor Red
    exit 1
}

Write-Host "📁 JSON file: $ResolvedJsonPath" -ForegroundColor Cyan

# Set up environment variables
$env:NODE_ENV = "production"

if ($DryRun) {
    $env:DRY_RUN = "true"
    Write-Host "🔍 Dry run mode enabled - no data will be written" -ForegroundColor Yellow
}

if ($UseEmulator) {
    $env:FIRESTORE_EMULATOR_HOST = $EmulatorHost
    Write-Host "🧪 Using Firestore Emulator: $EmulatorHost" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "⚠️  Make sure the emulator is running:" -ForegroundColor Yellow
    Write-Host "   firebase emulators:start" -ForegroundColor Gray
    Write-Host ""
} elseif ($ServiceAccountKey) {
    $ResolvedKeyPath = Resolve-Path $ServiceAccountKey -ErrorAction SilentlyContinue
    if (-not $ResolvedKeyPath) {
        Write-Host "❌ Error: Service account key file not found: $ServiceAccountKey" -ForegroundColor Red
        exit 1
    }
    
    $env:GOOGLE_APPLICATION_CREDENTIALS = $ResolvedKeyPath
    Write-Host "🔐 Using service account: $ResolvedKeyPath" -ForegroundColor Cyan
} else {
    Write-Host "⚠️  No service account specified - using default credentials" -ForegroundColor Yellow
    Write-Host "   Set -ServiceAccountKey or -UseEmulator to specify credentials" -ForegroundColor Gray
}

Write-Host ""

# Check if firebase-admin is installed
Write-Host "🔍 Checking dependencies..." -ForegroundColor Cyan
Push-Location $ProjectRoot
try {
    $packageJson = Get-Content "package.json" -Raw | ConvertFrom-Json
    $hasFirebaseAdmin = $packageJson.dependencies.PSObject.Properties.Name -contains "firebase-admin"
    
    if (-not $hasFirebaseAdmin) {
        Write-Host "⚠️  firebase-admin not found in dependencies" -ForegroundColor Yellow
        Write-Host "Installing firebase-admin..." -ForegroundColor Cyan
        npm install firebase-admin --save
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Error: Failed to install firebase-admin" -ForegroundColor Red
            exit 1
        }
    }
    
    Write-Host "✅ Dependencies OK" -ForegroundColor Green
} catch {
    Write-Host "❌ Error checking dependencies: $_" -ForegroundColor Red
    exit 1
} finally {
    Pop-Location
}

Write-Host ""

# Run the seeding script
Write-Host "🚀 Starting Firestore seeding..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

$StartTime = Get-Date

try {
    & node $SeedScript $ResolvedJsonPath
    $ExitCode = $LASTEXITCODE
    
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    
    $Duration = (Get-Date) - $StartTime
    $DurationStr = "{0:N2}" -f $Duration.TotalSeconds
    
    if ($ExitCode -eq 0) {
        Write-Host "✨ Seeding completed successfully in ${DurationStr}s" -ForegroundColor Green
        
        if ($UseEmulator) {
            Write-Host ""
            Write-Host "🌐 View data in Emulator UI: http://localhost:4000/firestore" -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ Seeding failed (exit code: $ExitCode)" -ForegroundColor Red
        exit $ExitCode
    }
} catch {
    Write-Host "❌ Error running seed script: $_" -ForegroundColor Red
    exit 1
} finally {
    # Clean up environment variables
    Remove-Item Env:DRY_RUN -ErrorAction SilentlyContinue
    Remove-Item Env:FIRESTORE_EMULATOR_HOST -ErrorAction SilentlyContinue
    Remove-Item Env:GOOGLE_APPLICATION_CREDENTIALS -ErrorAction SilentlyContinue
}

Write-Host ""
Write-Host "📚 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Verify data in Firestore console or emulator" -ForegroundColor Gray
Write-Host "   2. Create composite indexes for common queries" -ForegroundColor Gray
Write-Host "   3. Set up security rules (firestore.rules)" -ForegroundColor Gray
Write-Host ""

exit 0
