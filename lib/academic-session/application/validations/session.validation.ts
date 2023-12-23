import { AcademicSessionStatus } from "@prisma/client";
import { Joi } from "express-validation";

export const SessionValidation = {
  body: Joi.object({
    id: Joi.string().uuid().optional(),
    yearSession: Joi.string().required(),
    status: Joi.string()
      .valid(
        AcademicSessionStatus.COMPLETE,
        AcademicSessionStatus.ONGOING,
        AcademicSessionStatus.PENDING
      )
      .optional(),
  }),
};
