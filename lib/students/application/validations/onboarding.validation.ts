import { Joi } from "express-validation";
import { DegreeEnum, EmploymentTypeEnum } from "shared/types";

export const saveStudentCategory = {
  body: Joi.object({
    categoryId: Joi.string().uuid().required(),
  }),
};

export const studentSkills = {
  body: Joi.object({
    skills: Joi.array()
      .items({
        skillId: Joi.string().required(),
      })
      .required(),
  }),
};

export const studentEducation = {
  body: Joi.object({
    educationId: Joi.string().optional().allow(""),
    name: Joi.string().required(),
    discipline: Joi.string().required(),
    degree: Joi.string().valid(
      DegreeEnum.UNDERGRADUATE,
      DegreeEnum.BACHELOR_OF_SCIENCE,
      DegreeEnum.BACHELOR_OF_ARTS,
      DegreeEnum.MASTERS,
      DegreeEnum.PHD
    ),
    country: Joi.string().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    address: Joi.string().optional(),
  }),
};

export const workExperience = {
  body: Joi.object({
    workExperienceId: Joi.string().required(),
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

export const addWorkExperience = {
  body: Joi.object({
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

export const profileSummary = {
  body: Joi.object({
    title: Joi.string().required(),
    professionalOverview: Joi.string().required(),
  }),
};

export const refereeDetails = {
  body: Joi.object({
    companyName: Joi.string().required(),
    refereeFirstName: Joi.string().required(),
    refereeLastName: Joi.string().required(),
    refereeAddress: Joi.string().required(),
    refereeLastEmail: Joi.string().email().required(),
    refereePhoneNumber: Joi.string().required(),
  }),
};

export const professionalOverviewValidation = {
  body: Joi.object({
    dateOfBirth: Joi.string().isoDate().required(),
    state: Joi.string().required(),
    city: Joi.string().required(),
    maritalStatus: Joi.string().valid("single", "married", "divorced", "widowed").required(),
    phoneNumber: Joi.string().required(),
    zipCode: Joi.string().pattern(new RegExp("^[0-9]{6}$")),
    homePhone: Joi.string(),
    bloodGroup: Joi.string().valid("A", "B", "AB", "O").required(),
    genotypeId: Joi.string().guid({ version: "uuidv4" }),
    meansOfIdentification: Joi.string().required(),
    language: Joi.string(),
    proficiency: Joi.string(),
    providedMedicalCondition: Joi.string(),
    medicalConditionId: Joi.string().guid({ version: "uuidv4" }),
    country: Joi.string().required(),
    otherMedicalCondition: Joi.string(),
  }),
};

export const createCertificateValidation = {
  body: Joi.object({
    issuingOrganization: Joi.string().required(),
    issueDate: Joi.string().required(),
    credentialUrl: Joi.string().required(),
    expirationDate: Joi.date().required(),
    name: Joi.string().required(),
    certificateFile: Joi.any(),
  }),
};

export const guarantorValidation = {
  body: Joi.object({
    guarantorFirstName: Joi.string().required(),
    guarantorLastName: Joi.string().required(),
    date: Joi.string().isoDate(),
    relationshipWithGuarantor: Joi.string().required(),
    guarantorEmail: Joi.string().email().required(),
    guarantorPhoneNumber: Joi.string().required(),
  }),
};

export const addPortfolio = {
  body: Joi.object({
    id: Joi.string().uuid().optional(),
    portfolioUrl: Joi.string().required(),
  }),
};
