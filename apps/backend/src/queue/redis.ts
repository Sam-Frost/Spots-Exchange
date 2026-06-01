import { createClient } from "redis";
import { logger } from "../util/logger";

export const streamWriter = createClient();
export const streamReader = createClient();

streamWriter.on("error", (err) =>
  logger.error("streamWriter Client Error", err),
);

streamReader.on("error", (err) =>
  logger.error("streamReader Client Error", err),
);

await Promise.all([streamReader.connect(), streamWriter.connect()]);

export async function sendToRedis() {}
