import type { AddBalance, RegisterUser, ToEngine } from "common";
import { db } from "../db/db";
import { sendToBackend } from "../redis/redis";

export async function registerUser(data: ToEngine<RegisterUser>) {
  db.user.createUser(data.data.userId);
  await sendToBackend({
    correlationId: data.correlationId,
    eventName: data.eventName,
    data: null,
    success: true,
  });
}

export function addBalance(data: ToEngine<AddBalance>) {
  db.user.increaseBalance(data.data.userId, data.data.amount);
}
