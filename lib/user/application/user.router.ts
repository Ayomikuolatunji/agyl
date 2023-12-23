import { Router } from "express";
import { UserController } from "./user.controller";
import { validate } from "express-validation";
import {
  changeEmailValidation,
  createUserAccountValidation,
  emailValidation,
  loginUserAccountValidation,
} from "./validations/user.validation";
import { UtilityFunctions } from "util/util.auth";
import { Auth } from "middlewares/auth/authToken";

const router = Router();

const userController = new UserController();

const UserLogoutRouter = Router();

const authUtil = new UtilityFunctions();

router.post("/auth/signup", validate(createUserAccountValidation), userController.signup);

router.post("/auth/login", validate(loginUserAccountValidation), userController.loginUser);

UserLogoutRouter.get("/logout", Auth, userController.logoutUser);

router.post(
  "/auth/request-email-verification-link",
  authUtil.enableRateLimit(3, 60 * 60 * 1000, "You can only make 3 requests every hour."),
  userController.requestToken
);

router.post("/auth/change-email", validate(changeEmailValidation), userController.changeEmail);

router.put("/auth/verify-email", userController.verifyEmail);

router.post("/auth/forget-password", userController.forgetPassword);

router.put("/auth/reset-password", userController.resetPassword);

export { router as UserRouter, UserLogoutRouter };
