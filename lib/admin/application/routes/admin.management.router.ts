import { Router } from "express";
import { AdminManagementController } from "../controllers/admin.management.controller";
import { checkAdminRolesAndPermissions } from "middlewares/auth/adminAuthorizationMiddleware";

const adminManagementRouter = Router();

const applicantListController = new AdminManagementController();

adminManagementRouter.route("/admin").get(applicantListController.admin);

adminManagementRouter
  .route("/admin-users-listing")
  .get(
    checkAdminRolesAndPermissions(["user management"]),
    applicantListController.adminUserListing
  );

adminManagementRouter
  .route("/delete-admin-users")
  .put(checkAdminRolesAndPermissions(["user management"]), applicantListController.deleteUserAdmin);

adminManagementRouter
  .route("/restore-deleted-admin-users")
  .put(
    checkAdminRolesAndPermissions(["user management"]),
    applicantListController.restoreDeletedUserAdmin
  );

adminManagementRouter
  .route("/change-admin-user-email")
  .put(
    checkAdminRolesAndPermissions(["user management"]),
    applicantListController.changeAdminUserEmail
  );

adminManagementRouter
  .route("/reset-multiple-admin-user-password")
  .put(
    checkAdminRolesAndPermissions(["user management"]),
    applicantListController.resetAdminUsersPassword
  );

adminManagementRouter
  .route("/reset-admin-user-password")
  .put(
    checkAdminRolesAndPermissions(["user management"]),
    applicantListController.resetAdminUserPassword
  );

export { adminManagementRouter };
