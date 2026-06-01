import jwt from "jsonwebtoken";
import { env } from "./env";
export function generateToken(userId: number): string {
  const token = jwt.sign({ userId: userId.toString() }, env.jwtSecretKey, {
    expiresIn: "7d",
  });
  return token;
}
