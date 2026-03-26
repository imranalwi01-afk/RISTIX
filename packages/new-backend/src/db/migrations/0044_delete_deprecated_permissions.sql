-- Remove deprecated permission rows that are no longer part of the canonical seed catalog.
-- Keep role names intact; this only removes obsolete permission codes.

DELETE FROM core.role_permissions
WHERE permission_id IN (
    SELECT id
    FROM core.permissions
    WHERE code IN (
        'banking.portfolio.loans.view',
        'banking.portfolio.loans.manage',
        'SUPER_ADMIN'
    )
);

DELETE FROM core.permissions
WHERE code IN (
    'banking.portfolio.loans.view',
    'banking.portfolio.loans.manage',
    'SUPER_ADMIN'
);
