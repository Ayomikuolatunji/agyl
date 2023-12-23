import { UnauthorizedError } from "errors";
import { NextFunction, Request, Response } from "express";
import { UserRepository } from "shared/repository";

export class UserAuthsValidation {
  userRepository = new UserRepository();
  public verifyAuthorizedUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    const userId = req.params.userId;
    try {
      const user = await this.userRepository.getUserById(userId);
      if (user?.id !== req.userId) {
        throw new UnauthorizedError("You are not authorized");
      }
      if (!user?.isEmailVerified) {
        throw new UnauthorizedError("You need to verify your email address");
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

export const { verifyAuthorizedUser } = new UserAuthsValidation();
