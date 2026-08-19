import { Router, type IRouter } from "express";
import healthRouter from "./health";
import repairRouter from "./repair";

const router: IRouter = Router();

router.use(healthRouter);
router.use(repairRouter);

export default router;
