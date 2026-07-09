// packages/frontend/src/utils/postFixDiagnostic.ts
// Diagnostic helpers — kept for development use

export function runPostFixDiagnostic() {
  return true;
}

export function testSpecificRedirect(_userRole: string, _requestedPath?: string) {
}

export default {
  runPostFixDiagnostic,
  testSpecificRedirect
};