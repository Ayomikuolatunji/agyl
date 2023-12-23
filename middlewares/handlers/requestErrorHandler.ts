import { BaseError } from "errors";
import { NextFunction, Request, Response } from "express";
import { ValidationError } from "express-validation";

interface RequestError {
  status?: number;
  message?: string;
  statusCode?: number;
}

const errorHandler = (
  error: RequestError | any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const message = error.message || "encounter error";
  const status = error.statusCode || 500;
  if (error instanceof ValidationError) {
    return res.status(error.statusCode).json(error);
  } else {
    res.status(status).json({
      message,
      error: "Error message",
      errorStatus: status,
    });
  }
  next();
};

export default errorHandler;
