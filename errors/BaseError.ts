import { StatusCodes } from "http-status-codes";

export class BaseError extends Error {
  public message: string = "";
  public statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR;

  constructor(message: string, statusCode?: number) {
    super();
    if (message) this.message = message;

    if (statusCode) this.statusCode = statusCode;
  }
}
