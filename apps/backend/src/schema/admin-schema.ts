import z from "zod";
import { positiveNumericString } from "./common-schemta";

export const createMarketSchema = z.object({
  slug: z.string(),
  priceTickSize: positiveNumericString,
  quantityStepSize: positiveNumericString,
});
