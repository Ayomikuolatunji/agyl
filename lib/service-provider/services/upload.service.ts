import { ServiceProviderRepository } from "shared/repository";
import { CloudinaryFunctions } from "util/util.cloudinary";
import { prisma } from "config/prisma-client";

export class UploadService extends CloudinaryFunctions {
  private serviceProviderRepository = new ServiceProviderRepository();

  uploadMeansOfIdentification = async (userId: string, photo: any) => {
    const serviceProvider =
      await this.serviceProviderRepository.getServiceProviderByUserId(userId);

    const filePath = "./uploads/" + photo.filename;

    const result = await this.uploadImage(filePath);

    const validIdData = await prisma.validIdUpload.upsert({
      where: { serviceProviderId: serviceProvider.id },
      update: {
        format: result.format,
        originalFilename: photo.originalname,
        publicId: result.public_id,
        publicUrl: result.url,
        serviceProvider: { connect: { id: serviceProvider.id } },
      },
      create: {
        format: result.format,
        originalFilename: photo.originalname,
        publicId: result.public_id,
        publicUrl: result.url,
        serviceProvider: { connect: { id: serviceProvider.id } },
      },
    });

    return validIdData;
  };
}
