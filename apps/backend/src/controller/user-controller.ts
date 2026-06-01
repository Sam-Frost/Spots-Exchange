import type { Request, Response } from "express";

export async function signupController(
  req: Request,
  res: Response,
): Promise<void> {
  res.status(503).json({
    mesage: "To be implemented",
  });
}

export async function signinController(
  req: Request,
  res: Response,
): Promise<void> {
  res.status(503).json({
    mesage: "To be implemented",
  });
}

export async function onRampController(
  req: Request,
  res: Response,
): Promise<void> {
  res.status(503).json({
    mesage: "To be implemented",
  });
}
