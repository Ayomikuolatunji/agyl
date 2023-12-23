import { Response } from "express";

interface SuccessResponseBody {
  data?: any;
  message: string;
  statusCode: number;
}

export function successHandler(
  res: Response,
  { data, statusCode, message }: SuccessResponseBody
) {
  return res.status(statusCode).json({
    success: true,
    statusCode,
    message,
    data,
  });
}
