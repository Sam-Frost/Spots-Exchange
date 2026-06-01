import { prisma } from "db";
import type { Request, Response } from "express";
import { createMarketSchema } from "../schema/admin-schema";
import { ValidationError } from "../errors/ValidationError";
import { ApiResponse } from "../util/api-response";
import { generateCorrelationId, sendToEngine } from "../queue/redis";
import type { CreateMarket, ToBackend, ToEngine } from "common";
import { RequestTimeoutError } from "../errors/request-timeout-error";
import { REQUEST_TIMED_OUT } from "../util/constants";

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

    const data: ToEngine<CreateMarket> = {
      correlationId: generateCorrelationId(),
      eventName: "CREATE_MARKET",
      data: {
        marketId: createdMarket.id,
        slug: createdMarket.slug,
        quantityStepSize: createdMarket.quantityStepSize,
        priceTickSize: createdMarket.priceTickSize,
      },
    };

    const engineResponse = (await sendToEngine(data)) as ToBackend<unknown>;
    console.log(engineResponse);
    if (!engineResponse.success) {
      if (engineResponse.error == REQUEST_TIMED_OUT) {
        throw new RequestTimeoutError();
      }
    }

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
    if (err instanceof RequestTimeoutError) {
      throw err;
    }
    console.log(err);
    // TODO : Handle Error
  }
}
