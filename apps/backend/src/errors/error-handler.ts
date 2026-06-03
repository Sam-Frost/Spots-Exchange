import type { Request, Response, NextFunction } from "express";
import { ApiError } from "../util/api-error";
import { logger } from "../util/logger";
import { ValidationError } from "./ValidationError";
import { RequestTimeoutError } from "./request-timeout-error";
import { AuthorizationError } from "./AuthorizationError";

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (err instanceof ValidationError) {
    logger.error("Validation error occured");
    logger.error(err.validationErrors);
    res.status(400).json(new ApiError("Validation error occured!"));
  } else if (err instanceof RequestTimeoutError) {
    res.status(408).json(new ApiError("Request timed out"));
  } else if (err instanceof AuthorizationError) {
    res.status(401).json(new ApiError(err.message));
  } else {
    logger.error(err.name);
    logger.error(err.message);
    logger.error(err.cause);
    logger.error(err.stack);
    res.status(500).json(new ApiError("An unkown error occured"));
  }
}
