import { prisma } from "config/prisma-client";
import {
  BadRequestError,
  BaseError,
  ForbiddenError,
  NotFoundError,
} from "errors";
import { StatusCodes } from "http-status-codes";
import { StudentRepository, UserRepository } from "shared/repository";
import { OnboardingUploadService } from "./upload.service";
import { EmploymentTypeEnum } from "shared/types";

import {
  RefereeDetails,
  StudentProfileSummary,
  Education,
  CertificateAchievement,
  GuarantorDetails,
  Portfolio,
  Prisma,
  OnboardingStatus,
} from "@prisma/client";
import { InternalServerError } from "errors/InternalServerError";
import {
  fileSizeValidator,
  photoValidator,
  videoValidator,
} from "util/file-validator";

interface WorkExperienceArgs {
  workExperienceId?: string;
  companyName: string;
  jobTitle: string;
  workingHere: boolean;
  startDate: Date;
  endDate?: Date;
  employmentType: EmploymentTypeEnum;
  monthlySalary: string;
  openToNegotiate: boolean;
  currentSalary: string;
  expectedSalary: string;
  jobDescription: string;
}

export class StudentOnboardingService {
  private userRepository = new UserRepository();
  private studentRepository = new StudentRepository();
  private uploadService = new OnboardingUploadService();

  public studentCategory = async (requestBody: {
    userId: string;
    categoryId: string;
  }) => {
    const user = await this.userRepository.getUserById(requestBody.userId);
    if (!user) throw new NotFoundError("User not found");

    const save = await prisma.student.upsert({
      where: { userId: requestBody.userId },
      update: {
        category: { connect: { id: requestBody.categoryId } },
        onboardingStep: 1,
      },
      create: {
        user: { connect: { id: requestBody.userId } },
        category: { connect: { id: requestBody.categoryId } },
        onboardingStep: 1,
      },
    });
    if (!save) {
      throw new InternalServerError("Operation failed");
    }
    return await this.studentRepository.setCachedStudentByUserId(user.id);
  };

  public saveStudentSkills = async (
    userId: string,
    skills: Array<{ skillId: string }>
  ) => {
    const user = await this.userRepository.getUserById(userId);
    if (!user) throw new NotFoundError("User not found");
    const student = await prisma.student.findUnique({ where: { userId } });
    if (!student) throw new NotFoundError("Student not found");
    await Promise.all(
      skills.map(async (skill) => {
        const skillRecord = await prisma.skill.findFirst({
          where: { id: skill.skillId },
        });
        if (!skillRecord)
          throw new NotFoundError(`Invalid id skill supplied: ${skill}`);
        const alreadyHasSkill = await prisma.userSkill.findFirst({
          where: { studentId: student.id, skillId: skill.skillId },
        });
        if (!alreadyHasSkill) {
          await prisma.$transaction(async (tx) => {
            const saveSkill = await tx.userSkill.create({
              data: {
                student: { connect: { id: student.id } },
                skill: { connect: { id: skillRecord.id } },
              },
            });
            if (!saveSkill) {
              throw new InternalServerError("Failed to save skill");
            }

            await tx.student.update({
              where: { id: student.id },
              data: { onboardingStep: 2 },
            });
          });
        }
      })
    );

    return await this.studentRepository.setCachedStudentByUserId(user.id);
  };

  public uploadNyscAndValidId = async (files: any, userId: string) => {
    const nyscFiles = files["nysc"];
    const validId = files["validId"];
    const student = await this.studentRepository.getStudentByUserId(userId);
    if (!student)
      throw new ForbiddenError(
        "You are not permitted to perform this operation"
      );
    const nyscPath = "./uploads/" + nyscFiles[0].filename;
    const validIdPath = "./uploads/" + validId[0].filename;
    const nyscResult = await this.uploadService.uploadImage(nyscPath);
    const validIdResult = await this.uploadService.uploadImage(validIdPath);
    return await prisma.$transaction(
      async (tx) => {
        // save student uploads
        const nyscData = await tx.studentNyscUpload.upsert({
          where: { studentId: student.id },
          update: {
            format: nyscResult.format,
            originalFilename: nyscFiles[0].originalname,
            publicId: nyscResult.public_id,
            publicUrl: nyscResult.url,
            student: { connect: { id: student.id } },
          },
          create: {
            format: nyscResult.format,
            originalFilename: nyscFiles[0].originalname,
            publicId: nyscResult.public_id,
            publicUrl: nyscResult.url,
            student: { connect: { id: student.id } },
          },
        });
        if (!nyscData) {
          throw new InternalServerError("Failed to save nysc record");
        }
        const validIdData = await tx.validIdUpload.upsert({
          where: { studentId: student.id },
          update: {
            format: validIdResult.format,
            originalFilename: validId[0].originalname,
            publicId: validIdResult.public_id,
            publicUrl: validIdResult.url,
            student: { connect: { id: student.id } },
          },
          create: {
            format: validIdResult.format,
            originalFilename: validId[0].originalname,
            publicId: validIdResult.public_id,
            publicUrl: validIdResult.url,
            student: { connect: { id: student.id } },
          },
        });
        if (!validIdData) {
          throw new InternalServerError("Failed to valid id record");
        }

        await tx.student.update({
          where: { id: student.id },
          data: { onboardingStep: 3 },
        });

        await this.studentRepository.setCachedStudentByUserId(userId);
        return { nysc: nyscData, validId: validIdData };
      },
      { timeout: 30000 }
    );
  };

