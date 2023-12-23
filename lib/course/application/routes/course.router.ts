import { Router } from "express";
import { CourseCategoryRouter } from "./category.router";

const router = Router();

router.use("/category", CourseCategoryRouter);

export { router as CourseRouter };
