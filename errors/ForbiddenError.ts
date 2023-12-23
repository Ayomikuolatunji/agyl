import { StatusCodes } from "http-status-codes";
import { BaseError } from "./BaseError";

export class ForbiddenError extends BaseError {
  constructor(message = "Forbidden Error") {
    super(message, StatusCodes.FORBIDDEN);
  }
}
