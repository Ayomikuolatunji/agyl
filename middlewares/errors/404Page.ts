import { type RequestHandler } from "express";
import { StatusCodes } from "http-status-codes";

export const pageNotFound: RequestHandler = (req, res) =>
  res.status(StatusCodes.NOT_FOUND).send("API route does not exist");
