import { NextResponse } from "next/server"
import { ZodError } from "zod"

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export function notFound(message = "Not found") {
  return new ApiError(404, message)
}

export function unauthorized(message = "Unauthorized") {
  return new ApiError(401, message)
}

export function forbidden(message = "Forbidden") {
  return new ApiError(403, message)
}

export function badRequest(message: string) {
  return new ApiError(400, message)
}

type Handler = (...args: unknown[]) => Promise<NextResponse>

/**
 * Wraps a route handler with centralized error handling.
 * Catches ApiError, ZodError, and unexpected errors, returning
 * consistent JSON error responses.
 */
export function withErrorHandler(handler: Handler): Handler {
  return async (...args: unknown[]) => {
    try {
      return await handler(...args)
    } catch (err) {
      if (err instanceof ApiError) {
        return NextResponse.json({ error: err.message }, { status: err.statusCode })
      }
      if (err instanceof ZodError) {
        return NextResponse.json(
          { error: "Validation failed", details: err.flatten().fieldErrors },
          { status: 422 },
        )
      }
      console.error("[API Error]", err)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
}
