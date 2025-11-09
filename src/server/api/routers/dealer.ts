import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  createTRPCRouter,
  publicProcedure,
  protectedProcedure,
} from '~/server/api/trpc';
import {
  DealerLeadInputSchema,
} from '~/server/api/schemas';

export const dealerRouter = createTRPCRouter({
  /**
   * Find nearby dealers based on ZIP code
   * NOTE: This is a demonstration endpoint that returns mock data.
   * To implement: Set up GOOGLE_MAPS_API_KEY in .env and seed dealers collection.
   */
  findNearby: publicProcedure
    .input(
      z.object({
        zipCode: z.string().regex(/^\d{5}$/, 'Invalid ZIP code format'),
        radius: z.number().min(1).max(100).default(25),
        limit: z.number().int().min(1).max(20).default(10),
      })
    )
    .query(async ({ input }) => {
      const { zipCode } = input;

      // Return mock data for demonstration
      const mockDealers = [
        {
          id: 'demo-toyota-dealer-1',
          name: `Toyota Dealer near ${zipCode}`,
          address: {
            street: '123 Main Street',
            city: 'Your City',
            state: 'TX',
            zipCode: zipCode,
          },
          coordinates: { lat: 0, lng: 0 },
          phone: '2145551234',
          website: 'https://example.com',
          distance: 5.2,
          hours: {
            Monday: '9AM-7PM',
            Tuesday: '9AM-7PM',
            Wednesday: '9AM-7PM',
            Thursday: '9AM-7PM',
            Friday: '9AM-7PM',
            Saturday: '9AM-6PM',
            Sunday: 'Closed',
          },
          services: ['sales', 'service', 'parts'],
        },
      ];

      return { dealers: mockDealers };
    }),

  /**
   * Submit a dealer contact request (lead)
   * NOTE: This is a demonstration endpoint that simulates lead submission.
   * To implement: Ensure authentication is set up and Firestore is configured.
   */
  submitLead: protectedProcedure
    .input(DealerLeadInputSchema)
    .mutation(async ({ input }) => {
      // Validate consent is literal true
      if (input.consent !== true) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Explicit consent is required to submit a dealer lead',
        });
      }

      // Return mock success response for demonstration
      const mockLeadId = `demo-lead-${Date.now()}`;

      console.log('[DEMO] Would submit dealer lead:', {
        leadId: mockLeadId,
        vehicleIds: input.vehicleIds,
        contactInfo: input.contactInfo,
        zipCode: input.zipCode,
      });

      return {
        leadId: mockLeadId,
        submittedAt: new Date(),
        confirmationMessage:
          'Demo Mode: This is a simulated submission. In production, a local Toyota dealer would contact you within 24-48 hours via your preferred contact method.',
      };
    }),

  /**
   * Get all dealer leads for the authenticated user
   * NOTE: This is a demonstration endpoint that returns mock data.
   * To implement: Ensure authentication is set up and Firestore is configured.
   */
  getMyLeads: protectedProcedure.query(async () => {
    // Return mock data for demonstration
    const mockLeads = [
      {
        id: 'demo-lead-1',
        vehicleIds: ['camry-2024', 'rav4-2024'],
        contactInfo: {
          name: 'Demo User',
          email: 'demo@example.com',
          phone: '5555551234',
          preferredContact: 'email',
        },
        zipCode: '75080',
        message: 'This is a demo lead. No actual submission was made.',
        status: 'new' as const,
        createdAt: new Date(),
      },
    ];

    return { leads: mockLeads };
  }),

  /**
   * Get details for a specific dealer
   * NOTE: This is a demonstration endpoint that returns mock data.
   * To implement: Seed dealers collection with actual dealer data.
   */
  getById: publicProcedure
    .input(
      z.object({
        dealerId: z.string().min(1),
      })
    )
    .query(async ({ input }) => {
      const { dealerId } = input;

      // Return mock dealer data for demonstration
      return {
        id: dealerId,
        name: `Toyota Dealer ${dealerId}`,
        address: {
          street: '123 Demo Street',
          city: 'Demo City',
          state: 'TX',
          zipCode: '75080',
        },
        coordinates: { lat: 0, lng: 0 },
        phone: '2145551234',
        website: 'https://example.com',
        hours: {
          Monday: '9AM-7PM',
          Tuesday: '9AM-7PM',
          Wednesday: '9AM-7PM',
          Thursday: '9AM-7PM',
          Friday: '9AM-7PM',
          Saturday: '9AM-6PM',
          Sunday: 'Closed',
        },
        services: ['sales', 'service', 'parts'],
        reviews: {
          rating: 4.5,
          count: 100,
          source: 'Google',
        },
      };
    }),
});
