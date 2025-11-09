"use client";

/**
 * T041 [US4]: Shared compare set view page
 * 
 * Public view of a saved comparison set accessible via shareable link.
 */

import { useSearchParams } from "next/navigation";
import { Share2, Download, Printer } from "lucide-react";
import { useState } from "react";
import {
  PrintSummary,
  PrintSection,
  PrintTable,
} from "~/components/shared/PrintSummary";
import { exportToPDF, copyShareableLinkToClipboard } from "~/lib/exportPdf";

export default function SharedCompareSetPage() {
  const searchParams = useSearchParams();
  const vehicleIds = searchParams.get("ids")?.split(",") ?? [];
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareId = searchParams.get("shareId") ?? vehicleIds.join("-");
    const success = await copyShareableLinkToClipboard("compare", shareId);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePrint = () => {
    exportToPDF("print-summary", `Toyota-Comparison-${Date.now()}`);
  };

  const handleDownload = () => {
    // Download comparison data as JSON
    const data = {
      vehicleIds,
      createdAt: new Date().toISOString(),
      type: "comparison",
    };
    
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.href = url;
    link.download = `toyota-comparison-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  if (vehicleIds.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            No Vehicles to Compare
          </h1>
          <p className="text-gray-600 mb-6">
            This comparison link appears to be invalid or empty. Please check the URL and try again.
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Action Bar */}
        <div className="mb-6 flex items-center justify-between bg-white rounded-lg shadow p-4">
          <h1 className="text-xl font-semibold text-gray-900">
            Vehicle Comparison
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

        {/* Comparison Content */}
        <PrintSummary
          title="Toyota Vehicle Comparison"
          subtitle={`Comparing ${vehicleIds.length} vehicles`}
          footer={
            <p className="text-sm text-gray-600">
              Visit your local Toyota dealer for the most accurate pricing and availability information.
            </p>
          }
        >
          <PrintSection title="Vehicles">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {vehicleIds.map((vehicleId) => (
                <div
                  key={vehicleId}
                  className="border border-gray-300 rounded-lg p-4"
                >
                  <h3 className="font-semibold text-lg mb-2">{vehicleId}</h3>
                  <p className="text-sm text-gray-600">
                    Loading vehicle details...
                  </p>
                </div>
              ))}
            </div>
          </PrintSection>

          <PrintSection title="Specifications">
            <PrintTable
              headers={["Feature", ...vehicleIds]}
              rows={[
                ["Model", ...vehicleIds],
                ["Year", ...vehicleIds.map(() => "2024")],
                ["Price", ...vehicleIds.map(() => "Loading...")],
                ["Body Style", ...vehicleIds.map(() => "Loading...")],
                ["Fuel Type", ...vehicleIds.map(() => "Loading...")],
              ]}
            />
          </PrintSection>
        </PrintSummary>
      </div>
    </div>
  );
}
