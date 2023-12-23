import { prisma } from "config/prisma-client";
import { ServiceProviderRepository, UserRepository } from "shared/repository";
import { NotFoundError } from "errors";
import {
  CertificateAchievement,
  Education,
  ProfessionalOverview,
  ServiceProvider,
  WorkExperience,
} from "@prisma/client";
import { UploadService } from "./upload.service";

export class OnboardingService {
  private serviceProviderRepository = new ServiceProviderRepository();
  private userRepository = new UserRepository();

  private uploadService = new UploadService();

  addSkills = async (userId: string, skills: Array<{ skillId: string }>) => {
    let serviceProvider: ServiceProvider | null;
    const user = await this.userRepository.getUserById(userId);

    serviceProvider = await prisma.serviceProvider.findUnique({
      where: { userId: user.id },
    });

    const SPUserType = await this.userRepository.findUserTypeByName(
      "Service Provider"
    );

    // if SP is not found, confirm user signed up as a SP and create SP Account
    if (!serviceProvider && user.userTypeId === SPUserType.id) {
      serviceProvider = await prisma.serviceProvider.create({
        data: {
          user: { connect: { id: user.id } },
        },
      });
    }

    await Promise.all(
      skills.map(async (el) => {
        const skillRecord = await prisma.skill.findFirst({
          where: { id: el.skillId },
        });
        if (!skillRecord)
          throw new NotFoundError(`Invalid id skill supplied: ${el.skillId}`);

        // confirm service Provider already has skill
        const alreadyHasSkill = await prisma.userSkill.findFirst({
          where: {
            serviceProviderId: serviceProvider!.id,
            skillId: el.skillId,
          },
        });

        if (!alreadyHasSkill) {
          await prisma.userSkill.create({
            data: {
              serviceProvider: { connect: { id: serviceProvider!.id } },
              skill: { connect: { id: skillRecord.id } },
            },
          });
        }
      })
    );

    await this.serviceProviderRepository.setCachedServiceProvider(user.id);
  };

  addEducation = async (userId: string, body: Education) => {
    const serviceProvider =
      await this.serviceProviderRepository.getServiceProviderByUserId(userId);

    const result = await prisma.education.create({
      data: {
        serviceProvider: { connect: { id: serviceProvider.id } },
        name: body.name,
        city: body.city,
        country: body.country,
        state: body.state,
        discipline: body.discipline,
        degree: body.degree,
        address: body.address,
      },
    });

    await this.serviceProviderRepository.setCachedServiceProvider(userId);
    return result;
  };

  updateEducation = async (userId: string, body: Education) => {
    const serviceProvider =
      await this.serviceProviderRepository.getServiceProviderByUserId(userId);

    const education = await prisma.education.findUnique({
      where: { id: body.id },
    });

    if (!education)
      throw new NotFoundError("No education history found for record id");

    const result = await prisma.education.update({
      where: { id: education.id },
      data: {
        serviceProvider: { connect: { id: serviceProvider.id } },
        name: body.name,
        degree: body.degree,
        country: body.country,
        state: body.state,
        city: body.city,
        discipline: body.discipline,
        address: body.address,
      },
    });

    await this.serviceProviderRepository.setCachedServiceProvider(userId);
    return result;
  };

  deleteEducation = async (userId: string, educationId: string) => {
    const serviceProvider =
      await this.serviceProviderRepository.getServiceProviderByUserId(userId);

    const education = await prisma.education.findUnique({
      where: { id: educationId },
    });
    if (!education) throw new NotFoundError("No such education record found");

    await prisma.education.delete({
      where: { id: education.id, serviceProviderId: serviceProvider.id },
    });

    await this.serviceProviderRepository.setCachedServiceProvider(userId);
  };

  getEducation = async (userId: string) => {
    const serviceProvider =
      await this.serviceProviderRepository.getServiceProviderByUserId(userId);

    return await prisma.education.findMany({
      where: { serviceProviderId: serviceProvider.id },
    });
  };

