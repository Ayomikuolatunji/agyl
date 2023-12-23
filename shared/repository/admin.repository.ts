import { prisma } from "config/prisma-client";
import { NotFoundError } from "errors";

export class AdminRepository {
  public getAdminById = async (adminUserId: string) => {
    const admin = await prisma.admin.findFirst({
      where: {
        user: {
          id: adminUserId,
        },
      },
      include: {
        adminInformation: true,
        user: true,
        roles: {
          include: {
            role: {
              include: {
                permissions: true,
              },
            },
          },
        },
      },
    });
    if (!admin) {
      throw new NotFoundError("Admin account does not exist");
    }
    return admin;
  };
}
