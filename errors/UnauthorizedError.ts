import { StatusCodes } from "http-status-codes";
import { BaseError } from "./BaseError";

export class UnauthorizedError extends BaseError {
  constructor(message = "Authorization Failure") {
    super(message, StatusCodes.UNAUTHORIZED);
  }
}
