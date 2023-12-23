import { Prisma } from "@prisma/client";
import { prisma } from "config/prisma-client";
import { GenericFilterAndSort } from "helpers/genericFilterAndSort/genericFilterAndSort";
import { GenericIncludeType } from "helpers/genericFilterAndSort/types";
import { UserRepository } from "shared/repository";
import { AdminListingFilterOptions } from "../application/types";
import { AdminRepository } from "shared/repository/admin.repository";
import { InternalServerError } from "errors/InternalServerError";
import { UtilityFunctions } from "util/util.auth";
import { BadRequestError } from "errors";
import { AlreadyExistRequestError } from "errors/AlreadyExistiError";
import { allowAdminToChangePassword } from "../emails/admin.onboard.email";

export class AdminManagementService {
  private utils = new UtilityFunctions();
  private userRepository = new UserRepository();
  private adminRepository = new AdminRepository();
  private filterAndSortService: GenericFilterAndSort;

  constructor() {
    this.filterAndSortService = new GenericFilterAndSort(prisma);
  }
  public admin = async (adminUserId: string) => {
    const user = await this.userRepository.getUserById(adminUserId);
    const admin = await prisma.admin.findFirst({
      where: {
        user: {
          id: user.id,
        },
      },
      include: {
        adminInformation: true,
        user: true,
        roles: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
      },
    });
    return admin;
  };
  public adminUserListing = async ({
    discipline,
    search,
    pageSize,
    currentPage,
  }: AdminListingFilterOptions) => {
    const where: Prisma.AdminWhereInput = {
      user: {
        userType: {
          name: "Admin",
        },
      },
      deleted: false,
      AND: [
        {
          OR: [
            { user: { firstName: { contains: search.toLowerCase() } } },
            { user: { lastName: { contains: search.toLowerCase() } } },
            { user: { email: { contains: search.toLowerCase() } } },
          ],
        },
        {
          adminInformation: {
            jobTitle: discipline.toLowerCase(),
          },
        },
      ],
    };
    const include: GenericIncludeType = {
      user: true,
      adminInformation: true,
    };
    const orderBy = {
      createdAt: "desc",
    };
    return await this.filterAndSortService.filterAndSort(
      { pageSize: parseInt(pageSize), currentPage },
      "Admin",
      where,
      include,
      orderBy
    );
  };
  public deleteUserAdmin = async (adminUserIds: string[]) => {
    const deletedAdmins = await prisma.admin.updateMany({
      where: {
        user: {
          id: {
            in: adminUserIds,
          },
        },
      },
      data: {
        deleted: true,
      },
    });
    if (deletedAdmins.count === adminUserIds.length) {
      return true;
    } else {
      throw new InternalServerError("Failed to delete some admin users");
    }
  };
  public restoreDeletedUserAdmin = async (body: {
    adminUserId: string;
    autoCreatePassword: boolean;
    password: string;
  }) => {
    const admin = await this.adminRepository.getAdminById(body.adminUserId);
    if (!admin.deleted) {
      throw new BadRequestError("This account is not deleted");
    }
    const hashPassword =
      body.password && !body.autoCreatePassword ? await this.utils.hashPassword(body.password) : "";
    const systemPassword = await this.utils.hashPassword(this.utils.generateRandomPassword(5));
    const restoreAdmin = await prisma.admin.update({
      where: {
        id: admin.id,
      },
      data: {
        deleted: false,
      },
    });
    if (!restoreAdmin) {
      throw new InternalServerError("Failed to delete some admin users");
    }
    const changePassword = await prisma.user.update({
      where: {
        id: admin.userId,
      },
      data: {
        password: body.autoCreatePassword ? systemPassword : hashPassword,
      },
    });
    if (!changePassword) {
      throw new InternalServerError("Operation failed!");
    }
    return true;
  };
  public changeUserAdminEmail = async ({
    adminUserId,
    email,
  }: {
    adminUserId: string;
    email: string;
  }) => {
    const admin = await this.adminRepository.getAdminById(adminUserId);
    const findUserAdminProvidedEmail = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });
    if (findUserAdminProvidedEmail) {
      throw new AlreadyExistRequestError("Email already exist");
    }
    const changePassword = await prisma.user.update({
      where: {
        id: admin.userId,
      },
      data: {
        email: email,
      },
    });
    if (!changePassword) {
      throw new InternalServerError("Operation failed!");
    }
    return true;
  };
  public resetAdminUsersPassword = async (
    adminUsers: {
      autoCreatePassword: string;
      password: string;
      adminUserId: string;
      requireUserToChangePassword: string;
    }[]
  ) => {
    return await prisma.$transaction(
      async (tx) => {
        const changedAdminPassword = [];
        for (let adminUser of adminUsers) {
          const admin = await this.adminRepository.getAdminById(adminUser.adminUserId);
          if (admin.user.id === adminUser.adminUserId) {
            const hashPassword =
              adminUser.password && !adminUser.autoCreatePassword
                ? await this.utils.hashPassword(adminUser.password)
                : "";
            const token = await this.utils.generateToken();
            const systemPassword = this.utils.generateRandomPassword(9);
            const hashSystemPassword = await this.utils.hashPassword(systemPassword);
            const adminUserPassword = adminUser.autoCreatePassword
              ? hashSystemPassword
              : hashPassword;

            await tx.userToken.upsert({
              where: {
                userId: admin.user.id,
              },
              update: {
                token: token,
                updatedAt: new Date(),
              },
              create: {
                token,
                userId: admin.user.id,
                updatedAt: new Date(),
              },
            });
            if (adminUser.requireUserToChangePassword) {
              await allowAdminToChangePassword({
                firstName: admin.user.firstName,
                lastName: admin.user.lastName,
                email: admin.user.email,
                token: token,
              });
            }
            const changePassword = await tx.user.update({
              where: {
                id: admin.userId,
              },
              data: {
                password: adminUserPassword,
              },
            });
            if (!changePassword) {
              throw new InternalServerError("Operation failed!");
            }
            const passwordToUse = adminUser.autoCreatePassword
              ? systemPassword
              : adminUser.password;
            changedAdminPassword.push({
              passwordToUse,
              firstName: admin.user.firstName,
              lastName: admin.user.lastName,
              adminUserId: adminUser.adminUserId,
            });
          }
        }
        return changedAdminPassword;
      },
      {
        maxWait: 9000,
        timeout: 60000,
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  };
  public resetAdminUserPassword = async ({
    autoCreatePassword,
    password,
    adminUserId,
    requireUserToChangePassword,
  }: {
    autoCreatePassword: string;
    password: string;
    adminUserId: string;
    requireUserToChangePassword: string;
  }) => {
    return await prisma.$transaction(
      async (tx) => {
        const admin = await this.adminRepository.getAdminById(adminUserId);
        const hashPassword =
          password && !autoCreatePassword ? await this.utils.hashPassword(password) : "";
        const token = await this.utils.generateToken();
        const systemPassword = this.utils.generateRandomPassword(9);
        const hashSystemPassword = await this.utils.hashPassword(systemPassword);
        const adminUserPassword = autoCreatePassword ? hashSystemPassword : hashPassword;
        await tx.userToken.upsert({
          where: {
            userId: admin.user.id,
          },
          update: {
            token: token,
            updatedAt: new Date(),
          },
          create: {
            token,
            userId: admin.user.id,
            updatedAt: new Date(),
          },
        });
        if (requireUserToChangePassword) {
          await allowAdminToChangePassword({
            firstName: admin.user.firstName,
            lastName: admin.user.lastName,
            email: admin.user.email,
            token: token,
          });
        }
        const changePassword = await tx.user.update({
          where: {
            id: admin.userId,
          },
          data: {
            password: adminUserPassword,
          },
        });
        if (!changePassword) {
          throw new InternalServerError("Operation failed!");
        }
        const passwordToUse = autoCreatePassword ? systemPassword : password;
        return {
          password: passwordToUse,
        };
      },
      {
        maxWait: 5000,
        timeout: 20000,
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  };
}
