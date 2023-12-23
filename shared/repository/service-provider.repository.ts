import { prisma } from "config/prisma-client";
import { redisClient } from "config/redis-client";
import { NotFoundError } from "errors";

export class ServiceProviderRepository {
  public getServiceProviders = async () => {
    return await prisma.serviceProvider.findMany({
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            isEmailVerified: true,
            field: true,
            fieldOfInterestId: true,
            level: true,
            isAgreementAccepted: true,
            needEmailNotification: true,
          },
        },
        professionalOverview: true,
        meansOfIdentification: true,
      },
    });
  };

  public getServiceProviderByUserId = async (userId: string) => {
    const sp = await prisma.serviceProvider.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            isEmailVerified: true,
            field: true,
            fieldOfInterestId: true,
            level: true,
            isAgreementAccepted: true,
            needEmailNotification: true,
          },
        },
        professionalOverview: true,
        education: true,
        workExperience: true,
        skills: true,
        achievements: true,
        meansOfIdentification: true,
      },
    });
    if (!sp) throw new NotFoundError("Service Provider not found");
    return sp;
  };

  public setCachedServiceProvider = async (userId: string) => {
    const sp = await this.getServiceProviderByUserId(userId);
    if (sp) {
      await redisClient.set(`sp-${userId}`, JSON.stringify(sp));
    }
  };

  public getCachedServiceProvider = async (userId: string) => {
    const sp = await redisClient.get(`sp-${userId}`);
    return sp ? JSON.parse(sp) : null;
  };

  public getCachedServiceProviders = async () => {
    const result = await redisClient.get("service-providers");
    return result ? JSON.parse(result) : null;
  };

  public setCachedServiceProviders = async () => {
    const data = await this.getServiceProviders();
    if (data) await redisClient.set("service-providers", JSON.stringify(data));
  };
}
