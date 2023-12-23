import { Router } from "express";
import { ApplicantListController } from "../controllers/applicantListing.controller";

const applicantListingRouter = Router();


const applicantListController=new  ApplicantListController()

applicantListingRouter.route("/students").get(
  applicantListController.studentApplicantListing
);

applicantListingRouter
  .route("/service-providers")
  .get(applicantListController.serviceProviderListing);

export { applicantListingRouter };
