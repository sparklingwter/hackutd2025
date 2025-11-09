'use client';

import { useState } from 'react';
import { Button } from '~/components/ui/button';
import { Input } from '~/components/ui/input';
import { Search } from 'lucide-react';

interface ZipSearchProps {
  onSearch: (zipCode: string) => void;
  isLoading?: boolean;
}

export function ZipSearch({ onSearch, isLoading = false }: ZipSearchProps) {
  const [zipCode, setZipCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate ZIP code format
    if (!/^\d{5}$/.test(zipCode)) {
      setError('Please enter a valid 5-digit ZIP code');
      return;
    }

    onSearch(zipCode);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md">
      <div className="flex flex-col gap-2">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Enter ZIP code (e.g., 75080)"
              value={zipCode}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setZipCode(e.target.value.replace(/\D/g, '').slice(0, 5));
                setError('');
              }}
              maxLength={5}
              className="pr-10"
              disabled={isLoading}
              aria-label="ZIP code"
              aria-describedby={error ? 'zip-error' : undefined}
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button type="submit" disabled={isLoading || zipCode.length !== 5}>
            {isLoading ? 'Searching...' : 'Find Dealers'}
          </Button>
        </div>
        {error && (
          <p id="zip-error" className="text-sm text-destructive">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
