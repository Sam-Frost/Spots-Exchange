import express from "express";
import { adminRouter } from "./routes/admin-route";
import { errorHandler } from "./errors/error-handler";
import { orderRouter } from "./routes/order-routes";
import { userRouter } from "./routes/user-routes";

export const app = express();

app.use(express.json());

app.use(adminRouter);
app.use(orderRouter);
app.use(userRouter);

app.use(errorHandler);
