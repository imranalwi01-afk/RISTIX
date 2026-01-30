/**
 * Approval utilities for checking user eligibility and permission requirements
 */

export interface ApprovalMetadata {
    requiresApproval: boolean;
    requiredApprovalLevel: number | null;
    requiredApprovers: number;
}

export interface UserRoleInfo {
    hierarchyLevel: number;
    roleCode: string;
    roleName: string;
}

/**
 * Check if user can approve based on their highest hierarchy level
 * @param userMaxHierarchyLevel - Highest hierarchy level among user's roles
 * @param requiredMinHierarchyLevel - Minimum level required to approve
 * @returns true if user meets or exceeds the required level
 */
export const canUserApprove = (
    userMaxHierarchyLevel: number,
    requiredMinHierarchyLevel: number | null
): boolean => {
    if (requiredMinHierarchyLevel === null) {
        return true; // No hierarchy requirement
    }
    return userMaxHierarchyLevel >= requiredMinHierarchyLevel;
};

/**
 * Get the highest hierarchy level from user's roles
 * @param roles - Array of user's role assignments
 * @returns Maximum hierarchy level, or 1 if no roles
 */
export const getUserMaxHierarchyLevel = (roles: UserRoleInfo[]): number => {
    if (!roles || roles.length === 0) return 1;
    return Math.max(...roles.map(r => r.hierarchyLevel));
};

/**
 * Check if user has sufficient privileges for a permission
 * @param userRoles - User's current roles
 * @param approval - Permission's approval requirements
 * @returns Object with eligibility status and reason
 */
export const checkApprovalEligibility = (
    userRoles: UserRoleInfo[],
    approval: ApprovalMetadata
): {
    canApprove: boolean;
    reason: string;
    maxLevel: number;
    requiredLevel: number | null;
} => {
    const maxLevel = getUserMaxHierarchyLevel(userRoles);
    const requiredLevel = approval.requiredApprovalLevel;

    if (!approval.requiresApproval) {
        return {
            canApprove: true,
            reason: 'No approval required',
            maxLevel,
            requiredLevel,
        };
    }

    if (requiredLevel === null) {
        return {
            canApprove: true,
            reason: 'No hierarchy level requirement',
            maxLevel,
            requiredLevel,
        };
    }

    const canApprove = maxLevel >= requiredLevel;

    return {
        canApprove,
        reason: canApprove
            ? `User level ${maxLevel} meets requirement (Level ${requiredLevel}+)`
            : `User level ${maxLevel} insufficient (Level ${requiredLevel}+ required)`,
        maxLevel,
        requiredLevel,
    };
};

/**
 * Get approval status message for UI display
 * @param approval - Permission's approval requirements
 * @returns Human-readable status string
 */
export const getApprovalStatusMessage = (approval: ApprovalMetadata): string => {
    if (!approval.requiresApproval) {
        return 'No approval required';
    }

    const level = approval.requiredApprovalLevel ?? 1;
    const approvers = approval.requiredApprovers ?? 1;
    const approverText = approvers > 1 ? `${approvers} approvers` : '1 approver';

    return `Requires Level ${level}+ approval (${approverText})`;
};

/**
 * Get hierarchy level display name
 * @param level - Hierarchy level number (1-10)
 * @returns Human-readable level name
 */
export const getHierarchyLevelName = (level: number): string => {
    const levels: Record<number, string> = {
        1: 'Base/Operator',
        2: 'Supervisor/Manager',
        3: 'Senior Manager/Director',
        4: 'Executive/Board',
    };

    return levels[level] ?? (level >= 4 ? 'Executive/Board' : 'Custom Level');
};

/**
 * Get approval badge color based on level
 * @param level - Required approval level
 * @returns MUI color name
 */
export const getApprovalBadgeColor = (
    level: number | null
): 'default' | 'info' | 'warning' | 'error' => {
    if (level === null) return 'default';
    if (level === 1) return 'info';
    if (level === 2) return 'warning';
    return 'error'; // Level 3+
};
