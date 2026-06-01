import type { ZodError } from "zod";

export class ValidationError extends Error {
  validationErrors: ZodError;
  constructor(zodErros: ZodError) {
    super();
    this.validationErrors = zodErros;
  }
}
