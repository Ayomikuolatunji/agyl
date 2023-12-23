import { SessionService } from "lib/academic-session/services/session.service";
import { RequestHandler } from "express";
import { successHandler } from "middlewares/res/success-handler";

export class SessionController {
  protected sessionService = new SessionService();

  createAcademicSession: RequestHandler = async (req, res, next) => {
    try {
      await this.sessionService.createAcademicSession(req.body);

      successHandler(res, {
        statusCode: 201,
        message: "New Academic session added ",
      });
    } catch (err) {
      next(err);
    }
  };

  updateAcademicSession: RequestHandler = async (req, res, next) => {
    try {
      await this.sessionService.updateAcedemicSession(req.body);

      successHandler(res, { statusCode: 200, message: "Session updated" });
    } catch (err) {
      next(err);
    }
  };

  getAcademicSessions: RequestHandler = async (req, res, next) => {
    const data = await this.sessionService.getAcademicSessions();

    successHandler(res, { data, statusCode: 200, message: "Okay" });
  };
}
