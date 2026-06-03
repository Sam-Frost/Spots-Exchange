import { Router } from "express";
import {
  onRampController,
  signinController,
  signupController,
} from "../controller/user-controller";
import { asyncHandler } from "../util/async-handler";
import { authMiddleware } from "../middleware/auth-middleware";

export const userRouter = Router();

userRouter.post("/api/v1/user/signup", asyncHandler(signupController));
userRouter.post("/api/v1/user/signin", asyncHandler(signinController));
userRouter.post(
  "/api/v1/user/onRamp",
  authMiddleware,
  asyncHandler(onRampController),
);
