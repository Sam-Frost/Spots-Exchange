import type { Request, Response, NextFunction } from "express";
import { ADMIN_API_KEY_HEADER } from "../util/constants";
import { AuthorizationError } from "../errors/AuthorizationError";
import { env } from "../util/env";

export function adminAuth(req: Request, res: Response, next: NextFunction) {
  const adminApiKey = req.get(ADMIN_API_KEY_HEADER);

  if (!adminApiKey) {
    throw new AuthorizationError("Admin api key is missing!", 401);
  }

  if (adminApiKey != env.adminApiKey) {
    throw new AuthorizationError("Invalid admin api key", 401);
  }

  next();
}
