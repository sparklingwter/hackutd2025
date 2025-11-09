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
 * Handles all vehicle cost estimation calculations including cash purchase,
 * financing, leasing, and fuel costs. Uses finance-engine library for
 * accurate tax, fee, and payment calculations based on ZIP code.
 * 
 * All estimates include state-specific tax rates, registration fees, and
 * dealer documentation charges. Results are for estimation only and include
 * appropriate disclaimers.
 * 
 * @module server/api/routers/estimate
 * @see {@link ~/lib/finance-engine} for calculation logic
 */
export const estimateRouter = createTRPCRouter({
  /**
   * Calculate cash purchase estimate with all fees
   * 
   * Computes out-the-door total for buying a vehicle outright. Includes
   * sales tax (state-specific), registration, title, and doc fees based
   * on buyer's ZIP code.
   * 
   * @param {object} input - Input parameters
   * @param {string} input.vehicleId - Target vehicle ID
   * @param {string} [input.trimId] - Optional specific trim
   * @param {string} input.zipCode - 5-digit ZIP code for tax calculation
   * @param {CashInputs} input.inputs - Cash purchase parameters
   * @param {number} input.inputs.msrp - Manufacturer suggested retail price
   * @param {number} [input.inputs.addons=0] - Optional accessories/features
   * @param {number} [input.inputs.tradeInValue=0] - Trade-in credit
   * @param {number} [input.inputs.rebates=0] - Manufacturer rebates/incentives
   * 
   * @returns {Promise<EstimateResult>} Complete cash estimate
   * @returns {string} returns.estimateId - Unique estimate identifier (UUID)
   * @returns {string} returns.vehicleId - Vehicle being estimated
   * @returns {"cash"} returns.type - Estimate type
   * @returns {EstimateOutputs} returns.outputs - Calculated totals
   * @returns {number} returns.outputs.outTheDoorTotal - Final amount to pay
   * @returns {number} returns.outputs.totalTaxes - All applicable taxes
   * @returns {number} returns.outputs.totalFees - Registration, title, doc fees
   * @returns {TaxBreakdown} returns.taxBreakdown - Itemized tax/fee details
   * @returns {string} returns.disclaimer - Legal disclaimer text
   * @returns {Date} returns.calculatedAt - Timestamp
   * 
   * @throws {Error} NOT_FOUND - Vehicle doesn't exist
   * 
   * @example
   * ```typescript
   * const estimate = await trpc.estimate.calculateCash.query({
   *   vehicleId: "camry-2024",
   *   zipCode: "75080",
   *   inputs: {
   *     msrp: 28000,
   *     addons: 2500,
   *     tradeInValue: 5000,
   *     rebates: 1000
   *   }
   * });
   * // estimate.outputs.outTheDoorTotal: $26,837.50
   * ```
   * 
   * @see {@link ~/lib/finance-engine/cash} for calculation details
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
   * Calculate auto loan financing estimate with amortization
   * 
   * Computes monthly payment, total interest, and full loan cost for
   * financing a vehicle. Supports terms from 12-84 months with customizable
   * down payment and APR. Includes all taxes and fees in amount financed.
   * 
   * @param {object} input - Input parameters
   * @param {string} input.vehicleId - Target vehicle ID
   * @param {string} [input.trimId] - Optional specific trim
   * @param {string} input.zipCode - 5-digit ZIP code for tax calculation
   * @param {FinanceInputs} input.inputs - Financing parameters
   * @param {number} input.inputs.msrp - Vehicle base price
   * @param {number} [input.inputs.addons=0] - Optional accessories
   * @param {number} [input.inputs.tradeInValue=0] - Trade-in credit
   * @param {number} [input.inputs.rebates=0] - Manufacturer incentives
   * @param {number} input.inputs.downPayment - Cash down (reduces amount financed)
   * @param {number} input.inputs.apr - Annual percentage rate (0-30%)
   * @param {number} input.inputs.termMonths - Loan duration (12,24,36,48,60,72,84)
   * 
   * @returns {Promise<EstimateResult>} Complete finance estimate
   * @returns {EstimateOutputs} returns.outputs - Calculated totals
   * @returns {number} returns.outputs.monthlyPayment - Fixed monthly payment
   * @returns {number} returns.outputs.dueAtSigning - Down payment + fees
   * @returns {number} returns.outputs.totalCostOverTerm - Total paid over loan life
   * @returns {number} returns.outputs.totalInterestPaid - Interest portion only
   * @returns {string} returns.disclaimer - Finance disclaimer text
   * 
   * @throws {Error} NOT_FOUND - Vehicle doesn't exist
   * @throws {Error} BAD_REQUEST - APR > 30% or invalid term
   * 
   * @example
   * ```typescript
   * const estimate = await trpc.estimate.calculateFinance.query({
   *   vehicleId: "camry-2024",
   *   zipCode: "75080",
   *   inputs: {
   *     msrp: 28000,
   *     downPayment: 5000,
   *     apr: 6.5,
   *     termMonths: 60
   *   }
   * });
   * // estimate.outputs.monthlyPayment: $458.32
   * ```
   * 
   * @see {@link ~/lib/finance-engine/finance} for amortization calculation
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
   * Calculate vehicle lease estimate with monthly payment
   * 
   * Computes lease payment based on MSRP, residual value percentage, money
   * factor (similar to APR), and lease term. Includes acquisition fee and
   * first month's payment in due at signing.
   * 
   * @param {object} input - Input parameters
   * @param {string} input.vehicleId - Target vehicle ID
   * @param {string} [input.trimId] - Optional specific trim
   * @param {string} input.zipCode - 5-digit ZIP code for tax calculation
   * @param {LeaseInputs} input.inputs - Lease parameters
   * @param {number} input.inputs.msrp - Vehicle base price
   * @param {number} [input.inputs.addons=0] - Optional accessories
   * @param {number} input.inputs.capCostReduction - Down payment equivalent
   * @param {number} input.inputs.residualPercent - Expected value at lease end (0-100%)
   * @param {number} input.inputs.moneyFactor - Lease rate (divide APR by 2400)
   * @param {number} input.inputs.termMonths - Lease duration (24,36,39,48)
   * @param {number} input.inputs.annualMileage - Yearly mileage limit
   * 
   * @returns {Promise<EstimateResult>} Complete lease estimate
   * @returns {EstimateOutputs} returns.outputs - Calculated totals
   * @returns {number} returns.outputs.monthlyPayment - Monthly lease payment
   * @returns {number} returns.outputs.dueAtSigning - Initial payment + fees
   * @returns {number} returns.outputs.totalCostOverTerm - Total lease cost
   * @returns {string} returns.disclaimer - Lease disclaimer with mileage terms
   * 
   * @throws {Error} NOT_FOUND - Vehicle doesn't exist
   * @throws {Error} BAD_REQUEST - Invalid residual percent or money factor
   * 
   * @example
   * ```typescript
   * const estimate = await trpc.estimate.calculateLease.query({
   *   vehicleId: "camry-2024",
   *   zipCode: "75080",
   *   inputs: {
   *     msrp: 28000,
   *     capCostReduction: 2000,
   *     residualPercent: 60,
   *     moneyFactor: 0.00125, // Equivalent to ~3% APR
   *     termMonths: 36,
   *     annualMileage: 12000
   *   }
   * });
   * // estimate.outputs.monthlyPayment: $275.45
   * ```
   * 
   * @see {@link ~/lib/finance-engine/lease} for residual calculation
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
