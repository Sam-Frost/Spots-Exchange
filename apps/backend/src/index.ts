import { app } from "./app";
import { streamReader, streamWriter } from "./queue/redis";
import { env } from "./util/env";
import { logger } from "./util/logger";

async function init() {
  await Promise.all([streamReader.connect(), streamWriter.connect()]);

  app.listen(env.port, () => {
    logger.info(`Server started listening on ${env.port}`);
  });
}

await init();
