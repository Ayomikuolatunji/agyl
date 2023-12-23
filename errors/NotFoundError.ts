import { StatusCodes } from "http-status-codes";
import { BaseError } from "./BaseError";

export class NotFoundError extends BaseError {
  constructor(message = "Resource Not Found") {
    super(message, StatusCodes.NOT_FOUND);
  }
}
