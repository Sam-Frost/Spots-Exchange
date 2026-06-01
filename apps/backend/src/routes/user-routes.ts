import { Router } from "express";
import {
  onRampController,
  signinController,
  signupController,
} from "../controller/user-controller";
import { asyncHandler } from "../util/async-handler";

export const userRouter = Router();

userRouter.post("/api/v1/user/singup", asyncHandler(signupController));
userRouter.post("/api/v1/user/signin", asyncHandler(signinController));
userRouter.post("/api/v1/user/onRamp", asyncHandler(onRampController));
