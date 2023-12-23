import { StatusCodes } from "http-status-codes";
import { BaseError } from "./BaseError";

export class BadRequestError extends BaseError {
  constructor(message: string = "Bad Request Error") {
    super(message, StatusCodes.BAD_REQUEST);
  }
}
