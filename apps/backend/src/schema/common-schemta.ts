import z from "zod";

export const positiveNumericString = z
  .string()
  .regex(new RegExp("^\d+(?:\.\d+)?$"));
