import express from "express";

import { env } from "./util/env";
import { logger } from "./util/logger";

const app = express();

app.use(express.json());

app.listen(env.port, () => {
  logger.info(`Server started listening on ${env.port}`);
});
