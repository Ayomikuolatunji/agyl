import { Router } from "express";
import { RolesPermissionController } from "../controllers/rolePermission.controller";
import {
  assignRolePermissionValidation,
  roleIdValidation,
  rolePermissionValidation,
  updatePermissionValidation,
} from "../validations/validations";
import { validate } from "express-validation";
import { checkAdminRolesAndPermissions } from "middlewares/auth/adminAuthorizationMiddleware";

const rolesPermissionRouter = Router();

const adminRolesPermissionController = new RolesPermissionController();

rolesPermissionRouter
  .route("/roles")
  .post(
    checkAdminRolesAndPermissions(["roles and permission"]),
    validate(rolePermissionValidation),
    adminRolesPermissionController.roles
  );

rolesPermissionRouter
  .route("/roles/:roleId")
  .post(
    checkAdminRolesAndPermissions(["roles and permission"]),
    validate(updatePermissionValidation),
    adminRolesPermissionController.updateRole
  );

rolesPermissionRouter
  .route("/roles")
  .get(
    // checkAdminRolesAndPermissions(["roles and permission"]),
    adminRolesPermissionController.fetchRoles
  );

rolesPermissionRouter
  .route("/roles/associateRoleWithPermissions/:roleId")
  .post(
    checkAdminRolesAndPermissions(["roles and permission"]),
    validate(assignRolePermissionValidation),
    adminRolesPermissionController.associateRoleWithPermissions
  );

rolesPermissionRouter
  .route("/roles/assignRolesToAdmin/:adminId")
  .post(
    checkAdminRolesAndPermissions(["roles and permission"]),
    adminRolesPermissionController.assignRolesToAdmin
  );

rolesPermissionRouter
  .route("/roles/removeRolesFromAdmin/:adminId")
  .put(
    checkAdminRolesAndPermissions(["roles and permission"]),
    adminRolesPermissionController.removeRolesFromAdmin
  );

rolesPermissionRouter
  .route("/roles/removePermissionsFromRole/:roleId")
  .put(
    checkAdminRolesAndPermissions(["roles and permission"]),
    validate(assignRolePermissionValidation),
    adminRolesPermissionController.removePermissionsFromRole
  );

rolesPermissionRouter
  .route("/roles/:roleId")
  .delete(
    checkAdminRolesAndPermissions(["roles and permission"]),
    validate(roleIdValidation),
    adminRolesPermissionController.deleteRole
  );

rolesPermissionRouter
  .route("/permissions")
  .post(
    checkAdminRolesAndPermissions(["roles and permission"]),
    validate(rolePermissionValidation),
    adminRolesPermissionController.permissions
  );

rolesPermissionRouter
  .route("/permissions")
  .get(
    checkAdminRolesAndPermissions(["roles and permission"]),
    adminRolesPermissionController.allPermissions
  );

export { rolesPermissionRouter };
