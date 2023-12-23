import { Joi } from "express-validation";

export const createUserAccountValidation = {
  body: Joi.object({
    id: Joi.string().uuid().optional(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    isAgreementAccepted: Joi.boolean().default(false),
    needEmailNotification: Joi.boolean().optional(),
    level: Joi.string().valid("BEGINNERS", "EXPERIENCED", "INTERMEDIATE").optional(),
    userTypeId: Joi.string().required(),
    field: Joi.string().required(),
    fieldOfInterestId: Joi.string().required(),
  }),
};

export const loginUserAccountValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

export const tokenAccountValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
    token: Joi.string().required(),
  }),
};

export const emailValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
  }),
};

export const changeEmailValidation = {
  body: Joi.object({
    newEmail: Joi.string().email().required(),
    oldEmail: Joi.string().email().required(),
  }),
};

export const resetPasswordValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
    token: Joi.string().required(),
    password: Joi.string().required(),
  }),
};
