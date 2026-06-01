import { Router } from "express";
import { asyncHandler } from "../util/async-handler";
import { adminAuth } from "../middleware/admin-auth-middleware";
import { createMarket } from "../controller/admin-controller";

const adminRouter = Router();

adminRouter.use(adminAuth);
adminRouter.post("/api/v1/admin/market", asyncHandler(createMarket));
