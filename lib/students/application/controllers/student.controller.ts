import { RequestHandler } from "express";
import { StudentOnboardingService } from "../../services/onboarding.service";
import { successHandler } from "middlewares/res/success-handler";
import { StatusCodes } from "http-status-codes";
import { StudentService } from "../../services/student.service";
import { NotFoundError } from "errors";
import { InternalServerError } from "errors/InternalServerError";

export class StudentController {
  private onboardingService = new StudentOnboardingService();
  private studentService = new StudentService();

  public studentCategory: RequestHandler = (req, res, next) => {
    try {
      this.onboardingService.studentCategory({
        userId: req.params.userId,
        categoryId: req.body.categoryId,
      });
      successHandler(res, {
        message: "Operation successful",
        statusCode: StatusCodes.CREATED,
      });
    } catch (err) {
      next(err);
    }
  };

  public studentSkills: RequestHandler = (req, res, next) => {
    try {
      const { userId } = req.params;
      const { skills } = req.body;
      this.onboardingService.saveStudentSkills(userId, skills);
      successHandler(res, {
        message: "Skills successfully",
        statusCode: StatusCodes.CREATED,
      });
    } catch (err) {
      next(err);
    }
  };

  public uploadNyscAndValidIdHandler: RequestHandler = async (
    req,
    res,
    next
  ) => {
    try {
      const result = await this.onboardingService.uploadNyscAndValidId(
        req.files,
        req.params.userId
      );
      successHandler(res, {
        data: result,
        statusCode: 201,
        message: "Uploads successful",
      });
    } catch (err) {
      next(err);
    }
  };

  public addStudentEducationHandler: RequestHandler = async (
    req,
    res,
    next
  ) => {
    try {
      const { userId } = req.params;
      const result = await this.onboardingService.addStudentEducation(
        req.body,
        userId
      );
      successHandler(res, {
        data: result,
        statusCode: StatusCodes.CREATED,
        message: "Education operation successful",
      });
    } catch (err) {
      next(err);
    }
  };

  public editStudentEducationHandler: RequestHandler = async (
    req,
    res,
    next
  ) => {
    try {
      const data = await this.onboardingService.editStudentEducation(
        req.body,
        req.params.userId
      );

      successHandler(res, {
        data,
        statusCode: 200,
        message: "Education record edited",
      });
    } catch (err) {
      next(err);
    }
  };

  public getStudentEducationHandler: RequestHandler = async (
    req,
    res,
    next
  ) => {
    try {
      const { userId } = req.params;
      const data = await this.onboardingService.getStudentEducation(userId);

      successHandler(res, {
        data,
        statusCode: StatusCodes.OK,
        message: "Student education returned successfully",
      });
    } catch (err) {
      next(err);
    }
  };

  public deleteEducationHandler: RequestHandler = async (req, res, next) => {
    try {
      const { educationId, userId } = req.params;
      await this.onboardingService.deleteEducation(educationId, userId);

      successHandler(res, {
        statusCode: StatusCodes.OK,
        message: "Education record deleted",
      });
    } catch (err) {
      next(err);
    }
  };

  public workExperienceHandler: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = req.params;

      const data = await this.onboardingService.workExperience(
        req.body,
        userId
      );

