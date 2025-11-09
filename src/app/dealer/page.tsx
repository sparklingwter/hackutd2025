'use client';

import { useState } from 'react';
import { api } from '~/trpc/react';
import { ZipSearch } from '~/components/dealer/ZipSearch';
import { DealerList } from '~/components/dealer/DealerList';

export default function DealerFinderPage() {
  const [zipCode, setZipCode] = useState('');
  const [searchZipCode, setSearchZipCode] = useState('');

  const { data, isLoading, error } = api.dealer.findNearby.useQuery(
    {
      zipCode: searchZipCode,
      radius: 25,
      limit: 10,
    },
    {
      enabled: !!searchZipCode, // Only run query when ZIP code is set
    }
  );

  const handleSearch = (zip: string) => {
    setZipCode(zip);
    setSearchZipCode(zip);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-8">
        {/* Demo Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
          <p className="text-sm text-blue-900">
            <strong>Demo Mode:</strong> This feature displays sample dealer data. To enable full functionality:
            <br />
            1. Add GOOGLE_MAPS_API_KEY to .env file
            <br />
            2. Run seed script: <code className="bg-blue-100 px-2 py-0.5 rounded">npm run seed-dealers</code>
          </p>
        </div>

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">
            Find Your Local Toyota Dealer
          </h1>
          <p className="text-muted-foreground text-lg">
            Connect with nearby dealerships to schedule test drives and get
            personalized assistance
          </p>
        </div>

        {/* Search Form */}
        <div className="flex justify-center">
          <ZipSearch onSearch={handleSearch} isLoading={isLoading} />
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Searching for dealers...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-destructive">{error.message}</p>
          </div>
        )}

        {/* Results */}
        {!isLoading && !error && data && (
          <DealerList dealers={data.dealers} searchZipCode={zipCode} />
        )}
      </div>
    </div>
  );
}
