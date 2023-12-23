import { prisma } from "config/prisma-client";
import { BadRequestError, BaseError, NotFoundError } from "errors";
import { UtilityFunctions } from "util/util.auth";

type UserTypeNames = "Student" | "Facilitator" | "Service Provider";

export class UserRepository {
  private utils = new UtilityFunctions();
  public getUserById = async (id: string) => {
    const user = await prisma.user.findUnique({
      where: {
        id: id,
      },
      include: {
        userType: true,
      },
    });
    if (!user) {
      throw new NotFoundError("User account not found");
    }
    return user;
  };

  public getUserByEmail = async (email: string) => {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        userType: true,
        admin: true,
        student: true,
        serviceProvider: true,
      },
    });
    if (!user) {
      throw new NotFoundError("User account not found");
    }
    return user;
  };

  public findUserType = async (userTypeId: string) => {
    const userType = await prisma.userType.findUnique({
      where: {
        id: userTypeId,
      },
    });
    if (!userType) {
      throw new BadRequestError("Invalid id supplied for user type");
    }
    return userType;
  };

  public findUserTypeByName = async (userTypeName: UserTypeNames) => {
    const userType = await prisma.userType.findFirst({
      where: { name: userTypeName },
    });
    if (!userType) throw new BaseError("An unexpected error occurred user type error");

    return userType;
  };
  public verifyToken = async (token: string, userId: string) => {
    const userToken = await prisma.userToken.findUnique({
      where: { userId: userId },
    });
    if (userToken?.token !== token) {
      throw new BadRequestError("Token is invalid");
    }
    const dateElapseTime = this.utils.diff_minutes(userToken?.updatedAt!, new Date());
    if (dateElapseTime > 20) {
      await prisma.userToken.update({
        where: { id: userToken?.id },
        data: { token: "" },
      });
      throw new BadRequestError("Token expired, try again");
    }
  };
}
