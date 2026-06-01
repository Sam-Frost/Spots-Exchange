import pino from "pino";

export function getLogger(serviceName: string) {
  const logger = pino();

  return logger;
}
