import { Router } from "express";
import { OnboardingRouter } from "./onboarding.router";
import { StudentController } from "../controllers/student.controller";

const StudentRouter = Router();

const controller = new StudentController();

StudentRouter.use("/onboarding", OnboardingRouter);

StudentRouter.route("/:userId").get(controller.getStudent);

export { StudentRouter };
