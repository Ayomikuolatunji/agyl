import { CategoryService } from "lib/course/services/category.service";
import { RequestHandler } from "express";
import { successHandler } from "middlewares/res/success-handler";

export class CourseCategoryController {
  private categoryService = new CategoryService();

  public createCourseCategory: RequestHandler = async (req, res, next) => {
    try {
      await this.categoryService.createCourseCategory(req.body);

      successHandler(res, { statusCode: 200, message: "Cagtegory added" });
    } catch (err) {
      next(err);
    }
  };

  public updateCourseCategory: RequestHandler = async (req, res, next) => {
    try {
      await this.categoryService.updateCourseCategory(req.body);

      successHandler(res, { statusCode: 200, message: "Category updated" });
    } catch (err) {
      next(err);
    }
  };

  public getCourseCategories: RequestHandler = async (req, res, next) => {
    try {
      const data = await this.categoryService.getCourseCategories();

      successHandler(res, { data, statusCode: 200, message: "Okay" });
    } catch (err) {
      next(err);
    }
  };
}
