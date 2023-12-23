import { Router } from "express";
import { OnboardingRouter } from "./onboarding.router";
import { ServiceProviderController } from "../controllers/service-provider.controller";

const ServiceProviderRouter = Router();

const controller = new ServiceProviderController();

ServiceProviderRouter.use("/onboarding", OnboardingRouter);

ServiceProviderRouter.route("/user/:userId").get(controller.getServiceProvider);

export { ServiceProviderRouter };
