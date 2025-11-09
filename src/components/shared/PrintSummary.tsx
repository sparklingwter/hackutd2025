"use client";

/**
 * T040 [P] [US4]: Print-friendly summary template
 * 
 * Provides a clean, print-optimized layout for comparisons and estimates.
 */

import type { ReactNode } from "react";
import { formatCurrency, formatDate } from "~/lib/exportPdf";

interface PrintSummaryProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function PrintSummary({
  title,
  subtitle,
  children,
  footer,
}: PrintSummaryProps) {
  return (
    <div
      id="print-summary"
      className="bg-white p-8 max-w-5xl mx-auto print:p-4"
      style={{
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Header */}
      <div className="border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 print:text-2xl">
          {title}
        </h1>
        {subtitle && (
          <p className="text-gray-600 mt-2 print:text-sm">{subtitle}</p>
        )}
        <p className="text-sm text-gray-500 mt-2">
          Generated on {formatDate(new Date())}
        </p>
      </div>

      {/* Content */}
      <div className="space-y-6 print:space-y-4">{children}</div>

      {/* Footer */}
      {footer && (
        <div className="border-t-2 border-gray-300 pt-4 mt-8 print:mt-6">
          {footer}
        </div>
      )}

      {/* Print Disclaimer */}
      <div className="mt-8 p-4 bg-gray-100 border border-gray-300 rounded print:bg-white print:border-gray-400">
        <p className="text-xs text-gray-600 text-center">
          This is an estimate only. Actual prices, financing terms, and total costs may vary.
          Please verify all information with your local Toyota dealer.
        </p>
      </div>
    </div>
  );
}

interface PrintSectionProps {
  title: string;
  children: ReactNode;
}

export function PrintSection({ title, children }: PrintSectionProps) {
  return (
    <div className="mb-6 print:mb-4">
      <h2 className="text-xl font-semibold text-gray-800 mb-3 print:text-lg">
        {title}
      </h2>
      <div>{children}</div>
    </div>
  );
}

interface PrintTableProps {
  headers: string[];
  rows: Array<Array<string | number>>;
}

export function PrintTable({ headers, rows }: PrintTableProps) {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b-2 border-gray-800">
          {headers.map((header, index) => (
            <th
              key={index}
              className="text-left py-2 px-3 font-semibold text-gray-900 print:py-1"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className="border-b border-gray-300"
          >
            {row.map((cell, cellIndex) => (
              <td
                key={cellIndex}
                className="py-2 px-3 text-gray-700 print:py-1 print:text-sm"
              >
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

interface PrintKeyValueProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

export function PrintKeyValue({ label, value, highlight }: PrintKeyValueProps) {
  return (
    <div
      className={`flex justify-between py-2 px-3 ${
        highlight ? "bg-blue-50 font-semibold" : "bg-gray-50"
      } print:py-1`}
    >
      <span className="text-gray-700">{label}</span>
      <span className={highlight ? "text-blue-700" : "text-gray-900"}>
        {value}
      </span>
    </div>
  );
}

// Export utility functions
export { formatCurrency, formatDate };
