import { ENGINE_TO_BACKEND_STREAM } from "../util/constants";
import { streamReader } from "./redis";

export const pendingResolves: Map<
  string,
  { resolve: (value: unknown) => void; timeout: NodeJS.Timeout }
> = new Map();

export async function eventListener() {
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
    const eventData = event[0]?.messages[0];
    console.log("eventData");
    console.log(eventData);
  }
}
