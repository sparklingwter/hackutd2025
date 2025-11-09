"use client";

import { useState } from "react";
import { CashTab } from "~/components/estimate/CashTab";
import { FinanceTab } from "~/components/estimate/FinanceTab";
import { LeaseTab } from "~/components/estimate/LeaseTab";

/**
 * T041: Estimate Page with Tab Navigation
 * 
 * Provides cost estimation for cash, finance, and lease options.
 * Users can switch between tabs to calculate different payment scenarios.
 */
export default function EstimatePage() {
  const [activeTab, setActiveTab] = useState<"cash" | "finance" | "lease">("cash");

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Cost Estimator</h1>
        <p className="mt-2 text-gray-600">
          Calculate your estimated costs for cash, finance, or lease options
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("cash")}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
              ${activeTab === "cash"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }
            `}
          >
            Cash Purchase
          </button>
          <button
            onClick={() => setActiveTab("finance")}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
              ${activeTab === "finance"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }
            `}
          >
            Finance
          </button>
          <button
            onClick={() => setActiveTab("lease")}
            className={`
              whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
              ${activeTab === "lease"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }
            `}
          >
            Lease
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "cash" && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Cash Purchase Estimate</h2>
            <p className="text-gray-600 mb-6">Calculate your total out-the-door cost for paying in cash.</p>
            <CashTab />
          </div>
        )}

        {activeTab === "finance" && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Finance Estimate</h2>
            <p className="text-gray-600 mb-6">Calculate your monthly payment and total cost when financing.</p>
            <FinanceTab />
          </div>
        )}

        {activeTab === "lease" && (
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold mb-4">Lease Estimate</h2>
            <p className="text-gray-600 mb-6">Calculate your monthly lease payment and terms.</p>
            <LeaseTab />
          </div>
        )}
      </div>
    </div>
  );
}
