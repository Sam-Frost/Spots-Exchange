import type { AddBalance, RegisterUser, ToEngine } from "common";
import { db } from "../db/db";
import { sendToBackend } from "../redis/redis";
import { logger } from "../util/logger";

export async function registerUser(data: ToEngine<RegisterUser>) {
  db.user.createUser(data.data.userId);
  logger.info("User registered, sending ACK to backend");
  await sendToBackend({
    correlationId: data.correlationId,
    eventName: data.eventName,
    data: null,
    success: "true",
  });
}

export async function addBalance(data: ToEngine<AddBalance>) {
  db.user.increaseBalance(data.data.userId, data.data.amount);
  await sendToBackend({
    correlationId: data.correlationId,
    eventName: data.eventName,
    data: {},
    success: "true",
  });
}
