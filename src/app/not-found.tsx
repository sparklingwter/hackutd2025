import Link from 'next/link';
import { Button } from '~/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <div className="mx-auto max-w-md text-center">
        <h1 className="mb-4 text-9xl font-bold text-primary">404</h1>
        
        <h2 className="mb-4 text-3xl font-bold text-foreground">
          Page not found
        </h2>
        
        <p className="mb-8 text-muted-foreground">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link href="/">
            <Button size="lg">
              <Home className="mr-2 h-4 w-4" />
              Go to homepage
            </Button>
          </Link>
          
          <Link href="/recommendations">
            <Button variant="outline" size="lg">
              <Search className="mr-2 h-4 w-4" />
              Browse vehicles
            </Button>
          </Link>
        </div>
        
        <div className="mt-12 text-sm text-muted-foreground">
          <p>Looking for something specific?</p>
          <div className="mt-4 flex flex-col gap-2">
            <Link 
              href="/discovery/budget" 
              className="text-primary hover:underline"
            >
              Start vehicle discovery
            </Link>
            <Link 
              href="/compare" 
              className="text-primary hover:underline"
            >
              Compare vehicles
            </Link>
            <Link 
              href="/dealer" 
              className="text-primary hover:underline"
            >
              Find dealers
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
