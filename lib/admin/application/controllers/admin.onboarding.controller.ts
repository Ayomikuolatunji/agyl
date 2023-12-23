import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { AdminOnBoardingService } from "lib/admin/service/admin.onboarding.service";
import { successHandler } from "middlewares/res/success-handler";

export class AdminOnBoardingController {
  private adminOnboard = new AdminOnBoardingService();
  public signup: RequestHandler = async (req, res, next) => {
    try {
      const signup = await this.adminOnboard.signup(req.body);
      successHandler(res, {
        data: signup,
        message: "Admin onboard successfully",
        statusCode: StatusCodes.CREATED,
      });
    } catch (error) {
      next(error);
    }
  };
  public login: RequestHandler = async (req, res, next) => {
    try {
       const login = await this.adminOnboard.loginUser(req.body);
       successHandler(res, {
         data: login,
         message: "Admin loggedIn successfully",
         statusCode: StatusCodes.CREATED,
       });
    } catch (error) {
       next(error);
    }
  };
}
