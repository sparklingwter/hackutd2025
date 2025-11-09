'use client';

import { DealerCard } from './DealerCard';

interface Dealer {
  id: string;
  name: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
  };
  phone: string;
  website?: string;
  distance: number;
  hours?: Record<string, string>;
  services: string[];
}

interface DealerListProps {
  dealers: Dealer[];
  searchZipCode?: string;
}

export function DealerList({ dealers, searchZipCode }: DealerListProps) {
  if (dealers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">
          {searchZipCode
            ? `No Toyota dealers found within 25 miles of ${searchZipCode}`
            : 'Enter your ZIP code above to find nearby Toyota dealers'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Found {dealers.length} dealer{dealers.length !== 1 ? 's' : ''} near{' '}
        {searchZipCode}
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {dealers.map((dealer) => (
          <DealerCard key={dealer.id} dealer={dealer} />
        ))}
      </div>
    </div>
  );
}
