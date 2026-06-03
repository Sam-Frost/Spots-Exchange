export type CreateMarket = {
  marketId: number;
  slug: string;
  priceTickSize: string;
  quantityStepSize: string;
};

export type RegisterUser = {
  userId: number;
};

export type AddBalance = {
  userId: number;
  amount: bigint;
};

export type OrderType = "MARKET" | "LIMIT";
export type OrderSide = "BUY" | "SELL";

export type CreateOrder = {
  id: number;
  userId: number;
  marketId: number;
  orderType: OrderType;
  orderSide: OrderSide;
  priceTick: bigint;
  quantityStep: bigint;
};
