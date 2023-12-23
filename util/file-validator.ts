import { BadRequestError } from "errors";
import { Multer } from "multer";
import { Express } from "express";

export const fileSizeValidator = (file: Express.Multer.File, limit: number) => {
  // convert to MB
  const maxBiteSize = limit * 1024 * 1024;

  if (file.size > maxBiteSize)
    throw new BadRequestError(`File size should not exceed ${limit} MB`);
};

export const photoValidator = (file: Express.Multer.File) => {
  const allowedFileTypes = ["image/jpeg", "image/png", "image/jpg"];

  if (!file.mimetype || !allowedFileTypes.includes(file.mimetype))
    throw new BadRequestError("File type should be either jpeg, jpg or png");
};

export const videoValidator = (file: Express.Multer.File) => {
  const allowedFileTypes = ["video/mp4", "video/mkv", "video/webm"];
  if (!allowedFileTypes?.includes(file.mimetype))
    throw new BadRequestError("Video should be either mp4");
};

export const documentValidator = (file: Express.Multer.File) => {
  const fileSize = file.size / (1024 * 1024);

  const allowedExtensions = /pdf|svg|png|jpeg|jpg|gif|jfif|mp4|webm/;

  if (!allowedExtensions.test(file.mimetype)) {
    throw new BadRequestError("Unsupported document format" + file.mimetype);
  }

  if (fileSize > 10) {
    throw new BadRequestError("File size should not exceed 10mb");
  }
};