  public addStudentEducation = async (body: Education, userId: string) => {
    const student = await this.studentRepository.getStudentByUserId(userId);
    if (!student)
      throw new ForbiddenError(
        "You are not permitted to perform this operation"
      );

    return await prisma.$transaction(async (tx) => {
      const data = await tx.education.create({
        data: {
          student: { connect: { id: student.id } },
          name: body.name,
          degree: body.degree,
          country: body.country,
          state: body.state,
          city: body.city,
          discipline: body.discipline,
          address: body.address,
        },
      });
      if (!data) {
        throw new InternalServerError("Failed to save education record");
      }

      await tx.student.update({
        where: { id: student.id },
        data: { onboardingStep: 4 },
      });

      await this.studentRepository.setCachedStudentByUserId(userId);
      return data;
    });
  };

  public editStudentEducation = async (
    body: Education & { educationId: string },
    userId: string
  ) => {
    const student = await this.studentRepository.getStudentByUserId(userId);
    if (!student)
      throw new ForbiddenError(
        "You are not permitted to perform this operation"
      );
    const education = await prisma.education.findUnique({
      where: { id: body.educationId },
    });
    if (!education)
      throw new NotFoundError("No education history found for record id");

    await prisma.$transaction(async (tx) => {
      const updateEducation = await tx.education.update({
        where: { id: education.id },
        data: {
          student: { connect: { id: student.id } },
          name: body.name,
          degree: body.degree,
          country: body.country,
          state: body.state,
          city: body.city,
          discipline: body.discipline,
          address: body.address,
        },
      });
      if (!updateEducation) {
        throw new InternalServerError("Failed to update education");
      }

      await tx.student.update({
        where: { id: student.id },
        data: { onboardingStep: 4 },
      });

      await this.studentRepository.setCachedStudentByUserId(userId);
    });
  };

  public getStudentEducation = async (userId: string) => {
    const student = await this.studentRepository.getStudentByUserId(userId);
    return await prisma.education.findMany({
      where: { studentId: student.id },
    });
  };

  public deleteEducation = async (educationId: string, userId: string) => {
    const student = await this.studentRepository.getStudentByUserId(userId);
    if (!student)
      throw new ForbiddenError(
        "You are not permitted to perform this operation"
      );
    const education = await prisma.education.findUnique({
      where: { id: educationId },
    });
    if (!education) throw new NotFoundError("No such education record found");
    const deleteEducation = await prisma.education.delete({
      where: { id: education.id },
    });
    if (!deleteEducation) {
      throw new InternalServerError("Failed to delete education");
    }
    return await this.studentRepository.setCachedStudentByUserId(userId);
  };

  public workExperience = async (body: WorkExperienceArgs, userId: string) => {
    const student = await this.studentRepository.getStudentByUserId(userId);

    return await prisma.$transaction(
      async (tx) => {
        const data = await tx.workExperience.create({
          data: {
            student: { connect: { id: student.id } },
            companyName: body.companyName,
            jobTitle: body.jobTitle,
            workingHere: body.workingHere,
            startDate: new Date(body.startDate),
            endDate: body.endDate ? new Date(body.endDate) : null,
            monthlySalary: body.monthlySalary.toString(),
            employmentType: body.employmentType,
            currentSalary: body.currentSalary.toString(),
            expectedSalary: body.expectedSalary.toString(),
            openToNegotiate: body.openToNegotiate,
            jobDescription: body.jobDescription,
          },
        });
        if (!data) {
          throw new InternalServerError("Failed to save work experience");
        }
        await tx.student.update({
          where: { id: student.id },
          data: { onboardingStep: 5 },
        });
        await this.studentRepository.setCachedStudentByUserId(userId);
        return data;
      },
      { timeout: 20000 }
    );
  };

