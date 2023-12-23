import { StatusCodes } from "http-status-codes";
import { BaseError } from "./BaseError";

export class PaymentRequiredError extends BaseError {
  constructor(message = "Payment Required") {
    super(message, StatusCodes.PAYMENT_REQUIRED);
  }
}
