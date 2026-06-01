export class ApiResponse {
  success: boolean;
  data: unknown;
  message: string;
  error: unknown;
  constructor(
    success: boolean,
    data: unknown,
    message: string,
    error?: unknown,
  ) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
  }
}
