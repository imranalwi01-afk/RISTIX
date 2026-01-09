
export interface LookupItem {
  code: string;
  label: string;
  description?: string;
}

// Mock data store
const MOCK_LOOKUPS: Record<string, LookupItem[]> = {
  // Example: Business Models (B0001)
  'B0001': [
    { code: 'BM01', label: 'Retail Banking', description: 'Standard retail banking operations' },
    { code: 'BM02', label: 'Corporate Banking', description: 'Services for corporate clients' },
    { code: 'BM03', label: 'Investment Banking', description: 'Capital market services' },
  ],
  // Example: Product Types (B0002)
  'B0002': [
    { code: 'PT01', label: 'Savings Account' },
    { code: 'PT02', label: 'Current Account' },
    { code: 'PT03', label: 'Term Deposit' },
    { code: 'PT04', label: 'Personal Loan' },
    { code: 'PT05', label: 'Mortgage' },
  ],
  // Example: Currency (B0003)
  'B0003': [
    { code: 'IDR', label: 'Indonesian Rupiah' },
    { code: 'USD', label: 'US Dollar' },
    { code: 'EUR', label: 'Euro' },
    { code: 'SGD', label: 'Singapore Dollar' },
  ],
  // Example: Region/Segment (B0004)
  'B0004': [
    { code: 'REG01', label: 'Jakarta (HQ)' },
    { code: 'REG02', label: 'Surabaya' },
    { code: 'REG03', label: 'Medan' },
    { code: 'REG04', label: 'Makassar' },
  ],
  // Journal Type (B0005) - Sprint 1
  'B0005': [
    { code: 'JT01', label: 'Accrual' },
    { code: 'JT02', label: 'Cash Basis' },
    { code: 'JT03', label: 'Adjustment' },
  ],
  // Journal Code (B0006) - Sprint 1
  'B0006': [
    { code: 'JC100', label: 'ECL Provision Expense' },
    { code: 'JC200', label: 'ECL Allowance Liability' },
    { code: 'JC300', label: 'Reversal of Provision' },
  ],
  // DB/CR Flag (B0007) - Sprint 1
  'B0007': [
    { code: 'D', label: 'Debit' },
    { code: 'C', label: 'Credit' },
  ],
  // Tables for Condition Builder (B0012) - Sprint 2
  'B0012': [
      { code: 'TBL_CUSTOMER', label: 'Customer Info' },
      { code: 'TBL_ACCOUNT', label: 'Account Details' },
      { code: 'TBL_COLLATERAL', label: 'Collateral Data' },
  ],
  // Operators (Hardcoded for builder)
  'OPERATORS': [
      { code: 'EQ', label: 'Equals (=)' },
      { code: 'GT', label: 'Greater Than (>)' },
      { code: 'LT', label: 'Less Than (<)' },
      { code: 'LIKE', label: 'Contains (LIKE)' },
      { code: 'IN', label: 'In List (IN)' },
  ]
};

// Mock Metadata for Columns (Dependent on Table)
export const MOCK_COLUMNS: Record<string, LookupItem[]> = {
    'TBL_CUSTOMER': [
        { code: 'CUST_TYPE', label: 'Customer Type' },
        { code: 'SECTOR', label: 'Economic Sector' },
        { code: 'RATING', label: 'Internal Rating' },
    ],
    'TBL_ACCOUNT': [
        { code: 'DPD', label: 'Days Past Due' },
        { code: 'OS_BAL', label: 'Outstanding Balance' },
        { code: 'PROD_TYPE', label: 'Product Type' },
    ],
    'TBL_COLLATERAL': [
        { code: 'COLL_TYPE', label: 'Collateral Type' },
        { code: 'VALUATION', label: 'Valuation Amount' },
    ]
};

export class MockLookupService {
  /**
   * Simulate an API call to fetch lookup items by category code (e.g., 'B0001')
   */
  static async getByCode(categoryCode: string): Promise<LookupItem[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const items = MOCK_LOOKUPS[categoryCode] || [];
        resolve(items);
      }, 500); // Simulate network delay
    });
  }

  /**
   * Get multiple categories at once
   */
  static async getMultipleCodes(categoryCodes: string[]): Promise<Record<string, LookupItem[]>> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const result: Record<string, LookupItem[]> = {};
        categoryCodes.forEach(code => {
            result[code] = MOCK_LOOKUPS[code] || [];
        });
        resolve(result);
      }, 800);
    });
  }
}
