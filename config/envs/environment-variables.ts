import dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT;
export const SENDGRID_SECRET_KEY = process.env.SENDGRID_SECRET_KEY;
export const CLOUDINARY_NAME = process.env.CLOUDINARY_NAME;
export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
export const CLOUDINARY_UPLOAD_PATH = process.env.CLOUDINARY_UPLOAD_PATH;
export const JWT_TOKEN = process.env.JWT_TOKEN;
export const SENDGRID_SENDER = process.env.SENDGRID_SENDER;
export const REDIS_URL = process.env.REDIS_URL;
export const FRONTEND_EMAIL_PORT = process.env.FRONTEND_EMAIL_PORT;