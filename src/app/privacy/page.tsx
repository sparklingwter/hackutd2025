import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function PrivacyPolicyPage() {
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

          <h1 className="mb-4 text-4xl font-bold">Privacy Policy</h1>
          <p className="text-muted-foreground">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          {/* Content */}
          <div className="prose prose-slate mt-8 dark:prose-invert max-w-none">
            <div className="rounded-lg border border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-800 dark:bg-yellow-900/20">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Notice:</strong> This is a placeholder privacy policy. Before launching this application in production, you must create a comprehensive privacy policy that complies with applicable privacy laws (GDPR, CCPA, etc.).
              </p>
            </div>

            <h2>Overview</h2>
            <p>
              This Privacy Policy describes how Toyota Vehicle Finder (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) collects, uses, and protects your information when you use our vehicle discovery platform.
            </p>

            <h2>Information We Collect</h2>
            <h3>Information Stored Locally</h3>
            <ul>
              <li>Vehicle preferences and discovery journey responses</li>
              <li>Saved vehicles, comparisons, and estimates</li>
              <li>Filter and search preferences</li>
            </ul>
            <p>
              <strong>Important:</strong> This information is stored only in your browser&apos;s local storage. We do not transmit or store this data on our servers.
            </p>

            <h3>Information You Provide</h3>
            <ul>
              <li>Contact information when submitting dealer lead forms (name, email, phone number)</li>
              <li>ZIP code for location-based services</li>
              <li>Voice recordings (processed and immediately discarded)</li>
            </ul>

            <h3>Automatically Collected Information</h3>
            <ul>
              <li>Usage statistics and analytics</li>
              <li>Device and browser information</li>
              <li>IP address (for rate limiting and security)</li>
            </ul>

            <h2>How We Use Your Information</h2>
            <ul>
              <li>To provide vehicle recommendations and comparisons</li>
              <li>To calculate payment estimates based on your inputs</li>
              <li>To connect you with local Toyota dealers</li>
              <li>To improve our service and user experience</li>
              <li>To prevent fraud and abuse</li>
            </ul>

            <h2>Third-Party Services</h2>
            <p>We use the following third-party services:</p>
            <ul>
              <li><strong>Google Gemini AI:</strong> For generating vehicle recommendations and explanations</li>
              <li><strong>ElevenLabs:</strong> For voice synthesis and speech-to-text features</li>
              <li><strong>Firebase/Firestore:</strong> For vehicle data storage</li>
            </ul>
            <p>
              These services may collect information as described in their respective privacy policies.
            </p>

            <h2>Data Sharing</h2>
            <p>We do not sell your personal information. We may share information:</p>
            <ul>
              <li>With Toyota dealers you choose to contact</li>
              <li>With service providers who assist in operating our platform</li>
              <li>When required by law or to protect our rights</li>
            </ul>

            <h2>Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your information stored in your browser (via browser developer tools)</li>
              <li>Delete your local data (clear browser storage)</li>
              <li>Opt out of analytics and tracking</li>
              <li>Request deletion of information submitted to dealers</li>
            </ul>

            <h2>Data Security</h2>
            <p>
              We implement reasonable security measures to protect your information. However, no method of transmission over the Internet is 100% secure.
            </p>

            <h2>Children&apos;s Privacy</h2>
            <p>
              Our service is not intended for children under 13. We do not knowingly collect information from children.
            </p>

            <h2>Changes to This Policy</h2>
            <p>
              We may update this policy from time to time. Continued use of our service constitutes acceptance of any changes.
            </p>

            <h2>Contact Us</h2>
            <p>
              For questions about this privacy policy or our data practices, please contact:
            </p>
            <p>
              <strong>Email:</strong> privacy@example.com<br />
              <strong>Address:</strong> [Your Address Here]
            </p>
          </div>

          {/* Actions */}
          <div className="mt-12 flex gap-4 border-t pt-8">
            <Button variant="outline">
              <Link href="/">Return to Home</Link>
            </Button>
            <Button variant="outline">
              <Link href="/terms">View Terms of Service</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
