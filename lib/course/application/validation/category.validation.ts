import { Joi } from "express-validation";

export const CourseCategorySchema = {
  body: Joi.object({
    id: Joi.string().uuid().optional(),
    name: Joi.string().required(),
  }),
};
