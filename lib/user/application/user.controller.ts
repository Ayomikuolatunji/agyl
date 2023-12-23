import { successHandler } from "middlewares/res/success-handler";
import { NextFunction, RequestHandler, Response } from "express";
import { AuthService } from "../service/auth.service";
import { StatusCodes } from "http-status-codes";

export class UserController {
  private authService = new AuthService();
  public signup: RequestHandler = async (req, res, next) => {
    try {
      await this.authService.signup(req.body);
      successHandler(res, {
        statusCode: StatusCodes.CREATED,
        message: "User signup successful",
      });
    } catch (error) {
      next(error);
    }
  };
  public loginUser: RequestHandler = async (req, res, next) => {
    try {
      const login = await this.authService.loginUser(req.body);
      successHandler(res, {
        statusCode: StatusCodes.OK,
        message: "Login successfully",
        data: login,
      });
    } catch (error) {
      next(error);
    }
  };
  public logoutUser: RequestHandler = async (req, res: Response, next: NextFunction) => {
    try {
      await this.authService.logout(req);
      successHandler(res, {
        statusCode: StatusCodes.OK,
        message: "Logout successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  public verifyEmail: RequestHandler = async (req, res, next) => {
    try {
      const message = await this.authService.verifyEmail(req.body.email, req.body.token);
      successHandler(res, {
        statusCode: StatusCodes.OK,
        message,
      });
    } catch (error) {
      next(error);
    }
  };
  public forgetPassword: RequestHandler = async (req, res, next) => {
    try {
      await this.authService.forgetPassword(req.body.email);
      successHandler(res, {
        statusCode: StatusCodes.OK,
        message: "Check inbox to update password",
      });
    } catch (error) {
      next(error);
    }
  };
  public resetPassword: RequestHandler = async (req, res, next) => {
    try {
      await this.authService.resetPassword(req.body.email, req.body.password, req.body.token, req);
      successHandler(res, {
        statusCode: StatusCodes.OK,
        message: "Password updated successfully",
      });
    } catch (error) {
      next(error);
    }
  };
  public changeEmail: RequestHandler = async (req, res, next) => {
    try {
      await this.authService.changeEmail(req.body);
      successHandler(res, {
        statusCode: StatusCodes.OK,
        message: "Email updated successfully. Check inbox to verify the email address",
      });
    } catch (error) {
      next(error);
    }
  };
  public requestToken: RequestHandler = async (req, res, next) => {
    try {
      await this.authService.requestEmailVerificationToken(req.body.email);
      successHandler(res, {
        statusCode: StatusCodes.OK,
        message: "Sent!",
      });
    } catch (error) {
      next(error);
    }
  };
}
