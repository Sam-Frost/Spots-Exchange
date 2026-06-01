import {
  ENGINE_TO_BACKEND_STREAM,
  type CreateMarket,
  type RegisterUser,
  type ToEngine,
} from "common";
import { sendToBackend, streamReader } from "../redis/redis";
import { createMarket } from "./market";
import { createOrder, cancelOrder } from "./order";
import { addBalance, registerUser } from "./user";

export async function engineInit() {
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

    const eventData = event[0]?.messages[0] as ToEngine<unknown>;

    switch (eventData.eventName) {
      case "CREATE_MARKET":
        createMarket(eventData as ToEngine<CreateMarket>);
        break;
      case "REGISTER_USER":
        registerUser(eventData as ToEngine<RegisterUser>);
        break;
      case "ADD_BALANCE":
        addBalance();
        break;
      case "CREATER_ORDER":
        createOrder();
        break;
      case "CANCEL_ORDER":
        cancelOrder();
        break;
      default:
        sendToBackend({
          correlationId: eventData.correlationId,
          eventName: eventData.eventName,
          success: false,
          data: null,
          error: "Invalid event ",
        });
    }
  }
}
