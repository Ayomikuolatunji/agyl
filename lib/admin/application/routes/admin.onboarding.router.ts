import { Router } from "express";
import { AdminOnBoardingController } from "../controllers/admin.onboarding.controller";
import { loginUserAccountValidation, onBoardValidation } from "../validations/validations";
import { validate } from "express-validation";

const adminOnBoardingRouter = Router();
const adminOnBoardingController = new AdminOnBoardingController();

adminOnBoardingRouter
  .route("/signup")
  .post(validate(onBoardValidation), adminOnBoardingController.signup);

adminOnBoardingRouter
  .route("/login")
  .post(validate(loginUserAccountValidation), adminOnBoardingController.login);

export { adminOnBoardingRouter };
