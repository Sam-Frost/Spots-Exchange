import { Router } from "express";
import { asyncHandler } from "../util/async-handler";
import { creatOrder, getOrder } from "../controller/order-controller";

const orderRouter = Router();

orderRouter.post("/api/v1/order", asyncHandler(creatOrder));
orderRouter.get("/api/v1/order/:marketId", asyncHandler(getOrder));
