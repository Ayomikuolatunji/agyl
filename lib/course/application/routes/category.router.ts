import { Router } from "express";
import { CourseCategoryController } from "../controllers/category.controller";
import * as validator from "../validation/category.validation";
import { validate } from "express-validation";

const router = Router();
const controller = new CourseCategoryController();

router
  .route("/")
  .post(
    validate(validator.CourseCategorySchema, {}, {}),
    controller.createCourseCategory
  )
  .put(
    validate(validator.CourseCategorySchema, {}, {}),
    controller.updateCourseCategory
  )
  .get(controller.getCourseCategories);

export { router as CourseCategoryRouter };
