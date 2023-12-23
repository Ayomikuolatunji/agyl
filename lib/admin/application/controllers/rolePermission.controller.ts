import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { AdminRolesPermissionService } from "lib/admin/service/rolePermission.service";
import { successHandler } from "middlewares/res/success-handler";

export class RolesPermissionController {
  private rolePermissionService = new AdminRolesPermissionService();

  public roles: RequestHandler = async (req, res, next) => {
    try {
      const createRole = await this.rolePermissionService.createRole(req.body);
      successHandler(res, {
        message: "Role created successfully",
        data: createRole,
        statusCode: StatusCodes.CREATED,
      });
    } catch (error) {
      next(error);
    }
  };
  public updateRole: RequestHandler = async (req, res, next) => {
    try {
      const updateRole = await this.rolePermissionService.updateRole(
        { roleId: req.params.roleId },
        req.body
      );
      successHandler(res, {
        message: "Role updated successfully",
        data: updateRole,
        statusCode: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  };
  public fetchRoles: RequestHandler = async (req, res, next) => {
    try {
      successHandler(res, {
        statusCode: StatusCodes.OK,
        message: "fetched successfully",
        data: await this.rolePermissionService.fetchRoles(),
      });
    } catch (error) {
      next(error);
    }
  };
  public permissions: RequestHandler = async (req, res, next) => {
    try {
      const createPermission = await this.rolePermissionService.createPermission(req.body);
      successHandler(res, {
        message: "Permission created successfully",
        data: createPermission,
        statusCode: StatusCodes.CREATED,
      });
    } catch (error) {
      next(error);
    }
  };
  public associateRoleWithPermissions: RequestHandler = async (req, res, next) => {
    try {
      const createRoleWithPermissions =
        await this.rolePermissionService.associateRoleWithPermissions(req.params.roleId, req.body);
      successHandler(res, {
        message: "Role permissions associated successfully",
        data: createRoleWithPermissions,
        statusCode: StatusCodes.CREATED,
      });
    } catch (error) {
      next(error);
    }
  };
  public removeRolesFromAdmin: RequestHandler = async (req, res, next) => {
    try {
      await this.rolePermissionService.removeRolesFromAdmin(req.params.adminId, req.body);
      successHandler(res, {
        message: "Done!",
        statusCode: StatusCodes.CREATED,
      });
    } catch (error) {
      next(error);
    }
  };
  public assignRolesToAdmin: RequestHandler = async (req, res, next) => {
    try {
      await this.rolePermissionService.assignRolesToAdmin(req.params.adminId, req.body);
      successHandler(res, {
        message: "Roles assigned and updated successfully",
        statusCode: StatusCodes.CREATED,
      });
    } catch (error) {
      next(error);
    }
  };
  public deleteRole: RequestHandler = async (req, res, next) => {
    try {
      const deleteRole = await this.rolePermissionService.deleteRole(req.params.roleId);
      successHandler(res, {
        message: "Role deleted successfully",
        data: deleteRole,
        statusCode: StatusCodes.CREATED,
      });
    } catch (error) {
      next(error);
    }
  };
  public removePermissionsFromRole: RequestHandler = async (req, res, next) => {
    try {
      const deleteRole = await this.rolePermissionService.removePermissionsFromRole(
        req.params.roleId,
        req.body
      );
      successHandler(res, {
        message: "Permission deleted successfully from the select role",
        data: deleteRole,
        statusCode: StatusCodes.CREATED,
      });
    } catch (error) {
      next(error);
    }
  };
  public allPermissions: RequestHandler = async (req, res, next) => {
    try {
      const permissions = await this.rolePermissionService.permissions();
      successHandler(res, {
        message: "Permissions fetched successfully",
        data: permissions,
        statusCode: StatusCodes.CREATED,
      });
    } catch (error) {
      next(error);
    }
  };
}
