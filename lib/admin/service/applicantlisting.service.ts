import { prisma } from "config/prisma-client";
import {
  ServiceProviderApplicantListingFilterOptions,
  StudentApplicantListingFilterOptions,
} from "../application/types";
import { GenericFilterAndSort } from "helpers/genericFilterAndSort/genericFilterAndSort";
import { GenericIncludeType } from "helpers/genericFilterAndSort/types";
import { Prisma } from "@prisma/client";
import { BadRequestError } from "errors";

export class ApplicantListService {
  private filterAndSortService: GenericFilterAndSort;

  constructor() {
    this.filterAndSortService = new GenericFilterAndSort(prisma);
  }
  public studentApplicantListing = async (query: StudentApplicantListingFilterOptions) => {
    const { pageSize, search, categoryId, currentPage, state } = query;
    if (!categoryId) {
      throw new BadRequestError("category is required");
    }
    const where: Prisma.StudentWhereInput = {
      user: {
        userType: {
          name: "Student",
        },
      },
      AND: [
        {
          OR: [
            { user: { firstName: { contains: search } } },
            { user: { lastName: { contains: search } } },
            { user: { email: { contains: search } } },
            { professionalOverview: { phoneNumber: { contains: search } } },
          ],
        },
        {
          professionalOverview: {
            state: state,
          },
        },
        {
          categoryId: categoryId,
        },
      ],
    };
    const orderBy = {
      createdAt: "desc",
    };
    const include: GenericIncludeType = {
      user: true,
      professionalOverview: true,
      category: true,
    };

    return await this.filterAndSortService.filterAndSort(
      { pageSize: parseInt(pageSize), currentPage },
      "Student",
      where,
      include,
      orderBy
    );
  };
  public serviceProviderListing = async (query: ServiceProviderApplicantListingFilterOptions) => {
    const { pageSize, search, currentPage, state, discipline } = query;
    const where: Prisma.ServiceProviderWhereInput = {
      user: {
        userType: {
          name: "Service Provider",
        },
        field: {
          name: discipline,
        },
      },
      AND: [
        {
          OR: [
            { user: { firstName: { contains: search } } },
            { user: { lastName: { contains: search } } },
            { user: { email: { contains: search } } },
            { professionalOverview: { phoneNumber: { contains: search } } },
          ],
        },
        {
          professionalOverview: {
            state: state,
          },
        },
      ],
    };
    const include: GenericIncludeType = {
      user: true,
      professionalOverview: true,
    };
    const orderBy = {
      createdAt: "desc",
    };
    return await this.filterAndSortService.filterAndSort(
      { pageSize: parseInt(pageSize), currentPage },
      "ServiceProvider",
      where,
      include,
      orderBy
    );
  };
}
