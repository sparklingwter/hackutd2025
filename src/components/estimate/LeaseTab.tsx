"use client";

import { useState } from "react";
import { api } from "~/trpc/react";

/**
 * T044: Lease Tab Form Component
 * 
 * Form for lease estimate with residual value, money factor, and mileage cap
 */
export function LeaseTab() {
  const [vehicleId, setVehicleId] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [vehiclePrice, setVehiclePrice] = useState("");
  const [discounts, setDiscounts] = useState("");
  const [rebates, setRebates] = useState("");
  const [downPayment, setDownPayment] = useState("");
  const [tradeInValue, setTradeInValue] = useState("");
  const [tradeInPayoff, setTradeInPayoff] = useState("");
  const [termMonths, setTermMonths] = useState("36");
  const [residualPercent, setResidualPercent] = useState("60");
  const [moneyFactor, setMoneyFactor] = useState("0.00125");
  const [mileageCap, setMileageCap] = useState("12000");

  // Calculate lease estimate mutation
  const calculateLease = api.estimate.calculateLease.useQuery(
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
        termMonths: parseInt(termMonths) || 36,
        residualPercent: parseFloat(residualPercent) || 60,
        moneyFactor: parseFloat(moneyFactor) || 0.00125,
        mileageCap: parseInt(mileageCap) || 12000,
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
    void calculateLease.refetch();
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

        {/* Lease Terms */}
        <div className="space-y-4">
          <div>
            <label htmlFor="termMonths" className="block text-sm font-medium text-gray-700 mb-1">
              Lease Term (months)
            </label>
            <select
              id="termMonths"
              value={termMonths}
              onChange={(e) => setTermMonths(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="24">24 months</option>
              <option value="36">36 months</option>
              <option value="48">48 months</option>
            </select>
          </div>

          <div>
            <label htmlFor="residualPercent" className="block text-sm font-medium text-gray-700 mb-1">
              Residual Value (%)
            </label>
            <input
              type="number"
              id="residualPercent"
              value={residualPercent}
              onChange={(e) => setResidualPercent(e.target.value)}
              step="0.1"
              min="0"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="60"
            />
            <p className="text-xs text-gray-500 mt-1">Typical range: 50-70%</p>
          </div>

          <div>
            <label htmlFor="moneyFactor" className="block text-sm font-medium text-gray-700 mb-1">
              Money Factor
            </label>
            <input
              type="number"
              id="moneyFactor"
              value={moneyFactor}
              onChange={(e) => setMoneyFactor(e.target.value)}
              step="0.00001"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00125"
            />
            <p className="text-xs text-gray-500 mt-1">Multiply by 2400 for equivalent APR</p>
          </div>

          <div>
            <label htmlFor="mileageCap" className="block text-sm font-medium text-gray-700 mb-1">
              Annual Mileage Cap
            </label>
            <select
              id="mileageCap"
              value={mileageCap}
              onChange={(e) => setMileageCap(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10000">10,000 miles/year</option>
              <option value="12000">12,000 miles/year</option>
              <option value="15000">15,000 miles/year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incentives */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
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

      {/* Calculate Button */}
      <div className="flex justify-end">
        <button
          onClick={handleCalculate}
          disabled={calculateLease.isFetching}
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
        >
          {calculateLease.isFetching ? "Calculating..." : "Calculate Lease Estimate"}
        </button>
      </div>

      {/* Results */}
      {calculateLease.data && (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Lease Estimate Results</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Monthly Payment:</p>
              <p className="text-2xl font-bold text-green-700">
                ${calculateLease.data.outputs.monthlyPayment?.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Due at Signing:</p>
              <p className="text-xl font-semibold">
                ${calculateLease.data.outputs.dueAtSigning.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Cost:</p>
              <p className="text-xl font-semibold">
                ${calculateLease.data.outputs.totalCostOverTerm.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Taxes:</p>
              <p className="text-lg font-semibold">
                ${calculateLease.data.outputs.totalTaxes.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Fees:</p>
              <p className="text-lg font-semibold">
                ${calculateLease.data.outputs.totalFees.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-500">{calculateLease.data.disclaimer}</p>
        </div>
      )}

      {calculateLease.error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{calculateLease.error.message}</p>
        </div>
      )}
    </div>
  );
}
