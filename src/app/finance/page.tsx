"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import StickyHeader from "~/components/ui/sticky-header";
import { findCar, Car } from "~/lib/cars";
import { DollarSign, CreditCard, ArrowLeft } from "lucide-react";

// helpers
function parseMoneyToNumber(display?: string) {
  if (!display) return 0;
  // "$36,990" -> 36990
  return Number(display.replace(/[^\d.]/g, "")) || 0;
}

function fmtUSD(n: number) {
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

// Monthly payment: P = principal, r = monthly rate, n = months
function monthlyPayment(principal: number, aprPercent: number, months: number) {
  const r = (aprPercent / 100) / 12;
  if (r <= 0) return principal / months;
  const pow = Math.pow(1 + r, months);
  return principal * (r * pow) / (pow - 1);
}

export default function FinancePage() {
  const params = useSearchParams();
  const carId = params.get("carId") ?? "";
  const car: Car | undefined = useMemo(() => findCar(carId), [carId]);
  // UI state
  const [mode, setMode] = useState<"finance" | "buy">("finance");

  // Financing inputs (defaults; adjust as needed)
  const [downPct, setDownPct] = useState(10);   // %
  const [apr, setApr] = useState(4.5);          // %
  const [term, setTerm] = useState(60);         // months
  const [taxPct, setTaxPct] = useState(6.25);   // Texas base sales tax
  const [docFee, setDocFee] = useState(150);    // flat doc/title/registration placeholder

  // Derived numbers
  const msrp = parseMoneyToNumber(car?.price);
  const taxAmount = useMemo(() => msrp * (taxPct / 100), [msrp, taxPct]);
  const subtotal = useMemo(() => msrp + taxAmount + docFee, [msrp, taxAmount, docFee]);
  const downAmt = useMemo(() => Math.round(subtotal * (downPct / 100)), [subtotal, downPct]);
  const principal = useMemo(() => Math.max(subtotal - downAmt, 0), [subtotal, downAmt]);
  const monthly = useMemo(() => monthlyPayment(principal, apr, term), [principal, apr, term]);

  return (
    <>
      <StickyHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 text-foreground">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Finance Options</h1>
          <Link href="/result" className="flex items-center gap-2 text-primary hover:underline">
            <ArrowLeft className="h-4 w-4" /> Back to Results
          </Link>
        </div>

        {!car ? (
          <div className="rounded-2xl border bg-card p-6 shadow">Loading car…</div>
        ) : !car ? (
          <div className="rounded-2xl border bg-card p-6 shadow">
            Car not found. Please go back and select a car.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Car summary */}
            <aside className="lg:col-span-1">
              <div className="overflow-hidden rounded-2xl border bg-card shadow">
                <div className="relative h-48 w-full">
                  <Image src={car.img} alt={car.name} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <h2 className="text-lg font-semibold">{car.name}</h2>
                  <div className="mt-1 text-sm text-muted-foreground">{car.description}</div>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm">
                    <DollarSign className="h-4 w-4" />
                    MSRP: <span className="font-semibold">{car.price ?? "—"}</span>
                  </div>
                </div>
              </div>
            </aside>

            {/* Calculator + Summary */}
            <section className="lg:col-span-2">
              {/* Toggle buttons */}
              <div className="mb-4 inline-flex overflow-hidden rounded-full border bg-card shadow">
                <button
                  onClick={() => setMode("finance")}
                  className={`px-5 py-3 text-sm font-medium ${mode === "finance" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  <span className="inline-flex items-center gap-2"><CreditCard className="h-4 w-4" /> Finance</span>
                </button>
                <button
                  onClick={() => setMode("buy")}
                  className={`px-5 py-3 text-sm font-medium ${mode === "buy" ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  <span className="inline-flex items-center gap-2"><DollarSign className="h-4 w-4" /> Buy</span>
                </button>
              </div>

              {/* Inputs + numbers */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Left: inputs */}
                <div className="rounded-2xl border bg-card p-5 shadow">
                  <h3 className="mb-3 text-base font-semibold">Your Inputs</h3>

                  {/* Common inputs */}
                  <div className="mb-3">
                    <label className="mb-1 block text-sm text-muted-foreground">Sales Tax (%)</label>
                    <input
                      type="number"
                      value={taxPct}
                      onChange={(e) => setTaxPct(Number(e.target.value))}
                      className="w-full rounded-lg border px-3 py-2"
                      step="0.01"
                      min={0}
                    />
                  </div>
                  <div className="mb-6">
                    <label className="mb-1 block text-sm text-muted-foreground">Fees (doc/title/etc.)</label>
                    <input
                      type="number"
                      value={docFee}
                      onChange={(e) => setDocFee(Number(e.target.value))}
                      className="w-full rounded-lg border px-3 py-2"
                      step="1"
                      min={0}
                    />
                  </div>

                  {mode === "finance" && (
                    <>
                      <div className="mb-3">
                        <label className="mb-1 block text-sm text-muted-foreground">Down Payment (%)</label>
                        <input
                          type="number"
                          value={downPct}
                          onChange={(e) => setDownPct(Number(e.target.value))}
                          className="w-full rounded-lg border px-3 py-2"
                          step="0.5"
                          min={0}
                          max={100}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="mb-1 block text-sm text-muted-foreground">APR (%)</label>
                        <input
                          type="number"
                          value={apr}
                          onChange={(e) => setApr(Number(e.target.value))}
                          className="w-full rounded-lg border px-3 py-2"
                          step="0.1"
                          min={0}
                        />
                      </div>
                      <div className="mb-3">
                        <label className="mb-1 block text-sm text-muted-foreground">Term (months)</label>
                        <input
                          type="number"
                          value={term}
                          onChange={(e) => setTerm(Number(e.target.value))}
                          className="w-full rounded-lg border px-3 py-2"
                          step="1"
                          min={12}
                          max={96}
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Right: summary */}
                <div className="rounded-2xl border bg-card p-5 shadow">
                  <h3 className="mb-3 text-base font-semibold">Summary</h3>

                  <dl className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">MSRP</dt>
                      <dd className="font-medium">{fmtUSD(msrp)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Sales Tax ({taxPct}%)</dt>
                      <dd className="font-medium">{fmtUSD(taxAmount)}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-muted-foreground">Fees</dt>
                      <dd className="font-medium">{fmtUSD(docFee)}</dd>
                    </div>
                    <div className="flex items-center justify-between border-t pt-2">
                      <dt className="text-muted-foreground">Subtotal</dt>
                      <dd className="font-semibold">{fmtUSD(subtotal)}</dd>
                    </div>

                    {mode === "finance" ? (
                      <>
                        <div className="flex items-center justify-between">
                          <dt className="text-muted-foreground">Down Payment ({downPct}%)</dt>
                          <dd className="font-medium">− {fmtUSD(downAmt)}</dd>
                        </div>
                        <div className="flex items-center justify-between">
                          <dt className="text-muted-foreground">Amount Financed</dt>
                          <dd className="font-semibold">{fmtUSD(principal)}</dd>
                        </div>
                        <div className="mt-3 rounded-xl bg-muted px-4 py-3 text-base">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">Estimated Monthly</span>
                            <span className="font-bold">{fmtUSD(Math.round(monthly))}</span>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Based on APR {apr}% for {term} months.
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="mt-3 rounded-xl bg-muted px-4 py-3 text-base">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Total Due (Cash)</span>
                          <span className="font-bold">{fmtUSD(subtotal)}</span>
                        </div>
                        <div className="mt-1 text-xs text-muted-foreground">
                          Includes taxes & fees.
                        </div>
                      </div>
                    )}
                  </dl>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Link href="/result" className="rounded-full border px-4 py-2 text-sm hover:bg-muted">
                      Back
                    </Link>
                    <Link href="#" className="rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90">
                      Continue
                    </Link>
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </>
  );
}
