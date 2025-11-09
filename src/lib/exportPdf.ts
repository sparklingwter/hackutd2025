/**
 * T039 [P] [US4]: Export to PDF utility
 * 
 * Provides functionality to export comparison and estimate summaries to PDF.
 * Uses browser print functionality for now (can be enhanced with libraries like jsPDF).
 */

/**
 * Export content to PDF using browser print dialog
 */
export function exportToPDF(elementId: string, filename: string): void {
  const element = document.getElementById(elementId);
  
  if (!element) {
    console.error(`Element with id "${elementId}" not found`);
    return;
  }

  // Store original document title
  const originalTitle = document.title;
  
  // Set document title to desired filename
  document.title = filename;

  // Hide other content temporarily
  const body = document.body;
  const originalContent = body.innerHTML;
  const printContent = element.cloneNode(true) as HTMLElement;

  // Apply print-friendly styles
  printContent.classList.add("print-content");

  // Replace body content with print content
  body.innerHTML = "";
  body.appendChild(printContent);

  // Trigger print dialog
  window.print();

  // Restore original content
  body.innerHTML = originalContent;
  document.title = originalTitle;
}

/**
 * Generate shareable link for comparison or estimate
 */
export function generateShareableLink(
  type: "compare" | "estimate",
  id: string
): string {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  
  if (type === "compare") {
    return `${baseUrl}/compare/shared/${id}`;
  } else {
    return `${baseUrl}/estimate/shared/${id}`;
  }
}

/**
 * Copy shareable link to clipboard
 */
export async function copyShareableLinkToClipboard(
  type: "compare" | "estimate",
  id: string
): Promise<boolean> {
  try {
    const link = generateShareableLink(type, id);
    
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(link);
      return true;
    } else {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = link;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      
      return successful;
    }
  } catch (error) {
    console.error("Failed to copy link to clipboard:", error);
    return false;
  }
}

/**
 * Download content as JSON file
 */
export function downloadAsJSON(data: unknown, filename: string): void {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up URL
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

/**
 * Format currency for display
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}
