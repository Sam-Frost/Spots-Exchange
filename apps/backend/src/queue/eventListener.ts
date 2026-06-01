import { ENGINE_TO_BACKEND_STREAM, type ToBackend } from "common";
import { streamReader } from "./redis";
import { logger } from "../util/logger";

export const pendingResolves: Map<
  string,
  { resolve: (value: unknown) => void; timeout: NodeJS.Timeout }
> = new Map();

export async function eventListener() {
  logger.info("Starting event listener loop...");
  while (true) {
    const event = await streamReader.XREAD(
      {
        key: ENGINE_TO_BACKEND_STREAM,
        id: "$",
      },
      {
        COUNT: 1,
        BLOCK: 1000,
      },
    );

    if (!event) continue;

    const eventData = event[0]?.messages[0].message as ToBackend<unknown>;
    eventData.data = eventData.data
      ? JSON.parse(eventData.data as string)
      : null;

    const pendingResolve = pendingResolves.get(eventData.correlationId);

    if (!pendingResolve) {
      logger.error(`No reslove for correlation id ${eventData.correlationId}`);
      continue;
    }

    pendingResolve.resolve(eventData);
    clearTimeout(pendingResolve.timeout);
    pendingResolves.delete(eventData.correlationId);
  }
}
