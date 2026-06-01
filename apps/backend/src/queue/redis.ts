import { createClient } from "redis";
import { logger } from "../util/logger";
import { env } from "../util/env";
import {
  BACKEND_TO_ENGINE_STREAM,
  type ToBackend,
  type ToEngine,
} from "common";
import { REQUEST_TIMED_OUT, TIMEOUT_DURATION } from "../util/constants";
import { pendingResolves } from "./eventListener";

export const streamWriter = createClient({
  url: env.redisUrl,
});
export const streamReader = createClient({
  url: env.redisUrl,
});

streamWriter.on("error", (err) =>
  logger.error("streamWriter Client Error", err),
);

streamReader.on("error", (err) =>
  logger.error("streamReader Client Error", err),
);

export async function sendToEngine(data: ToEngine<unknown>) {
  await streamWriter.XADD(BACKEND_TO_ENGINE_STREAM, "*", {
    ...data,
    data: JSON.stringify(data.data),
  });

  const promise = new Promise((resolve) => {
    const timeout = setTimeout(() => {
      const errorResponse: ToBackend<null> = {
        eventName: data.eventName,
        correlationId: data.correlationId,
        success: false,
        error: REQUEST_TIMED_OUT,
        data: null,
      };
      pendingResolves.delete(data.correlationId);
      resolve(errorResponse);
    }, TIMEOUT_DURATION);
    pendingResolves.set(data.correlationId, { resolve, timeout });
  });

  return promise;
}

export function generateCorrelationId() {
  return crypto.randomUUID().toString();
}