  addWorkExperience = async (userId: string, body: WorkExperience) => {
    const serviceProvider =
      await this.serviceProviderRepository.getServiceProviderByUserId(userId);

    const data = await prisma.workExperience.create({
      data: {
        serviceProvider: { connect: { id: serviceProvider.id } },
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

    await this.serviceProviderRepository.setCachedServiceProvider(userId);
    return data;
  };

  updateWorkExperience = async (userId: string, body: WorkExperience) => {
    const serviceProvider =
      await this.serviceProviderRepository.getServiceProviderByUserId(userId);

    const workExperience = await prisma.workExperience.findFirst({
      where: { id: body.id, serviceProviderId: serviceProvider.id },
    });

    if (!workExperience)
      throw new NotFoundError("No work experience found for service provider");

    const data = await prisma.workExperience.update({
      where: { id: workExperience.id },
      data: {
        serviceProvider: { connect: { id: serviceProvider.id } },
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

    await this.serviceProviderRepository.setCachedServiceProvider(userId);
    return data;
  };

  deleteWorkExperience = async (userId: string, workExperienceId: string) => {
    const serviceProvider =
      await this.serviceProviderRepository.getServiceProviderByUserId(userId);

    const workExperience = await prisma.workExperience.findFirst({
      where: { id: workExperienceId, serviceProviderId: serviceProvider.id },
    });

    if (!workExperience)
      throw new NotFoundError("No work experience found for service provider");

    await prisma.workExperience.delete({ where: { id: workExperience.id } });

    await this.serviceProviderRepository.setCachedServiceProvider(userId);
  };

  getWorkExperience = async (userId: string) => {
    const serviceProvider =
      await this.serviceProviderRepository.getServiceProviderByUserId(userId);

    return await prisma.workExperience.findMany({
      where: { serviceProviderId: serviceProvider.id },
    });
  };

  addCertificate = async (userId: string, body: any, files: any) => {
    const serviceProvider =
      await this.serviceProviderRepository.getServiceProviderByUserId(userId);

    const certificateFile = files["certificateFile"];

    const certificatePath = "./uploads/" + certificateFile[0].filename;

    const uploadResponse = await this.uploadService.uploadImage(
      certificatePath
    );

    const data = await prisma.certificateAchievement.create({
      data: {
        serviceProvider: { connect: { id: serviceProvider.id } },
        uploadedCertificateCloudinaryId: uploadResponse.public_id,
        uploadedCertificateUrl: uploadResponse.url,
        ...body,
      },
    });

    await this.serviceProviderRepository.setCachedServiceProvider(userId);
    return data;
  };

  editCertificate = async (
    userId: string,
    body: CertificateAchievement,
    files: any
  ) => {
    const serviceProvider =
      await this.serviceProviderRepository.getServiceProviderByUserId(userId);

    const certificate = await prisma.certificateAchievement.findFirst({
      where: { id: body.id, serviceProviderId: serviceProvider.id },
    });

    if (!certificate)
      throw new NotFoundError(
        "Certificate with record id not found for service provider"
      );

    const certificateFile = files["certificateFile"];

    const certPath = "./uploads/" + certificateFile[0].filename;

    // delete existing image
    await this.uploadService.deleteImage(
      certificate.uploadedCertificateCloudinaryId
    );

    const uploadResponse = await this.uploadService.uploadImage(certPath);

    const result = await prisma.certificateAchievement.update({
      where: { id: certificate.id },
      data: {
        uploadedCertificateCloudinaryId: uploadResponse.public_id,
        uploadedCertificateUrl: uploadResponse.url,
        credentialUrl: body.credentialUrl,
        issueDate: body.issueDate,
        expirationDate: body.expirationDate || null,
        issuingOrganization: body.issuingOrganization,
        name: body.name,
        serviceProviderId: serviceProvider.id,
      },
    });

    await this.serviceProviderRepository.setCachedServiceProvider(userId);
    return result;
  };

  deleteCertificate = async (userId: string, certificateId: string) => {
    const serviceProvider =
      await this.serviceProviderRepository.getServiceProviderByUserId(userId);

    const certificate = await prisma.certificateAchievement.findUnique({
      where: { id: certificateId, serviceProviderId: serviceProvider.id },
    });

    if (!certificate)
      throw new NotFoundError(
        "No certifciate with record id found for service provider"
      );

    await prisma.certificateAchievement.delete({
      where: { id: certificate.id },
    });

    await this.serviceProviderRepository.setCachedServiceProvider(userId);
  };

  getCertifications = async (userId: string) => {
    const serviceProvider =
      await this.serviceProviderRepository.getServiceProviderByUserId(userId);

    return await prisma.certificateAchievement.findMany({
      where: { serviceProviderId: serviceProvider.id },
    });
  };

  addPersonalData = async (userId: string, body: ProfessionalOverview) => {
    const serviceProvider =
      await this.serviceProviderRepository.getServiceProviderByUserId(userId);

    await prisma.professionalOverview.upsert({
      where: { serviceProviderId: serviceProvider.id },
      create: {
        serviceProvider: { connect: { id: serviceProvider.id } },
        bloodGroup: body.bloodGroup,
        dateOfBirth: body.dateOfBirth,
        city: body.city,
        country: body.city,
        genoType: { connect: { id: body.genotypeId } },
        homePhone: body.homePhone,
        phoneNumber: body.phoneNumber,
        maritalStatus: body.maritalStatus,
        proficiency: body.proficiency,
        state: body.state,
        zipCode: body.zipCode,
        otherMedicalCondition: body.otherMedicalCondition,
      },
      update: {
        serviceProvider: { connect: { id: serviceProvider.id } },
        bloodGroup: body.bloodGroup,
        dateOfBirth: body.dateOfBirth,
        city: body.city,
        country: body.city,
        genoType: { connect: { id: body.genotypeId } },
        homePhone: body.homePhone,
        phoneNumber: body.phoneNumber,
        maritalStatus: body.maritalStatus,
        proficiency: body.proficiency,
        state: body.state,
        zipCode: body.zipCode,
        otherMedicalCondition: body.otherMedicalCondition,
      },
    });

    await this.serviceProviderRepository.setCachedServiceProvider(userId);
  };
}
