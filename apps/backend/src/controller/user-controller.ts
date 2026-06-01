import bcrypt from "bcrypt";
import { prisma } from "db";
import type { Request, Response } from "express";
import { signupSchema } from "../schema/user-schema";
import { ValidationError } from "../errors/ValidationError";
import { ApiError } from "../util/api-error";
import { generateCorrelationId, sendToEngine } from "../queue/redis";
import type { RegisterUser, ToBackend, ToEngine } from "common";
import { ApiResponse } from "../util/api-response";
import { generateToken } from "../util/jwt";
import { PrismaClientKnownRequestError } from "db/generated/prisma/internal/prismaNamespace";

export async function signupController(
  req: Request,
  res: Response,
): Promise<void> {
  const parsedBody = signupSchema.safeParse(req.body);

  if (!parsedBody.success) {
    throw new ValidationError(parsedBody.error);
  }

  const hashedPassword = await bcrypt.hash(parsedBody.data.password, 10);
  try {
    const savedUser = await prisma.user.create({
      data: {
        username: parsedBody.data.username,
        password: hashedPassword,
        balance: "0",
        lockedBalance: "0",
      },
    });
    const data: ToEngine<RegisterUser> = {
      correlationId: generateCorrelationId(),
      eventName: "REGISTER_USER",
      data: {
        userId: savedUser.id,
      },
    };
    const engineResponse = (await sendToEngine(data)) as ToBackend<unknown>;

    if (!engineResponse.success) {
      res.status(200).json(new ApiError(engineResponse.error!));
      return;
    }

    res.status(201).json(
      new ApiResponse(
        true,
        {
          userId: savedUser.id,
          token: generateToken(savedUser.id),
        },
        "User successfully registered!",
      ),
    );
  } catch (err) {
    if (err instanceof PrismaClientKnownRequestError) {
      res.status(200).json(new ApiError("Username already exist"));
      return;
    }
    console.log(err);
    throw new ApiError("Error not handled yet");
  }
}

export async function signinController(
  req: Request,
  res: Response,
): Promise<void> {
  const parsedBody = signupSchema.safeParse(req.body);

  if (!parsedBody.success) {
    throw new ValidationError(parsedBody.error);
  }

  try {
    const savedUser = await prisma.user.findUniqueOrThrow({
      where: {
        username: parsedBody.data.username,
      },
    });

    const isPasswordValid = await bcrypt.compare(
      parsedBody.data.password,
      savedUser.password,
    );

    if (!isPasswordValid) {
      res.status(200).json(new ApiError("Invalid password"));
      return;
    }

    res.status(200).json(
      new ApiResponse(
        true,
        {
          userId: savedUser.id,
          token: generateToken(savedUser.id),
        },
        "User successfully login!",
      ),
    );
  } catch (err) {
    throw new ApiError("Error not handled yet");
  }
}

export async function onRampController(
  req: Request,
  res: Response,
): Promise<void> {
  res.status(503).json({
    mesage: "To be implemented",
  });
}
