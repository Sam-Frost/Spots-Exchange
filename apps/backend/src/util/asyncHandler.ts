import type { Request, Response, NextFunction, RequestHandler } from "express";

export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler => {
  return function wrappedHandler(req, res, next) {
    void fn(req, res, next).catch(next);
  };
};
