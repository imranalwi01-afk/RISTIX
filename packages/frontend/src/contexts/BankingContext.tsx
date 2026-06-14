// packages/frontend/src/contexts/BankingContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface BankingContextType {
  selectedTenant: string | null;
  bankingType: 'conventional' | null;
  setSelectedTenant: (tenant: string | null) => void;
  setBankingType: (type: 'conventional' | null) => void;
}

const BankingContext = createContext<BankingContextType | undefined>(undefined);

interface BankingProviderProps {
  children: ReactNode;
}

export const BankingProvider: React.FC<BankingProviderProps> = ({ children }) => {
  const [selectedTenant, setSelectedTenant] = useState<string | null>(null);
  const [bankingType, setBankingType] = useState<'conventional' | null>(null);

  const value = {
    selectedTenant,
    bankingType,
    setSelectedTenant,
    setBankingType,
  };

  return (
    <BankingContext.Provider value={value}>
      {children}
    </BankingContext.Provider>
  );
};

export const useBankingContext = () => {
  const context = useContext(BankingContext);
  if (context === undefined) {
    throw new Error('useBankingContext must be used within a BankingProvider');
  }
  return context;
};

export default BankingContext;