import { createClient } from "redis";
import { env } from "../util/env";
import { logger } from "../util/logger";
import {
  ENGINE_TO_BACKEND_STREAM,
  type EventType,
  type ToBackend,
} from "common";

export const streamWriter = createClient({
  url: env.redisUrl,
});
export const streamReader = createClient({
  url: env.redisUrl,
});

streamWriter.on("error", (err) => logger.error("Redis Client Error", err));
streamReader.on("error", (err) => logger.error("Redis Client Error", err));

export async function sendToBackend(data: ToBackend<unknown>) {
  await streamWriter.XADD(ENGINE_TO_BACKEND_STREAM, "*", {
    ...data,
    success: String(data.success),
    data: JSON.stringify(data.data),
  });
}

export async function sendErrorToBackend(
  error: string,
  eventName: EventType,
  correlationId: string,
) {
  await sendToBackend({
    correlationId: correlationId,
    eventName: eventName,
    success: false,
    data: null,
    error,
  });
}
