import z from "zod";
import { positiveNumericString } from "./common-schemta";

export const signupSchema = z.object({
  username: z.string(),
  password: z.string(),
});

export const onrampSchema = z.object({
  amount: z.string(),
});