  public updateStudentWorkExperience = async (
    body: WorkExperienceArgs,
    userId: string
  ) => {
    const student = await this.studentRepository.getStudentByUserId(userId);

    if (!student) throw new NotFoundError("No record found for student id");
    const findExperience = await prisma.workExperience.findFirst({
      where: { id: body.workExperienceId, studentId: student.id },
    });
    if (!findExperience) {
      throw new NotFoundError("Work experience not found");
    }

    return await prisma.$transaction(
      async (tx) => {
        const data = await tx.workExperience.update({
          where: { id: body.workExperienceId },
          data: {
            student: { connect: { id: student.id } },
            companyName: body.companyName,
            jobTitle: body.jobTitle,
            workingHere: body.workingHere,
            startDate: new Date(body.startDate),
            endDate: body.endDate ? new Date(body.endDate) : null,
            monthlySalary: body.monthlySalary.toString(),
            employmentType: body.employmentType,
            currentSalary: body.currentSalary.toString(),
            expectedSalary: body.expectedSalary.toString(),
            openToNegotiate: body.openToNegotiate,
            jobDescription: body.jobDescription,
          },
        });
        if (!data) {
          throw new InternalServerError("Failed to update work experience");
        }

        await tx.student.update({
          where: { id: student.id },
          data: { onboardingStep: 5 },
        });
        await this.studentRepository.setCachedStudentByUserId(userId);
        return data;
      },
      { timeout: 20000 }
    );
  };

  public deleteStudentWorkExperience = async (
    workExperienceId: string,
    userId: string
  ) => {
    const student = await this.studentRepository.getStudentByUserId(userId);
    const workExperience = await prisma.workExperience.findUnique({
      where: { id: workExperienceId },
    });
    if (!workExperience)
      throw new NotFoundError("No work experience found for record id");
    await prisma.workExperience.delete({
      where: { id: workExperienceId, studentId: student.id },
    });
    await this.studentRepository.setCachedStudentByUserId(userId);
  };

  public getStudentWorkExperience = async (userId: string) => {
    const student = await this.studentRepository.getStudentByUserId(userId);
    return await prisma.workExperience.findMany({
      where: { studentId: student.id },
    });
  };

  public createRefereeDetails = async (
    userId: string,
    refereeDetails: RefereeDetails
  ) => {
    const studentId = await this.studentRepository.getStudentByUserId(userId);

    return await prisma.$transaction(
      async (tx) => {
        const createdReferee = await tx.refereeDetails.create({
          data: {
            studentId: studentId.id,
            companyName: refereeDetails.companyName,
            refereeFirstName: refereeDetails.refereeFirstName,
            refereeLastName: refereeDetails.refereeLastName,
            refereeAddress: refereeDetails.refereeAddress,
            refereeLastEmail: refereeDetails.refereeLastEmail,
            refereePhoneNumber: refereeDetails.refereePhoneNumber,
          },
        });
        if (!createdReferee) {
          throw new InternalServerError(
            "Creating Referee details encounter server issue"
          );
        }
        await tx.student.update({
          where: { id: studentId.id },
          data: { onboardingStep: 6 },
        });
        await this.studentRepository.setCachedStudentByUserId(userId);
        return createdReferee;
      },
      { timeout: 20000 }
    );
  };

  public updateRefereeDetails = async (
    userId: string,
    refereeDetailsId: string,
    updatedDetails: RefereeDetails
  ) => {
    const studentId = await this.studentRepository.getStudentByUserId(userId);
    const findReferee = await prisma.refereeDetails.findUnique({
      where: {
        id: refereeDetailsId,
      },
    });
    if (!findReferee) {
      throw new NotFoundError("Referee not found");
    }

    return await prisma.$transaction(
      async (tx) => {
        const updatedReferee = await tx.refereeDetails.update({
          where: {
            id: refereeDetailsId,
            studentId: studentId.id,
          },
          data: {
            companyName: updatedDetails.companyName,
            refereeFirstName: updatedDetails.refereeFirstName,
            refereeLastName: updatedDetails.refereeLastName,
            refereeAddress: updatedDetails.refereeAddress,
            refereeLastEmail: updatedDetails.refereeLastEmail,
            refereePhoneNumber: updatedDetails.refereePhoneNumber,
          },
        });
        if (!updatedDetails) {
          throw new InternalServerError("Failed to update referee details");
        }

        await tx.student.update({
          where: { id: studentId.id },
          data: { onboardingStep: 6 },
        });

        await this.studentRepository.setCachedStudentByUserId(userId);
        return updatedReferee;
      },
      { timeout: 20000 }
    );
  };

  public deleteReferee = async (userId: string, refereeDetailsId: string) => {
    const studentId = await this.studentRepository.getStudentByUserId(userId);
    const findReferee = await prisma.refereeDetails.findUnique({
      where: {
        id: refereeDetailsId,
      },
    });
    if (!findReferee) {
      throw new NotFoundError("Referee not found");
    }
    const updatedReferee = await prisma.refereeDetails.delete({
      where: {
        id: refereeDetailsId,
        studentId: studentId.id,
      },
    });
    if (!updatedReferee) {
      throw new InternalServerError("Failed delete referee");
    }
    await this.studentRepository.setCachedStudentByUserId(userId);
    return updatedReferee;
  };

