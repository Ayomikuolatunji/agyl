import { RequestHandler } from "express";
import { AdminManagementService } from "lib/admin/service/admin.management.service";
import { successHandler } from "middlewares/res/success-handler";
import { AdminListingFilterOptions } from "../types";
import { StatusCodes } from "http-status-codes";

export class AdminManagementController {
  private adminManagementService = new AdminManagementService();

  public admin: RequestHandler = async (req, res, next) => {
    try {
      const admin = await this.adminManagementService.admin(req.userId);
      successHandler(res, {
        data: admin,
        message: "Admin fetched successfully",
        statusCode: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  };
  public adminUserListing: RequestHandler = async (req, res, next) => {
    try {
      const filterResult = await this.adminManagementService.adminUserListing(
        req.query as unknown as AdminListingFilterOptions
      );
      successHandler(res, {
        data: filterResult,
        message: "Fetch successfully",
        statusCode: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  };
  public deleteUserAdmin: RequestHandler = async (req, res, next) => {
    try {
      const deleteUserAdmin = await this.adminManagementService.deleteUserAdmin(
        req.body.adminUserIds
      );
      successHandler(res, {
        data: deleteUserAdmin,
        message: "Admin user moved to deleted bin",
        statusCode: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  };
  public restoreDeletedUserAdmin: RequestHandler = async (req, res, next) => {
    try {
      const restoreDeletedUserAdmin = await this.adminManagementService.restoreDeletedUserAdmin(
        req.body
      );
      successHandler(res, {
        data: restoreDeletedUserAdmin,
        message: "Admin users account restored",
        statusCode: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  };
  public changeAdminUserEmail: RequestHandler = async (req, res, next) => {
    try {
      const changeAdminUserEmail = await this.adminManagementService.changeUserAdminEmail(req.body);
      successHandler(res, {
        data: changeAdminUserEmail,
        message: "Admin user email updated",
        statusCode: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  };
  public resetAdminUsersPassword: RequestHandler = async (req, res, next) => {
    try {
      const resetAdminUsersPassword = await this.adminManagementService.resetAdminUsersPassword(
        req.body.adminUsers
      );
      successHandler(res, {
        data: resetAdminUsersPassword,
        message: "Operation successful",
        statusCode: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  };
  public resetAdminUserPassword: RequestHandler = async (req, res, next) => {
    try {
      const resetAdminUserPassword = await this.adminManagementService.resetAdminUserPassword(
        req.body
      );
      successHandler(res, {
        data: resetAdminUserPassword,
        message: "Operation successful",
        statusCode: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  };
}
