"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

/**
 * T042: Cash Tab Form Component
 * 
 * Form for cash purchase estimate with vehicle selection, discounts, trade-in, and ZIP code
 */
export function CashTab() {
  const [vehicleId, setVehicleId] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [vehiclePrice, setVehiclePrice] = useState("");
  const [discounts, setDiscounts] = useState("");
  const [rebates, setRebates] = useState("");
  const [tradeInValue, setTradeInValue] = useState("");
  const [tradeInPayoff, setTradeInPayoff] = useState("");

  // Calculate cash estimate mutation
  const calculateCash = api.estimate.calculateCash.useQuery(
    {
      vehicleId: vehicleId || "placeholder",
      zipCode: zipCode || "00000",
      inputs: {
        vehiclePrice: parseFloat(vehiclePrice) || 0,
        discounts: parseFloat(discounts) || 0,
        rebates: parseFloat(rebates) || 0,
        tradeInValue: parseFloat(tradeInValue) || 0,
        tradeInPayoff: parseFloat(tradeInPayoff) || 0,
      },
    },
    {
      enabled: false, // Don't run automatically
    }
  );

  const handleCalculate = () => {
    if (!vehicleId || !zipCode || !vehiclePrice) {
      alert("Please fill in vehicle ID, ZIP code, and vehicle price");
      return;
    }
    void calculateCash.refetch();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicle Information */}
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
        </div>

        {/* Incentives & Trade-In */}
        <div className="space-y-4">
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
      </div>

      {/* Calculate Button */}
      <div className="flex justify-end">
        <button
          onClick={handleCalculate}
          disabled={calculateCash.isFetching}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {calculateCash.isFetching ? "Calculating..." : "Calculate Cash Estimate"}
        </button>
      </div>

      {/* Results */}
      {calculateCash.data && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Estimate Results</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Out-the-Door Total:</p>
              <p className="text-2xl font-bold text-green-700">
                ${calculateCash.data.outputs.outTheDoorTotal.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Taxes:</p>
              <p className="text-xl font-semibold">
                ${calculateCash.data.outputs.totalTaxes.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Fees:</p>
              <p className="text-xl font-semibold">
                ${calculateCash.data.outputs.totalFees.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500">{calculateCash.data.disclaimer}</p>
        </div>
      )}

      {calculateCash.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{calculateCash.error.message}</p>
        </div>
      )}
    </div>
  );
}