  public createCertificate = async (userId: string, body: any, files: any) => {
    const certificateFile = files["certificateFile"];
    const {
      issueDate,
      credentialUrl,
      issuingOrganization,
      expirationDate,
      name,
    } = body;
    const student = await this.studentRepository.getStudentByUserId(userId);
    if (!student)
      throw new ForbiddenError(
        "You are not permitted to perform this operation"
      );
    const uploadedCertificate = "./uploads/" + certificateFile[0].filename;
    const response = await this.uploadService.uploadImage(uploadedCertificate);
    if (!response) {
      throw new InternalServerError("Operation failed");
    }

    return await prisma.$transaction(
      async (tx) => {
        const certificate = await tx.certificateAchievement.create({
          data: {
            name,
            studentId: student.id,
            issuingOrganization: issuingOrganization,
            issueDate: issueDate,
            expirationDate: expirationDate,
            credentialUrl: credentialUrl,
            uploadedCertificateUrl: response.secure_url,
            uploadedCertificateCloudinaryId: response.public_id,
          },
        });
        if (!certificate) {
          throw new InternalServerError("Failed to create certificate");
        }

        await tx.student.update({
          where: { id: student.id },
          data: { onboardingStep: 7 },
        });

        await this.studentRepository.setCachedStudentByUserId(userId);
        return certificate;
      },
      { timeout: 20000 }
    );
  };

  public studentProfileSummary = async (
    body: StudentProfileSummary,
    userId: string
  ) => {
    const student = await this.studentRepository.getStudentByUserId(userId);

    return await prisma.$transaction(
      async (tx) => {
        const data = await tx.studentProfileSummary.upsert({
          where: { studentId: student.id },
          update: { ...body },
          create: {
            student: { connect: { id: student.id } },
            professionalOverview: body.professionalOverview,
            title: body.title,
          },
        });
        if (!data) {
          throw new InternalServerError("Operation failed");
        }
        await tx.student.update({
          where: { id: student.id },
          data: { onboardingStep: 8 },
        });
        await this.studentRepository.setCachedStudentByUserId(userId);
        return data;
      },
      { timeout: 20000 }
    );
  };

  public updateCertificate = async (
    userId: string,
    body: CertificateAchievement,
    certificateId: string
  ) => {
    const {
      issueDate,
      credentialUrl,
      issuingOrganization,
      expirationDate,
      name,
    } = body;
    const student = await this.studentRepository.getStudentByUserId(userId);
    if (!student)
      throw new ForbiddenError(
        "You are not permitted to perform this operation"
      );
    const findCertificate = await prisma.certificateAchievement.findUnique({
      where: {
        id: certificateId,
      },
    });
    if (!findCertificate) {
      throw new NotFoundError("Certificate not found");
    }

    return await prisma.$transaction(
      async (tx) => {
        const certificate = await tx.certificateAchievement.update({
          where: {
            id: findCertificate.id,
          },
          data: {
            issuingOrganization: issuingOrganization,
            issueDate: issueDate,
            name: name,
            expirationDate: expirationDate,
            credentialUrl: credentialUrl,
          },
        });
        if (!certificate) {
          throw new InternalServerError("Operation failed");
        }

        await tx.student.update({
          where: { id: student.id },
          data: { onboardingStep: 7 },
        });

        await this.studentRepository.setCachedStudentByUserId(userId);

        return certificate;
      },
      { timeout: 20000 }
    );
  };
  public deleteCertificate = async (userId: string, certificateId: string) => {
    const student = await this.studentRepository.getStudentByUserId(userId);
    if (!student)
      throw new ForbiddenError(
        "You are not permitted to perform this operation"
      );
    const findCertificate = await prisma.certificateAchievement.findUnique({
      where: {
        id: certificateId,
      },
    });
    if (!findCertificate) {
      throw new NotFoundError("Certificate not found");
    }
    const certificate = await prisma.certificateAchievement.delete({
      where: {
        id: certificateId,
        studentId: student.id,
      },
    });
    if (!certificate) {
      throw new InternalServerError("Operation failed");
    }
    await this.studentRepository.setCachedStudentByUserId(userId);
    return certificate;
  };

  public updateUploadedCertificate = async (
    userId: string,
    body: any,
    files: any,
    certificateId: string
  ) => {
    const { uploadedCertificateCloudinaryId } = body;
    const student = await this.studentRepository.getStudentByUserId(userId);
    if (!student)
      throw new ForbiddenError(
        "You are not permitted to perform this operation"
      );
    const certificateFile = files["certificateFile"];
    const uploadedCertificate = "./uploads/" + certificateFile[0].filename;
    const validIdResult = await this.uploadService.uploadImage(
      uploadedCertificate
    );
    const updateUploadedCertificate =
      await prisma.certificateAchievement.update({
        where: {
          id: certificateId,
          studentId: student.id,
        },
        data: {
          uploadedCertificateUrl: validIdResult.secure_url,
          uploadedCertificateCloudinaryId: validIdResult.public_id,
        },
      });
    if (!updateUploadedCertificate) {
      throw new InternalServerError("Failed to update certificate");
    }
    await this.uploadService.deleteImage(uploadedCertificateCloudinaryId);
    await this.studentRepository.setCachedStudentByUserId(userId);
    return updateUploadedCertificate;
  };

