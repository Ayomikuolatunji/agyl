import { ServiceProviderRepository } from "shared/repository";

export class ServiceProviderService {
  private spRepository = new ServiceProviderRepository();
  getServiceProvider = async (userId: string) => {
    const cached = await this.spRepository.getCachedServiceProvider(userId);

    if (cached) return cached;

    const data = await this.spRepository.getServiceProviderByUserId(userId);
    await this.spRepository.setCachedServiceProvider(userId);
    return data;
  };

}
