export type CreateMarket = {
  marketId: number;
  slug: String;
  priceTickSize: String;
  quantityStepSize: String;
};

export type RegisterUser = {
  userId: number;
};

export type AddBalance = {
  userId: number;
  amount: string;
};
