'use client';

import { MapPin, Phone, ExternalLink, Clock } from 'lucide-react';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

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

interface DealerCardProps {
  dealer: Dealer;
}

export function DealerCard({ dealer }: DealerCardProps) {
  const formattedPhone = dealer.phone.replace(
    /(\d{3})(\d{3})(\d{4})/,
    '($1) $2-$3'
  );

  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${dealer.address.street}, ${dealer.address.city}, ${dealer.address.state} ${dealer.address.zipCode}`
  )}`;

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayHours = dealer.hours?.[today];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{dealer.name}</CardTitle>
        <CardDescription className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {dealer.distance} miles away
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm">
          <div className="flex gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p>{dealer.address.street}</p>
              <p>
                {dealer.address.city}, {dealer.address.state}{' '}
                {dealer.address.zipCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a
              href={`tel:${dealer.phone}`}
              className="hover:underline text-blue-600"
            >
              {formattedPhone}
            </a>
          </div>

          {todayHours && (
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span>
                {today}: {todayHours}
              </span>
            </div>
          )}

          {dealer.services && dealer.services.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {dealer.services.map((service) => (
                <span
                  key={service}
                  className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs capitalize"
                >
                  {service}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button asChild className="flex-1">
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2"
            >
              <MapPin className="h-4 w-4" />
              Get Directions
            </a>
          </Button>
          {dealer.website && (
            <Button asChild variant="outline">
              <a
                href={dealer.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Website
              </a>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
