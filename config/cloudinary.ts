import cloudinary from "cloudinary";
import { config } from "./envs/config";

cloudinary.v2.config({
  cloud_name: config.cloudinary.CLOUDINARY_NAME,
  api_key: config.cloudinary.CLOUDINARY_API_KEY,
  api_secret: config.cloudinary.CLOUDINARY_API_SECRET,
});

export { cloudinary };
