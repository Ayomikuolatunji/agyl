import { Router } from "express";
import { StudentController } from "../controllers/student.controller";
import * as onBoardingValidator from "../validations/onboarding.validation";
import { validate } from "express-validation";
import { OnboardingUploadService } from "../../services/upload.service";
import { verifyAuthorizedUser } from "middlewares/auth/userAuths";
import {
  createCertificateFields,
  nyscAndValid,
  updateCertificateFields,
  updateGuarantorFiles,
  uploadGuarantorFields,
} from "../../fields";

const studentController = new StudentController();

const uploadService = new OnboardingUploadService();

const router = Router();

router.route("/category/:userId").post(
  verifyAuthorizedUser,
  validate(onBoardingValidator.saveStudentCategory),
  (req, res, next) => {
    next();
  },
  studentController.studentCategory
);

router.route("/skills/:userId").post(
  verifyAuthorizedUser,
  validate(onBoardingValidator.studentSkills),
  (req, res, next) => {
    next();
  },
  studentController.studentSkills
);

router.route("/nysc-and-valid-id/:userId").post(
  verifyAuthorizedUser,
  uploadService.getMulter().fields(nyscAndValid),
  (req, res, next) => {
    next();
  },
  studentController.uploadNyscAndValidIdHandler
);
router.route("/education/:userId").post(
  verifyAuthorizedUser,
  validate(onBoardingValidator.studentEducation),
  (req, res, next) => {
    next();
  },
  studentController.addStudentEducationHandler
);

router.route("/education/:userId").put(
  verifyAuthorizedUser,
  validate(onBoardingValidator.studentEducation),
  (req, res, next) => {
    next();
  },
  studentController.editStudentEducationHandler
);
router
  .route("/education/:userId")
  .get(studentController.getStudentEducationHandler);
router
  .route("/education/user/:userId/remove/:educationId")
  .delete(verifyAuthorizedUser, studentController.deleteEducationHandler);

router
  .route("/work-experience/:userId")
  .post(
    verifyAuthorizedUser,
    validate(onBoardingValidator.addWorkExperience),
    studentController.workExperienceHandler
  );
router
  .route("/work-experience/:userId")
  .put(
    validate(onBoardingValidator.workExperience),
    studentController.updateStudentWorkExperienceHandler
  );

router
  .route("/work-experience/:userId")
  .get(verifyAuthorizedUser, studentController.getStudentWorkExperienceHandler);

router
  .route("/work-experience/delete/:userId/:workExperienceId")
  .delete(studentController.deleteStudentWorkExperienceHandler);

router
  .route("/referee-details/:userId")
  .post(
    verifyAuthorizedUser,
    validate(onBoardingValidator.refereeDetails),
    studentController.createRefereeDetails
  );

router
  .route("/referee-details/:userId/:refereeDetailsId")
  .put(
    verifyAuthorizedUser,
    validate(onBoardingValidator.refereeDetails),
    studentController.updateRefereeDetails
  );

router
  .route("/referee-details/:userId/:refereeDetailsId")
  .delete(verifyAuthorizedUser, studentController.deleteReferee);

router
  .route("/certificates/:userId")
  .post(
    verifyAuthorizedUser,
    uploadService.getMulter().fields(createCertificateFields),
    validate(onBoardingValidator.createCertificateValidation, {}, {}),
    studentController.createCertificate
  );
router
  .route("/certificates/:userId/:certificateId")
  .put(verifyAuthorizedUser, studentController.updateCertificate);

router
  .route("/certificate/:userId/:certificateId")
  .delete(verifyAuthorizedUser, studentController.deleteCertificate);

router
  .route("/update-uploaded-certificate/:userId/:certificateId")
  .patch(
    verifyAuthorizedUser,
    uploadService.getMulter().fields(updateCertificateFields),
    studentController.updateCertificate
  );

router
  .route("/guarantor/:userId")
  .post(
    verifyAuthorizedUser,
    uploadService.getMulter().fields(uploadGuarantorFields),
    validate(onBoardingValidator.guarantorValidation, {}, {}),
    studentController.createGuarantor
  );

router
  .route("/guarantor/:userId/:guarantorId")
  .get(verifyAuthorizedUser, studentController.getGuarantorById);

router
  .route("/guarantor/:userId/:guarantorId")
  .put(verifyAuthorizedUser, studentController.updateGuarantor);

router
  .route("/guarantor/:userId/:guarantorId")
  .delete(verifyAuthorizedUser, studentController.deleteGuarantor);

router
  .route("/guarantor/:userId/:guarantorId/profile-picture")
  .put(
    verifyAuthorizedUser,
    uploadService.getMulter().fields(updateGuarantorFiles),
    studentController.updateGuarantorProfilePicture
  );

router
  .route("/guarantor/:userId/:guarantorId/guarantor-validId")
  .put(
    verifyAuthorizedUser,
    uploadService.getMulter().fields(updateGuarantorFiles),
    studentController.updateGuarantorValidId
  );

router
  .route("/guarantor/:userId/:guarantorId/signature")
  .put(
    verifyAuthorizedUser,
    uploadService.getMulter().fields(updateGuarantorFiles),
    studentController.updateGuarantorSignature
  );

router
  .route("/personal-information/:userId")
  .post(
    validate(onBoardingValidator.professionalOverviewValidation),
    studentController.createProfessionalOverview
  );

router
  .route("/profile-summary/:userId")
  .post(
    validate(onBoardingValidator.profileSummary),
    studentController.profileSummary
  );

router
  .route("/portfolio/:userId")
  .post(
    verifyAuthorizedUser,
    uploadService.getMulter().array("portfolioFiles"),
    validate(onBoardingValidator.addPortfolio, {}, {}),
    studentController.addPortfolio
  )
  .put(
    verifyAuthorizedUser,
    uploadService.getMulter().array("portfolioFiles"),
    validate(onBoardingValidator.addPortfolio, {}, {}),
    studentController.updatePortfolio
  )
  .get(studentController.getPortfolio);

router
  .route("/portfolio/:userId/file/:portfolioFileId")
  .delete(verifyAuthorizedUser, studentController.deletePortfolioFile);

router
  .route("/pitch-video/:userId")
  .post(
    uploadService.getMulter().single("video"),
    studentController.addPitchVideo
  );

router
  .route("/complete-onboarding")
  .post(studentController.markOnboardingAsComplete);

export { router as OnboardingRouter };
