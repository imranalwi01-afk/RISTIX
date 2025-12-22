// packages/backend/src/config/ifrs9/validation.ts
import { z } from 'zod';
import Decimal from 'decimal.js';

// Portfolio Account validation schema for IFRS 9
export const PortfolioAccountIfrs9Schema = z.object({
  accountId: z.string().min(1).max(50),
  customerId: z.string().min(1).max(50),
  productType: z.string().min(1).max(100),
  outstandingAmount: z.number().positive('Outstanding amount must be positive'),
  committedAmount: z.number().nonnegative('Committed amount cannot be negative'),
  currencyCode: z.string().length(3, 'Currency code must be 3 characters'),
  originationDate: z.coerce.date(),
  maturityDate: z.coerce.date(),
  reportingDate: z.coerce.date(),
  currentStage: z.number().int().min(1).max(3, 'Stage must be 1, 2, or 3'),
  customerName: z.string().min(1).max(200),
  customerType: z.string().min(1).max(50),
  industrySector: z.string().max(100).optional(),
  internalRating: z.string().max(10).optional(),
  externalRating: z.string().max(10).optional(),
  isSyariahCompliant: z.boolean(),
  syariahContractType: z.string().max(50).optional(),
  accountStatus: z.enum(['active', 'closed', 'suspended', 'default']),
  isActive: z.boolean()
}).refine(data => {
  // Maturity date must be after origination date
  return data.maturityDate > data.originationDate;
}, {
  message: "Maturity date must be after origination date",
  path: ["maturityDate"]
}).refine(data => {
  // Committed amount should be >= outstanding amount
  return data.committedAmount >= data.outstandingAmount;
}, {
  message: "Committed amount should be greater than or equal to outstanding amount",
  path: ["committedAmount"]
});

// ECL calculation input validation
export const EclCalculationInputSchema = z.object({
  accountIds: z.array(z.string()).optional(),
  calculationDate: z.coerce.date(),
  parameters: z.object({
    pd12mMethod: z.enum(['historical', 'logistic', 'market']).optional(),
    lgdMethod: z.enum(['historical', 'beta', 'workout']).optional(),
    eadMethod: z.enum(['current', 'stressed', 'regulatory']).optional(),
    forwardLookingAdjustment: z.boolean().optional(),
    scenarioWeights: z.object({
      base: z.number().min(0).max(1),
      upside: z.number().min(0).max(1),
      downside: z.number().min(0).max(1)
    }).refine(weights => {
      const sum = new Decimal(weights.base).plus(weights.upside).plus(weights.downside);
      return sum.equals(1);
    }, {
      message: "Scenario weights must sum to 1.0"
    }).optional()
  }).optional()
});

// Data quality validation functions
export class IfrsDataValidator {
  
  /**
   * Validate portfolio account data for IFRS 9 calculation
   */
  static validatePortfolioAccount(account: any): { isValid: boolean; errors: string[] } {
    try {
      PortfolioAccountIfrs9Schema.parse(account);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        };
      }
      return { isValid: false, errors: ['Unknown validation error'] };
    }
  }

  /**
   * Validate ECL calculation input parameters
   */
  static validateEclCalculationInput(input: any): { isValid: boolean; errors: string[] } {
    try {
      EclCalculationInputSchema.parse(input);
      return { isValid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          isValid: false,
          errors: error.errors.map(err => `${err.path.join('.')}: ${err.message}`)
        };
      }
      return { isValid: false, errors: ['Unknown validation error'] };
    }
  }

  /**
   * Check data completeness for IFRS 9 calculation
   */
  static checkDataCompleteness(accounts: any[]): {
    totalAccounts: number;
    missingRating: number;
    missingCollateral: number;
    missingIndustry: number;
    zeroOutstanding: number;
    invalidDates: number;
    completenessScore: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let missingRating = 0;
    let missingCollateral = 0;
    let missingIndustry = 0;
    let zeroOutstanding = 0;
    let invalidDates = 0;

    accounts.forEach(account => {
      if (!account.internalRating && !account.externalRating) {
        missingRating++;
      }
      
      if (!account.collateralValue && !account.collateralType) {
        missingCollateral++;
      }
      
      if (!account.industrySector) {
        missingIndustry++;
      }
      
      if (account.outstandingAmount <= 0) {
        zeroOutstanding++;
      }
      
      if (!account.originationDate || !account.maturityDate || 
          new Date(account.maturityDate) <= new Date(account.originationDate)) {
        invalidDates++;
      }
    });

    // Calculate completeness score (0-100)
    const totalIssues = missingRating + missingCollateral + missingIndustry + zeroOutstanding + invalidDates;
    const completenessScore = Math.max(0, 100 - (totalIssues / accounts.length * 100));

    // Generate issues summary
    if (missingRating > 0) {
      issues.push(`${missingRating} accounts missing credit ratings`);
    }
    if (missingCollateral > 0) {
      issues.push(`${missingCollateral} accounts missing collateral information`);
    }
    if (missingIndustry > 0) {
      issues.push(`${missingIndustry} accounts missing industry sector`);
    }
    if (zeroOutstanding > 0) {
      issues.push(`${zeroOutstanding} accounts with zero or negative outstanding amount`);
    }
    if (invalidDates > 0) {
      issues.push(`${invalidDates} accounts with invalid date ranges`);
    }

    return {
      totalAccounts: accounts.length,
      missingRating,
      missingCollateral,
      missingIndustry,
      zeroOutstanding,
      invalidDates,
      completenessScore: Math.round(completenessScore * 100) / 100,
      issues
    };
  }

  /**
   * Validate calculated risk parameters
   */
  static validateRiskParameters(results: any[]): {
    validResults: number;
    invalidPd: number;
    invalidLgd: number;
    invalidEad: number;
    extremePd: number;
    extremeLgd: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let validResults = 0;
    let invalidPd = 0;
    let invalidLgd = 0;
    let invalidEad = 0;
    let extremePd = 0;
    let extremeLgd = 0;

    results.forEach(result => {
      let isValid = true;

      // Validate PD
      if (typeof result.pd12m !== 'number' || result.pd12m < 0 || result.pd12m > 1) {
        invalidPd++;
        isValid = false;
      } else if (result.pd12m > 0.5) {
        extremePd++;
      }

      // Validate LGD
      if (typeof result.lgd !== 'number' || result.lgd < 0 || result.lgd > 1) {
        invalidLgd++;
        isValid = false;
      } else if (result.lgd > 0.9) {
        extremeLgd++;
      }

      // Validate EAD
      if (typeof result.ead !== 'number' || result.ead <= 0) {
        invalidEad++;
        isValid = false;
      }

      if (isValid) {
        validResults++;
      }
    });

    // Generate issues
    if (invalidPd > 0) {
      issues.push(`${invalidPd} accounts with invalid PD values (must be 0-1)`);
    }
    if (invalidLgd > 0) {
      issues.push(`${invalidLgd} accounts with invalid LGD values (must be 0-1)`);
    }
    if (invalidEad > 0) {
      issues.push(`${invalidEad} accounts with invalid EAD values (must be positive)`);
    }
    if (extremePd > 0) {
      issues.push(`${extremePd} accounts with extremely high PD (>50%)`);
    }
    if (extremeLgd > 0) {
      issues.push(`${extremeLgd} accounts with extremely high LGD (>90%)`);
    }

    return {
      validResults,
      invalidPd,
      invalidLgd,
      invalidEad,
      extremePd,
      extremeLgd,
      issues
    };
  }
}

// Export validation schemas
export {
  PortfolioAccountIfrs9Schema,
  EclCalculationInputSchema
};
