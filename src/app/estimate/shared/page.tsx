"use client";

/**
 * T042 [P] [US4]: Shared estimate view page
 * 
 * Public view of a saved estimate accessible via shareable link.
 */

import { useSearchParams } from "next/navigation";
import { Share2, Download, Printer } from "lucide-react";
import { useState } from "react";
import {
  PrintSummary,
  PrintSection,
  PrintKeyValue,
  formatCurrency,
} from "~/components/shared/PrintSummary";
import { exportToPDF, copyShareableLinkToClipboard } from "~/lib/exportPdf";

export default function SharedEstimatePage() {
  const searchParams = useSearchParams();
  const vehicleId = searchParams.get("vehicleId") ?? "";
  const estimateId = searchParams.get("estimateId") ?? "";
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const success = await copyShareableLinkToClipboard("estimate", estimateId);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    exportToPDF("print-summary", `Toyota-Estimate-${vehicleId}-${Date.now()}`);
  };

  const handleDownload = () => {
    // Download estimate data as JSON
    const data = {
      vehicleId,
      estimateId,
      createdAt: new Date().toISOString(),
      type: "estimate",
    };
    
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `toyota-estimate-${vehicleId}-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  if (!vehicleId || !estimateId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Estimate Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            This estimate link appears to be invalid or empty. Please check the URL and try again.
          </p>
          <a
            href="/discovery/budget"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start New Search
          </a>
        </div>
      </div>
    );
  }

  // Mock estimate data (in real app, fetch from API)
  const mockEstimate = {
    vehicleId,
    type: "finance" as const,
    monthlyPayment: 450,
    downPayment: 5000,
    termMonths: 60,
    apr: 5.9,
    outTheDoorTotal: 32500,
    totalInterestPaid: 4500,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Action Bar */}
        <div className="mb-6 flex items-center justify-between bg-white rounded-lg shadow p-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Cost Estimate
          </h1>
          <div className="flex gap-2">
            <button
              onClick={handleShare}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Share2 size={16} />
              {copied ? "Copied!" : "Share"}
            </button>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
            >
              <Printer size={16} />
              Print
            </button>
          </div>
        </div>

        {/* Estimate Content */}
        <PrintSummary
          title={`Cost Estimate: ${vehicleId}`}
          subtitle={`${mockEstimate.type.toUpperCase()} Estimate`}
          footer={
            <div className="space-y-2">
              <p className="text-sm text-gray-600">
                <strong>Disclaimer:</strong> This estimate is for informational purposes only.
                Actual financing terms, pricing, taxes, and fees may vary based on your location,
                credit score, and dealer policies.
              </p>
              <p className="text-sm text-gray-600">
                Visit your local Toyota dealer for the most accurate pricing and financing options.
              </p>
            </div>
          }
        >
          <PrintSection title="Vehicle Information">
            <div className="space-y-1">
              <PrintKeyValue label="Vehicle" value={vehicleId} />
              <PrintKeyValue label="Estimate Type" value={mockEstimate.type.toUpperCase()} />
            </div>
          </PrintSection>

          <PrintSection title="Payment Summary">
            <div className="space-y-1">
              <PrintKeyValue
                label="Monthly Payment"
                value={formatCurrency(mockEstimate.monthlyPayment)}
                highlight
              />
              <PrintKeyValue
                label="Down Payment"
                value={formatCurrency(mockEstimate.downPayment)}
              />
              <PrintKeyValue
                label="Term Length"
                value={`${mockEstimate.termMonths} months`}
              />
              <PrintKeyValue
                label="APR"
                value={`${mockEstimate.apr}%`}
              />
            </div>
          </PrintSection>

          <PrintSection title="Total Costs">
            <div className="space-y-1">
              <PrintKeyValue
                label="Out-the-Door Total"
                value={formatCurrency(mockEstimate.outTheDoorTotal)}
                highlight
              />
              <PrintKeyValue
                label="Total Interest Paid"
                value={formatCurrency(mockEstimate.totalInterestPaid)}
              />
            </div>
          </PrintSection>
        </PrintSummary>
      </div>
    </div>
  );
}
