import type { Context } from 'hono'
import { buildErrorResponse } from './error-response'

type ValidationIssue = {
    path?: (string | number)[]
    message?: string
}

type ValidationResult = {
    success: boolean
    target?: string
    error?: {
        errors?: ValidationIssue[]
        issues?: ValidationIssue[]
    }
}

export const openApiValidationHook = (result: ValidationResult, c: Context) => {
    if (result.success) {
        return
    }

    const issues = result.error?.issues ?? result.error?.errors ?? []

    return c.json(
        buildErrorResponse(c, {
            success: false,
            error: 'Validation failed',
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: issues.map((issue) => ({
                path: Array.isArray(issue.path) ? issue.path.join('.') : '',
                message: issue.message ?? 'Invalid value',
                target: result.target ?? 'unknown',
            })),
        }) as any,
        400
    )
}
