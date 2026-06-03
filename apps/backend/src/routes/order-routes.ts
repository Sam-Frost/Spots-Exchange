import { Router } from "express";
import { asyncHandler } from "../util/async-handler";
import { creatOrder, getOrder } from "../controller/order-controller";
import { authMiddleware } from "../middleware/auth-middleware";

export const orderRouter = Router();

orderRouter.post("/api/v1/order", authMiddleware, asyncHandler(creatOrder));
orderRouter.get(
  "/api/v1/order/:marketId",
  authMiddleware,
  asyncHandler(getOrder),
);
