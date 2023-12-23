import { Router } from "express";
import { adminOnBoardingRouter } from "lib/admin/application/routes/admin.onboarding.router";
import { StaticRouter } from "lib/static-data/static.router";
import { UserRouter } from "lib/user/application/user.router";

const PublicRouter = Router();

PublicRouter.use("/user", UserRouter);
PublicRouter.use("/admin/onboarding", adminOnBoardingRouter);
PublicRouter.use("/static-data", StaticRouter);

export { PublicRouter };
