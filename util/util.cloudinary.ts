import cloudinary from "cloudinary";
import { config } from "config/envs/config";
import multer from "multer";

export abstract class CloudinaryFunctions {
  public async uploadImage(path: string) {
    return await cloudinary.v2.uploader.upload(path, {
      folder: config.cloudinary.CLOUDINARY_UPLOAD_PATH,
    });
  }
  public async deleteImage(imagePublicId: string) {
    const deleteImageResponse = await cloudinary.v2.uploader.destroy(
      imagePublicId
    );
    if (deleteImageResponse) {
      return true;
    }
    return false;
  }
  public async uploadPDFs() {}

  public async upload(filePath: string) {
    return await cloudinary.v2.uploader.upload(filePath, {
      folder: config.cloudinary.CLOUDINARY_UPLOAD_PATH,
      resource_type: "auto",
    });
  }

  public getMulter() {
    const upload = multer({ dest: "uploads/" });
    return upload;
  }
}
