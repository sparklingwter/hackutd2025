"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import StickyHeader from "~/components/ui/sticky-header";
import { ThemeToggle } from "~/components/theme-toggle";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { CAR_INDEX, CARS, Car } from "~/lib/cars";
import { ArrowLeft, DollarSign, Percent, Calculator, CheckCircle2, FileText } from "lucide-react";

type FinancingType = "finance" | "lease";

// APR rates based on credit tier (simplified)
const APR_RATES = {
  excellent: 2.9, // Excellent credit (720+)
  good: 4.5,      // Good credit (680-719)
  fair: 6.9,      // Fair credit (640-679)
  poor: 9.9,     // Poor credit (below 640)
};

// Money factor rates for leasing (converted from APR)
const MONEY_FACTORS = {
  excellent: 0.0012, // ~2.9% APR
  good: 0.0019,      // ~4.5% APR
  fair: 0.0029,      // ~6.9% APR
  poor: 0.0041,     // ~9.9% APR
};

// Residual value percentages by term (typical lease values)
const RESIDUAL_VALUES: Record<number, number> = {
  24: 0.65, // 65% residual for 24 months
  36: 0.55, // 55% residual for 36 months
  39: 0.53, // 53% residual for 39 months
  48: 0.45, // 45% residual for 48 months
};

