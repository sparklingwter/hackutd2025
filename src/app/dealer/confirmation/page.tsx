'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '~/components/ui/button';

export default function ConfirmationPage() {
  const searchParams = useSearchParams();
  const leadId = searchParams.get('leadId');

  return (
    <div className="container mx-auto px-4 py-16 max-w-2xl">
      <div className="text-center space-y-6">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="rounded-full bg-green-100 p-6">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>

        {/* Demo Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-900">
            <strong>Demo Mode:</strong> This is a simulated confirmation. No actual dealer contact was made.
          </p>
        </div>

        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Thank You for Your Interest!
          </h1>
          <p className="text-lg text-muted-foreground">
            Your contact request has been successfully submitted (Demo)
          </p>
        </div>

        {/* Confirmation Details */}
        <div className="bg-muted/50 rounded-lg p-6 space-y-4 text-left">
          <h2 className="font-semibold text-lg">What Happens Next?</h2>
          <ul className="space-y-2 text-muted-foreground">
            <li className="flex gap-2">
              <span className="text-primary font-bold">1.</span>
              <span>
                A local Toyota dealer will review your request within 24 hours
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">2.</span>
              <span>
                They will contact you via your preferred method to discuss your
                vehicle interests
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-primary font-bold">3.</span>
              <span>
                You can schedule a test drive or ask any questions about the
                vehicles
              </span>
            </li>
          </ul>
          {leadId && (
            <p className="text-sm text-muted-foreground mt-4">
              Reference ID: {leadId.slice(0, 8)}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Button asChild size="lg">
            <Link href="/recommendations">View Recommendations</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/profile/leads">View My Leads</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
