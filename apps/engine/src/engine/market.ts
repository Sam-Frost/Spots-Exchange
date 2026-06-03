import type { CreateMarket, ToEngine } from "common";
import { db } from "../db/db";
import { sendToBackend } from "../redis/redis";
import { logger } from "../util/logger";

export async function createMarket(data: ToEngine<CreateMarket>) {
  data.data.marketId = Number(data.data.marketId);
  db.orderbook.createNewOrderBook(data.data.marketId);
  logger.info(`Orderbook for market id ${data.data.marketId} created!`);

  await sendToBackend({
    correlationId: data.correlationId,
    eventName: data.eventName,
    success: "true",
    data: null,
  });
}
