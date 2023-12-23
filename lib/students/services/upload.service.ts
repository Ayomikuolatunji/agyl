import multer, { Multer } from "multer";
import { CloudinaryFunctions } from "util/util.cloudinary";
import { cloudinary } from "config/cloudinary";
import { config } from "config/envs/config";

export class OnboardingUploadService extends CloudinaryFunctions {
  public getMulter(): Multer {
    const upload = multer({ dest: "uploads/" });
    return upload;
  }

  public uploadImage = async (filePath: string) => {
    return await cloudinary.v2.uploader.upload(filePath, {
      folder: config.cloudinary.CLOUDINARY_UPLOAD_PATH,
      resource_type: "auto",
    });
  };

}