// Calculate finance monthly payment
function calculateFinancePayment(price: number, apr: number, downPayment: number, termMonths: number): number {
  const principal = price - downPayment;
  const monthlyRate = apr / 100 / 12;
  if (monthlyRate === 0) return principal / termMonths;
  return (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
}

// Calculate lease monthly payment
function calculateLeasePayment(
  price: number,
  moneyFactor: number,
  downPayment: number,
  termMonths: number,
  residualPercent: number
): number {
  const capitalizedCost = price - downPayment;
  const residualValue = price * residualPercent;
  const depreciation = (capitalizedCost - residualValue) / termMonths;
  const financeCharge = (capitalizedCost + residualValue) * moneyFactor;
  return depreciation + financeCharge;
}

// Extract numeric price from string like "$36,990"
function extractPrice(priceStr: string): number {
  return parseInt(priceStr.replace(/[^0-9]/g, ""), 10);
}

export default function PricePage() {
  const params = useSearchParams();
  const carIdParam = params.get("id") || params.get("car");
  
  const [selectedCarId, setSelectedCarId] = useState<string>(() => {
    if (carIdParam && CAR_INDEX[carIdParam]) return carIdParam;
    return CARS[0]?.id || "";
  });
  
  const [financingType, setFinancingType] = useState<FinancingType>("finance");
  const [creditTier, setCreditTier] = useState<keyof typeof APR_RATES>("excellent");
  const [downPayment, setDownPayment] = useState<string>("5000");
  const [termMonths, setTermMonths] = useState<number>(60);
  const [mileagePerYear, setMileagePerYear] = useState<number>(12000);

  const selectedCar: Car | null = useMemo(() => {
    return selectedCarId ? CAR_INDEX[selectedCarId] || null : null;
  }, [selectedCarId]);

  const apr = APR_RATES[creditTier];
  const moneyFactor = MONEY_FACTORS[creditTier];
  const carPrice = selectedCar ? extractPrice(selectedCar.price) : 0;
  const downPaymentNum = parseFloat(downPayment) || 0;
  
  // Get residual value percentage based on term (default to 55% for 36 months)
  const residualPercent = RESIDUAL_VALUES[termMonths] ?? RESIDUAL_VALUES[36];
  
  const monthlyPayment = useMemo(() => {
    if (!selectedCar || carPrice === 0) return 0;
    if (financingType === "lease") {
      return calculateLeasePayment(carPrice, moneyFactor, downPaymentNum, termMonths, residualPercent);
    } else {
      return calculateFinancePayment(carPrice, apr, downPaymentNum, termMonths);
    }
  }, [carPrice, apr, moneyFactor, downPaymentNum, termMonths, residualPercent, financingType]);
  
  // Calculate total cost
  const totalCost = useMemo(() => {
    if (financingType === "lease") {
      return downPaymentNum + (monthlyPayment * termMonths);
    } else {
      return downPaymentNum + (monthlyPayment * termMonths);
    }
  }, [downPaymentNum, monthlyPayment, termMonths, financingType]);

  return (
    <>
      <ThemeToggle />
      <StickyHeader />

      <main className="mx-auto w-full max-w-7xl px-4 py-8 text-foreground">
        {/* Header with back button */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/result">
              <Button variant="outline" size="icon" className="rounded-full">
                <ArrowLeft className="h-5 w-5" />
                <span className="sr-only">Back to Results</span>
              </Button>
            </Link>
            <h1 className="text-3xl font-bold">Pricing & Financing</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column: Car Selection */}
          <div className="lg:col-span-1">
            <div className="rounded-2xl border bg-card p-5 shadow">
              <h2 className="mb-4 text-lg font-semibold">Select Vehicle</h2>
              
              {/* Car Selection Dropdown */}
              <div className="mb-4">
                <label htmlFor="car-select" className="mb-2 block text-sm text-muted-foreground">
                  Choose a model
                </label>
                <select
                  id="car-select"
                  value={selectedCarId}
                  onChange={(e) => setSelectedCarId(e.target.value)}
                  className="h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                >
                  {CARS.map((car) => (
                    <option key={car.id} value={car.id}>
                      {car.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Car Card */}
              {selectedCar && (
                <div className="rounded-xl border bg-muted/30 p-4">
                  <div className="relative mb-3 h-32 w-full overflow-hidden rounded-lg">
                    <Image
                      src={selectedCar.img}
                      alt={selectedCar.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 300px"
                    />
                  </div>
                  <h3 className="mb-2 text-base font-semibold">{selectedCar.name}</h3>
                  <p className="mb-3 text-sm text-muted-foreground">{selectedCar.description}</p>
                  
                  {/* Car Specs */}
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs">
                      {selectedCar.specs.drivetrain.toUpperCase()}
                    </span>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs">
                      {selectedCar.specs.powertrain.toUpperCase()}
                    </span>
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs">
                      {selectedCar.specs.body.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Price & Financing Details */}
          <div className="lg:col-span-2">
            {selectedCar ? (
              <>
                {/* Price Display Card */}
                <div className="mb-6 rounded-2xl border bg-card p-6 shadow">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Vehicle Price</h2>
                    <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <span className="text-2xl font-bold text-primary">{selectedCar.price}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <div className="mb-1 text-sm text-muted-foreground">Base MSRP</div>
                      <div className="text-xl font-semibold">{selectedCar.price}</div>
                    </div>
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <div className="mb-1 text-sm text-muted-foreground">Estimated Total</div>
                      <div className="text-xl font-semibold">{selectedCar.price}</div>
                    </div>
                  </div>
                </div>

                {/* Financing Type Selection */}
                <div className="mb-6 rounded-2xl border bg-card p-6 shadow">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Financing Options</h2>
                    <div className="flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2">
                      {financingType === "lease" ? (
                        <>
                          <FileText className="h-5 w-5 text-primary" />
                          <span className="text-2xl font-bold text-primary">Lease</span>
                        </>
                      ) : (
                        <>
                          <Percent className="h-5 w-5 text-primary" />
                          <span className="text-2xl font-bold text-primary">{apr}% APR</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Lease vs Finance Toggle */}
                  <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">
                      Choose Option
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => {
                          setFinancingType("finance");
                          // Reset to common finance terms
                          if (termMonths > 84) setTermMonths(60);
                        }}
                        className={`rounded-lg border p-4 text-sm transition ${
                          financingType === "finance"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-muted hover:bg-muted/70"
                        }`}
                      >
                        <div className="font-semibold">Finance</div>
                        <div className="mt-1 text-xs opacity-80">Own the vehicle</div>
                      </button>
                      <button
                        onClick={() => {
                          setFinancingType("lease");
                          // Reset to common lease terms
                          if (termMonths > 48) setTermMonths(36);
                        }}
                        className={`rounded-lg border p-4 text-sm transition ${
                          financingType === "lease"
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-muted hover:bg-muted/70"
                        }`}
                      >
                        <div className="font-semibold">Lease</div>
                        <div className="mt-1 text-xs opacity-80">Lower monthly payments</div>
                      </button>
                    </div>
                  </div>

                  {/* Credit Tier Selection */}
                  <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-muted-foreground">
                      Credit Tier
                    </label>
                    <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                      {Object.entries(APR_RATES).map(([tier, rate]) => (
                        <button
                          key={tier}
                          onClick={() => setCreditTier(tier as keyof typeof APR_RATES)}
                          className={`rounded-lg border p-3 text-sm transition ${
                            creditTier === tier
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-border bg-muted hover:bg-muted/70"
                          }`}
                        >
                          <div className="font-semibold capitalize">{tier}</div>
                          <div className="text-xs opacity-80">
                            {financingType === "lease" 
                              ? `${(MONEY_FACTORS[tier as keyof typeof MONEY_FACTORS] * 2400).toFixed(1)}% APR`
                              : `${rate}% APR`}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payment Calculator */}
                  <div className="rounded-xl border bg-muted/30 p-5">
                    <div className="mb-4 flex items-center gap-2">
                      <Calculator className="h-5 w-5 text-primary" />
                      <h3 className="text-lg font-semibold">Payment Calculator</h3>
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Down Payment / Capitalized Cost Reduction */}
                      <div>
                        <label htmlFor="down-payment" className="mb-2 block text-sm text-muted-foreground">
                          {financingType === "lease" ? "Capitalized Cost Reduction" : "Down Payment"}
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                          <Input
                            id="down-payment"
                            type="number"
                            value={downPayment}
                            onChange={(e) => setDownPayment(e.target.value)}
                            className="pl-8"
                            min="0"
                            max={carPrice.toString()}
                          />
                        </div>
                      </div>

                      {/* Term */}
                      <div>
                        <label htmlFor="term" className="mb-2 block text-sm text-muted-foreground">
                          {financingType === "lease" ? "Lease Term" : "Loan Term"}
                        </label>
                        <select
                          id="term"
                          value={termMonths}
                          onChange={(e) => setTermMonths(Number(e.target.value))}
                          className="h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
                        >
                          {financingType === "lease" ? (
                            <>
                              <option value="24">24 months</option>
                              <option value="36">36 months</option>
                              <option value="39">39 months</option>
                              <option value="48">48 months</option>
                            </>
                          ) : (
                            <>
                              <option value="36">36 months</option>
                              <option value="48">48 months</option>
                              <option value="60">60 months</option>
                              <option value="72">72 months</option>
                              <option value="84">84 months</option>
                            </>
                          )}
                        </select>
                      </div>
                    </div>

                    {/* Mileage Selection (Lease Only) */}
                    {financingType === "lease" && (
                      <div className="mt-4">
                        <label className="mb-2 block text-sm text-muted-foreground">
                          Annual Mileage
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[10000, 12000, 15000].map((miles) => (
                            <button
                              key={miles}
                              onClick={() => setMileagePerYear(miles)}
                              className={`rounded-lg border p-3 text-sm transition ${
                                mileagePerYear === miles
                                  ? "border-primary bg-primary text-primary-foreground"
                                  : "border-border bg-muted hover:bg-muted/70"
                              }`}
                            >
                              {miles.toLocaleString()} mi/yr
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Monthly Payment Display */}
                    <div className="mt-6 rounded-lg border-2 border-primary bg-primary/5 p-4">
                      <div className="mb-2 text-sm text-muted-foreground">
                        Estimated Monthly {financingType === "lease" ? "Lease" : "Payment"}
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-primary">
                          ${monthlyPayment.toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground">/month</span>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        {financingType === "lease" ? (
                          <>
                            Based on {termMonths} months, {mileagePerYear.toLocaleString()} mi/yr
                            {residualPercent && `, ${(residualPercent * 100).toFixed(0)}% residual`}
                          </>
                        ) : (
                          <>Based on {termMonths} months at {apr}% APR</>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Financing Summary */}
                <div className="rounded-2xl border bg-card p-6 shadow">
                  <h2 className="mb-4 text-xl font-semibold">
                    {financingType === "lease" ? "Lease Summary" : "Financing Summary"}
                  </h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                      <span className="text-sm text-muted-foreground">Vehicle Price (MSRP)</span>
                      <span className="font-semibold">{selectedCar.price}</span>
                    </div>
                    <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                      <span className="text-sm text-muted-foreground">
                        {financingType === "lease" ? "Capitalized Cost Reduction" : "Down Payment"}
                      </span>
                      <span className="font-semibold">${downPaymentNum.toLocaleString()}</span>
                    </div>
                    {financingType === "lease" ? (
                      <>
                        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                          <span className="text-sm text-muted-foreground">Capitalized Cost</span>
                          <span className="font-semibold">
                            ${(carPrice - downPaymentNum).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                          <span className="text-sm text-muted-foreground">Residual Value</span>
                          <span className="font-semibold">
                            ${(carPrice * residualPercent).toLocaleString()} ({(residualPercent * 100).toFixed(0)}%)
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                          <span className="text-sm text-muted-foreground">Money Factor</span>
                          <span className="font-semibold">{(moneyFactor * 1000).toFixed(4)}</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                          <span className="text-sm text-muted-foreground">Annual Mileage</span>
                          <span className="font-semibold">{mileagePerYear.toLocaleString()} miles</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                          <span className="text-sm text-muted-foreground">Lease Term</span>
                          <span className="font-semibold">{termMonths} months</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                          <span className="text-sm text-muted-foreground">Amount Financed</span>
                          <span className="font-semibold">
                            ${(carPrice - downPaymentNum).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                          <span className="text-sm text-muted-foreground">APR Rate</span>
                          <span className="font-semibold">{apr}%</span>
                        </div>
                        <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                          <span className="text-sm text-muted-foreground">Loan Term</span>
                          <span className="font-semibold">{termMonths} months</span>
                        </div>
                      </>
                    )}
                    <div className="mt-4 flex items-center justify-between rounded-lg border-2 border-primary bg-primary/5 p-4">
                      <span className="text-base font-semibold">
                        Monthly {financingType === "lease" ? "Lease" : "Payment"}
                      </span>
                      <span className="text-2xl font-bold text-primary">
                        ${monthlyPayment.toFixed(2)}
                      </span>
                    </div>
                    {financingType === "lease" && (
                      <div className="flex items-center justify-between rounded-lg border bg-muted/30 p-3">
                        <span className="text-sm text-muted-foreground">Total Lease Cost</span>
                        <span className="font-semibold">${totalCost.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="mt-6">
                    <Button className="w-full rounded-full py-6 text-lg" size="lg">
                      <CheckCircle2 className="mr-2 h-5 w-5" />
                      {financingType === "lease" ? "Apply for Lease" : "Apply for Financing"}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border bg-card p-8 text-center shadow">
                <p className="text-muted-foreground">Please select a vehicle to view pricing information.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

