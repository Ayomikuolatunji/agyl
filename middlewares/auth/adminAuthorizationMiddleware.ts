import { NextFunction, Request, Response } from "express";
import { successHandler } from "middlewares/res/success-handler";
import { AdminRepository } from "shared/repository/admin.repository";

const adminRepository = new AdminRepository();

export const checkAdminRolesAndPermissions = (requiredRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.userId;
      const user = await adminRepository.getAdminById(adminId);
      const hasRequiredRoles = user.roles.some((role) => requiredRoles.includes(role.role.name));
      if (hasRequiredRoles) {
        next();
      } else {
        successHandler(res, { message: "Access denied", statusCode: 403 });
      }
    } catch (error) {
      next(error);
    }
  };
};
