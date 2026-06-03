import type { Request, Response, NextFunction } from "express";
import { AuthorizationError } from "../errors/AuthorizationError";
import jwt, { type JwtPayload } from "jsonwebtoken";
import { env } from "../util/env";
import { ApiError } from "../util/api-error";

export function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const authHeader = req.headers.authorization;
  console.log(authHeader);

  if (!authHeader?.startsWith("Bearer ")) {
    throw new AuthorizationError("Auth header is missing", 401);
  }

  const token = authHeader.slice(7);

  if (!token) {
    throw new AuthorizationError("Token is missing", 401);
  }

  try {
    const result = jwt.verify(token, env.jwtSecretKey);
    console.log((result as JwtPayload).userId);
    req.userId = (result as JwtPayload).userId;
    next();
  } catch (err) {
    res.status(401).json(new ApiError("Invalid or expired token"));
  }
}
