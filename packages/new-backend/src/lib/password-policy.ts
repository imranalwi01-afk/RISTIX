import { ValidationError, DatabaseError } from './errors'
import { Effect, pipe } from 'effect'
import { getTenantById } from '../services/tenants.service'

export interface PasswordPolicy {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
}

const DEFAULT_POLICY: PasswordPolicy = {
    minLength: 8,
    requireUppercase: false,
    requireLowercase: false,
    requireNumbers: false,
    requireSpecialChars: false,
};

export const validatePasswordPolicy = (password: string, tenantId: string): Effect.Effect<void, ValidationError | DatabaseError> => {
    return pipe(
        getTenantById(tenantId),
        Effect.flatMap((tenant) => {
            let policy = DEFAULT_POLICY;
            let settingsObj: any = null;

            if (tenant?.settings) {
                if (typeof tenant.settings === 'string') {
                    try {
                        settingsObj = JSON.parse(tenant.settings);
                    } catch (e) {}
                } else if (typeof tenant.settings === 'object') {
                    settingsObj = tenant.settings;
                }
            }

            if (settingsObj && settingsObj.passwordPolicy) {
                policy = { ...DEFAULT_POLICY, ...settingsObj.passwordPolicy };
            }

            const errors: string[] = [];

            if (password.length < policy.minLength) {
                errors.push(`Password must be at least ${policy.minLength} characters long`);
            }
            if (policy.requireUppercase && !/[A-Z]/.test(password)) {
                errors.push('Password must contain at least one uppercase letter');
            }
            if (policy.requireLowercase && !/[a-z]/.test(password)) {
                errors.push('Password must contain at least one lowercase letter');
            }
            if (policy.requireNumbers && !/[0-9]/.test(password)) {
                errors.push('Password must contain at least one number');
            }
            if (policy.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                errors.push('Password must contain at least one special character');
            }

            if (errors.length > 0) {
                return Effect.fail(new ValidationError({
                    message: 'Password does not meet policy requirements',
                    field: 'password',
                    errors
                }));
            }

            return Effect.succeed(undefined);
        })
    );
};
