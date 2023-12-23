import { Router } from "express";
import { ServiceProviderController } from "../controllers/service-provider.controller";
import { UploadService } from "lib/service-provider/services/upload.service";
import { certificateFields } from "lib/service-provider/fields";
import * as validator from "../validations/onboarding.validation";
import { validate } from "express-validation";

const router = Router();
const controller = new ServiceProviderController();

const { getMulter } = new UploadService();

router
  .route("/skills/user/:userId")
  .post(
    validate(validator.serviceProviderSkills, {}, {}),
    controller.addSkills
  );

router
  .route("/education/user/:userId")
  .post(
    validate(validator.serviceProviderEducation, {}, {}),
    controller.addEducation
  )
  .put(
    validate(validator.serviceProviderEducation, {}, {}),
    controller.editEducation
  )
  .get(controller.getEducation);

router
  .route("/education/user/:userId/delete/:educationId")
  .delete(controller.deleteEducation);

router
  .route("/work-experience/user/:userId")
  .post(
    validate(validator.workExperience, {}, {}),
    controller.addWorkExperience
  )
  .put(
    validate(validator.workExperience, {}, {}),
    controller.editWorkExperience
  )
  .get(controller.getWorkExperience);

router
  .route("/work-experience/user/:userId/delete/:workExperience")
  .delete(controller.deleteWorkExperience);

router
  .route("/means-of-identity/user/:userId")
  .post(getMulter().single("file"), controller.uploadMeansOfIdentification);

router
  .route("/certificate/user/:userId")
  .post(getMulter().fields(certificateFields), controller.addCertificate)
  .put(getMulter().fields(certificateFields), controller.editCertificate)
  .get(controller.getCertifications);

router
  .route("/certificate/user/:userId/delete/:certificateId")
  .delete(controller.deleteCertificate);

router.route("/personal-data/user/:userId").post(controller.addPersonalData);

export { router as OnboardingRouter };
