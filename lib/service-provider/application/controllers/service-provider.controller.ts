import { RequestHandler } from "express";
import { OnboardingService } from "lib/service-provider/services/onboarding.service";
import { ServiceProviderService } from "lib/service-provider/services/service-provider.service";
import { UploadService } from "lib/service-provider/services/upload.service";
import { successHandler } from "middlewares/res/success-handler";

export class ServiceProviderController {
  protected serviceProviderService = new ServiceProviderService();
  protected onboardingService = new OnboardingService();
  protected uploadService = new UploadService();

  public getServiceProvider: RequestHandler = async (req, res, next) => {
    try {
      const data = await this.serviceProviderService.getServiceProvider(
        req.params.userId
      );

      successHandler(res, { data, statusCode: 200, message: "Okay" });
    } catch (err) {
      next(err);
    }
  };

  public addSkills: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const { skills } = req.body;

      await this.onboardingService.addSkills(userId, skills);

      successHandler(res, {
        statusCode: 200,
        message: "Service provider skill added",
      });
    } catch (err) {
      next(err);
    }
  };

  public addEducation: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const data = await this.onboardingService.addEducation(userId, req.body);

      successHandler(res, {
        data,
        statusCode: 200,
        message: "Education added",
      });
    } catch (err) {
      next(err);
    }
  };

  public editEducation: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const data = await this.onboardingService.updateEducation(
        userId,
        req.body
      );

      successHandler(res, {
        data,
        statusCode: 200,
        message: "Education updated",
      });
    } catch (err) {
      next(err);
    }
  };

  public deleteEducation: RequestHandler = async (req, res, next) => {
    try {
      const { userId, educationId } = req.params;

      await this.onboardingService.deleteEducation(userId, educationId);

      successHandler(res, { statusCode: 200, message: "Education deleted" });
    } catch (err) {
      next(err);
    }
  };

  public getEducation: RequestHandler = async (req, res, next) => {
    try {
      const data = await this.onboardingService.getEducation(req.params.userId);

      successHandler(res, {
        data,
        statusCode: 200,
        message: "Education returned",
      });
    } catch (err) {
      next(err);
    }
  };

  public addWorkExperience: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = req.params;

      const data = await this.onboardingService.addWorkExperience(
        userId,
        req.body
      );

      successHandler(res, {
        data,
        statusCode: 201,
        message: "Work experience added",
      });
    } catch (err) {
      next(err);
    }
  };

  public editWorkExperience: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = req.params;

      const data = await this.onboardingService.updateWorkExperience(
        userId,
        req.body
      );

      successHandler(res, {
        data,
        statusCode: 200,
        message: "Work experience updated",
      });
    } catch (err) {
      next(err);
    }
  };

  public deleteWorkExperience: RequestHandler = async (req, res, next) => {
    try {
      const { userId, workExperienceId } = req.params;

      await this.onboardingService.deleteWorkExperience(
        userId,
        workExperienceId
      );

      successHandler(res, {
        statusCode: 200,
        message: "Work experience updated",
      });
    } catch (err) {
      next(err);
    }
  };

  public getWorkExperience: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = req.params;

      const data = await this.onboardingService.getWorkExperience(userId);

      successHandler(res, {
        data,
        statusCode: 200,
        message: "Work experience returned",
      });
    } catch (err) {
      next(err);
    }
  };

  public uploadMeansOfIdentification: RequestHandler = async (
    req,
    res,
    next
  ) => {
    try {
      const { userId } = req.params;

      const data = await this.uploadService.uploadMeansOfIdentification(
        userId,
        req.file
      );

      successHandler(res, {
        statusCode: 201,
        message: "Means of identification uploaded",
      });
    } catch (err) {
      next(err);
    }
  };

  public addCertificate: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const data = await this.onboardingService.addCertificate(
        userId,
        req.body,
        req.files
      );

      successHandler(res, {
        data,
        statusCode: 201,
        message: "Certificate added",
      });
    } catch (err) {
      next(err);
    }
  };

  public editCertificate: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const data = await this.onboardingService.editCertificate(
        userId,
        req.body,
        req.files
      );

      successHandler(res, {
        data,
        statusCode: 200,
        message: "Certificate updated",
      });
    } catch (err) {
      next(err);
    }
  };

  public deleteCertificate: RequestHandler = async (req, res, next) => {
    try {
      const { userId, certificateId } = req.params;
      await this.onboardingService.deleteCertificate(userId, certificateId);

      successHandler(res, { statusCode: 200, message: "Certificate deleted" });
    } catch (err) {
      next(err);
    }
  };

  public getCertifications: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const data = await this.onboardingService.getCertifications(userId);

      successHandler(res, {
        data,
        statusCode: 200,
        message: "Certifications returned",
      });
    } catch (err) {
      next(err);
    }
  };

  public addPersonalData: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const data = await this.onboardingService.addPersonalData(
        userId,
        req.body
      );

      successHandler(res, {
        data,
        statusCode: 200,
        message: "Operation successful",
      });
    } catch (err) {
      next(err);
    }
  };
}
