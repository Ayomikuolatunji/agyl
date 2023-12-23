import { NextFunction, Response, RequestHandler } from "express";
import Jwt from "jsonwebtoken";
import { config } from "config/envs/config";
import { ForbiddenError, UnauthorizedError } from "errors";

class AuthMiddleware {
  /**
   * This middleware will set and verify the user making request to the server resources
   * @param AuthRequest
   * @param res
   * @param next
   */

  public Auth: RequestHandler = (req, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.get("Authorization");
      if (!authHeader) {
        throw new ForbiddenError("No token provided");
      }
      let decode: any;
      const token = authHeader?.split(" ")[1];
      decode = Jwt.verify(token as string, `${config.server.JWT_TOKEN}`);
      if (!token || !decode) {
        throw new UnauthorizedError("Invalid token");
      }
      req.userId = decode.userId;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export const { Auth } = new AuthMiddleware();
