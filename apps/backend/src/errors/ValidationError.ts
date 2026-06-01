import type { ZodError } from "zod";

export class ValidationError extends Error {
  constructor(zodErros: ZodError) {
    super();
  }
}