      successHandler(res, {
        data,
        statusCode: StatusCodes.CREATED,
        message: "Work experience added",
      });
    } catch (err) {
      next(err);
    }
  };

  public updateStudentWorkExperienceHandler: RequestHandler = async (
    req,
    res,
    next
  ) => {
    try {
      const { userId } = req.params;

      const data = await this.onboardingService.updateStudentWorkExperience(
        req.body,
        userId
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

  public deleteStudentWorkExperienceHandler: RequestHandler = async (
    req,
    res,
    next
  ) => {
    try {
      const { userId, workExperienceId } = req.params;
      const data = await this.onboardingService.deleteStudentWorkExperience(
        workExperienceId,
        userId
      );

      successHandler(res, {
        data,
        statusCode: 200,
        message: "Work experience deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  };

  public getStudentWorkExperienceHandler: RequestHandler = async (
    req,
    res,
    next
  ) => {
    try {
      const data = await this.onboardingService.getStudentWorkExperience(
        req.params.userId
      );
      successHandler(res, {
        data,
        statusCode: 200,
        message: "Work experience returned",
      });
    } catch (err) {
      next(err);
    }
  };

  public createRefereeDetails: RequestHandler = async (req, res, next) => {
    try {
      const payload = req.body;
      const userId = req.params.userId;
      const createdReferee = await this.onboardingService.createRefereeDetails(
        userId,
        payload
      );
      successHandler(res, {
        data: createdReferee,
        message: "Referee details created successfully",
        statusCode: StatusCodes.CREATED,
      });
    } catch (err) {
      next(err);
    }
  };

  public updateRefereeDetails: RequestHandler = async (req, res, next) => {
    try {
      const { refereeDetailsId, userId } = req.params;
      const payload = req.body;
      const updatedReferee = await this.onboardingService.updateRefereeDetails(
        userId,
        refereeDetailsId,
        payload
      );
      successHandler(res, {
        data: updatedReferee,
        message: "Referee details updated successfully",
        statusCode: StatusCodes.OK,
      });
    } catch (err) {
      next(err);
    }
  };

  public deleteReferee: RequestHandler = async (req, res, next) => {
    try {
      const { refereeDetailsId, userId } = req.params;
      const deleteReferee = await this.onboardingService.deleteReferee(
        userId,
        refereeDetailsId
      );

      successHandler(res, {
        data: deleteReferee,
        message: "Referee deleted successfully",
        statusCode: StatusCodes.OK,
      });
    } catch (err) {
      next(err);
    }
  };

  public createCertificate: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const createdCertificate = await this.onboardingService.createCertificate(
        userId,
        req.body,
        req.files
      );
      successHandler(res, {
        data: createdCertificate,
        message: "Certificate created successfully",
        statusCode: StatusCodes.CREATED,
      });
    } catch (err) {
      next(err);
    }
  };
  public updateUploadedCertificate: RequestHandler = async (req, res, next) => {
    try {
      const { userId, certificateId } = req.params;
      const uploadedCertificate =
        await this.onboardingService.updateUploadedCertificate(
          userId,
          req.body,
          req.files,
          certificateId
        );
      successHandler(res, {
        data: uploadedCertificate,
        message: "Certificate updated successfully",
        statusCode: StatusCodes.CREATED,
      });
    } catch (err) {
      next(err);
    }
  };
  public deleteCertificate: RequestHandler = async (req, res, next) => {
    try {
      const { userId, certificateId } = req.params;
      const uploadedCertificate =
        await this.onboardingService.deleteCertificate(userId, certificateId);
      successHandler(res, {
        data: uploadedCertificate,
        message: "Certificate deleted successfully",
        statusCode: StatusCodes.CREATED,
      });
    } catch (err) {
      next(err);
    }
  };
  public updateCertificate: RequestHandler = async (req, res, next) => {
    try {
      const { certificateId, userId } = req.params;
      const updatedCertificate = await this.onboardingService.updateCertificate(
        userId,
        req.body,
        certificateId
      );
      successHandler(res, {
        data: updatedCertificate,
        message: "Certificate updated successfully",
        statusCode: StatusCodes.OK,
      });
    } catch (err) {
      next(err);
    }
  };

  public createGuarantor: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = req.params;
      const createGuarantor = await this.onboardingService.createGuarantor(
        userId,
        req.body,
        req.files
      );
      successHandler(res, {
        data: createGuarantor,
        message: "Guarantor created successfully",
        statusCode: StatusCodes.CREATED,
      });
    } catch (error) {
      next(error);
    }
  };
  public getGuarantorById: RequestHandler = async (req, res, next) => {
    try {
      const { userId, guarantorId } = req.params;
      const guarantor = await this.onboardingService.getGuarantorById(
        userId,
        guarantorId
      );

      successHandler(res, {
        data: guarantor,
        message: "Guarantor retrieved successfully",
        statusCode: StatusCodes.OK,
      });
    } catch (err) {
      next(err);
    }
  };
  public updateGuarantor: RequestHandler = async (req, res, next) => {
    try {
      const { guarantorId, userId } = req.params;
      const updatedGuarantor = await this.onboardingService.updateGuarantor(
        userId,
        req.body,
        guarantorId
      );
      if (!updatedGuarantor) {
        throw new InternalServerError("Failed not updated");
      }
      successHandler(res, {
        data: updatedGuarantor,
        message: "Guarantor updated successfully",
        statusCode: StatusCodes.OK,
      });
    } catch (err) {
      next(err);
    }
  };
  public deleteGuarantor: RequestHandler = async (req, res, next) => {
    try {
      const updatedGuarantor = await this.onboardingService.deleteGuarantor(
        req.params.userId,
        req.params.guarantorId
      );
      successHandler(res, {
        data: updatedGuarantor,
        message: "Guarantor deleted successfully",
        statusCode: StatusCodes.OK,
      });
    } catch (err) {
      next(err);
    }
  };
  public updateGuarantorProfilePicture: RequestHandler = async (
    req,
    res,
    next
  ) => {
    try {
      const { guarantorId, userId } = req.params;
      const updateGuarantorProfilePicture =
        await this.onboardingService.updateGuarantorProfilePicture(
          userId,
          req.body,
          req.files,
          guarantorId
        );
      successHandler(res, {
        data: updateGuarantorProfilePicture,
        message: "Guarantor updated successfully",
        statusCode: StatusCodes.OK,
      });
    } catch (err) {
      next(err);
    }
  };
  public updateGuarantorValidId: RequestHandler = async (req, res, next) => {
    try {
      const { guarantorId, userId } = req.params;
      const updateGuarantorValidId =
        await this.onboardingService.updateGuarantorValidId(
          userId,
          req.body,
          req.files,
          guarantorId
        );
      successHandler(res, {
        data: updateGuarantorValidId,
        message: "Guarantor  validId updated successfully",
        statusCode: StatusCodes.OK,
      });
    } catch (err) {
      next(err);
    }
  };
  public updateGuarantorSignature: RequestHandler = async (req, res, next) => {
    try {
      const { guarantorId, userId } = req.params;
      const updateGuarantorSignature =
        await this.onboardingService.updateGuarantorSignature(
          userId,
          req.body,
          req.files,
          guarantorId
        );
      successHandler(res, {
        data: updateGuarantorSignature,
        message: "Guarantor signature updated successfully",
        statusCode: StatusCodes.OK,
      });
    } catch (err) {
      next(err);
    }
  };
  public profileSummary: RequestHandler = async (req, res, next) => {
    try {
      const data = await this.onboardingService.studentProfileSummary(
        req.body,
        req.params.userId
      );
      successHandler(res, {
        data,
        statusCode: 201,
        message: "Profile Summary added",
      });
    } catch (err) {
      next(err);
    }
  };
  public getStudent: RequestHandler = async (req, res, next) => {
    try {
      const data = await this.studentService.getStudent(req.params.userId);
      successHandler(res, {
        data,
        statusCode: 201,
        message: "Student returned",
      });
    } catch (err) {
      next(err);
    }
  };

  public createProfessionalOverview: RequestHandler = async (
    req,
    res,
    next
  ) => {
    try {
      const { userId } = req.params;
      const createProfessionalOverview =
        await this.onboardingService.createProfessionalOverview(
          userId,
          req.body
        );
      successHandler(res, {
        data: createProfessionalOverview,
        message: "Personal information created or updated successfully",
        statusCode: StatusCodes.CREATED,
      });
    } catch (err) {
      next(err);
    }
  };

  public addPortfolio: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = req.params;

      const data = await this.onboardingService.addPortfolioLinks(
        userId,
        req.body,
        req.files as Express.Multer.File[]
      );

      successHandler(res, {
        data,
        statusCode: 201,
        message: "Portfolio data saved successfully",
      });
    } catch (err) {
      next(err);
    }
  };

  public updatePortfolio: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = req.params;

      const data = await this.onboardingService.updatePortfolio(
        userId,
        req.body,
        req.files as Express.Multer.File[]
      );

      successHandler(res, {
        data,
        statusCode: 201,
        message: "Portfolio Updated",
      });
    } catch (err) {
      next(err);
    }
  };

  public getPortfolio: RequestHandler = async (req, res, next) => {
    try {
      const data = await this.onboardingService.getPortfolio(req.params.userId);

      successHandler(res, {
        data,
        statusCode: 200,
        message: "Portfolio returned",
      });
    } catch (err) {
      next(err);
    }
  };

  public deletePortfolioFile: RequestHandler = async (req, res, next) => {
    try {
      const { userId, portfolioFileId } = req.params;
      await this.onboardingService.deletePortfolioFile(userId, portfolioFileId);

      successHandler(res, {
        statusCode: 200,
        message: "Portfolio File deleted",
      });
    } catch (err) {
      next(err);
    }
  };

  public addPitchVideo: RequestHandler = async (req, res, next) => {
    try {
      const { userId } = req.params;

      const data = await this.onboardingService.addPitchVideo(
        userId,
        req.file as Express.Multer.File
      );

      successHandler(res, {
        data,
        statusCode: 201,
        message: "Pitch video uploaded",
      });
    } catch (err) {
      next(err);
    }
  };

  public markOnboardingAsComplete: RequestHandler = async (req, res, next) => {
    try {
      await this.onboardingService.markOnboardingAsComplete(req.userId);

      successHandler(res, {
        statusCode: 200,
        message: "Onboarding completed successfully",
      });
    } catch (err) {
      next(err);
    }
  };
}
