#!/usr/bin/env pwsh

<#
.SYNOPSIS
    Complete setup and seeding workflow for Firestore

.DESCRIPTION
    This script automates the entire process:
    1. Checks if Firebase emulator is running
    2. Starts emulator if needed
    3. Runs the seeding script
    4. Verifies the seeded data

.PARAMETER JsonPath
    Path to the Toyota dataset JSON file

.PARAMETER WaitForEmulator
    Wait for emulator to be ready before seeding

.PARAMETER SkipVerification
    Skip data verification after seeding

.EXAMPLE
    .\setup-and-seed.ps1 -JsonPath ".\scripts\sample-data.json"
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$JsonPath,
    
    [Parameter(Mandatory=$false)]
    [switch]$WaitForEmulator,
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipVerification
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "🚀 Firebase Firestore Setup & Seed" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

# Check if emulator is running
Write-Host "🔍 Checking if Firebase emulator is running..." -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
    Write-Host "✅ Emulator is already running" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Emulator is not running" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Starting Firebase emulator..." -ForegroundColor Cyan
    
    # Start emulator in background
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "firebase emulators:start --only firestore" -WindowStyle Normal
    
    Write-Host "⏳ Waiting for emulator to be ready..." -ForegroundColor Yellow
    
    # Wait for emulator to be ready (max 60 seconds)
    $maxWait = 60
    $waited = 0
    $ready = $false
    
    while ($waited -lt $maxWait -and -not $ready) {
        Start-Sleep -Seconds 2
        $waited += 2
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:4000" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
            $ready = $true
            Write-Host "✅ Emulator is ready!" -ForegroundColor Green
        } catch {
            Write-Host "." -NoNewline
        }
    }
    
    if (-not $ready) {
        Write-Host ""
        Write-Host "❌ Emulator did not start within $maxWait seconds" -ForegroundColor Red
        Write-Host "Please start it manually: firebase emulators:start --only firestore" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host ""
}

Write-Host ""

# Run seeding script
Write-Host "📦 Running seeding script..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

$seedScript = Join-Path $ScriptDir "scripts\seed-firestore.ps1"

try {
    & $seedScript -JsonPath $JsonPath -UseEmulator
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -ne 0) {
        Write-Host ""
        Write-Host "❌ Seeding failed" -ForegroundColor Red
        exit $exitCode
    }
} catch {
    Write-Host ""
    Write-Host "❌ Error running seeding script: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Verify data
if (-not $SkipVerification) {
    Write-Host "🔍 Verifying seeded data..." -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host ""
    
    $env:FIRESTORE_EMULATOR_HOST = "localhost:8080"
    
    try {
        $verifyScript = Join-Path $ScriptDir "scripts\verify-data.js"
        & node $verifyScript
    } catch {
        Write-Host "⚠️  Could not verify data: $_" -ForegroundColor Yellow
    } finally {
        Remove-Item Env:FIRESTORE_EMULATOR_HOST -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "✨ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 View your data:" -ForegroundColor Cyan
Write-Host "   Emulator UI: http://localhost:4000/firestore" -ForegroundColor Gray
Write-Host ""
Write-Host "🛠️  Next steps:" -ForegroundColor Cyan
Write-Host "   1. Open http://localhost:4000/firestore in your browser" -ForegroundColor Gray
Write-Host "   2. Browse the 'vehicles' collection" -ForegroundColor Gray
Write-Host "   3. Start your Next.js dev server: npm run dev" -ForegroundColor Gray
Write-Host ""
