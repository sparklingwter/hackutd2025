import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Link>
          </div>

          <h1 className="mb-4 text-4xl font-bold">Terms of Service</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          {/* Content */}
          <div className="prose prose-slate mt-8 dark:prose-invert max-w-none">
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Notice:</strong> This is a placeholder terms of service. Before launching this application in production, you must create comprehensive terms of service drafted or reviewed by legal counsel.
              </p>
            </div>

            <h2>Agreement to Terms</h2>
            <p>
              By accessing and using Toyota Vehicle Finder, you accept and agree to be bound by these Terms of Service and our Privacy Policy.
            </p>

            <h2>Description of Service</h2>
            <p>
              Toyota Vehicle Finder is an AI-powered vehicle discovery and comparison platform that helps users:
            </p>
            <ul>
              <li>Explore Toyota vehicle options based on their preferences</li>
              <li>Compare vehicles side-by-side</li>
              <li>Calculate payment estimates</li>
              <li>Connect with local Toyota dealers</li>
            </ul>

            <h2>Important Disclaimers</h2>
            
            <h3>Not an Official Toyota Service</h3>
            <p>
              This service is an independent platform and is not affiliated with, endorsed by, or sponsored by Toyota Motor Corporation or its affiliates.
            </p>

            <h3>AI-Generated Content</h3>
            <p>
              Vehicle recommendations and explanations are generated using artificial intelligence (Google Gemini). While we strive for accuracy, AI-generated content may contain errors or omissions. Always verify critical information independently.
            </p>

            <h3>Pricing and Availability</h3>
            <p>
              All pricing information is approximate and based on MSRP. Actual prices, incentives, and vehicle availability vary by dealer and location. Contact dealers directly for current offers.
            </p>

            <h3>Payment Estimates</h3>
            <p>
              Payment estimates are for illustrative purposes only and do not constitute a financing offer. Actual financing terms depend on creditworthiness, down payment, location, and dealer participation.
            </p>

            <h2>User Responsibilities</h2>
            <p>You agree to:</p>
            <ul>
              <li>Provide accurate information when using our service</li>
              <li>Not misuse or attempt to disrupt our service</li>
              <li>Not use our service for any unlawful purpose</li>
              <li>Verify all important information with dealers before making decisions</li>
            </ul>

            <h2>Dealer Connections</h2>
            <p>
              When you submit a contact request to dealers:
            </p>
            <ul>
              <li>You authorize us to share your information with selected dealers</li>
              <li>Dealers are independent businesses responsible for their own practices</li>
              <li>We are not responsible for dealer communications or sales practices</li>
            </ul>

            <h2>Intellectual Property</h2>
            <p>
              All content on this platform, except for third-party data, is our property. You may not copy, reproduce, or distribute our content without permission.
            </p>

            <h2>Limitation of Liability</h2>
            <p>
              TO THE FULLEST EXTENT PERMITTED BY LAW:
            </p>
            <ul>
              <li>This service is provided &quot;as is&quot; without warranties of any kind</li>
              <li>We are not liable for any indirect, incidental, or consequential damages</li>
              <li>We are not responsible for errors, interruptions, or data loss</li>
              <li>Our total liability shall not exceed $100</li>
            </ul>

            <h2>Indemnification</h2>
            <p>
              You agree to indemnify and hold us harmless from any claims arising from your use of our service or violation of these terms.
            </p>

            <h2>Rate Limiting</h2>
            <p>
              We implement rate limiting to ensure fair use. Excessive requests may result in temporary or permanent restrictions.
            </p>

            <h2>Changes to Service</h2>
            <p>
              We reserve the right to modify or discontinue our service at any time without notice.
            </p>

            <h2>Changes to Terms</h2>
            <p>
              We may update these terms from time to time. Continued use of our service constitutes acceptance of changes.
            </p>

            <h2>Governing Law</h2>
            <p>
              These terms are governed by the laws of [Your Jurisdiction], without regard to conflict of law principles.
            </p>

            <h2>Dispute Resolution</h2>
            <p>
              Any disputes shall be resolved through binding arbitration in accordance with [Arbitration Rules], except where prohibited by law.
            </p>

            <h2>Severability</h2>
            <p>
              If any provision of these terms is found to be unenforceable, the remaining provisions shall remain in full effect.
            </p>

            <h2>Contact Information</h2>
            <p>
              For questions about these terms, please contact:
            </p>
            <p>
              <strong>Email:</strong> legal@example.com<br />
              <strong>Address:</strong> [Your Address Here]
            </p>
          </div>

          {/* Actions */}
          <div className="mt-12 flex gap-4 border-t pt-8">
            <Button variant="outline">
              <Link href="/">Return to Home</Link>
            </Button>
            <Button variant="outline">
              <Link href="/privacy">View Privacy Policy</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
