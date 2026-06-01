import type { Request, Response } from "express";

export async function creatOrder(req: Request, res: Response): Promise<void> {
  res.status(503).json({
    mesage: "To be implemented",
  });
}

export async function getOrder(req: Request, res: Response): Promise<void> {
  res.status(503).json({
    mesage: "To be implemented",
  });
}
