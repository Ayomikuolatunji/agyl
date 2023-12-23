import { ExperienceLevel, Prisma, User } from "@prisma/client";
import { prisma } from "config/prisma-client";
import { UtilityFunctions } from "util/util.auth";
import { ITLoginPayload } from "../types";
import { config } from "config/envs/config";
import { accountSuccessMessage, forgetPassword, verifyEmail } from "../emails/user-emails";
import { UserRepository } from "shared/repository";
import { BadRequestError, BaseError, NotFoundError } from "errors";
import { InternalServerError } from "errors/InternalServerError";
import { redisClient } from "config/redis-client";

export class AuthService {
  private utils = new UtilityFunctions();
  private userRepository = new UserRepository();

  public signup = async (body: User) => {
    return await prisma.$transaction(
      async (tx) => {
        const hashPassword = await this.utils.hashPassword(body.password);
        const user = await prisma.user.findUnique({
          where: {
            email: body.email,
          },
        });
        if (user) throw new NotFoundError("User already exits");
        if (!body.isAgreementAccepted) {
          throw new BadRequestError("User must accept agreement");
        }
        const userType = await this.userRepository.findUserType(body.userTypeId);
        const createdAccount = await tx.user.create({
          data: {
            password: hashPassword,
            level: body.level as ExperienceLevel,
            userTypeId: userType?.id as string,
            email: body.email,
            needEmailNotification: body.needEmailNotification,
            isAgreementAccepted: body.isAgreementAccepted,
            firstName: body.firstName,
            lastName: body.lastName,
            fieldOfInterestId: body.fieldOfInterestId,
          },
          include: {
            userType: true,
          },
        });
        if (!createdAccount) {
          throw new BadRequestError("Error creating account");
        }
        await accountSuccessMessage({
          email: createdAccount?.email,
        });
        const token = await this.utils.generateToken();
        const updateUserToken = await tx.userToken.upsert({
          where: {
            userId: createdAccount.id,
          },
          update: {
            token: token,
            userId: createdAccount.id,
            updatedAt: new Date(),
          },
          create: {
            token,
            userId: createdAccount.id,
            updatedAt: new Date(),
          },
        });
        if (!updateUserToken) {
          throw new InternalServerError("Encountered error");
        }
        await verifyEmail({
          email: createdAccount?.email,
          token,
          userType: createdAccount.userType.name,
        });
        return true;
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
    const getLoggedInUser = await redisClient.get(`logged-in-user-${user.email}`);
    if (getLoggedInUser) {
      throw new BadRequestError("User is already logged in.");
    }
    if (!user?.isEmailVerified) {
      throw new BadRequestError("Please verify your email address");
    }
    await this.utils.validatePassword(body.password, user?.password as string);
    const token = this.utils.createToken(user?.id as string, config.server.JWT_TOKEN as string);
    redisClient.set(`logged-in-user-${user.email}`, token);
    return { token, userId: user?.id };
  };
  public logout = async (req: any) => {
    const user = await this.userRepository.getUserById(req.userId);
    const signedInUser = await redisClient.get(`logged-in-user-${user.email}`);
    if (!signedInUser) throw new BadRequestError("User is not signed in");

    await redisClient.del(`logged-in-user-${user.email}`);
    return true;
  };
  public verifyEmail = async (email: string, token: string) => {
    const user = await this.userRepository.getUserByEmail(email);
    return await prisma.$transaction(
      async (tx) => {
        if (user.isEmailVerified) {
          throw new BadRequestError("Email account already verified");
        }
        await this.userRepository.verifyToken(token, user?.id as string);
        await tx.user.update({
          where: { id: user?.id },
          data: {
            isEmailVerified: true,
          },
        });
        await prisma.userToken.delete({ where: { userId: user?.id } });
        return "Email verified successfully";
      },
      { timeout: 20000 }
    );
  };
  public requestEmailVerificationToken = async (email: string) => {
    const user = await this.userRepository.getUserByEmail(email);
    const token = await this.utils.generateToken();
    const updateUserToken = await prisma.userToken.upsert({
      where: {
        userId: user?.id,
      },
      update: {
        token: token,
        userId: user?.id,
        updatedAt: new Date(),
      },
      create: {
        token,
        userId: user?.id,
        updatedAt: new Date(),
      },
    });
    if (!updateUserToken) {
      throw new BaseError("Internal Server Error");
    }
    await verifyEmail({
      email: email,
      token,
      userType: user.userType.name,
    });
    return true;
  };
  public forgetPassword = async (email: string) => {
    const user = await this.userRepository.getUserByEmail(email);
    const token = await this.utils.generateToken();
    const updateUserToken = await prisma.userToken.upsert({
      where: {
        userId: user?.id,
      },
      update: {
        token: token,
        userId: user?.id,
        updatedAt: new Date(),
      },
      create: {
        token,
        userId: user?.id,
        updatedAt: new Date(),
      },
    });
    if (!updateUserToken) {
      throw new InternalServerError("Encountered error");
    }
    await forgetPassword({
      email: email,
      token,
      userType: user?.userType.name as string,
    });
    return true;
  };
  public resetPassword = async (email: string, password: string, token: string, req: any) => {
    const user = await this.userRepository.getUserByEmail(email);
    await this.userRepository.verifyToken(token, user?.id as string);
    await prisma.userToken.delete({ where: { token: token, userId: user.id } });
    const updateUserPassword = await prisma.user.update({
      where: {
        email: email,
      },
      data: {
        password: await this.utils.hashPassword(password),
      },
    });
    if (!updateUserPassword) {
      throw new BadRequestError("Failed to updated password");
    }
    return "Password reset successfully";
  };
  public changeEmail = async (body: { newEmail: string; oldEmail: string }) => {
    const user = await this.userRepository.getUserByEmail(body.oldEmail);
    const findNewEmail = await prisma.user.findUnique({
      where: {
        email: body.newEmail,
      },
    });
    if (findNewEmail) {
      throw new BadRequestError("The new email provided is already used");
    }
    await prisma.$transaction(
      async (tx) => {
        const update = await tx.user.update({
          where: { id: user.id },
          data: { email: body.newEmail, isEmailVerified: false },
        });
        if (!update) {
          throw new BadRequestError("Failed to update email");
        }
        const token = await this.utils.generateToken();
        const updateUserToken = await tx.userToken.upsert({
          where: {
            userId: user?.id,
          },
          update: {
            token: token,
            userId: user?.id,
            updatedAt: new Date(),
          },
          create: {
            token,
            userId: user?.id,
            updatedAt: new Date(),
          },
        });
        if (!updateUserToken) {
          throw new BadRequestError("Encountered error");
        }
        await verifyEmail({
          email: body.newEmail,
          token,
          userType: user?.userType.name as string,
        });

        return "Email updated successfully";
      },
      { timeout: 20000 }
    );
  };
}
