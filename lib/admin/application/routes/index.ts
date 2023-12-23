import { Router } from "express";
import { rolesPermissionRouter } from "lib/admin/application/routes/rolePermission.routers";
import { applicantListingRouter } from "./applicantListing.router";
import { adminManagementRouter } from "./admin.management.router";


const AdminRouter = Router();

AdminRouter.use("/role-permissions", rolesPermissionRouter);
AdminRouter.use("/applicants-management", applicantListingRouter);
AdminRouter.use("/management", adminManagementRouter);

export { AdminRouter };
