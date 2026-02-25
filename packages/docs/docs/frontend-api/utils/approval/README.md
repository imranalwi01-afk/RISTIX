[**Frontend API Reference v1.0.0**](../../README.md)

***

# utils/approval

## Interfaces

| Interface | Description |
| ------ | ------ |
| [ApprovalMetadata](interfaces/ApprovalMetadata.md) | Approval utilities for checking user eligibility and permission requirements |
| [UserRoleInfo](interfaces/UserRoleInfo.md) | - |

## Functions

| Function | Description |
| ------ | ------ |
| [canUserApprove](functions/canUserApprove.md) | Check if user can approve based on their highest hierarchy level |
| [checkApprovalEligibility](functions/checkApprovalEligibility.md) | Check if user has sufficient privileges for a permission |
| [getApprovalBadgeColor](functions/getApprovalBadgeColor.md) | Get approval badge color based on level |
| [getApprovalStatusMessage](functions/getApprovalStatusMessage.md) | Get approval status message for UI display |
| [getHierarchyLevelName](functions/getHierarchyLevelName.md) | Get hierarchy level display name |
| [getUserMaxHierarchyLevel](functions/getUserMaxHierarchyLevel.md) | Get the highest hierarchy level from user's roles |
