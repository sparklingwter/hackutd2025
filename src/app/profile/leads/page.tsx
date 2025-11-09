'use client';

import { api } from '~/trpc/react';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { Button } from '~/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '~/components/ui/card';

export default function MyLeadsPage() {
  const { data, isLoading, error } = api.dealer.getMyLeads.useQuery();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <p className="text-center text-muted-foreground">Loading your leads...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <p className="text-center text-destructive">{error.message}</p>
      </div>
    );
  }

  const leads = data?.leads ?? [];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-6">
        {/* Demo Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Demo Mode:</strong> Displaying sample lead data. To enable full functionality, ensure authentication and Firestore are configured.
          </p>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            My Dealer Contacts
          </h1>
          <p className="text-muted-foreground mt-2">
            Track your dealer contact requests and their status
          </p>
        </div>

        {/* Empty State */}
        {leads.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-muted-foreground mb-4">
                You haven't contacted any dealers yet
              </p>
              <Button asChild>
                <Link href="/dealer">Find Dealers</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Leads List */}
        {leads.length > 0 && (
          <div className="space-y-4">
            {leads.map((lead) => (
              <Card key={lead.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {lead.vehicleIds.length} Vehicle
                        {lead.vehicleIds.length !== 1 ? 's' : ''} Requested
                      </CardTitle>
                      <CardDescription>
                        Submitted{' '}
                        {formatDistanceToNow(lead.createdAt, {
                          addSuffix: true,
                        })}
                      </CardDescription>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        lead.status === 'new'
                          ? 'bg-blue-100 text-blue-800'
                          : lead.status === 'contacted'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {lead.status === 'new'
                        ? 'Pending'
                        : lead.status === 'contacted'
                          ? 'Contacted'
                          : 'Closed'}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Contact Info */}
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Name:</span>{' '}
                      {lead.contactInfo.name}
                    </p>
                    <p>
                      <span className="font-medium">Email:</span>{' '}
                      {lead.contactInfo.email}
                    </p>
                    <p>
                      <span className="font-medium">Phone:</span>{' '}
                      {lead.contactInfo.phone.replace(
                        /(\d{3})(\d{3})(\d{4})/,
                        '($1) $2-$3'
                      )}
                    </p>
                    <p>
                      <span className="font-medium">Preferred Contact:</span>{' '}
                      {lead.contactInfo.preferredContact}
                    </p>
                    <p>
                      <span className="font-medium">ZIP Code:</span>{' '}
                      {lead.zipCode}
                    </p>
                  </div>

                  {/* Message */}
                  {lead.message && (
                    <div className="text-sm">
                      <p className="font-medium">Message:</p>
                      <p className="text-muted-foreground mt-1">
                        {lead.message}
                      </p>
                    </div>
                  )}

                  {/* Vehicle IDs */}
                  <div className="text-sm">
                    <p className="font-medium">Vehicle IDs:</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {lead.vehicleIds.map((vehicleId) => (
                        <span
                          key={vehicleId}
                          className="inline-flex items-center rounded-md bg-secondary px-2 py-1 text-xs"
                        >
                          {vehicleId}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
