'use client';

import React, { createContext, useContext } from 'react';

const AssessmentWorkspaceEmbeddedContext = createContext<boolean>(false);

export function AssessmentWorkspaceEmbeddedProvider({
  children,
  value = true
}: {
  children: React.ReactNode;
  value?: boolean;
}) {
  return (
    <AssessmentWorkspaceEmbeddedContext.Provider value={value}>
      {children}
    </AssessmentWorkspaceEmbeddedContext.Provider>
  );
}

export function useAssessmentWorkspaceEmbedded() {
  return useContext(AssessmentWorkspaceEmbeddedContext);
}
