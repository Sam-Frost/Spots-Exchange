export class ApiError {
  success: boolean = false;
  message: string;
  error: unknown;
  constructor(message: string, error?: unknown) {
    this.message = message;
    this.error = error;
  }
}
