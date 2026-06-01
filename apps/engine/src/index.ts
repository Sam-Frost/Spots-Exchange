import { engineInit } from "./engine/engine";
import { streamReader, streamWriter } from "./redis/redis";

async function init() {
  await Promise.all([streamWriter.connect(), streamReader.connect()]);
  engineInit();
}

init();
