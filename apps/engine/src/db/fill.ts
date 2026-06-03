import { generateRandomId } from "./db";

export class Fill {
  id: string;
  takerOrderId: number;
  takerUserId: number;
  makerOrderId: number;
  makerUserId: number;
  quantityStep: bigint;
  priceTick: bigint;
  constructor(
    takerId: number,
    takerUserId: number,
    makerId: number,
    makerUserId: number,
    quantityStep: bigint,
    priceTick: bigint,
  ) {
    this.id = generateRandomId();
    this.takerOrderId = takerId;
    this.takerUserId = takerUserId;
    this.makerOrderId = makerId;
    this.makerUserId = makerUserId;
    this.quantityStep = quantityStep;
    this.priceTick = priceTick;
  }
}
