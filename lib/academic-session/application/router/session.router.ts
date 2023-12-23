import { Router } from "express";
import { SessionController } from "../controller/session.controller";
import { validate } from "express-validation";
import * as sessionValidator from "../validations/session.validation";

const router = Router();
const controller = new SessionController();

router
  .route("/")
  .post(
    validate(sessionValidator.SessionValidation, {}, {}),
    controller.createAcademicSession
  )
  .put(
    validate(sessionValidator.SessionValidation, {}, {}),
    controller.updateAcademicSession
  )
  .get(controller.getAcademicSessions);

export { router as AcademicSessionRouter };
