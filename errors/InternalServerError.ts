import { StatusCodes } from "http-status-codes";
import { BaseError } from "./BaseError";

export class InternalServerError extends BaseError {
    constructor(message = "Forbidden Error") {
        super(message, StatusCodes.INTERNAL_SERVER_ERROR);
    }
}
