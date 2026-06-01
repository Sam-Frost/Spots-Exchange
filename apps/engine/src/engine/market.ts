import type { CreateMarket, ToEngine } from "common";
import { db } from "../db/db";

export function createMarket(data: ToEngine<CreateMarket>) {
  db.orderbook.createNewOrderBook(data.data.marketId);
}
