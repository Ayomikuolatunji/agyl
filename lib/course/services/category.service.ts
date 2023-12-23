import { FieldOfInterest } from "@prisma/client";
import { prisma } from "config/prisma-client";
import { BadRequestError } from "errors";

export class CategoryService {
  createCourseCategory = async (body: FieldOfInterest) => {
    const nameExist = await prisma.fieldOfInterest.findFirst({
      where: { name: body.name },
    });
    if (nameExist)
      throw new BadRequestError("Category with name already exists.");

    await prisma.fieldOfInterest.create({
      data: {
        ...body,
      },
    });
  };

  updateCourseCategory = async (body: FieldOfInterest) => {
    await prisma.fieldOfInterest.update({
      where: { id: body.id },
      data: { ...body },
    });
  };

  getCourseCategories = async () => {
    return await prisma.fieldOfInterest.findMany();
  };
}
