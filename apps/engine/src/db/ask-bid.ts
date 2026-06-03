import { generateRandomId } from "./db";

export class AskBid {
  id: string;
  userId: number;
  orderId: number;
  quantityStep: bigint;
  priceTick: bigint;
  lockedCollateral: bigint;
  constructor(
    userId: number,
    orderId: number,
    quantityStep: bigint,
    priceTick: bigint,
    lockedCollateral: bigint,
  ) {
    this.id = generateRandomId();
    this.userId = userId;
    this.orderId = orderId;
    this.quantityStep = quantityStep;
    this.priceTick = priceTick;
    this.lockedCollateral = lockedCollateral;
  }
}
