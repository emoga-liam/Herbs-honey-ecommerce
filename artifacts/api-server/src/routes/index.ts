import { Router, type IRouter } from "express";
import healthRouter from "./health";
import productsRouter from "./products";
import ordersRouter from "./orders";
import authRouter from "./auth";
import adminRouter from "./admin";
import settingsRouter from "./settings";
import uploadsRouter from "./uploads";
import categoriesRouter from "./categories";
import deliveryFeesRouter from "./delivery-fees";

const router: IRouter = Router();

router.use(healthRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(authRouter);
router.use(adminRouter);
router.use(settingsRouter);
router.use(uploadsRouter);
router.use(categoriesRouter);
router.use(deliveryFeesRouter);

export default router;
