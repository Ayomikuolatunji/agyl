import { Router } from "express";
import { AcademicSessionRouter } from "lib/academic-session/application/router/session.router";
import { AdminRouter } from "lib/admin/application/routes";
import { CourseRouter } from "lib/course/application/routes/course.router";
import { ServiceProviderRouter } from "lib/service-provider/application/routes/service-provider.router";
import { StudentRouter } from "lib/students/application/routes/student.router";
import { UserLogoutRouter } from "lib/user/application/user.router";

const ProtectedRouter = Router();

ProtectedRouter.use("/student", StudentRouter);
ProtectedRouter.use("/user", UserLogoutRouter);
ProtectedRouter.use("/service-provider", ServiceProviderRouter);
ProtectedRouter.use("/admin", AdminRouter);
ProtectedRouter.use("/course", CourseRouter);
ProtectedRouter.use("/course", CourseRouter);
ProtectedRouter.use("/academic-session", AcademicSessionRouter);

export { ProtectedRouter };
