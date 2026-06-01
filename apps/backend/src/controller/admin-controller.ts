import { prisma } from "db";
import type { Request, Response } from "express";
import { createMarketSchema } from "../schema/admin-schema";
import { ValidationError } from "../errors/ValidationError";
import { ApiResponse } from "../util/api-response";

export async function createMarket(req: Request, res: Response): Promise<void> {
  const parsedData = createMarketSchema.safeParse(req.body);

  if (!parsedData.success) {
    throw new ValidationError(parsedData.error);
  }
  try {
    const createdMarket = await prisma.market.create({
      data: {
        slug: parsedData.data.slug,
        priceTickSize: parsedData.data.priceTickSize,
        quantityStepSize: parsedData.data.quantityStepSize,
      },
    });

    res.status(201).json(
      new ApiResponse(
        true,
        {
          marketId: createdMarket.id,
        },
        `Market created for slug ${parsedData.data.slug}}`,
      ),
    );
  } catch (err) {
    // TODO : Handle Error
  }
}
