import { RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import { ApplicantListService } from "lib/admin/service/applicantlisting.service";
import { successHandler } from "middlewares/res/success-handler";
import {
  ServiceProviderApplicantListingFilterOptions,
  StudentApplicantListingFilterOptions,
} from "../types";

export class ApplicantListController {
  private applicantListService = new ApplicantListService();

  public studentApplicantListing: RequestHandler = async (req, res, next) => {
    try {
      const filterResult = await this.applicantListService.studentApplicantListing(
        req.query as unknown as StudentApplicantListingFilterOptions
      );
      successHandler(res, {
        data: filterResult,
        message: "Fetch successfully",
        statusCode: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  };
  public serviceProviderListing: RequestHandler = async (req, res, next) => {
    try {
      const filterResult = await this.applicantListService.serviceProviderListing(
        req.query as unknown as ServiceProviderApplicantListingFilterOptions
      );
      successHandler(res, {
        data: filterResult,
        message: "Fetch successfully",
        statusCode: StatusCodes.OK,
      });
    } catch (error) {
      next(error);
    }
  };
}
