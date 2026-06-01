import z from "zod";

export const positiveNumericString = z.string().regex(/^\d+(?:\.\d+)?$/);