  public createGuarantor = async (userId: string, body: any, files: any) => {
    const validIdFile = files["validIdFile"];
    const profilePicture = files["profilePictureFile"];
    const signature = files["signatureFile"];
    const applicantSignature = files["applicantSignatureFile"];
    const {
      guarantorFirstName,
      guarantorLastName,
      date,
      relationshipWithGuarantor,
      guarantorEmail,
      guarantorPhoneNumber,
    } = body;

    const student = await this.studentRepository.getStudentByUserId(userId);
    if (!student)
      throw new NotFoundError(
        "You are not permitted to perform this operation"
      );

    const uploadedProfilePicture = "./uploads/" + profilePicture[0].filename;
    const validIdResultUploadedProfilePicture =
      await this.uploadService.uploadImage(uploadedProfilePicture);

    const uploadedValidIdFile = "./uploads/" + validIdFile[0].filename;
    const validIdResult = await this.uploadService.uploadImage(
      uploadedValidIdFile
    );

    const uploadedSignature = "./uploads/" + signature[0].filename;
    const validUploadedSignature = await this.uploadService.uploadImage(
      uploadedSignature
    );

    const uploadedApplicantSignature =
      "./uploads/" + applicantSignature[0].filename;
    const validUploadedApplicantSignature =
      await this.uploadService.uploadImage(uploadedApplicantSignature);

    if (
      !validIdResult ||
      !validUploadedSignature ||
      !validUploadedApplicantSignature
    ) {
      throw new InternalServerError("Upload error");
    }

    return await prisma.$transaction(
      async (tx) => {
        const certificate = await tx.guarantorDetails.create({
          data: {
            studentId: student.id,
            guarantorFirstName,
            guarantorLastName,
            date,
            relationshipWithGuarantor,
            guarantorEmail,
            guarantorPhoneNumber,
            profilePicture: {
              file: {
                publicUrl: validIdResultUploadedProfilePicture.secure_url,
                publicId: validIdResultUploadedProfilePicture.public_id,
                format: validIdResultUploadedProfilePicture.format,
                originalFilename:
                  validIdResultUploadedProfilePicture.original_filename,
                studentId: student.id,
              },
            },
            validID: {
              file: {
                publicUrl: validIdResult.secure_url,
                publicId: validIdResult.public_id,
                format: validIdResult.format,
                originalFilename: validIdResult.original_filename,
                studentId: student.id,
              },
            },
            signature: {
              file: {
                publicUrl: validUploadedSignature.secure_url,
                publicId: validUploadedSignature.public_id,
                format: validUploadedSignature.format,
                originalFilename: validUploadedSignature.original_filename,
                studentId: student.id,
              },
            },
            applicantSignature: {
              file: {
                publicUrl: validUploadedApplicantSignature.secure_url,
                publicId: validUploadedApplicantSignature.public_id,
                format: validUploadedApplicantSignature.format,
                originalFilename:
                  validUploadedApplicantSignature.original_filename,
                studentId: student.id,
              },
            },
          },
        });
        if (!certificate) {
          throw new InternalServerError("Failed to save certificate");
        }
        await tx.student.update({
          where: { id: student.id },
          data: { onboardingStep: 9 },
        });
        await this.studentRepository.setCachedStudentByUserId(userId);
        return certificate;
      },
      { timeout: 35000 }
    );
  };

  public updateGuarantor = async (
    userId: string,
    body: GuarantorDetails,
    guarantorId: string
  ) => {
    const {
      guarantorFirstName,
      guarantorLastName,
      date,
      relationshipWithGuarantor,
      guarantorEmail,
      guarantorPhoneNumber,
    } = body;
    const student = await this.studentRepository.getStudentByUserId(userId);
    if (!student)
      throw new ForbiddenError(
        "You are not permitted to perform this operation"
      );
    const findGuarantor = await prisma.guarantorDetails.findUnique({
      where: {
        id: guarantorId,
      },
    });
    if (!findGuarantor) {
      throw new NotFoundError("Guarantor not found with the id provided");
    }

    return await prisma.$transaction(
      async (tx) => {
        const guarantor = await tx.guarantorDetails.update({
          where: {
            id: guarantorId,
            studentId: student.id,
          },
          data: {
            studentId: student.id,
            guarantorFirstName,
            guarantorLastName,
            date,
            relationshipWithGuarantor,
            guarantorEmail,
            guarantorPhoneNumber,
          },
        });
        if (!guarantor) {
          throw new InternalServerError("Operation to create guarantor failed");
        }
        await tx.student.update({
          where: { id: student.id },
          data: { onboardingStep: 9 },
        });
        await this.studentRepository.setCachedStudentByUserId(userId);
        return guarantor;
      },
      { timeout: 30000 }
    );
  };

