import { Joi } from "express-validation";

export const rolePermissionValidation = {
  body: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
  }),
};

export const updatePermissionValidation = {
  body: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().required(),
  }),
  params: Joi.object({
    roleId: Joi.string().uuid().required(),
  }),
};

export const loginUserAccountValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

export const rolesPermissionsValidation = {
  body: Joi.object({
    roleData: Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
    }).required(),
    permissionIds: Joi.array().items(Joi.string()).required(),
  }),
};

const permissionSchema = Joi.object({
  permissionId: Joi.string().uuid().required(),
  isActive: Joi.boolean().required(),
});

export const assignRolePermissionValidation = {
  body: Joi.object({
    permissions: Joi.array().items(permissionSchema).min(1).max(4).required(),
  }),
};

export const roleIdValidation = {
  params: Joi.object({
    roleId: Joi.string().required(),
  }),
};


export const onBoardValidation = {
  body: Joi.object({
    password: Joi.string(),
    userName: Joi.string().required(),
    userTypeId: Joi.string().guid().required(),
    autoCreatePassword: Joi.boolean().required(),
    requireUserToChangePassword: Joi.boolean().required(),
    email: Joi.string().email().required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    jobTitle: Joi.string().required(),
    department: Joi.string().required(),
    office: Joi.string().required(),
    officePhone: Joi.string().required(),
    faxNumber: Joi.string().required(),
    domain: Joi.string().required(),
    mobilePhone: Joi.string().required(),
    city: Joi.string().required(),
    state: Joi.string().required(),
    zipCode: Joi.string().required(),
    country: Joi.string().required(),
    streetAddress: Joi.string().required(),
    roles: Joi.array().items(Joi.string().guid()).required(),
    sendPassword: Joi.boolean().required(),
  }),
};

