import type { AskBid } from "./ask-bid";

export class OrderBook {
  asks: Map<bigint, AskBid[]> = new Map();
  bids: Map<bigint, AskBid[]> = new Map();
  askPriceTicks: bigint[] = [];
  bidPriceTicks: bigint[] = [];
  constructor() {}
}