  public deleteGuarantor = async (userId: string, guarantorId: string) => {
    const student = await this.studentRepository.getStudentByUserId(userId);
    if (!student)
      throw new ForbiddenError(
        "You are not permitted to perform this operation"
      );
    const findGuarantor = await prisma.guarantorDetails.findUnique({
      where: {
        id: guarantorId,
      },
    });
    if (!findGuarantor) {
      throw new NotFoundError("Guarantor not found with the id provided");
    }
    const deleteGuarantor = await prisma.guarantorDetails.delete({
      where: {
        id: guarantorId,
      },
    });
    if (!deleteGuarantor) {
      throw new InternalServerError("Failed to delete guarantor");
    }
    await this.studentRepository.setCachedStudentByUserId(userId);
    return deleteGuarantor;
  };

  public updateGuarantorProfilePicture = async (
    userId: string,
    body: any,
    files: any,
    guarantorId: string
  ) => {
    const profilePicture = files["profilePictureFile"];
    const { profilePictureCloudinaryId } = body;
    const student = await this.studentRepository.getStudentByUserId(userId);
    if (!student)
      throw new ForbiddenError(
        "You are not permitted to perform this operation"
      );
    const uploadedProfilePicture = "./uploads/" + profilePicture[0].filename;
    const validIdResultUploadedProfilePicture =
      await this.uploadService.uploadImage(uploadedProfilePicture);
    const updateGuarantorProfilePicture = await prisma.guarantorDetails.update({
      where: {
        id: guarantorId,
        studentId: student.id,
      },
      data: {
        profilePicture: {
          file: {
            publicUrl: validIdResultUploadedProfilePicture.secure_url,
            publicId: validIdResultUploadedProfilePicture.public_id,
            format: validIdResultUploadedProfilePicture.format,
            originalFilename:
              validIdResultUploadedProfilePicture.original_filename,
            studentId: student.id,
          },
        },
      },
    });
    if (updateGuarantorProfilePicture) {
      throw new BaseError(
        "Operation failed",
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
    await this.uploadService.deleteImage(profilePictureCloudinaryId);
    await this.studentRepository.setCachedStudentByUserId(userId);
    return updateGuarantorProfilePicture;
  };

  public updateGuarantorValidId = async (
    userId: string,
    body: any,
    files: any,
    guarantorId: string
  ) => {
    const validIdFile = files["validIdFile"];
    const { validIdCloudinaryId } = body;
    const student = await this.studentRepository.getStudentByUserId(userId);
    if (!student)
      throw new ForbiddenError(
        "You are not permitted to perform this operation"
      );
    if (validIdCloudinaryId) {
      const uploadedValidIdFile = "./uploads/" + validIdFile[0].filename;
      const validIdResult = await this.uploadService.uploadImage(
        uploadedValidIdFile
      );
      const updateGuarantorValidId = await prisma.guarantorDetails.update({
        where: {
          id: guarantorId,
          studentId: student.id,
        },
        data: {
          validID: {
            file: {
              publicUrl: validIdResult.secure_url,
              publicId: validIdResult.public_id,
              format: validIdResult.format,
              originalFilename: validIdResult.original_filename,
              studentId: student.id,
            },
          },
        },
      });
      if (!updateGuarantorValidId) {
        throw new InternalServerError("Failed to update guarantor ValidId");
      }
      await this.uploadService.deleteImage(validIdCloudinaryId);
    }
    await this.studentRepository.setCachedStudentByUserId(userId);
  };
  public updateGuarantorSignature = async (
    userId: string,
    body: any,
    files: any,
    guarantorId: string
  ) => {
    const signature = files["signatureFIle"];
    const { signatureCloudinaryId } = body;
    const student = await this.studentRepository.getStudentByUserId(userId);
    if (!student)
      throw new ForbiddenError(
        "You are not permitted to perform this operation"
      );
    if (signatureCloudinaryId) {
      const uploadedSignature = "./uploads/" + signature[0].filename;
      const validUploadedSignature = await this.uploadService.uploadImage(
        uploadedSignature
      );
      const updateGuarantorSignature = await prisma.guarantorDetails.update({
        where: {
          id: guarantorId,
          studentId: student.id,
        },
        data: {
          signature: {
            file: {
              url: validUploadedSignature.secure_url,
              signatureCloudinaryId: validUploadedSignature.public_id,
            },
          },
        },
      });
      if (!updateGuarantorSignature) {
        throw new InternalServerError(
          "Failed to update update guarantor signature"
        );
      }
      await this.uploadService.deleteImage(signatureCloudinaryId);
    }
    await this.studentRepository.setCachedStudentByUserId(userId);
  };

  public updateGuarantorApplicantSignature = async (
    userId: string,
    body: any,
    files: any,
    guarantorId: string
  ) => {
    const applicantSignature = files["applicantSignature"];
    const { applicantSignatureCloudinaryId } = body;
    const student = await this.studentRepository.getStudentByUserId(userId);
    if (!student)
      throw new ForbiddenError(
        "You are not permitted to perform this operation"
      );
    if (applicantSignatureCloudinaryId) {
      const uploadedApplicantSignature =
        "./uploads/" + applicantSignature[0].filename;
      const validUploadedApplicantSignature =
        await this.uploadService.uploadImage(uploadedApplicantSignature);
      await prisma.guarantorDetails.update({
        where: {
          id: guarantorId,
          studentId: student.id,
        },
        data: {
          applicantSignature: {
            file: {
              publicUrl: validUploadedApplicantSignature.secure_url,
              publicId: validUploadedApplicantSignature.public_id,
              format: validUploadedApplicantSignature.format,
              originalFilename:
                validUploadedApplicantSignature.original_filename,
              studentId: student.id,
            },
          },
        },
      });
      await this.uploadService.deleteImage(applicantSignatureCloudinaryId);
    }
    await this.studentRepository.setCachedStudentByUserId(userId);
  };

  public getGuarantorById = async (userId: string, guarantorId: string) => {
    const student = await this.studentRepository.getStudentByUserId(userId);
    if (!student)
      throw new ForbiddenError(
        "You are not permitted to perform this operation"
      );
    const result = await prisma.guarantorDetails.findFirst({
      where: {
        id: guarantorId,
        studentId: student.id,
      },
    });
    return result;
  };

  public createProfessionalOverview = async (userId: string, body: any) => {
    const {
      dateOfBirth,
      state,
      city,
      maritalStatus,
      phoneNumber,
      zipCode,
      homePhone,
      bloodGroup,
      genotypeId,
      language,
      proficiency,
      otherMedicalCondition,
      medicalConditionId,
      country,
    } = body;
    const student = await this.studentRepository.getStudentByUserId(userId);
    if (!student)
      throw new ForbiddenError(
        "You are not permitted to perform this operation"
      );
    const medicalCondition = await prisma.medicalCondition.findUnique({
      where: { id: medicalConditionId },
    });
    if (!medicalCondition) {
      throw new BadRequestError("Please provide valid medicalConditionId");
    }
    const genotype = await prisma.genotype.findUnique({
      where: { id: genotypeId },
    });
    if (!genotype) {
      throw new BadRequestError("Please provide valid genotypeId");
    }

    return await prisma.$transaction(
      async (tx) => {
        const createProfessionalOverview = await tx.professionalOverview.upsert(
          {
            where: {
              studentId: student.id,
            },
            update: {
              dateOfBirth,
              country,
              state,
              city,
              maritalStatus,
              phoneNumber,
              zipCode,
              homePhone,
              bloodGroup,
              genotypeId,
              language,
              proficiency,
              otherMedicalCondition,
              medicalConditionId,
            },
            create: {
              studentId: student.id,
              dateOfBirth,
              country,
              state,
              city,
              maritalStatus,
              phoneNumber,
              zipCode,
              homePhone,
              bloodGroup,
              genotypeId,
              language,
              proficiency,
              otherMedicalCondition,
              medicalConditionId,
            },
          }
        );
        if (!createProfessionalOverview) {
          throw new InternalServerError("Failed to create or update record");
        }
        await tx.student.update({
          where: { id: student.id },
          data: { onboardingStep: 10 },
        });
        await this.studentRepository.setCachedStudentByUserId(userId);
        return createProfessionalOverview;
      },
      { timeout: 35000 }
    );
  };

  public addPortfolioLinks = async (
    userId: string,
    body: Portfolio,
    files: Express.Multer.File[]
  ) => {
    let result;
    const student = await this.studentRepository.getStudentByUserId(userId);

    return await prisma.$transaction(
      async (tx) => {
        const portfolio = await tx.portfolio.create({
          data: {
            student: { connect: { id: student.id } },
            portfolioUrl: body.portfolioUrl,
          },
        });

        if (files.length) {
          const uploads = Promise.all(
            files.map(async (file) => {
              fileSizeValidator(file, 10);

              photoValidator(file);

              const filePath = "./uploads/" + file.filename;
              const uploadResponse = await this.uploadService.uploadImage(
                filePath
              );

              const portfolioFiles = await tx.portfolioFiles.create({
                data: {
                  portfolioId: portfolio.id,
                  publicId: uploadResponse.public_id,
                  publicUrl: uploadResponse.url,
                  format: file.mimetype,
                  originalFilename: file.originalname,
                },
              });

              return portfolioFiles;
            })
          );

          await tx.student.update({
            where: { id: student.id },
            data: { onboardingStep: 11 },
          });

          await this.studentRepository.setCachedStudentByUserId(userId);
          return uploads;
        }
      },
      { timeout: 70000 }
    );
  };

  public updatePortfolio = async (
    userId: string,
    body: Portfolio,
    files: Express.Multer.File[]
  ) => {
    return await prisma.$transaction(
      async (tx) => {
        const updatedPortfolio = await tx.portfolio.update({
          where: { id: body.id },
          data: { portfolioUrl: body.portfolioUrl },
        });

        if (!updatedPortfolio)
          throw new NotFoundError("Portfolio not found for record id");

        const result = await Promise.all(
          files.map(async (file) => {
            fileSizeValidator(file, 10);

            photoValidator(file);

            const filePath = "./uploads/" + file.filename;
            const uploadResponse = await this.uploadService.uploadImage(
              filePath
            );
            const result = await tx.portfolioFiles.create({
              data: {
                portfolioId: updatedPortfolio.id,
                publicId: uploadResponse.public_id,
                publicUrl: uploadResponse.url,
                format: file.mimetype,
                originalFilename: file.originalname,
              },
            });
            return result;
          })
        );
        await tx.student.update({
          where: { id: updatedPortfolio.studentId as string },
          data: { onboardingStep: 11 },
        });
        await this.studentRepository.setCachedStudentByUserId(userId);
        return result;
      },
      { timeout: 100000 }
    );
  };

  public getPortfolio = async (userId: string) => {
    const student = await this.studentRepository.getStudentByUserId(userId);

    return await prisma.portfolio.findFirst({
      where: { studentId: student.id },
      include: { portfolioLinks: true },
    });
  };

  public deletePortfolioFile = async (
    userId: string,
    portfolioFileId: string
  ) => {
    await this.studentRepository.getStudentByUserId(userId);

    const portfolioFile = await prisma.portfolioFiles.findFirst({
      where: { id: portfolioFileId },
    });
    if (!portfolioFile) throw new NotFoundError("No file found for record id");

    await this.uploadService.deleteImage(portfolioFile.publicId);
    await this.studentRepository.setCachedStudentByUserId(userId);
  };

  public addPitchVideo = async (userId: string, file: Express.Multer.File) => {
    const student = await this.studentRepository.getStudentByUserId(userId);

    fileSizeValidator(file, 25);

    videoValidator(file);

    const filePath = "./uploads/" + file.filename;

    const uploadResponse = await this.uploadService.upload(filePath);

    return await prisma.$transaction(
      async (tx) => {
        const result = await tx.pitchVideo.upsert({
          where: {
            studentId: student.id,
          },
          create: {
            student: { connect: { id: student.id } },
            publicId: uploadResponse.public_id,
            publicUrl: uploadResponse.url,
            originalFilename: file.originalname,
            format: file.mimetype,
          },
          update: {
            student: { connect: { id: student.id } },
            publicId: uploadResponse.public_id,
            publicUrl: uploadResponse.url,
            originalFilename: file.originalname,
            format: file.mimetype,
          },
        });

        await tx.student.update({
          where: { id: student.id },
          data: { onboardingStep: 11 },
        });

        await this.studentRepository.setCachedStudentByUserId(userId);
        return result;
      },
      { timeout: 35000 }
    );
  };

  markOnboardingAsComplete = async (userId: string) => {
    const student = await this.studentRepository.getStudentByUserId(userId);

    const skills = await prisma.userSkill.count({
      where: { studentId: student.id },
    });

    if (skills < 1) throw new BadRequestError("Please add skills ");

    const education = await prisma.education.count({
      where: { studentId: student.id },
    });

    if (education < 1)
      throw new BadRequestError("Please add education information");

    const workExperience = await prisma.workExperience.count({
      where: { studentId: student.id },
    });

    if (workExperience < 1)
      throw new BadRequestError("Please add work experience");

    const referee = await prisma.refereeDetails.findFirst({
      where: { studentId: student.id },
    });
    if (!referee) throw new BadRequestError("Please add your referee");

    const guarantors = await prisma.guarantorDetails.count({
      where: { studentId: student.id },
    });
    if (guarantors < 1)
      throw new BadRequestError(
        "Kindly fill in your guarantor(s) information "
      );

    const profOverview = await prisma.professionalOverview.findFirst({
      where: { studentId: student.id },
    });
    if (!profOverview)
      throw new BadRequestError(
        "Kindly fill in your information for professional overview."
      );

    const certificates = await prisma.certificateAchievement.count({
      where: { studentId: student.id },
    });

    if (certificates < 1)
      throw new BadRequestError("Kindly add your certifications");

    const validId = await prisma.validIdUpload.findFirst({
      where: { studentId: student.id },
    });
    if (!validId)
      throw new BadRequestError("Kindly upload valid means of identification");

    await prisma.student.update({
      where: { id: student.id },
      data: { onboardingStatus: OnboardingStatus.Complete },
    });
  };
}
