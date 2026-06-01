import type { ZodError } from "zod";

export class AuthorizationError extends Error {
  constructor(message: string, statusCode: number) {
    super(message);
  }
}
