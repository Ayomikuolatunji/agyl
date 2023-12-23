import { Admin, AdminInformation, Prisma, User } from "@prisma/client";
import { config } from "config/envs/config";
import { prisma } from "config/prisma-client";
import { BadRequestError, NotFoundError, UnauthorizedError } from "errors";
import { InternalServerError } from "errors/InternalServerError";
import { ITLoginPayload } from "lib/user/types";
import { UserRepository } from "shared/repository";
import { UtilityFunctions } from "util/util.auth";
import { Roles } from "../application/types";
import {
  adminUserPassword,
  allowAdminToChangePassword,
} from "../emails/admin.onboard.email";
import { AlreadyExistRequestError } from "errors/AlreadyExistiError";

export class AdminOnBoardingService {
  private utils = new UtilityFunctions();
  private userRepository = new UserRepository();
  public signup = async (body: User & AdminInformation & Roles & Admin) => {
    await prisma.$transaction(
      async (tx) => {
        const hashPassword =
          body.password && !body.autoCreatePassword
            ? await this.utils.hashPassword(body.password)
            : "";
        const user = await prisma.user.findUnique({
          where: {
            email: body.email,
          },
        });
        if (user)
          throw new AlreadyExistRequestError("Admin User already exits");
        const userType = await this.userRepository.findUserType(
          body.userTypeId
        );
        const systemPassword = await this.utils.hashPassword(
          this.utils.generateRandomPassword(5)
        );
        const findUqUserName = await tx.admin.findUnique({
          where: { userName: body.userName },
        });
        if (findUqUserName) {
          throw new BadRequestError("User name already taken");
        }
        const createdAccount = await tx.user.create({
          data: {
            password: body.autoCreatePassword ? systemPassword : hashPassword,
            userTypeId: userType?.id as string,
            email: body.email.toLowerCase(),
            firstName: body.firstName.toLowerCase(),
            lastName: body.lastName.toLowerCase(),
          },
          include: {
            userType: true,
          },
        });
        if (!createdAccount) {
          throw new BadRequestError("Error creating account");
        }
        const createdAdmin = await tx.admin.create({
          data: {
            userId: createdAccount.id,
            userName: body.userName.toLowerCase(),
            domain: body.domain?.toLowerCase(),
            sendPassword: body.sendPassword,
            autoCreatePassword: body.autoCreatePassword,
            requireUserToChangePassword: body.requireUserToChangePassword,
          },
        });
        const createAdminInformation = await tx.adminInformation.create({
          data: {
            adminId: createdAdmin.id,
            jobTitle: body.jobTitle.toLowerCase(),
            department: body.department.toLowerCase(),
            office: body.office.toLowerCase(),
            officePhone: body.officePhone,
            faxNumber: body.faxNumber,
            mobilePhone: body.mobilePhone,
            city: body.city.toLowerCase(),
            state: body.state.toLowerCase(),
            zipCode: body.zipCode,
            country: body.country.toLowerCase(),
            streetAddress: body.streetAddress,
          },
        });
        if (!createAdminInformation) {
          throw new InternalServerError("Failed to create admin information");
        }
        const rolesWithPermissions = await prisma.role.findMany({
          where: {
            id: {
              in: body.roles,
            },
          },
          include: {
            permissions: true,
          },
        });
        if (!rolesWithPermissions.length) {
          throw new Error("Roles not found");
        }
        const rolesWithPermissionsIds = rolesWithPermissions.map(
          (role) => role.id
        );
        const rolesWithoutPermissionId = body.roles
          .map((role) => {
            if (!rolesWithPermissionsIds.includes(role)) {
              return role;
            }
          })
          .filter((role) => role != undefined);
        if (!rolesWithPermissions) {
          throw new Error("Roles not found");
        }
        if (rolesWithoutPermissionId.length) {
          throw new NotFoundError(
            `These roles are not found in the system: ${rolesWithPermissionsIds.join(
              " "
            )}`
          );
        }
        const roleUserEntries = body.roles.map((role) => ({
          adminId: createdAdmin.id,
          roleId: role,
        }));
        for (let roleUser of roleUserEntries) {
          await tx.roleUser.create({
            data: {
              admin: {
                connect: {
                  id: createdAdmin.id,
                },
              },
              role: {
                connect: {
                  id: roleUser.roleId,
                },
              },
            },
          });
        }
        if (body.sendPassword || body.autoCreatePassword) {
          await adminUserPassword({
            firstName: createdAccount.firstName,
            lastName: createdAccount.lastName,
            email: createdAccount.email,
            password: systemPassword,
          });
        }

        if (body.requireUserToChangePassword && createdAccount) {
          const token = await this.utils.generateToken();
          const updateUserToken = await tx.userToken.upsert({
            where: {
              userId: createdAccount?.id,
            },
            update: {
              token: token,
              updatedAt: new Date(),
            },
            create: {
              token,
              userId: createdAccount?.id,
              updatedAt: new Date(),
            },
          });
          if (!updateUserToken) {
            throw new InternalServerError("Encountered error");
          }
          await allowAdminToChangePassword({
            firstName: createdAccount.firstName,
            lastName: createdAccount.lastName,
            email: createdAccount.email,
            token: token,
          });
        }
        return createdAccount;
      },
      {
        maxWait: 5000,
        timeout: 20000,
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      }
    );
  };
  public loginUser = async (body: ITLoginPayload) => {
    const user = await this.userRepository.getUserByEmail(body.email);
    if (user.admin?.deleted) {
      throw new UnauthorizedError("Your account is deleted");
    }
    await this.utils.validatePassword(body.password, user?.password as string);
    const token = this.utils.createToken(
      user?.id as string,
      config.server.JWT_TOKEN as string
    );
    return { token, userId: user?.id };
  };
  public deleteAdminUser = async (adminId: string) => {
    const deleteAdminUser = await prisma.admin.delete({
      where: { id: adminId },
    });
    if (!deleteAdminUser) {
      throw new InternalServerError("Failed to delete admin user");
    }
    return deleteAdminUser;
  };
}
