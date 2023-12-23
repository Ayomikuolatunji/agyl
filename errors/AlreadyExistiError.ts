import { StatusCodes } from "http-status-codes";
import { BaseError } from "./BaseError";

export class AlreadyExistRequestError extends BaseError {
  constructor(message: string = "Bad Request Error") {
    super(message, 403);
  }
}
