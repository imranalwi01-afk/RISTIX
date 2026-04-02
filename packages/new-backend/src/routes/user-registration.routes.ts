import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import type { AppContext } from '../app'
import { openApiValidationHook } from '../lib/http/openapi-validation-hook'

/**
 * User Registration Routes (STUB)
 * TODO: Implement user registration flow
 */
export const userRegistrationRoutes = new OpenAPIHono<AppContext>({ defaultHook: openApiValidationHook })

// ============================================================================
// SCHEMAS
// ============================================================================

const RegisterUserSchema = z.object({
    email: z.string().email(),
    password: z.string().min(8),
    fullName: z.string().min(1),
}).openapi('RegisterUserInput')

const VerifyEmailSchema = z.object({
    token: z.string(),
    email: z.string().email(),
}).openapi('VerifyEmailInput')

const RegistrationResponse = z.object({
    success: z.boolean(),
    data: z.object({
        id: z.string(),
        email: z.string(),
        status: z.string(),
    }),
    message: z.string().optional(),
}).openapi('RegistrationResponse')

const VerificationResponse = z.object({
    success: z.boolean(),
    message: z.string().optional(),
}).openapi('VerificationResponse')

const ResendVerificationSchema = z.object({
    email: z.string().email(),
}).openapi('ResendVerificationInput')

const ErrorResponse = z.object({
    success: z.boolean(),
    message: z.string(),
}).openapi('ErrorResponse')

// ============================================================================
// REGISTRATION ENDPOINTS
// ============================================================================

userRegistrationRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/register',
        tags: ['User Registration'],
        summary: 'Register User',
        request: {
            body: { content: { 'application/json': { schema: RegisterUserSchema } } }
        },
        responses: {
            201: { content: { 'application/json': { schema: RegistrationResponse } }, description: 'Registered' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Bad Request' }
        }
    }),
    async (c) => {
        const body = c.req.valid('json')
        return c.json({
            success: true,
            data: {
                id: 'new-user-id',
                email: body.email,
                status: 'pending',
            },
            message: 'User registration initiated - stub implementation',
        }, 201) as any
    }
)

userRegistrationRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/verify',
        tags: ['User Registration'],
        summary: 'Verify Email',
        request: {
            body: { content: { 'application/json': { schema: VerifyEmailSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: VerificationResponse } }, description: 'Verified' },
            400: { content: { 'application/json': { schema: ErrorResponse } }, description: 'Invalid Token' }
        }
    }),
    async (c) => {
        return c.json({
            success: true,
            message: 'Email verified - stub implementation',
        }) as any
    }
)

userRegistrationRoutes.openapi(
    createRoute({
        method: 'post',
        path: '/resend-verification',
        tags: ['User Registration'],
        summary: 'Resend Verification Email',
        request: {
            body: { content: { 'application/json': { schema: ResendVerificationSchema } } }
        },
        responses: {
            200: { content: { 'application/json': { schema: VerificationResponse } }, description: 'Sent' }
        }
    }),
    async (c) => {
        return c.json({
            success: true,
            message: 'Verification email resent - stub implementation',
        }) as any
    }
)
