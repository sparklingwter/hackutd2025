import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "~/server/api/trpc";
import {
  CashInputsSchema,
  FinanceInputsSchema,
  LeaseInputsSchema,
  FuelEstimateInputSchema,
  EstimateOutputsSchema,
} from "~/server/api/schemas";
import {
  calculateCashEstimate,
  calculateFinanceEstimate,
  calculateLeaseEstimate,
  calculateFuelCost,
} from "~/lib/finance-engine";
import { randomUUID } from "crypto";
import { FieldValue } from "firebase-admin/firestore";

const DISCLAIMER_TEXT =
  "This estimate is informational only and not binding. Actual prices, taxes, fees, and terms may vary. " +
  "Please confirm all details with your local Toyota dealer before purchase.";

export const estimateRouter = createTRPCRouter({
  /**
   * Calculate cash purchase estimate
   */
  calculateCash: publicProcedure
    .input(
      z.object({
        vehicleId: z.string(),
        trimId: z.string().optional(),
        zipCode: z.string().regex(/^\d{5}$/),
        inputs: CashInputsSchema,
      })
    )
    .query(async ({ input, ctx }) => {
      const { vehicleId, trimId, zipCode, inputs } = input;

      // Verify vehicle exists
      const vehicleDoc = await ctx.db.collection("vehicles").doc(vehicleId).get();
      if (!vehicleDoc.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Vehicle ${vehicleId} not found`,
        });
      }

      // Call finance-engine
      const result = calculateCashEstimate({
        vehiclePrice: inputs.vehiclePrice,
        zipCode,
        discounts: inputs.discounts,
        rebates: inputs.rebates,
        tradeInValue: inputs.tradeInValue,
        tradeInPayoff: inputs.tradeInPayoff,
      });

      const estimateId = randomUUID();

      return {
        estimateId,
        vehicleId,
        trimId,
        type: "cash" as const,
        zipCode,
        inputs,
        outputs: {
          monthlyPayment: null,
          dueAtSigning: result.amountDue,
          totalTaxes: result.salesTax,
          totalFees: result.totalFees,
          outTheDoorTotal: result.outTheDoorTotal,
          totalCostOverTerm: result.outTheDoorTotal,
          totalInterestPaid: null,
        },
        taxBreakdown: {
          salesTax: result.salesTax,
          registrationFee: result.registrationFee,
          titleFee: 0,
          documentFee: result.docFee,
          stateFees: 0,
        },
        disclaimer: DISCLAIMER_TEXT,
        calculatedAt: new Date(),
      };
    }),

  /**
   * Calculate finance estimate
   */
  calculateFinance: publicProcedure
    .input(
      z.object({
        vehicleId: z.string(),
        trimId: z.string().optional(),
        zipCode: z.string().regex(/^\d{5}$/),
        inputs: FinanceInputsSchema,
      })
    )
    .query(async ({ input, ctx }) => {
      const { vehicleId, trimId, zipCode, inputs } = input;

      // Verify vehicle exists
      const vehicleDoc = await ctx.db.collection("vehicles").doc(vehicleId).get();
      if (!vehicleDoc.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Vehicle ${vehicleId} not found`,
        });
      }

      // Call finance-engine
      const result = calculateFinanceEstimate({
        vehiclePrice: inputs.vehiclePrice,
        zipCode,
        downPayment: inputs.downPayment,
        tradeInValue: inputs.tradeInValue,
        tradeInPayoff: inputs.tradeInPayoff,
        discounts: inputs.discounts,
        rebates: inputs.rebates,
        termMonths: inputs.termMonths,
        apr: inputs.apr,
      });

      const estimateId = randomUUID();

      return {
        estimateId,
        vehicleId,
        trimId,
        type: "finance" as const,
        zipCode,
        inputs,
        outputs: {
          monthlyPayment: result.monthlyPayment,
          dueAtSigning: result.dueAtSigning,
          totalTaxes: result.salesTax,
          totalFees: result.totalFees,
          outTheDoorTotal: result.outTheDoorTotal,
          totalCostOverTerm: result.totalCostOverTerm,
          totalInterestPaid: result.totalInterestPaid,
        },
        taxBreakdown: {
          salesTax: result.salesTax,
          registrationFee: result.registrationFee,
          titleFee: 0,
          documentFee: result.docFee,
          stateFees: 0,
        },
        disclaimer: DISCLAIMER_TEXT,
        calculatedAt: new Date(),
      };
    }),

  /**
   * Calculate lease estimate
   */
  calculateLease: publicProcedure
    .input(
      z.object({
        vehicleId: z.string(),
        trimId: z.string().optional(),
        zipCode: z.string().regex(/^\d{5}$/),
        inputs: LeaseInputsSchema,
      })
    )
    .query(async ({ input, ctx }) => {
      const { vehicleId, trimId, zipCode, inputs } = input;

      // Verify vehicle exists
      const vehicleDoc = await ctx.db.collection("vehicles").doc(vehicleId).get();
      if (!vehicleDoc.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Vehicle ${vehicleId} not found`,
        });
      }

      // Call finance-engine
      const result = calculateLeaseEstimate({
        vehiclePrice: inputs.vehiclePrice,
        zipCode,
        downPayment: inputs.downPayment,
        tradeInValue: inputs.tradeInValue,
        tradeInPayoff: inputs.tradeInPayoff,
        discounts: inputs.discounts,
        rebates: inputs.rebates,
        termMonths: inputs.termMonths,
        residualPercent: inputs.residualPercent,
        moneyFactor: inputs.moneyFactor,
        mileageCap: inputs.mileageCap,
      });

      const estimateId = randomUUID();

      return {
        estimateId,
        vehicleId,
        trimId,
        type: "lease" as const,
        zipCode,
        inputs,
        outputs: {
          monthlyPayment: result.monthlyPayment,
          dueAtSigning: result.dueAtSigning,
          totalTaxes: result.salesTax,
          totalFees: result.totalFees,
          outTheDoorTotal: result.totalLeasePayments + result.dueAtSigning,
          totalCostOverTerm: result.totalLeasePayments + result.dueAtSigning,
          totalInterestPaid: null,
        },
        taxBreakdown: {
          salesTax: result.salesTax,
          registrationFee: result.registrationFee,
          titleFee: 0,
          documentFee: result.docFee,
          stateFees: 0,
        },
        disclaimer: DISCLAIMER_TEXT,
        calculatedAt: new Date(),
      };
    }),

  /**
   * Calculate fuel cost estimate
   */
  calculateFuelCost: publicProcedure
    .input(
      z.object({
        vehicleId: z.string(),
        inputs: FuelEstimateInputSchema,
      })
    )
    .query(async ({ input, ctx }) => {
      const { vehicleId, inputs } = input;

      // Verify vehicle exists
      const vehicleDoc = await ctx.db.collection("vehicles").doc(vehicleId).get();
      if (!vehicleDoc.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Vehicle ${vehicleId} not found`,
        });
      }

      // Call finance-engine
      const result = calculateFuelCost({
        fuelType: inputs.fuelType,
        pricePerUnit: inputs.pricePerUnit,
        annualMiles: inputs.annualMiles,
        mpgOrMpge: inputs.mpgOrMpge,
      });

      return {
        vehicleId,
        fuelType: inputs.fuelType,
        monthlyCost: result.monthlyCost,
        annualCost: result.annualCost,
        assumptions: {
          pricePerUnit: inputs.pricePerUnit,
          annualMiles: inputs.annualMiles,
          mpgOrMpge: inputs.mpgOrMpge,
        },
      };
    }),

  /**
   * Save estimate to user profile
   */
  saveEstimate: protectedProcedure
    .input(
      z.object({
        estimate: z.object({
          vehicleId: z.string(),
          trimId: z.string().optional(),
          type: z.enum(["cash", "finance", "lease"]),
          zipCode: z.string().regex(/^\d{5}$/),
          inputs: z.union([CashInputsSchema, FinanceInputsSchema, LeaseInputsSchema]),
          outputs: EstimateOutputsSchema,
        }),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const userId = ctx.userId;
      const { estimate } = input;

      const estimateId = randomUUID();
      const savedEstimate = {
        id: estimateId,
        ...estimate,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const userRef = ctx.db.collection("userProfiles").doc(userId);
      await userRef.update({
        estimates: FieldValue.arrayUnion(savedEstimate),
        updatedAt: new Date(),
      });

      return {
        estimateId,
        savedAt: savedEstimate.createdAt,
      };
    }),

  /**
   * Get all saved estimates for user
   */
  getSavedEstimates: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.userId;
    const userRef = ctx.db.collection("userProfiles").doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      return { estimates: [] };
    }

    const estimates = (userDoc.data()?.estimates as Array<{
      id: string;
      vehicleId: string;
      trimId?: string;
      type: "cash" | "finance" | "lease";
      zipCode: string;
      inputs: unknown;
      outputs: unknown;
      createdAt: Date;
      updatedAt: Date;
    }>) ?? [];

    // Sort by updatedAt descending
    estimates.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return { estimates };
  }),

  /**
   * Delete saved estimate
   */
  deleteEstimate: protectedProcedure
    .input(z.object({ estimateId: z.string().uuid() }))
    .mutation(async ({ input, ctx }) => {
      const { estimateId } = input;
      const userId = ctx.userId;

      const userRef = ctx.db.collection("userProfiles").doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "User profile not found",
        });
      }

      const estimates = (userDoc.data()?.estimates as Array<{ id: string }> | undefined) ?? [];
      const estimateExists = estimates.some((est) => est.id === estimateId);

      if (!estimateExists) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Estimate not found",
        });
      }

      // Remove estimate from array
      const updatedEstimates = estimates.filter((est) => est.id !== estimateId);

      await userRef.update({
        estimates: updatedEstimates,
        updatedAt: new Date(),
      });

      return { success: true };
    }),
});
