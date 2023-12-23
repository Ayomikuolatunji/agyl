import { Joi } from "express-validation";
import { DegreeEnum, EmploymentTypeEnum } from "shared/types";

export const serviceProviderSkills = {
  body: Joi.object({
    skills: Joi.array()
      .items({
        skillId: Joi.string().required(),
      })
      .required(),
  }),
};

export const serviceProviderEducation = {
  body: Joi.object({
    id: Joi.string().optional().allow(""),
    name: Joi.string().required(),
    discipline: Joi.string().required(),
    degree: Joi.string()
      .valid(
        DegreeEnum.UNDERGRADUATE,
        DegreeEnum.BACHELOR_OF_SCIENCE,
        DegreeEnum.BACHELOR_OF_ARTS,
        DegreeEnum.MASTERS,
        DegreeEnum.PHD
      )
      .required(),
    country: Joi.string().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    address: Joi.string().optional(),
  }),
};

export const workExperience = {
  body: Joi.object({
    id: Joi.string().optional(),
    companyName: Joi.string().required(),
    jobTitle: Joi.string().required(),
    workingHere: Joi.boolean().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().optional().allow(""),
    employmentType: Joi.string().valid(
      EmploymentTypeEnum.CONTRACT,
      EmploymentTypeEnum.FREELANCING,
      EmploymentTypeEnum.FULL_TIME,
      EmploymentTypeEnum.PART_TIME
    ),
    monthlySalary: Joi.string().required(),
    openToNegotiate: Joi.boolean().required(),
    currentSalary: Joi.string().required(),
    expectedSalary: Joi.string().required(),
    jobDescription: Joi.string().required(),
  }),
};
