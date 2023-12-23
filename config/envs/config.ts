import { InternalServerError } from "errors/InternalServerError";
import {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_NAME,
  CLOUDINARY_UPLOAD_PATH,
  PORT,
  SENDGRID_SECRET_KEY,
  JWT_TOKEN,
  SENDGRID_SENDER,
  REDIS_URL,
  FRONTEND_EMAIL_PORT,
} from "./environment-variables";

interface Config {
  server: {
    PORT: string;
    JWT_TOKEN: string;
  };
  SENDGRID: {
    secretKey: string;
    SENDGRID_SENDER: string;
    FRONTEND_EMAIL_PORT: string;
  };
  cloudinary: {
    CLOUDINARY_UPLOAD_PATH: string;
    CLOUDINARY_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
  };
  [key: string]: any;
}

export const config: Config = {
  server: {
    PORT: PORT!,
    JWT_TOKEN: JWT_TOKEN!,
  },
  SENDGRID: {
    secretKey: SENDGRID_SECRET_KEY!,
    SENDGRID_SENDER: SENDGRID_SENDER!,
    FRONTEND_EMAIL_PORT: FRONTEND_EMAIL_PORT!,
  },
  cloudinary: {
    CLOUDINARY_UPLOAD_PATH: CLOUDINARY_UPLOAD_PATH!,
    CLOUDINARY_NAME: CLOUDINARY_NAME!,
    CLOUDINARY_API_KEY: CLOUDINARY_API_KEY!,
    CLOUDINARY_API_SECRET: CLOUDINARY_API_SECRET!,
  },
  redis: {
    REDIS_URL: REDIS_URL,
  },
};

export const checkConfig = () => {
  const envKeys = Object.keys(config);
  for (const key of envKeys) {
    if (!config[key]) {
      throw new InternalServerError(`Environment variable "${key}" is not provided `);
    }
  }
};
