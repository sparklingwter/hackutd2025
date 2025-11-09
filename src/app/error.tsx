'use client';

import { useEffect } from 'react';
import { Button } from '~/components/ui/button';
import { AlertTriangle } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global error boundary caught:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <AlertTriangle className="h-16 w-16 text-destructive" />
        </div>
        
        <h1 className="mb-4 text-3xl font-bold text-foreground">
          Something went wrong
        </h1>
        
        <p className="mb-6 text-muted-foreground">
          We encountered an unexpected error. Don&apos;t worry, your data is safe.
        </p>
        
        {error.digest && (
          <p className="mb-4 text-sm text-muted-foreground">
            Error ID: {error.digest}
          </p>
        )}
        
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button
            onClick={reset}
            variant="default"
            size="lg"
          >
            Try again
          </Button>
          
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            size="lg"
          >
            Go to homepage
          </Button>
        </div>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-8 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-left">
            <p className="mb-2 text-sm font-semibold text-destructive">
              Development Error Details:
            </p>
            <pre className="overflow-auto text-xs text-muted-foreground">
              {error.message}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
