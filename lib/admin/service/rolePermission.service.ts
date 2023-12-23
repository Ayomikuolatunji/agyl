import { Permission, Role } from "@prisma/client";
import { prisma } from "config/prisma-client";
import { BadRequestError, NotFoundError } from "errors";
import { InternalServerError } from "errors/InternalServerError";
import { AdminRepository } from "shared/repository/admin.repository";

export class AdminRolesPermissionService {
  private adminRepository = new AdminRepository();

  public createRole = async (body: Role) => {
    return await prisma.$transaction(async (tx) => {
      const checkExistingRole = await tx.role.findUnique({ where: { name: body.name } });
      if (checkExistingRole) {
        throw new InternalServerError("Role already exist");
      }
      const createRole = await tx.role.create({
        data: {
          name: body.name.toLowerCase(),
          description: body.description,
        },
      });
      if (!createRole) {
        throw new InternalServerError("Failed to create role");
      }
      return createRole;
    });
  };
  public updateRole = async (
    { roleId }: { roleId: string },
    { description, name }: { roleId: string; name: string; description: string }
  ) => {
    return await prisma.$transaction(async (tx) => {
      const role = await tx.role.findUnique({ where: { id: roleId } });
      if (!role) {
        throw new InternalServerError("Role does not exist");
      }
      const updateRole = await tx.role.update({
        where: {
          id: role.id,
        },
        data: {
          name: name.toLowerCase(),
          description: description,
        },
      });
      if (!updateRole) {
        throw new InternalServerError("Failed to update role");
      }
      return updateRole;
    });
  };
  deleteRole = async (roleId: string) => {
    const checkExistingRole = await prisma.role.findUnique({ where: { id: roleId } });
    if (!checkExistingRole) {
      throw new NotFoundError("Role not found");
    }
    const deleteRole = await prisma.role.delete({ where: { id: roleId } });
    if (!deleteRole) {
      throw new InternalServerError("Failed to delete role");
    }
    return deleteRole;
  };
  public fetchRoles = async () => {
    return await prisma.role.findMany({});
  };
  public fetchPermissionsForRole = async (roleId: string) => {
    return await prisma.rolePermission.findMany({
      where: {
        roleId,
      },
      include: {
        permission: true,
      },
    });
  };
  public fetchRolesForPermission = async (permissionId: string) => {
    return await prisma.rolePermission.findMany({
      where: {
        permissionId,
      },
      include: {
        role: true,
      },
    });
  };
  public createRoleWithPermissions = async (body: { roleData: Role; permissionIds: string[] }) => {
    const { roleData, permissionIds } = body;
    return await prisma.$transaction(async (tx) => {
      const findExistingRole = await tx.permission.findUnique({
        where: {
          name: roleData.name.toUpperCase(),
        },
      });
      if (findExistingRole) {
        throw new BadRequestError("Role already exits");
      }
      const createRole = await tx.role.create({
        data: {
          name: roleData.name.toUpperCase(),
          description: roleData.description,
        },
      });
      if (!createRole) {
        throw new InternalServerError("Failed to create role");
      }
      const rolePermissions = permissionIds.map((permissionId) => ({
        roleId: createRole.id,
        permissionId,
      }));
      await tx.rolePermission.createMany({
        data: rolePermissions,
      });

      return createRole;
    });
  };
  public createPermission = async (permissionData: Permission) => {
    return await prisma.$transaction(async (tx) => {
      const findExistingPermission = await tx.permission.findUnique({
        where: {
          name: permissionData.name.toUpperCase(),
        },
      });
      if (findExistingPermission) {
        throw new BadRequestError("Permission already exits");
      }
      const createPermission = await tx.permission.create({
        data: {
          ...permissionData,
          name: permissionData.name.toUpperCase(),
        },
      });
      return createPermission;
    });
  };
  public associateRoleWithPermissions = async (
    roleId: string,
    body: {
      permissions: { permissionId: string; isActive: boolean }[];
    }
  ) => {
    const { permissions } = body;
    return await prisma.$transaction(async (tx) => {
      const checkExistingRole = await tx.role.findUnique({ where: { id: roleId } });
      if (!checkExistingRole) {
        throw new NotFoundError("Role not found");
      }
      const existingAssociations = await tx.rolePermission.findMany({
        where: {
          roleId,
          permissionId: {
            in: permissions.map((perm) => perm.permissionId),
          },
        },
      });
      const newAssociations = permissions.filter(
        (perm) =>
          !existingAssociations.some(
            (existingAssoc) => existingAssoc.permissionId === perm.permissionId
          )
      );
      const rolePermissions = newAssociations.map(({ isActive, permissionId }) => ({
        roleId,
        permissionId,
        isActive,
      }));

      await tx.rolePermission.createMany({
        data: rolePermissions,
      });

      return true;
    });
  };
  assignRolesToAdmin = async (adminId: string, { rolesToAssign }: { rolesToAssign: string[] }) => {
    const admin = await this.adminRepository.getAdminById(adminId);
    const existingRoles = await prisma.roleUser.findMany({
      where: { adminId: admin.id },
    });
    const rolesToCreate = rolesToAssign.filter((roleToAssign) => {
      return !existingRoles.some((existingRole) => existingRole.roleId === roleToAssign);
    });
    const newRoleAssignments = rolesToCreate.map((roleToAssign) => {
      return prisma.roleUser.create({
        data: {
          admin: { connect: { id: admin.id } },
          role: { connect: { id: roleToAssign } },
        },
      });
    });
    return await Promise.all(newRoleAssignments);
  };
  removeRolesFromAdmin = async (
    adminId: string,
    { rolesToRemove }: { rolesToRemove: string[] }
  ) => {
    const admin = await prisma.admin.findUnique({
      where: { id: adminId },
    });
    if (!admin) {
      throw new Error("Admin not found");
    }
    const existingRoles = await prisma.roleUser.findMany({
      where: { adminId: adminId },
    });
    const rolesToDelete = existingRoles.filter((existingRole) => {
      return rolesToRemove.includes(existingRole.roleId);
    });
    const deletePromises = rolesToDelete.map((roleToDelete) => {
      return prisma.roleUser.delete({
        where: { id: roleToDelete.id, adminId: roleToDelete.adminId },
      });
    });
    return await Promise.all(deletePromises);
  };
  public removePermissionsFromRole = async (roleId: string, body: { permissionIds: string[] }) => {
    return await prisma.$transaction(async (tx) => {
      const checkExistingRole = await tx.role.findUnique({ where: { id: roleId } });
      if (!checkExistingRole) {
        throw new NotFoundError("Role not found");
      }
      await tx.rolePermission.deleteMany({
        where: {
          roleId,
          permissionId: {
            in: body.permissionIds,
          },
        },
      });

      return true;
    });
  };
  public permissions = async () => {
    const permissions = await prisma.permission.findMany({});
    return permissions;
  };
}
