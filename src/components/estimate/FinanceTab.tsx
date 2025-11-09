"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

/**
 * T043: Finance Tab Form Component
 * 
 * Form for finance estimate with loan parameters (APR, term, down payment)
 */
export function FinanceTab() {
  const [vehicleId, setVehicleId] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [vehiclePrice, setVehiclePrice] = useState("");
  const [discounts, setDiscounts] = useState("");
  const [rebates, setRebates] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [tradeInValue, setTradeInValue] = useState("");
  const [tradeInPayoff, setTradeInPayoff] = useState("");
  const [termMonths, setTermMonths] = useState("60");
  const [apr, setApr] = useState("5.99");

  // Calculate finance estimate mutation
  const calculateFinance = api.estimate.calculateFinance.useQuery(
    {
      vehicleId: vehicleId || "placeholder",
      zipCode: zipCode || "00000",
      inputs: {
        vehiclePrice: parseFloat(vehiclePrice) || 0,
        discounts: parseFloat(discounts) || 0,
        rebates: parseFloat(rebates) || 0,
        downPayment: parseFloat(downPayment) || 0,
        tradeInValue: parseFloat(tradeInValue) || 0,
        tradeInPayoff: parseFloat(tradeInPayoff) || 0,
        termMonths: parseInt(termMonths) || 60,
        apr: parseFloat(apr) || 0,
      },
    },
    {
      enabled: false,
    }
  );

  const handleCalculate = () => {
    if (!vehicleId || !zipCode || !vehiclePrice) {
      alert("Please fill in vehicle ID, ZIP code, and vehicle price");
      return;
    }
    void calculateFinance.refetch();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicle & Location */}
        <div className="space-y-4">
          <div>
            <label htmlFor="vehicleId" className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle ID *
            </label>
            <input
              type="text"
              id="vehicleId"
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., camry-2024"
            />
          </div>

          <div>
            <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
              ZIP Code *
            </label>
            <input
              type="text"
              id="zipCode"
              value={zipCode}
              onChange={(e) => setZipCode(e.target.value)}
              maxLength={5}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="75080"
            />
          </div>

          <div>
            <label htmlFor="vehiclePrice" className="block text-sm font-medium text-gray-700 mb-1">
              Vehicle Price (MSRP) *
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="vehiclePrice"
                value={vehiclePrice}
                onChange={(e) => setVehiclePrice(e.target.value)}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="28855"
              />
            </div>
          </div>

          <div>
            <label htmlFor="downPayment" className="block text-sm font-medium text-gray-700 mb-1">
              Down Payment
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="downPayment"
                value={downPayment}
                onChange={(e) => setDownPayment(e.target.value)}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Loan Terms & Incentives */}
        <div className="space-y-4">
          <div>
            <label htmlFor="termMonths" className="block text-sm font-medium text-gray-700 mb-1">
              Loan Term (months)
            </label>
            <select
              id="termMonths"
              value={termMonths}
              onChange={(e) => setTermMonths(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="12">12 months</option>
              <option value="24">24 months</option>
              <option value="36">36 months</option>
              <option value="48">48 months</option>
              <option value="60">60 months</option>
              <option value="72">72 months</option>
              <option value="84">84 months</option>
            </select>
          </div>

          <div>
            <label htmlFor="apr" className="block text-sm font-medium text-gray-700 mb-1">
              APR (%)
            </label>
            <input
              type="number"
              id="apr"
              value={apr}
              onChange={(e) => setApr(e.target.value)}
              step="0.01"
              max="30"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="5.99"
            />
          </div>

          <div>
            <label htmlFor="discounts" className="block text-sm font-medium text-gray-700 mb-1">
              Dealer Discounts
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="discounts"
                value={discounts}
                onChange={(e) => setDiscounts(e.target.value)}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label htmlFor="rebates" className="block text-sm font-medium text-gray-700 mb-1">
              Manufacturer Rebates
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-gray-500">$</span>
              <input
                type="number"
                id="rebates"
                value={rebates}
                onChange={(e) => setRebates(e.target.value)}
                className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Trade-In Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
        <div>
          <label htmlFor="tradeInValue" className="block text-sm font-medium text-gray-700 mb-1">
            Trade-In Value
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              id="tradeInValue"
              value={tradeInValue}
              onChange={(e) => setTradeInValue(e.target.value)}
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <label htmlFor="tradeInPayoff" className="block text-sm font-medium text-gray-700 mb-1">
            Trade-In Payoff Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">$</span>
            <input
              type="number"
              id="tradeInPayoff"
              value={tradeInPayoff}
              onChange={(e) => setTradeInPayoff(e.target.value)}
              className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0"
            />
          </div>
        </div>
      </div>

      {/* Calculate Button */}
      <div className="flex justify-end">
        <button
          onClick={handleCalculate}
          disabled={calculateFinance.isFetching}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {calculateFinance.isFetching ? "Calculating..." : "Calculate Finance Estimate"}
        </button>
      </div>

      {/* Results */}
      {calculateFinance.data && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Estimate Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Monthly Payment:</p>
              <p className="text-2xl font-bold text-green-700">
                ${calculateFinance.data.outputs.monthlyPayment?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Due at Signing:</p>
              <p className="text-xl font-semibold">
                ${calculateFinance.data.outputs.dueAtSigning.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Interest:</p>
              <p className="text-xl font-semibold">
                ${calculateFinance.data.outputs.totalInterestPaid?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Out-the-Door:</p>
              <p className="text-lg font-semibold">
                ${calculateFinance.data.outputs.outTheDoorTotal.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Cost:</p>
              <p className="text-lg font-semibold">
                ${calculateFinance.data.outputs.totalCostOverTerm.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500">{calculateFinance.data.disclaimer}</p>
        </div>
      )}

      {calculateFinance.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{calculateFinance.error.message}</p>
        </div>
      )}
    </div>
  );
}
