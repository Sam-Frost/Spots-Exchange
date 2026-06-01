import jwt from "jsonwebtoken";
import { env } from "./env";
export function generateToken(userId: number): string {
  const token = jwt.sign(userId.toString(), env.jwtSecretKey, {
    algorithm: "ES256",
    expiresIn: "7 days",
  });
  return token;
}
