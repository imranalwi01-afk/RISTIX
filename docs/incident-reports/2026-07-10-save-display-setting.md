# 2026-07-10: Save Display Setting Error (Combination Already Assigned)

## Summary
Users were unable to save system settings (like `CURRDSPLY`) due to a duplicate combination validation error in the backend.

## Root Cause
The update parameter detail function in `parameters.service.ts` was unconditionally validating the `(value1, value2, value3)` uniqueness for all updated parameters. However, this uniqueness constraint should only apply to Business Parameters (`paramType === 'B'`), not System Parameters like `CURRDSPLY`.

## Impact
Users and admins were completely blocked from toggling or updating system display settings through the UI.

## Fix
Updated `updateAppSettingDetail` in `packages/new-backend/src/services/parameters.service.ts` to fetch the parameter header and conditionally apply the duplicate values validation only if `header.paramType === 'B'`.

## Prevention
Ensure parameter update validations always check context (like `paramType`) before applying strict business constraints to generic entities.
