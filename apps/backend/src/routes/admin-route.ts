import { Router } from "express";
import { asyncHandler } from "../util/async-handler";
import { adminAuth } from "../middleware/admin-auth-middleware";
import { createMarket } from "../controller/admin-controller";

export const adminRouter = Router();

adminRouter.post("/api/v1/admin/market", adminAuth, asyncHandler(createMarket));
