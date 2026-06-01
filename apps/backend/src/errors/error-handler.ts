import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../util/api-error";
import { logger } from "../util/logger";
import { ValidationError } from "./ValidationError";
import { RequestTimeoutError } from "./request-timeout-error";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof ValidationError) {
    logger.error("Validation error occured");
    logger.error(err.validationErrors);
  } else if (err instanceof RequestTimeoutError) {
    return res.status(408).json(new ApiError("Request timed out"));
  } else {
    res.status(500).json(new ApiError("An unkown error occured"));
  }
}
