import {
  BACKEND_TO_ENGINE_STREAM,
  type AddBalance,
  type CreateMarket,
  type RegisterUser,
  type ToEngine,
} from "common";
import {
  sendErrorToBackend,
  sendToBackend,
  streamReader,
} from "../redis/redis";
import { createMarket } from "./market";
import { createOrder, cancelOrder } from "./order";
import { addBalance, registerUser } from "./user";
import { logger } from "../util/logger";

export async function engineInit() {
  logger.info("Engine starting listening...");
  while (true) {
    const event = await streamReader.XREAD(
      {
        key: BACKEND_TO_ENGINE_STREAM,
        id: "$",
      },
      {
        COUNT: 1,
        BLOCK: 1000,
      },
    );

    if (!event) continue;

    let eventData = event[0]?.messages[0].message as ToEngine<unknown>;
    eventData.data = JSON.parse(eventData.data as string);

    logger.info(`Event Received :  ${eventData.eventName}`);

    try {
      switch (eventData.eventName) {
        case "CREATE_MARKET":
          await createMarket(eventData as ToEngine<CreateMarket>);
          break;
        case "REGISTER_USER":
          await registerUser(eventData as ToEngine<RegisterUser>);
          break;
        case "ADD_BALANCE":
          addBalance(eventData as ToEngine<AddBalance>);
          break;
        case "CREATER_ORDER":
          createOrder();
          break;
        case "CANCEL_ORDER":
          cancelOrder();
          break;
        default:
          await sendErrorToBackend(
            "Invalid Event",
            eventData.eventName,
            eventData.correlationId,
          );
      }
    } catch (err) {
      if (err instanceof Error) {
        logger.error(err.message);
        await sendErrorToBackend(
          err.message,
          eventData.eventName,
          eventData.correlationId,
        );
      }
    }
  }
}
