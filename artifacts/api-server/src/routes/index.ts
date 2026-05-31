import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import ordersRouter from "./orders";
import authRouter from "./auth";
import adminRouter from "./admin";
import settingsRouter from "./settings";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(authRouter);
router.use(adminRouter);
router.use(settingsRouter);

export default router;
