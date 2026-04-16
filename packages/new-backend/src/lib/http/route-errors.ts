import type { Context } from 'hono'
import { buildErrorResponse } from './error-response'

type ErrorDetails = unknown

export const badRequest = (c: Context, message: string, details?: ErrorDetails) =>
    c.json(buildErrorResponse(c, { error: message, message, code: 'BAD_REQUEST', details }), 400)

export const unauthorized = (c: Context, message = 'Unauthorized', details?: ErrorDetails) =>
    c.json(buildErrorResponse(c, { error: message, message, code: 'UNAUTHORIZED', details }), 401)

export const forbidden = (c: Context, message: string, details?: ErrorDetails) =>
    c.json(buildErrorResponse(c, { error: message, message, code: 'FORBIDDEN', details }), 403)

export const notFound = (c: Context, message: string, details?: ErrorDetails) =>
    c.json(buildErrorResponse(c, { error: message, message, code: 'NOT_FOUND', details }), 404)

export const conflict = (c: Context, message: string, details?: ErrorDetails) =>
    c.json(buildErrorResponse(c, { error: message, message, code: 'CONFLICT', details }), 409)

export const unprocessable = (c: Context, message: string, code = 'UNPROCESSABLE_ENTITY', details?: ErrorDetails) =>
    c.json(buildErrorResponse(c, { error: message, message, code, details }), 422)

export const internalError = (
    c: Context,
    message: string,
    code = 'INTERNAL_ERROR',
    details?: ErrorDetails
) =>
    c.json(buildErrorResponse(c, { error: message, message, code, details }), 500)
