import { z } from "zod";
import { v4 as uuidv4 } from "uuid";
import {
  createTRPCRouter,
  publicProcedure,
} from "~/server/api/trpc";
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
import { adminDb } from "~/server/db/firebase";

/**
 * Estimate Router
 * 
 * Handles all cost estimation calculations:
 * - Cash purchase estimates (T041)
 * - Finance (loan) estimates (T042)
 * - Lease estimates (T043)
 * - Fuel cost estimates (T044)
 * - Saving/retrieving estimates (T045, T039, T040) - local storage only
 */
export const estimateRouter = createTRPCRouter({
  /**
   * T041: estimate.calculateCash - Calculate cash purchase estimate
   */
  calculateCash: publicProcedure
    .input(
      z.object({
        vehicleId: z.string(),
        trimId: z.string().optional(),
        zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits"),
        inputs: CashInputsSchema,
      })
    )
    .query(async ({ input }) => {
      // Verify vehicle exists
      const vehicleDoc = await adminDb.collection("vehicles").doc(input.vehicleId).get();
      
      if (!vehicleDoc.exists) {
        throw new Error("NOT_FOUND: Vehicle not found");
      }

      // Calculate estimate using finance-engine library
      // The library expects zipCode in the inputs
      const result = calculateCashEstimate({
        ...input.inputs,
        zipCode: input.zipCode,
      });

      const estimateId = uuidv4();

      // Map finance-engine result to contract format
      return {
        estimateId,
        vehicleId: input.vehicleId,
        trimId: input.trimId,
        type: "cash" as const,
        zipCode: input.zipCode,
        inputs: input.inputs,
        outputs: {
          monthlyPayment: null,
          dueAtSigning: 0,
          totalTaxes: result.salesTax,
          totalFees: result.totalFees,
          outTheDoorTotal: result.outTheDoorTotal,
          totalCostOverTerm: result.outTheDoorTotal,
          totalInterestPaid: null,
        },
        taxBreakdown: {
          salesTax: result.salesTax,
          registrationFee: result.registrationFee,
          titleFee: 0, // Not included in finance-engine, using 0
          documentFee: result.docFee,
          stateFees: 0,
        },
        disclaimer: result.disclaimer,
        calculatedAt: new Date(),
      };
    }),

  /**
   * T042: estimate.calculateFinance - Calculate finance estimate
   */
  calculateFinance: publicProcedure
    .input(
      z.object({
        vehicleId: z.string(),
        trimId: z.string().optional(),
        zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits"),
        inputs: FinanceInputsSchema,
      })
    )
    .query(async ({ input }) => {
      // Verify vehicle exists
      const vehicleDoc = await adminDb.collection("vehicles").doc(input.vehicleId).get();
      
      if (!vehicleDoc.exists) {
        throw new Error("NOT_FOUND: Vehicle not found");
      }

      // Validate inputs
      if (input.inputs.apr > 30) {
        throw new Error("BAD_REQUEST: APR cannot exceed 30%");
      }

      if (![12, 24, 36, 48, 60, 72, 84].includes(input.inputs.termMonths)) {
        throw new Error("BAD_REQUEST: Term must be 12, 24, 36, 48, 60, 72, or 84 months");
      }

      // Calculate estimate using finance-engine library
      const result = calculateFinanceEstimate({
        ...input.inputs,
        zipCode: input.zipCode,
      });

      const estimateId = uuidv4();

      // Map finance-engine result to contract format
      return {
        estimateId,
        vehicleId: input.vehicleId,
        trimId: input.trimId,
        type: "finance" as const,
        zipCode: input.zipCode,
        inputs: input.inputs,
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
        disclaimer: result.disclaimer,
        calculatedAt: new Date(),
      };
    }),

  /**
   * T043: estimate.calculateLease - Calculate lease estimate
   */
  calculateLease: publicProcedure
    .input(
      z.object({
        vehicleId: z.string(),
        trimId: z.string().optional(),
        zipCode: z.string().regex(/^\d{5}$/, "ZIP code must be 5 digits"),
        inputs: LeaseInputsSchema,
      })
    )
    .query(async ({ input }) => {
      // Verify vehicle exists
      const vehicleDoc = await adminDb.collection("vehicles").doc(input.vehicleId).get();
      
      if (!vehicleDoc.exists) {
        throw new Error("NOT_FOUND: Vehicle not found");
      }

      // Validate inputs
      if (input.inputs.residualPercent > 100 || input.inputs.residualPercent <= 0) {
        throw new Error("BAD_REQUEST: Residual percent must be between 0 and 100");
      }

      if (input.inputs.moneyFactor < 0) {
        throw new Error("BAD_REQUEST: Money factor cannot be negative");
      }

      // Calculate estimate using finance-engine library
      const result = calculateLeaseEstimate({
        ...input.inputs,
        zipCode: input.zipCode,
      });

      const estimateId = uuidv4();

      // Map finance-engine result to contract format
      return {
        estimateId,
        vehicleId: input.vehicleId,
        trimId: input.trimId,
        type: "lease" as const,
        zipCode: input.zipCode,
        inputs: input.inputs,
        outputs: {
          monthlyPayment: result.monthlyPayment,
          dueAtSigning: result.dueAtSigning,
          totalTaxes: result.salesTax,
          totalFees: result.totalFees,
          outTheDoorTotal: result.totalCostOverTerm,
          totalCostOverTerm: result.totalCostOverTerm,
          totalInterestPaid: null,
        },
        taxBreakdown: {
          salesTax: result.salesTax,
          registrationFee: result.registrationFee,
          titleFee: 0,
          documentFee: result.docFee,
          stateFees: 0,
        },
        disclaimer: result.disclaimer,
        calculatedAt: new Date(),
      };
    }),

  /**
   * T044: estimate.calculateFuelCost - Calculate fuel/energy cost estimate
   */
  calculateFuelCost: publicProcedure
    .input(
      z.object({
        vehicleId: z.string(),
        inputs: FuelEstimateInputSchema,
      })
    )
    .query(async ({ input }) => {
      // Verify vehicle exists
      const vehicleDoc = await adminDb.collection("vehicles").doc(input.vehicleId).get();
      
      if (!vehicleDoc.exists) {
        throw new Error("NOT_FOUND: Vehicle not found");
      }

      // Validate inputs
      if (input.inputs.pricePerUnit <= 0) {
        throw new Error("BAD_REQUEST: Price per unit must be positive");
      }

      if (input.inputs.mpgOrMpge <= 0) {
        throw new Error("BAD_REQUEST: MPG/MPGe must be positive");
      }

      // Calculate fuel cost using finance-engine library
      const result = calculateFuelCost(input.inputs);

      return {
        vehicleId: input.vehicleId,
        fuelType: input.inputs.fuelType,
        monthlyCost: result.monthlyCost,
        annualCost: result.annualCost,
        assumptions: {
          pricePerUnit: input.inputs.pricePerUnit,
          annualMiles: input.inputs.annualMiles,
          mpgOrMpge: input.inputs.mpgOrMpge,
        },
      };
    }),

  /**
   * T045: estimate.saveEstimate - Save estimate to local storage (placeholder)
   * 
   * Note: Per copilot-instructions.md, we're using local browser storage only.
   * This endpoint returns the estimate data for client-side persistence.
   */
  saveEstimate: publicProcedure
    .input(
      z.object({
        estimate: z.object({
          vehicleId: z.string(),
          trimId: z.string().optional(),
          type: z.enum(["cash", "finance", "lease"]),
          zipCode: z.string(),
          inputs: z.union([CashInputsSchema, FinanceInputsSchema, LeaseInputsSchema]),
          outputs: EstimateOutputsSchema,
        }),
      })
    )
    .mutation(async ({ input }) => {
      // Generate ID for the estimate
      const estimateId = uuidv4();
      const savedAt = new Date();

      // Return the data for client-side storage
      // Client will handle localStorage persistence
      return {
        estimateId,
        savedAt,
        estimate: {
          ...input.estimate,
          id: estimateId,
          createdAt: savedAt,
          updatedAt: savedAt,
        },
      };
    }),

  /**
   * T039: estimate.getSavedEstimates - Placeholder for local storage retrieval
   * 
   * Returns empty array - client should use localStorage directly
   */
  getSavedEstimates: publicProcedure
    .query(async () => {
      // Local storage only - return empty array
      // Client should read from localStorage directly
      return {
        estimates: [],
      };
    }),

  /**
   * T040: estimate.deleteEstimate - Placeholder for local storage deletion
   * 
   * Returns success - client should handle localStorage removal
   */
  deleteEstimate: publicProcedure
    .input(
      z.object({
        estimateId: z.string().uuid(),
      })
    )
    .mutation(async () => {
      // Local storage only - return success
      // Client should handle localStorage removal
      return {
        success: true,
      };
    }),
});
